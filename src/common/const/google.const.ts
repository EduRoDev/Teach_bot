import { GoogleGenAI } from '@google/genai';
import { AIService, ChatMessage } from '../types/types';
import { envs } from 'src/config';

const ai = new GoogleGenAI({
    apiKey: envs.GEMINI_API_KEY_TEXT
});

export const geminiServices: AIService = {
    name: 'Gemini',
    async chat(messages: ChatMessage[]) {
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history
        });

        const stream = await chat.sendMessageStream({ message: lastMessage });

        return (async function* () {
            for await (const chunk of stream) {
                yield chunk.text || '';
            }
        })();
    }
}