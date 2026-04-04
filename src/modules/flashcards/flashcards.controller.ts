import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FlashcardsService } from './flashcards.service';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('flashcards')
export class FlashcardsController {

    constructor(
        private readonly service: FlashcardsService
    ){}


    @Post('generate/:documentId')
    generate(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number
    ){
        const { userId } = req.user as { userId: number }
        return this.service.generate(documentId, userId)
    }

    @Get(':documentId')
    findByDocument(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number
    ){
        const { userId } = req.user as { userId: number }
        return this.service.findByDocument(documentId, userId)
    }

    @Delete(':id')
    delete(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number
    ){
        const { userId } = req.user as { userId: number }
        return this.service.delete(id, userId)
    }
}
