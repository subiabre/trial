import { names } from "$lib/data/names.json";
import { traits } from "$lib/data/traits.json";
import type { Memory, MemoryData } from "$lib/memory";
import * as jose from "jose";

function randomIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomElementsFromArray(array: any[], n = 1) {
    return array.sort(() => 0.5 - Math.random()).slice(0, n)
}

function randomTraits() {
    const [positiveRange, negativeRange] = randomIntBetween(0, 1) > 0 ? [3, 0] : [0, 3];

    return [
        ...randomElementsFromArray(traits.positive, positiveRange),
        ...randomElementsFromArray(traits.neutral, randomIntBetween(1, 2)),
        ...randomElementsFromArray(traits.negative, negativeRange)
    ];
}

function createCode(data: MemoryData) {
    return new jose.UnsecuredJWT({ data })
        .setIssuedAt()
        .encode()
        ;
}

function readCode(code: string) {
    const data = jose.UnsecuredJWT.decode(code).payload;

    return data.data;
}

/** @type {import('./__types/generate').RequestHandler} */
export async function post(event: { request: { json: () => any } }) {
    const req = await event.request.json();

    if (req.code !== '') {
        return {
            body: {
                code: req.code,
                data: readCode(req.code)
            }
        }
    }

    const data = {
        name: randomElementsFromArray(names, 1)[0],
        age: randomIntBetween(6, 101),
        traits: randomTraits().join(", "),
        logrange: randomIntBetween(-16, -8),
        temperature: randomIntBetween(2, 8) * 0.11
    };
    const code = createCode(data);

    return {
        body:  {
            code: code,
            data: data
        }
    };
}
