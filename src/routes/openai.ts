async function openai(prompt: any, max: any, stop: [String]) {
    const completion = await fetch('https://api.goose.ai/v1/engines/gpt-j-6b/completions', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            "prompt": prompt,
            "max_tokens": max,
            "stop": stop,
            "temperature": 0.9,
            "frequency_penalty": 0.1,
            "logit_bias": {"50256": -100,"198":  0.5},
        })
    });

    const data = await completion.json();

    return data;
}

/** @type {import('./__types/openai').RequestHandler} */
export async function post(event: { request: { json: () => any; }; }) {
    const data = await event.request.json();
    const prompt = data.messages.join("");
    const answer = await openai(prompt, 128, data.end);

    return { 
        body: { prompt, answer }
    };
}
