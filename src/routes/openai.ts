import { Configuration, OpenAIApi } from "openai";

const config = new Configuration({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });
const openai = new OpenAIApi(config);

/** @type {import('./__types/openai').RequestHandler} */
export async function post(event: { request: { json: () => any; }; }) {
    const data = await event.request.json();
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: data.log,
        temperature: 0.99,
      });
    const answer = completion.data.choices[0].text;

    console.log(data.log);
    console.log(completion.data.choices);

    return { 
        body: { data: answer }
    };
}
