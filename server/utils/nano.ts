// Alphabet lisible (pas de confusion l/1, o/0)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'

function randomString(length: number): string {
    let result = '';

    // Security: Only use cryptographically secure random generation
    // Node and modern browsers support crypto.getRandomValues.
    if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
        throw new Error('Cryptographically secure random generation not available');
    }

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        result += alphabet[array[i] % alphabet.length];
    }

    return result;
}

export const generateId = () => randomString(6) // Ex: "Xy7kM2"
export const generateKey = () => randomString(12) // Ex: "9jK2mP5nR8tL"
