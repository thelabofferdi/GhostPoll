/**
 * Types pour Ephemeral Vote (Server-side)
 * Copie des types principaux depuis /types/index.ts pour usage serveur
 */

// ============================================
// CORE TYPES
// ============================================

/**
 * Emoji autorisés pour les votes
 */
export type VoteEmoji = '😍' | '😊' | '😐' | '😕' | '😢';

/**
 * Statut d'une room
 */
export type RoomStatus = 'active' | 'locked' | 'expired';

/**
 * Mode de vote
 */
export type VoteMode =
    | 'single_vote'      // 1 vote unique par personne (défaut, éthique)
    | 'allow_revote'     // Peut changer son vote
    | 'multiple_votes';  // Peut voter plusieurs fois (applaudimètre)

/**
 * Room de vote
 */
export interface Room {
    /** Identifiant unique (6 caractères, ex: ABC123) */
    id: string;

    /** Clé admin (12 caractères) */
    adminKey?: string;

    /** Question posée (optionnel) */
    question?: string;

    /** Mode de vote (défaut: single_vote) */
    voteMode: VoteMode;

    /** Timestamp de création (ISO string) */
    createdAt: string;

    /** Timestamp d'expiration (ISO string) */
    expiresAt: string;

    /** Room verrouillée (plus de votes acceptés) */
    locked?: boolean;

    /** Statut actuel */
    status: RoomStatus;
}

/**
 * Résultats de vote
 */
export interface VoteResults {
    '😍': number;
    '😊': number;
    '😐': number;
    '😕': number;
    '😢': number;
}

/**
 * Vote individuel (pour signature HMAC)
 */
export interface Vote {
    roomId: string;
    emoji: VoteEmoji;
    timestamp: number;
    signature: string;
}

/**
 * Fingerprint d'un votant
 */
export interface Fingerprint {
    hash: string;
    createdAt: number;
}

// ============================================
// REDIS TYPES
// ============================================

/**
 * Clés Redis
 */
export interface RedisKeys {
    /** room:{roomId} */
    room: (roomId: string) => string;

    /** votes:{roomId} */
    votes: (roomId: string) => string;

    /** voted:{roomId}:{fingerprint} */
    voted: (roomId: string, fingerprint: string) => string;

    /** ratelimit:{roomId} */
    ratelimit: (roomId: string) => string;

    /** ratelimit:ip:{ip} */
    ratelimitIp: (ip: string) => string;
}

/**
 * TTL Redis (secondes)
 */
export const REDIS_TTL = {
    room: 24 * 60 * 60,        // 24 heures
    votes: 24 * 60 * 60,       // 24 heures
    voted: 24 * 60 * 60,       // 24 heures
    ratelimit: 60,             // 1 minute
} as const;
