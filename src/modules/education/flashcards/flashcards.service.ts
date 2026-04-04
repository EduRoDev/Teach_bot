import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayAiService } from '../../gateway-ai/gateway-ai.service';
import { parseAiJson } from 'src/common/const';
import { FlashcardResponse } from './interfaces';

@Injectable()
export class FlashcardsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: GatewayAiService
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

    async generate(documentId: number, userId: number) {
        const document = await this.getDocumentAndVerify(documentId, userId)

        const maxLength = 10000
        const text = document.content.length > maxLength
            ? document.content.substring(0, maxLength) + '...'
            : document.content;

        const response = await this.aiService.fetchText([
            {
                role: 'user',
                content: `Eres un experto en crear flashcards educativas. Devuelve solo JSON válido
                    Crea EXACTAMENTE 5 flashcards de estudio basadas en el texto.
                    Devuelve SOLO un JSON con esta estructura:
                    {
                        "flashcards": [
                            {"subject": "tema 1", "definition": "definición 1"}
                        ]
                    }

                    TEXTO:
                    ${text}
                `
            }
        ])

        const flashcards = parseAiJson<FlashcardResponse[]>(response, 'flashcards')
        await this.prisma.flashcard.createMany({
            data: flashcards.map(f => ({
                question: f.subject,
                answer: f.definition,
                document_id: documentId
            }))
        })

        return await this.prisma.flashcard.findMany({
            where: { document_id: documentId }
        })
    }

    async findByDocument(documentId: number, userId: number) {
        await this.getDocumentAndVerify(documentId, userId)
        const flashcards = await this.prisma.flashcard.findMany({
            where: { document_id: documentId }
        })

        if (!flashcards.length) throw new NotFoundException('Flashcards not found');
        return flashcards
    }

    async delete(id: number, userId: number) {
        const flashcard = await this.prisma.flashcard.findUnique({
            where: { id },
            include: { document: { include: { subject: true } } }
        })
        if (!flashcard) throw new NotFoundException('Flashcard not found');
        if (flashcard.document?.subject?.user_id !== userId) throw new ForbiddenException('You do not have access to this flashcard');
        await this.prisma.flashcard.delete({ where: { id } })
        return { message: 'Flashcard deleted successfully' }
    }


}
