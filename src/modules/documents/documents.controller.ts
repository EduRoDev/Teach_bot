import {
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Body,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    BadRequestException,
    ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
    constructor(private readonly service: DocumentsService) { }

    @Post(':subjectId')
    @UseInterceptors(
        FileInterceptor('file', {
            fileFilter: (req, file, callback) => {
                const allowed = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                ];
                if (allowed.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Invalid file type'), false);
                }
            },
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    create(
        @Req() req: Request,
        @Param('subjectId', ParseIntPipe) subjectId: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [],
                fileIsRequired: true,
                errorHttpStatusCode: 422,
            })
        ) file: Express.Multer.File,
        @Body() dto: CreateDocumentDto,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.create(file, dto.title, subjectId, userId);
    }

    @Get(':id')
    findOne(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.findOne(id, userId);
    }

    @Get(':id/file')
    async getFile(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Res() res: Response,
    ) {
        const { userId } = req.user as { userId: number };
        const document = await this.service.findOne(id, userId);
        const { stream, contentType } = await this.service.getFileStream(document.file_path);

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${document.file_path}"`,
        });

        (stream as any).pipe(res);
    }

    @Delete(':id')
    delete(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.delete(id, userId);
    }

    @Post(':id/audio')
    generateAudio(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.generateAudio(id, userId);
    }
}