import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';
import wav from 'wav';
import { envs } from 'src/config';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { SubjectService } from '../subject/subject.service';
import 'multer';
import { Server } from 'http';
import e from 'express';


@Injectable()
export class DocumentsService implements OnModuleInit {
    private s3Client: S3Client;
    private googleGenAI!: GoogleGenAI;

    private readonly MINIO_BUCKET = 'uploads'
    private readonly UPLOAD_DIR_AUDIO = path.join(process.cwd(), 'public', 'audio')
    private readonly PYTHON = envs.PYTHON_SERVICE_URL
    private readonly GOLANG = envs.GOLANG_SERVICE_URL

    private logger = new Logger('App - Modules: documents');
    constructor(
        private readonly prisma: PrismaService,
        private readonly subjects: SubjectService,
    ) {
        if (!fs.existsSync(this.UPLOAD_DIR_AUDIO)) {
            fs.mkdirSync(this.UPLOAD_DIR_AUDIO, { recursive: true });
        }

        this.s3Client = new S3Client({
            endpoint: `http://localhost:9000`,
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'User',
                secretAccessKey: 'password',
            },
            forcePathStyle: true,
        })
    }

    onModuleInit() {
        this.googleGenAI = new GoogleGenAI({
            apiKey: envs.GEMINI_API_KEY_VOICE
        })
    }

    private sanitizeFilename(filename: string): string {
        return filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ñ/g, 'n')
            .replace(/Ñ/g, 'N')
            .replace(/[^a-zA-Z0-9.\-_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    private buildAudioUrl(fileName: string): string {
        const origin = envs.BASE_URL.replace(/\/api\/v1\/?$/, '');
        const cleanFileName = fileName.replace(/^\/+/, '').replace(/^audio\/+/, '');
        return `${origin}/audio/${encodeURIComponent(cleanFileName)}`;
    }


    private async saveWaveFile(filename: string, pcmData: Buffer) {
        return new Promise((resolve, reject) => {
            const writer = new wav.FileWriter(filename, {
                channels: 1,
                sampleRate: 24000,
                bitDepth: 16,
            });
            writer.on('finish', resolve);
            writer.on('error', reject);
            writer.write(pcmData);
            writer.end();
        });
    }

    private async findOneAndVerify(id: number, userId: number) {
        const document = await this.prisma.document.findUnique({
            where: {
                id
            },
            include: {
                subject: true
            }
        })

        if (!document) throw new NotFoundException('Document not found')
        if (document.subject?.user_id !== userId) throw new BadRequestException('Access denied')
        return document
    }


    private async extractDataWithPython(filename: string, documentId: number) {
        try {
            const res = await fetch(`${this.PYTHON}/document/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file: filename, document_id: documentId }),
            });

            if (!res.ok) throw new Error(`Python service error: ${res.status}`);

            const data = await res.json();
            return { content: data.content, chunks_indexed: data.chunks_indexed };
        } catch (error: any) {
            throw new Error(error.message || 'Error extracting data');
        }
    }

    private async convertToPdfWithGo(filename: string) {
        try {
            const res = await fetch(`${this.GOLANG}/convert?file=${filename}`, {
                method: 'POST',
            });

            if (!res.ok) this.logger.log(`Go service error: ${res.status}`);
        } catch (error: any) {

            throw new InternalServerErrorException(error.message || 'Error converting file to PDF');
        }
    }

    async findOne(id: number, userId: number) {
        return await this.findOneAndVerify(id, userId);
    }

    async create(
        file: Express.Multer.File,
        title: string,
        subjectId: number,
        userId: number,
    ) {
        await this.subjects.findOne(subjectId, userId);

        const sanitized = this.sanitizeFilename(file.originalname);
        const filename = `${Date.now()}-${sanitized}`;
        const pdfFilename = `${filename}.pdf`;

        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.MINIO_BUCKET,
                Key: filename,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
        } catch (error: any) {
            this.logger.error(`Error uploading file to storage: ${error.message}`);
            throw new InternalServerErrorException('Error saving file to storage');
        }

        const document = await this.prisma.document.create({
            data: {
                title,
                content: '',
                file_path: filename,
                subject_id: subjectId,
            }
        });

        try {
            const [extractData] = await Promise.all([
                this.extractDataWithPython(filename, document.id),
                this.convertToPdfWithGo(filename),
            ]);

            await this.prisma.document.update({
                where: { id: document.id },
                data: {
                    file_path: pdfFilename,
                    content: extractData.content,
                }
            });

            return {
                message: 'Document created successfully',
                document: { id: document.id, title, filename: pdfFilename }
            };
        } catch {
            await this.prisma.document.delete({ where: { id: document.id } });
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.MINIO_BUCKET,
                Key: filename,
            })).catch(() => { });

            throw new BadRequestException('Error processing document');
        }
    }


    async getFileStream(filename: string) {
        const bucket = filename.endsWith('.pdf') ? 'processed' : 'uploads';

        try {
            const response = await this.s3Client.send(new GetObjectCommand({
                Bucket: bucket,
                Key: filename,
            }));

            return { stream: response.Body, contentType: response.ContentType };
        } catch {
            throw new NotFoundException('File not found');
        }
    }

    async generateAudio(id: number, userId: number) {
        const document = await this.findOneAndVerify(id, userId);

        const response = await this.googleGenAI.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: document.content }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });

        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!data) throw new InternalServerErrorException('No audio data received');

        const audioBuffer = Buffer.from(data, 'base64');
        const fileName = `audio-${id}-${Date.now()}.wav`;
        const fullPath = path.join(this.UPLOAD_DIR_AUDIO, fileName);

        await this.saveWaveFile(fullPath, audioBuffer);

        await this.prisma.document.update({
            where: { id },
            data: { audio_url: this.buildAudioUrl(`audio/${fileName}`) }
        });

        return { message: 'Audio generated successfully' };
    }




    async delete(id: number, userId: number) {
        const document = await this.findOneAndVerify(id, userId);

        try {
            await fetch(`${this.PYTHON}/document/${id}/`, {
                method: 'DELETE',
            });
        } catch (error: any) {
            this.logger.error(`Error deleting from ChromaDB: ${error.message}`);
        }

        try {
            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.MINIO_BUCKET,
                Key: document.file_path,
            }));
        } catch (error: any) {
            this.logger.error(`Error deleting from storage: ${error.message}`);
        }

        await this.prisma.document.delete({ where: { id } });

        return { message: 'Document deleted successfully' };
    }
}
