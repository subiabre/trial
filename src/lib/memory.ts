import type { CompletionOptions, PromptOptions } from "src/routes/openai";
import type { Log } from "./logs";

export interface Memory {
    name: String,
    age: Number,
    traits: String,
}

/**
 * @return {Memory}
 */
export function emptyMemory() {
    return { name: '', age: 0, traits: '' }
}

export async function createMemory() {
    const res = await fetch('/generate', {
        method: 'GET',
        headers: { "Content-Type": "application-json" },
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
