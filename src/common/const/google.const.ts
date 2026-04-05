import { GoogleGenAI } from '@google/genai';
import { AIService, ChatMessage } from '../types/types';
import { envs } from 'src/config';

const ai = new GoogleGenAI({
    apiKey: envs.GEMINI_API_KEY_TEXT
});

export const geminiServices: AIService = {
    name: 'Gemini',
    async chat(messages: ChatMessage[]) {
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        const history = conversationMessages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const lastMessage = conversationMessages[conversationMessages.length - 1].content;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: systemMessage ? {
                systemInstruction: systemMessage.content
            } : undefined,
            history,
        });

        const stream = await chat.sendMessageStream({ message: lastMessage });

        return (async function* () {
            for await (const chunk of stream) {
                yield chunk.text || '';
            }
        })();
    }
}