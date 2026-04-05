import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    async fetchStream(messages: ChatMessage[], res: Response) {
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

    async fetchText(messages: ChatMessage[]): Promise<string> {
        const service = this.getNextServices();
        this.logger.log(`Using AI service: ${service.name}`);

        const stream = await service.chat(messages);
        let result = '';

        for await (const chunk of stream) {
            result += chunk;
        }

        return result;
    }

    async fetchStreamAndCollect(
        messages: ChatMessage[],
        res: Response
    ): Promise<string> {
        const service = this.getNextServices();
        this.logger.log(`Using AI service: ${service.name}`);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await service.chat(messages);
        let fullResponse = '';

        for await (const chunk of stream) {
            res.write(chunk);
            fullResponse += chunk;
        }

        res.end();
        return fullResponse;
    }
}
