import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.guard';
import { ChatService } from './chat.service';
import type { Request, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {

    constructor(
        private readonly service: ChatService
    ) { }


    @Get(':documentId')
    getHistory(@Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number
    ) {
        const { userId } = req.user as { userId: number }
        return this.service.getHistory(documentId, userId);
    }

    @Post(':documentId/stream')
    sendMessageStream(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
        @Body('message') message: string,
        @Res() res: Response
    ){
        const { userId } = req.user as { userId: number }
        return this.service.sendMessageStream(documentId, userId, message, res)
    }

    @Post(':documentId')
    sendMessage(
        @Req() req: Request,
        @Param('documentId', ParseIntPipe) documentId: number,
        @Body('message') message: string,
    ) {
        const { userId } = req.user as { userId: number };
        return this.service.sendMessage(documentId, userId, message);
    }


}
