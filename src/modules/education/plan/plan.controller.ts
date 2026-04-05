import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { PlanService } from './plan.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('plan')
export class PlanController {
    constructor(
        private readonly service: PlanService
    ){}

    @Post(':documentId')
    generate(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
        @Body('level') level: string,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.generate(documentId, userId, level);
    }

    @Get(':documentId')
    findByDocument(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.findByDocument(documentId, userId);
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
