import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { GatewayAiService } from './gateway-ai.service';
import { ChatMessage } from 'src/common/types/types';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class GatewayAiController {
    constructor(
        private readonly service: GatewayAiService
    ) { }

    @Post('chat')
    async chat(
        @Body() body: { messages: ChatMessage[] },
        @Res() res: Response
    ) {
        await this.service.fetchStream(body.messages, res)
    }
}
