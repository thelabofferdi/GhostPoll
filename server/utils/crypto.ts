/**
 * Utilitaires de fingerprinting et hashing
 */

/**
 * Génère un hash SHA-256 d'une chaîne
 * 
 * @param input - Chaîne à hasher
 * @returns Hash hexadécimal
 */
export async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Check if crypto is available (Cloudflare Workers / Modern Browsers)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.error('[Crypto Error] SHA-256 failed:', e);
            throw e;
        }
    }

    // Fallback? Or throw explicit error
    console.error('[Crypto Error] Crypto API not available');
    throw new Error('Crypto API not available');
}

/**
 * Génère un fingerprint anonyme à partir des données de requête
 * 
 * @param ip - Adresse IP
 * @param userAgent - User-Agent
 * @param canvasFp - Fingerprint canvas (optionnel, envoyé par le client)
 * @returns Hash unique et anonyme
 * 
 * @example
 * ```ts
 * const fp = await generateFingerprint(
 *   '192.168.1.1',
 *   'Mozilla/5.0...',
 *   'a1b2c3d4'
 * );
 * // "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 * ```
 */
export async function generateFingerprint(
    ip: string,
    userAgent: string,
    canvasFp?: string
): Promise<string> {
    const components = [ip, userAgent, canvasFp || ''].filter(Boolean);
    const combined = components.join(':');
    return sha256(combined);
}

/**
 * Génère une signature HMAC pour un vote
 * 
 * @param payload - Données à signer
 * @param secretKey - Clé secrète
 * @returns Signature HMAC hexadécimale
 */
export async function hmacSign(payload: string, secretKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie une signature HMAC
 * 
 * @param payload - Données signées
 * @param signature - Signature à vérifier
 * @param secretKey - Clé secrète
 * @returns true si la signature est valide
 */
export async function hmacVerify(
    payload: string,
    signature: string,
    secretKey: string
): Promise<boolean> {
    const expectedSignature = await hmacSign(payload, secretKey);
    return signature === expectedSignature;
}

/**
 * Génère un payload de vote pour signature
 * 
 * @param roomId - ID de la room
 * @param emoji - Emoji voté
 * @param timestamp - Timestamp du vote
 * @returns Payload à signer
 */
export function createVotePayload(
    roomId: string,
    emoji: string,
    timestamp: number
): string {
    return `${roomId}:${emoji}:${timestamp}`;
}
