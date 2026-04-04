import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import type { Request } from 'express';
import { CreateSubjectDto } from './dto/create-subject.dto';

@UseGuards(JwtAuthGuard)
@Controller('subject')
export class SubjectController {
    constructor(
        private readonly service: SubjectService
    ) { }

    @Post()
    create(
        @Req() req: Request,
        @Body() dto: CreateSubjectDto,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.create({ userId, ...dto });
    }

    @Get()
    findAll(@Req() req: Request) {
        const { userId } = req.user as { userId: number };
        return this.service.findAll(userId);
    }

    @Get(':id')
    findOne(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.findOne(id, userId);
    }

    @Get(':id/documents')
    getDocuments(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.getDocuments(id, userId);
    }

    @Patch(':id')
    update(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSubjectDto,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.update({ userId, id, ...dto });
    }

    @Delete(':id')
    delete(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.delete(id, userId);
    }


}
