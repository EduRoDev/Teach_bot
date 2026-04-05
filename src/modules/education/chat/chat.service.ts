import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { GatewayAiService } from 'src/modules/gateway-ai/gateway-ai.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class ChatService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayService: GatewayAiService
    ) { }


    private async getDocumentAndVerify(documentId: number, userId: number) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { subject: true }
        })

        if (!document) throw new NotFoundException('Document not found');
        if (document.subject?.user_id !== userId) throw new ForbiddenException('You do not have access to this document');
        return document
    }

    private buildSystem(documentContent: string): string {
        const maxLength = 10000
        const text = documentContent.length > maxLength
            ? documentContent.substring(0, maxLength) + '...'
            : documentContent;

        return `Eres un asistente educativo experto. Responde preguntas sobre el siguiente documento.

                DOCUMENTO:
                ${text}

                INSTRUCCIONES:
                - Responde ÚNICAMENTE basándote en la información del documento
                - Si la información no está en el documento, indícalo claramente
                - Sé conciso y claro en tus respuestas
                - Mantén un tono profesional y educativo
                - Las respuestas deben tener un límite de 300 palabras
                - No utilices markdown para devolver la respuesta`;
    }

    async sendMessage(documentId: number, userId: number, message: string) {
        const document = await this.getDocumentAndVerify(documentId, userId);

        const history = await this.prisma.chatHistory.findMany({
            where: { document_id: documentId },
            orderBy: { timestamp: 'asc' }
        })

        const messages = [
            {
                role: 'system' as const,
                content: this.buildSystem(document.content),
            },
            ...history.flatMap(h => ([
                { role: 'user' as const, content: h.message },
                { role: 'assistant' as const, content: h.response },
            ])),
            { role: 'user' as const, content: message },
        ];


        const response = await this.gatewayService.fetchText(messages);

        const chat = await this.prisma.chatHistory.create({
            data: {
                document_id: documentId,
                message,
                response,
                user_id: userId
            }
        })

        return {
            id: chat.id,
            message: chat.message,
            response: chat.response,
            timestamp: chat.timestamp
        }

    }


    async sendMessageStream(
        documentId: number,
        userId: number,
        message: string,
        res: Response
    ) {

        const document = await this.getDocumentAndVerify(documentId, userId);

        const history = await this.prisma.chatHistory.findMany({
            where: { document_id: documentId },
            orderBy: { timestamp: 'asc' }
        })

        const messages = [
            {
                role: 'system' as const,
                content: this.buildSystem(document.content),
            },
            ...history.flatMap(h => ([
                { role: 'user' as const, content: h.message },
                { role: 'assistant' as const, content: h.response },
            ])),
            { role: 'user' as const, content: message },
        ];

        const fullResponse = await this.gatewayService.fetchStreamAndCollect(messages, res);

        await this.prisma.chatHistory.create({
            data: {
                document_id: documentId,
                message,
                response: fullResponse,
                user_id: userId
            }
        })

    }

    async getHistory(documentId: number, userId: number) {
        await this.getDocumentAndVerify(documentId, userId);

        return await this.prisma.chatHistory.findMany({
            where: { document_id: documentId, user_id: userId },
            orderBy: { timestamp: 'asc' },
            select: {
                id: true,
                message: true,
                response: true,
                timestamp: true
            }
        })
    }

    async deleteHistory(documentId: number, userId: number) {
        await this.getDocumentAndVerify(documentId, userId);
        await this.prisma.chatHistory.deleteMany({
            where: { document_id: documentId, user_id: userId }
        })
        return { message: 'Chat history deleted successfully' }
    }





}
