import { InternalServerErrorException } from "@nestjs/common";

export const cleanMarkdown = (content: string): string => {
    return content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

export const parseAiJson = <T>(content: string, key: string): T => {
    const cleaned = cleanMarkdown(content);
    try {
        return JSON.parse(cleaned)[key];
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0])[key];
        throw new InternalServerErrorException(`Error parsing AI response for key: ${key}`);
    }
}