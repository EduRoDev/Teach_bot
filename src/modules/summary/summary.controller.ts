import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('summary')
export class SummaryController {
    constructor(
        private readonly service: SummaryService
    ) { }

    @Post(':documentId')
    generate(
        @Req() req: Request,
        @Param('documentId') documentId: number
    ) {
        const { userId } = req.user as { userId: number }
        return this.service.generate(documentId, userId)
    }

    @Get(':documentId')
    findByDocument(
        @Req() req: Request,
        @Param('documentId') documentId: number
    ) {
        const { userId } = req.user as { userId: number }
        return this.service.findByDocument(documentId, userId)
    }
}
