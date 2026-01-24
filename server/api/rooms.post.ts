import { generateId, generateKey } from '../utils/nano'
import { redis } from '../utils/redis'
import { generateCustomQR, generateWhatsAppShareUrl } from '../utils/qrcode'
import { durationToMs, durationToSeconds } from '../utils/duration'
import type { CreateRoomRequest, CreateRoomResponse, Room, RoomType, RoomDuration, VoteMode } from '~/types'

export default defineEventHandler(async (event): Promise<CreateRoomResponse> => {
    try {
        const body = await readBody(event) as CreateRoomRequest

        // Validation du type de room
        const validTypes: RoomType[] = ['emoji_vote', 'poll']
        const roomType = body.type || 'emoji_vote'
        if (!validTypes.includes(roomType)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid room type'
            })
        }

        // Validation de la question (obligatoire pour poll)
        if (roomType === 'poll' && (!body.question || body.question.trim().length === 0)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question is required for poll type'
            })
        }

        if (body.question && body.question.trim().length > 200) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question too long (max 200 characters)'
            })
        }

        // Validation du mode de vote
        const validModes: VoteMode[] = ['single_vote', 'allow_revote']
        const voteMode = body.voteMode || 'single_vote'
        if (!validModes.includes(voteMode)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid vote mode'
            })
        }

        // Validation de la durée
        const validDurations: RoomDuration[] = ['1h', '6h', '12h', '24h', '48h']
        const duration = body.duration || '24h'
        if (!validDurations.includes(duration)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid duration'
            })
        }

        // Validation des options de sondage
        if (roomType === 'poll') {
            if (!body.pollOptions || body.pollOptions.length < 2 || body.pollOptions.length > 10) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Poll must have 2-10 options'
                })
            }
        }

        // Génération des IDs
        const roomId = generateId()
        const adminToken = generateKey()
        const secretKey = generateKey()

        const now = Date.now()
        const expiresAt = now + durationToMs(duration)

        // Création de l'objet Room
        const roomData: Room = {
            id: roomId,
            adminToken,
            secretKey,
            question: body.question?.trim(),
            type: roomType,
            voteMode,
            duration,
            pollOptions: roomType === 'poll'
                ? body.pollOptions!.map((text, index) => ({
                    id: `opt_${index}`,
                    text: text.trim(),
                    votes: 0
                }))
                : undefined,
            qrCustomization: body.qrCustomization,
            createdAt: now,
            expiresAt,
            locked: false,
            status: 'active',
            analytics: {
                totalParticipants: 0,
                peakActivity: 0,
                lastActivity: now
            },
            resultsVisibility: body.resultsVisibility || 'public',
            isRevealed: false
        }

        // URLs
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
        const publicUrl = `${baseUrl}/vote/${roomId}`
        const adminUrl = `${baseUrl}/admin?id=${roomId}&key=${adminToken}`

        // Génération du QR code personnalisé
        const qrCodeDataUrl = await generateCustomQR(publicUrl, body.qrCustomization)

        // URL de partage WhatsApp
        const whatsappShareUrl = generateWhatsAppShareUrl(publicUrl, body.question)

        // Sauvegarde dans Redis avec TTL
        const ttlSeconds = durationToSeconds(duration)
        try {
            await redis.set(`room:${roomId}`, JSON.stringify(roomData), { ex: ttlSeconds })

            // Initialiser les compteurs selon le type
            if (roomType === 'emoji_vote') {
                const emojis = ['😍', '😊', '😐', '😕', '😢']
                await Promise.all(emojis.map(emoji =>
                    redis.hset(`votes:${roomId}`, emoji, '0')
                ))
                await redis.expire(`votes:${roomId}`, ttlSeconds)
            } else if (roomType === 'poll') {
                const options = roomData.pollOptions!
                await Promise.all(options.map(option =>
                    redis.hset(`poll:${roomId}`, option.id, '0')
                ))
                await redis.expire(`poll:${roomId}`, ttlSeconds)
            }

        } catch (error) {
            console.error('[Rooms API DB Error]', error)
            throw createError({
                statusCode: 500,
                statusMessage: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
            })
        }

        // Retour client
        return {
            roomId,
            adminToken,
            publicUrl,
            adminUrl,
            qrCodeDataUrl,
            expiresAt,
            whatsappShareUrl
        }

    } catch (error: any) {
        console.error('[Rooms API Error]', error)

        // Si c'est déjà une erreur HTTP, la relancer
        if (error.statusCode) {
            throw error
        }

        // Sinon, erreur générique
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})
