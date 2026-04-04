import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createSubjectInterface, updateSubjectInterface } from './interfaces';

@Injectable()
export class SubjectService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    private async findOneAndVerify(id: number, userId: number) {
        const subject = await this.prisma.subject.findUnique({
            where: { id }
        })

        if (!subject) throw new NotFoundException('Subject not found')
        if (subject.user_id !== userId) throw new ForbiddenException('Access denied')

        return subject
    }

    async create({ userId, name, description }: createSubjectInterface) {
        return this.prisma.subject.create({
            data: {
                user_id: userId,
                name,
                description
            }
        })
    }

    async findOne(id: number, userId: number) {
        return await this.findOneAndVerify(id, userId);
    }

    async findAll(userId: number) {
        return await this.prisma.subject.findMany({
            where: { user_id: userId },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: { documents: true }
                }
            }
        })
    }

    async update({ userId, id, name, description }: updateSubjectInterface) {
        await this.findOneAndVerify(id, userId)

        return this.prisma.subject.update({
            where: { id },
            data: {
                name,
                description
            }
        })
    }

    async delete(id: number, userId: number) {
        await this.findOneAndVerify(id, userId)

        await this.prisma.subject.delete({
            where: { id }
        })

        return { message: 'Subject deleted successfully' }
    }

    async getDocuments(id: number, userId: number) {
        await this.findOneAndVerify(id, userId)
        return await this.prisma.subject.findMany({
            where: { id },
            select: {
                documents: true
            }
        })

    }
}
