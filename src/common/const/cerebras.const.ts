import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { AIService, ChatMessage } from '../types/types';

const cerebras = new Cerebras();

export const cerebrasServices: AIService = {
    name: 'Cerebras',
    async chat(messages: ChatMessage[]) {
        const stream = await cerebras.chat.completions.create({
            messages: messages as any[],
            model: 'llama3.1-8b',
            stream: true,
            max_completion_tokens: 2048,
            temperature: 0.2,
            top_p: 1
        });

        return (async function* () {
            for await (const chunk of stream) {
                yield (chunk as any).choices[0]?.delta?.content || '';
            }
        })()
    }
}