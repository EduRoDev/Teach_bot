import { Body, Controller, Post, Res } from '@nestjs/common';
import { GatewayAiService } from './gateway-ai.service';
import { ChatMessage } from 'src/common/types/types';
import type { Response } from 'express';

@Controller('ai')
export class GatewayAiController {
    constructor(
        private readonly service: GatewayAiService
    ) { }

    @Post('chat')
    async chat(
        @Body() body: { messages: ChatMessage[] },
        @Res() res: Response
    ) {
        await this.service.fetch(body.messages, res)
    }
}
