export interface Memory {
    name: String,
    age: Number,
    traits: String,
    code: String,
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

export async function sayToMemory(data: { messages: String[], end: String[] }) {
    const res = await fetch('/openai', {
        method: 'POST',
        headers: { "Content-Type": "application.json" },
        body: JSON.stringify({ ...data, end: data.end.map(end => `${end}:`) })
    });
    const json = await res.json();

    console.log(json);

    return json.answer;
}

export function parseMemoryAnswer(answer: any) {
    const choice = answer.choices[0];

    if (choice.finish_reason === 'length') return `${choice.text}...`

    return choice.text;
}
