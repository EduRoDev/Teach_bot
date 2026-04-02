import { Injectable, Logger } from '@nestjs/common';
import { Response, } from 'express';
import { cerebrasServices, groqServices, geminiServices } from 'src/common/const';
import { AIService, ChatMessage } from 'src/common/types/types';

@Injectable()
export class GatewayAiService {
    private services: AIService[] = [
        groqServices,
        cerebrasServices,
        geminiServices
    ];

    private currentIndexService: number = 0

    private readonly logger = new Logger('App - Modules: gateway-ai');

    private getNextServices() {
        const service = this.services[this.currentIndexService]
        this.currentIndexService = (this.currentIndexService + 1) % this.services.length
        return service
    }

    async fetch(messages: ChatMessage[], res: Response) {
        const service = this.getNextServices();
        this.logger.log(`Using AI service: ${service.name}`);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await service.chat(messages);

        for await (const chunk of stream) {
            res.write(chunk);
        }

        res.end();
    }
}
