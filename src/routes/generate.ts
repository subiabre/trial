import { names } from "$lib/names.json";
import { traits } from "$lib/traits.json";

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

/** @type {import('./__types/generate').RequestHandler} */
export async function get() {
    return { 
        body: { 
            data: {
                name: randomElementsFromArray(names, 1)[0],
                age: randomIntBetween(18, 99),
                traits: randomTraits().join(', ')
            }
        }
    };
}
