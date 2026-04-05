import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { parseAiJson } from 'src/common/const';
import { GatewayAiService } from 'src/modules/gateway-ai/gateway-ai.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { StudyPlanContent } from './interfaces';

@Injectable()
export class PlanService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayAi: GatewayAiService
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


    async generate(documentId: number, userId:number, level: string){
        const document = await this.getDocumentAndVerify(documentId, userId)

        const maxLength = 10000
        const text = document.content.length > maxLength
            ? document.content.substring(0, maxLength) + '...'
            : document.content;

        const response = await this.gatewayAi.fetchText([
            {
                role: 'user',
                content: `Eres un experto en crear planes de estudio personalizados.
                            Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido. NO incluyas markdown ni texto adicional.
                            Ademas los recursos recomendados deben ser existentes, no te inventes recursos que no existen, si no conoces recursos reales para recomendar, deja el array de recursos recomendado vacío.

                            Crea un plan de estudio para un estudiante de nivel ${level}.

                            DOCUMENTO:
                            ${text}

                            FORMATO REQUERIDO (JSON):
                            {
                                "study_plan": {
                                    "objectives": ["objetivo 1", "objetivo 2"],
                                    "recommended_resources": ["recurso 1", "recurso 2"],
                                    "schedule": {
                                        "week_1": "actividades semana 1",
                                        "week_2": "actividades semana 2"
                                    }
                                }
                            }

                            Responde ÚNICAMENTE con el JSON, sin texto adicional.`
            }
        ])

        const plan = parseAiJson<StudyPlanContent>(response, 'study_plan')

        const createdPlan = await this.prisma.customStudyPlan.create({
            data: {
                document_id: documentId,
                level,
                user_id: userId,
                title: `Plan de estudio para ${document.title}`,
                content: plan as any
            }
        })

        return createdPlan
    }

    async findByDocument(documentId: number, userId: number){
        await this.getDocumentAndVerify(documentId, userId)

        const plan = await this.prisma.customStudyPlan.findFirst({
            where: {
                document_id: documentId,
                user_id: userId
            },
            orderBy: { created_at: 'desc' }
        })

        if(!plan) throw new NotFoundException('No study plan found for this document');
        return plan
    }


    async delete(id: number, userId: number){
        const plan = await this.prisma.customStudyPlan.findUnique({ where: { id } })
        if(!plan) throw new NotFoundException('Study plan not found');
        if(plan.user_id !== userId) throw new ForbiddenException('You do not have access to this study plan');
        await this.prisma.customStudyPlan.delete({ where: { id } })
        return { message: 'Study plan deleted successfully' }
    }

}
