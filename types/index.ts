/**
 * Types pour Ephemeral Vote
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
  | 'allow_revote';    // Peut changer son vote

/**
 * Type de room
 */
export type RoomType =
  | 'emoji_vote'       // Vote avec émojis (défaut)
  | 'poll'             // Sondage avec options multiples (comme Telegram)

/**
 * Durée de vie d'une room
 */
export type RoomDuration = '1h' | '6h' | '12h' | '24h' | '48h'

/**
 * Option de sondage
 */
export interface PollOption {
  id: string
  text: string
  votes: number
}



/**
 * Room de vote
 */
export interface Room {
  /** Identifiant unique (6 caractères, ex: ABC123) */
  id: string;

  /** Token admin (32 caractères) */
  adminToken: string;

  /** Clé secrète pour HMAC (32 caractères) */
  secretKey: string;

  /** Question posée (optionnel) */
  question?: string;

  /** Type de room */
  type: RoomType;

  /** Mode de vote (défaut: single_vote) */
  voteMode: VoteMode;

  /** Durée de vie */
  duration: RoomDuration;

  /** Options pour les sondages */
  pollOptions?: PollOption[];

  /** Personnalisation QR Code */
  qrCustomization?: {
    logo?: string;
    primaryColor?: string;
    backgroundColor?: string;
  };

  /** Timestamp de création (ms) */
  createdAt: number;

  /** Timestamp d'expiration (ms) */
  expiresAt: number;

  /** Room verrouillée (plus de votes acceptés) */
  locked: boolean;

  /** Statut actuel */
  status: RoomStatus;

  /** Analytics */
  analytics: {
    totalParticipants: number;
    peakActivity: number;
    lastActivity: number;
  };

  /** Visibilité des résultats */
  resultsVisibility: 'public' | 'after_reveal';

