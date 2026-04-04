import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayAiService } from '../../gateway-ai/gateway-ai.service';
import { parseAiJson } from 'src/common/const';
import { QuizAnswerInput, QuizResponse } from './interfaces';

@Injectable()
export class QuizService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly aiService: GatewayAiService
    ) { }

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
        if (document.subject?.user_id !== userId) throw new UnauthorizedException('Access denied')
        return document
    }

    async generate(documentId: number, userId: number) {
        const document = await this.findOneAndVerify(documentId, userId);

        const maxLength = 10000;
        const text = document.content.length < maxLength
            ? document.content.substring(0, maxLength) + '...'
            : document.content;

        const response = await this.aiService.fetchText([
            {
                role: 'user',
                content: `
                    Eres un experto en crear quizzes educativos. Devuelve solo JSON válido.

                    Crea un quiz con MÍNIMO 5 preguntas basadas en el texto.
                    Devuelve SOLO un JSON con esta estructura:
                    {
                        "quiz": {
                            "title": "título del quiz",
                            "questions": [
                                {
                                    "question_text": "pregunta 1",
                                    "options": ["opción A", "opción B", "opción C", "opción D"],
                                    "correct_option": "opción correcta exacta"
                                }
                            ]
                        }
                    }

                    TEXTO:
                    ${text}

                    IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional.`
            }
        ])

        const quizData = parseAiJson<QuizResponse>(response, 'quiz');
        const quiz = await this.prisma.quiz.create({
            data: {
                title: quizData.title,
                document_id: documentId,
                questions: {
                    create: quizData.questions.map(q => ({
                        question_text: q.question_text,
                        correct_option: q.correct_option,
                        options: {
                            create: q.options.map(opt => ({
                                option_text: opt
                            }))
                        }
                    }))
                }
            },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        })

        return quiz;
    }

    async findByDocument(documentId: number, userId: number) {
        await this.findOneAndVerify(documentId, userId);

        const quiz = await this.prisma.quiz.findFirst({
            where: { document_id: documentId },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        })

        if (!quiz) throw new NotFoundException('Quiz not found for this document');
        return quiz;
    }

    async submitAnswer(
        quizId: number,
        userId: number,
        answers: QuizAnswerInput[],
        timeTaken?: number
    ) {

        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                document: {
                    include: {
                        subject: true
                    }
                },
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        })

        if (!quiz) throw new NotFoundException('Quiz not found');
        if (quiz.document?.subject?.user_id !== userId) throw new UnauthorizedException('Access denied');

        let correctAnswers: number = 0;

        const answersWithResult = answers.map(answer => {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            const isCorrect = question?.correct_option === answer.selectedOption;
            if (isCorrect) correctAnswers++;

            return {
                question_id: answer.questionId,
                selected_option: answer.selectedOption,
                is_correct: isCorrect,
            };
        });

        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quiz_id: quizId,
                user_id: userId,
                score: (correctAnswers / quiz.questions.length) * 100,
                time_taken: timeTaken,
                total_questions: quiz.questions.length,
                correct_answers: correctAnswers,
                answers: {
                    create: answersWithResult
                }
            },
            include: {
                answers: true
            }
        })

        return {
            score: attempt.score,
            correctAnswers: attempt.correct_answers,
            totalQuestions: attempt.total_questions,
            timeTaken: attempt.time_taken,
            answers: attempt.answers
        }
    }


    async getAttempts(quizId: number, userId: number){
        const quiz = await this.prisma.quiz.findUnique({
            where: {
                id: quizId
            },
            include: {
                document: {
                    include: {
                        subject: true
                    }
                }
            }
        })

        if (!quiz) throw new NotFoundException('Quiz not found');
        if (quiz.document?.subject?.user_id !== userId) throw new UnauthorizedException('Access denied');

        return await this.prisma.quizAttempt.findMany({
            where: {
                quiz_id: quizId,
                user_id: userId
            },
            include: {
                answers: true
            },
            orderBy: {
                completed_at: 'desc'
            }
        })
    }
}
