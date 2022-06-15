import type { CompletionOptions, PromptOptions } from "src/routes/openai";
import type { Log } from "./logs";

export interface Memory {
    code: string,
    data: MemoryData
}

export interface MemoryData {
    name: string,
    age: number,
    traits: string,
    logrange: number,
    temperature: number
}

/**
 * @return {Memory}
 */
export function emptyMemory() {
    return {
        code: '',
        data: {
            name: '',
            age: 0,
            traits: '',
            logrange: -8,
            temperature: 0.7
        }
    }
}

export async function createMemory(code?: string) {
    const res = await fetch('/generate', {
        method: 'POST',
        headers: { "Content-Type": "application-json" },
        body: JSON.stringify({ code: code ?? '' })
    });
    const json = await res.json();

    return json;
}

export async function sayToMemory(messages: Log[], options: { prompt: PromptOptions, completion?: CompletionOptions }) {
    const res = await fetch('/openai', {
        method: 'POST',
        headers: { "Content-Type": "application.json" },
        body: JSON.stringify({ messages, options })
    });

    const json = await res.json();

    return json.answer;
}