  /** Si les résultats ont été révélés (pour le mode after_reveal) */
  isRevealed: boolean;
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
 * Fingerprint d'un votant (amélioré)
 */
export interface Fingerprint {
  hash: string;
  createdAt: number;
  canvas?: string;
  timezone?: string;
  language?: string;
  screen?: string;
  fonts?: string[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * POST /api/rooms - Créer une room
 */
export interface CreateRoomRequest {
  question?: string;
  type?: RoomType; // Défaut: 'emoji_vote'
  voteMode?: VoteMode; // Défaut: 'single_vote'
  duration?: RoomDuration; // Défaut: '24h'
  pollOptions?: string[]; // Pour type 'poll'
  qrCustomization?: {
    logo?: string;
    primaryColor?: string;
    backgroundColor?: string;
  };
  resultsVisibility?: 'public' | 'after_reveal';
}

export interface CreateRoomResponse {
  roomId: string;
  adminToken: string;
  publicUrl: string;
  adminUrl: string;
  qrCodeDataUrl: string | null;
  expiresAt: number;
  whatsappShareUrl: string;
}

/**
 * POST /api/vote - Soumettre un vote
 */
export interface SubmitVoteRequest {
  roomId: string;
  emoji: VoteEmoji;
  fingerprint: string;
}

export interface SubmitVoteResponse {
  success: true;
  currentResults: VoteResults;
}

/**
 * GET /api/results/:roomId - Récupérer les résultats
 */
export interface GetResultsResponse {
  roomId: string;
  question?: string;
  type: RoomType;
  results: VoteResults | PollOption[] | null;
  total: number;
  locked: boolean;
  voteMode: VoteMode;
  expiresAt: number;
  status: RoomStatus | 'hidden';
  resultsVisibility: 'public' | 'after_reveal';
  isRevealed: boolean;
}

/**
 * POST /api/admin/lock - Verrouiller une room
 */
export interface LockRoomRequest {
  roomId: string;
  adminToken: string;
}

export interface LockRoomResponse {
  success: true;
  locked: true;
}

/**
 * POST /api/admin/close - Fermer une room
 */
export interface CloseRoomRequest {
  roomId: string;
  adminToken: string;
}

export interface CloseRoomResponse {
  success: true;
  message: string;
}

/**
 * GET /api/admin/export/:roomId - Exporter les résultats
 */
export interface ExportResultsResponse {
  roomId: string;
  question?: string;
  type: RoomType;
  createdAt: number;
  expiresAt: number;
  exportedAt: number;
  results: VoteResults | PollOption[];
  total: number;
  locked: boolean;
}

/**
 * GET /api/status - Statut du service
 */
export interface ServiceStatusResponse {
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  redis: 'connected' | 'disconnected';
  latency: number;
  version: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Codes d'erreur API
 */
export type ErrorCode =
  | 'room_not_found'
  | 'room_expired'
  | 'room_locked'
  | 'already_voted'
  | 'rate_limit'
  | 'invalid_emoji'
  | 'invalid_fingerprint'
  | 'invalid_admin_token'
  | 'redis_error'
  | 'internal_error';

/**
 * Réponse d'erreur API
 */
export interface ApiError {
  error: ErrorCode;
  message: string;
  statusCode: number;
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

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Configuration de l'application
 */
export interface AppConfig {
  /** Durée de vie des rooms (ms) */
  roomTTL: number;

  /** Limite de votes par room par minute */
  rateLimitPerRoom: number;

  /** Limite de votes par IP par minute */
  rateLimitPerIP: number;

  /** Délai minimum entre 2 votes (ms) */
  voteCooldown: number;

  /** URL de base de l'application */
  baseUrl: string;

  /** Environnement */
  env: 'development' | 'production';
}

/**
 * Contexte de requête
 */
export interface RequestContext {
  /** Adresse IP du client */
  ip: string;

  /** User-Agent */
  userAgent: string;

  /** Région ou zone infra optionnelle */
  region?: string;

  /** Timestamp de la requête */
  timestamp: number;
}

/**
 * Résultat d'une opération
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// ============================================
// CONSTANTS
// ============================================

/**
 * Emojis de vote disponibles
 */
export const VOTE_EMOJIS: readonly VoteEmoji[] = ['😍', '😊', '😐', '😕', '😢'] as const;

/**
 * Labels des emojis
 */
export const EMOJI_LABELS: Record<VoteEmoji, string> = {
  '😍': 'Excellent',
  '😊': 'Bien',
  '😐': 'Moyen',
  '😕': 'Décevant',
  '😢': 'Très mauvais',
};

/**
 * Couleurs des emojis
 */
export const EMOJI_COLORS: Record<VoteEmoji, string> = {
  '😍': '#ef4444', // Red
  '😊': '#10b981', // Green
  '😐': '#6b7280', // Gray
  '😕': '#f59e0b', // Amber
  '😢': '#8b5cf6', // Purple
};

/**
 * Labels des modes de vote
 */
export const VOTE_MODE_LABELS: Record<VoteMode, string> = {
  'single_vote': '1 vote unique',
  'allow_revote': 'Peut modifier son vote',
};

/**
 * Descriptions des modes de vote
 */
export const VOTE_MODE_DESCRIPTIONS: Record<VoteMode, string> = {
  'single_vote': 'Chaque personne ne peut voter qu\'une seule fois (recommandé)',
  'allow_revote': 'Les participants peuvent changer d\'avis et modifier leur vote',
};

/**
 * Configuration par défaut
 */
export const DEFAULT_CONFIG: AppConfig = {
  roomTTL: 24 * 60 * 60 * 1000, // 24 heures
  rateLimitPerRoom: 10,          // 10 votes/min
  rateLimitPerIP: 5,             // 5 votes/min
  voteCooldown: 3000,            // 3 secondes
  baseUrl: 'https://ephemeral.vote',
  env: 'production',
};

/**
 * TTL Redis (secondes)
 */
export const REDIS_TTL = {
  room: 24 * 60 * 60,        // 24 heures
  votes: 24 * 60 * 60,       // 24 heures
  voted: 24 * 60 * 60,       // 24 heures
  ratelimit: 60,             // 1 minute
} as const;
