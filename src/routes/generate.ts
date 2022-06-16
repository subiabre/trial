import { names } from "$lib/data/names.json";
import { traits } from "$lib/data/traits.json";
import type { MemoryData } from "$lib/memory";
import { encodeBase32, decodeBase32 } from "simple-base32";

const codePrefix = '_';

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
    return `${encodeBase32(data.name)}` +
        `${codePrefix}${encodeBase32(data.age.toString())}` +
        `${codePrefix}${encodeBase32(data.traits)}` +
        `${codePrefix}${data.logrange * -1}` +
        `${codePrefix}${data.temperature * 100}`
        ;
}

function readCode(code: string) {
    const params = code.split(codePrefix);

    return {
        name: decodeBase32(params[0]),
        age: decodeBase32(params[1]),
        traits: decodeBase32(params[2]),
        logrange: ~~params[3] * -1,
        temperature: ~~params[4] / 100
    }
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
