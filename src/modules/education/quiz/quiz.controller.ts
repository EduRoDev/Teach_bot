import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { SubmitAttemptDto } from './dto/submitAttempt.dto';
import type { Request } from 'express';
import { QuizService } from './quiz.service';

@UseGuards(JwtAuthGuard)
@Controller('quiz')
export class QuizController {
    constructor(private readonly service: QuizService) {}

    @Post(':documentId/generate')
    generate(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.generate(documentId, userId);
    }

    @Get(':documentId')
    findByDocument(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.findByDocument(documentId, userId);
    }

    @Post(':id/attempt')
    submitAttempt(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SubmitAttemptDto,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.submitAnswer(id, userId, dto.answers, dto.timeTaken);
    }

    @Get(':id/attempts')
    getAttempts(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.getAttempts(id, userId);
    }
}
