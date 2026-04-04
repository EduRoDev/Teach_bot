import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayAiService } from '../../gateway-ai/gateway-ai.service';

@Injectable()
export class SummaryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly AiService: GatewayAiService
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
        const truncatedText = document.content.length > maxLength
            ? document.content.substring(0, maxLength) + '...'
            : document.content;

        const response = await this.AiService.fetchText([
            {
                role: 'user', content: `Resume el siguiente documento en español con un estilo conciso y académico.
                    No uses markdown ni negrillas. Solo texto plano.

                    DOCUMENTO:
                    ${truncatedText}`
            }
        ])

        const summary = await this.prisma.summary.create({
            data: {
                content: response,
                document_id: documentId
            }
        })

        return summary
    }

    async findByDocument(documentId: number, userId: number) {
        await this.getDocumentAndVerify(documentId, userId)
        const summary = await this.prisma.summary.findFirst({
            where: { document_id: documentId }
        })
        if (!summary) throw new NotFoundException('Summary not found');
        return summary
    }
}
