import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

    async getOverview() {
        const [
            totalUsers,
            activeUsers,
            adminUsers,
            totalSubjects,
            totalDocuments,
            totalQuizAttempts,
            recentUsers,
            recentDocuments,
        ] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { deletedAt: null, role: 'ADMIN' } }),
            this.prisma.subject.count(),
            this.prisma.document.count(),
            this.prisma.quizAttempt.count(),
            this.prisma.user.findMany({
                where: { deletedAt: null },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            }),
            this.prisma.document.findMany({
                orderBy: { id: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    file_path: true,
                    subject: {
                        select: {
                            id: true,
                            name: true,
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        return {
            stats: {
                totalUsers,
                activeUsers,
                adminUsers,
                totalSubjects,
                totalDocuments,
                totalQuizAttempts,
            },
            recentUsers,
            recentDocuments,
        };
    }

    async getUsers({ page, limit, search }: { page: number; limit: number; search?: string }) {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            deletedAt: null,
            ...(search
                ? {
                      OR: [
                          { name: { contains: search, mode: 'insensitive' } },
                          { lastName: { contains: search, mode: 'insensitive' } },
                          { email: { contains: search, mode: 'insensitive' } },
                      ],
                  }
                : {}),
        };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    authProvider: true,
                    emailConfirm: true,
                    createdAt: true,
                    _count: {
                        select: {
                            subjects: true,
                            quiz_attempts: true,
                            chat_histories: true,
                            study_plans: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        };
    }

    async getSubjects({ page, limit, search }: { page: number; limit: number; search?: string }) {
        const skip = (page - 1) * limit;

        const where: Prisma.SubjectWhereInput = search
            ? { name: { contains: search, mode: 'insensitive' } }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.subject.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true,
                            role: true,
                            status: true,
                        },
                    },
                    _count: {
                        select: {
                            documents: true,
                        },
                    },
                },
            }),
            this.prisma.subject.count({ where }),
        ]);

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        };
    }

    async getDocuments({ page, limit, search }: { page: number; limit: number; search?: string }) {
        const skip = (page - 1) * limit;

        const where: Prisma.DocumentWhereInput = search
            ? { title: { contains: search, mode: 'insensitive' } }
            : {};

        const [data, total] = await Promise.all([
            this.prisma.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
                select: {
                    id: true,
                    title: true,
                    file_path: true,
                    audio_url: true,
                    subject: {
                        select: {
                            id: true,
                            name: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    lastName: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            summaries: true,
                            flashcards: true,
                            quizzes: true,
                            chat_histories: true,
                            study_plans: true,
                        },
                    },
                },
            }),
            this.prisma.document.count({ where }),
        ]);

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data,
        };
    }
}
