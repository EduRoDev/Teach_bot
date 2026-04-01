import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateSessionInterface, GetAllSessions, GetSession, UpdateSessionInterface } from './interfaces';

@Injectable()
export class SessionsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async create({
        id,
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        location,
        isActive,
        expiresAt
    }: CreateSessionInterface) {

        return await this.prisma.session.create({
            data: {
                id,
                userId,
                refreshToken,
                userAgent,
                ipAddress,
                location,
                isActive,
                expiresAt
            }
        })
    }

    async getAll({ userId }: GetAllSessions) {
        return await this.prisma.session.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                userId: true,
                userAgent: true,
                createdAt: true,
                lastUsedAt: true,
            }
        })
    }

    async findOne({ id, userId }: GetSession) {
        const session = await this.prisma.session.findFirst({
            where: {
                id,
                userId
            }
        })

        if (!session) throw new NotFoundException('Session not found')
        return session
    }

    async update({
        id,
        userId,
        refreshToken,
        userAgent,
        ipAddress,
        location,
        isActive,
        expiresAt
    }: UpdateSessionInterface) {
        await this.findOne({ id, userId })
        return await this.prisma.session.update({
            where: {
                id, userId
            },
            data: {
                refreshToken,
                userAgent,
                ipAddress,
                location,
                isActive,
                expiresAt
            }

        })
    }

    async delete({ id, userId }: GetSession) {
        await this.findOne({ id, userId })
        return await this.prisma.session.delete({
            where: {
                id, userId
            }
        })
    }

    async deleteAll({ userId }: GetAllSessions) {
        return await this.prisma.session.deleteMany({
            where: {
                userId
            }
        })
    }
}