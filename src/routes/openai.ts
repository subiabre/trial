import type { Log } from "$lib/logs";
import type { Memory } from "$lib/memory";

export interface CompletionOptions {
    max?: number,
    stop?: [string],
    temperature?: number,
    frequency_penalty?: number
}

export interface PromptOptions {
    memory: Memory,
    login: string
}

function makePrompt(messages: Log[], options: PromptOptions) {
    return [
        `The following is a conversation between ${options.login} and ${options.memory.name}. They both are people.\n`,
        `${options.memory.name} is ${options.memory.age} years old and is ${options.memory.traits}.\n\n`,
        ...messages
            .map((msg) => `${msg.user}: ${msg.text}\n`)
            .slice(options.memory.logrange),
        `${options.memory.name}:`,
    ];
}

async function makeCompletion(prompt: string, options: CompletionOptions) {
    const completion = await fetch('https://api.goose.ai/v1/engines/gpt-j-6b/completions', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            "prompt": prompt,
            "max_tokens": options.max ?? 128,
            "stop": options.stop ?? '',
            "temperature": options.temperature ?? 0.7,
            "frequency_penalty": options.frequency_penalty ?? 0.2,
            "logit_bias": {"50256": -100,"198":  0.5},
        })
    });

    const data = await completion.json();

    return data;
}

function parseOpenAiCompletion(completion: any, stop: string[]) {
    const choice = completion.choices[0];
    const text = (choice.finish_reason === 'length') ? `${choice.text}...` : choice.text;

    return text
        .split(`\n`)
        .map((msg: string) => msg.trim())
        .filter((msg: string) => {
            for (let index = 0; index < stop.length; index++) {
                const end = stop[index];
                
                if (new RegExp(`${end}$`).test(msg) || msg === '') return false;
            }

            return true;
        });
}

/** @type {import('./__types/makeCompletion').RequestHandler} */
export async function post(event: { request: { json: () => any; }; }) {
    const data = await event.request.json();
    const prompt = makePrompt(data.messages, data.options.prompt);

    const completion = await makeCompletion(prompt.join(), data.options.completion);
    const answer = parseOpenAiCompletion(completion, data.options.completion.stop);

    console.log(prompt);
    console.log(answer);

    return { 
        body: { prompt, answer }
    };
}
