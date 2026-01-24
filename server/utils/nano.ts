// Alphabet lisible (pas de confusion l/1, o/0)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'

function randomString(length: number): string {
    let result = '';
    
    // Cloudflare Workers compatible crypto
    try {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            result += alphabet[array[i] % alphabet.length];
        }
    } catch (error) {
        // Fallback pour environnements sans crypto
        for (let i = 0; i < length; i++) {
            result += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    }
    
    return result;
}

export const generateId = () => randomString(6) // Ex: "Xy7kM2"
export const generateKey = () => randomString(12) // Ex: "9jK2mP5nR8tL"
