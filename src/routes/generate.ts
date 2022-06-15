import { names } from "$lib/data/names.json";
import { traits } from "$lib/data/traits.json";

function randomIntBetween(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function randomElementsFromArray(array: any[], n = 1)
{
    return array.sort(() => 0.5 - Math.random()).slice(0, n)
}

function randomTraits()
{
    const traitsPositive = randomElementsFromArray(traits.positive, randomIntBetween(0, 3));
    const traitsNeutral = randomElementsFromArray(traits.neutral, randomIntBetween(1, 2));
    const traitsNegative = randomElementsFromArray(traits.negative, randomIntBetween(0, 3));

    return [...traitsPositive, ...traitsNeutral, ...traitsNegative];
}

/**
 * @see https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
function cyrb53(str: string) {
    let seed = 0;
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return (h2>>>0).toString(16).padStart(8)+(h1>>>0).toString(16).padStart(8);
};

/** @type {import('./__types/generate').RequestHandler} */
export async function get() {
    const name = randomElementsFromArray(names, 1)[0];  
    const age = randomIntBetween(6, 101);
    const traits = randomTraits().join(", ");
    const code = cyrb53(name + age + traits);

    return {
        body:  { name, age, traits, code }
    };
}
