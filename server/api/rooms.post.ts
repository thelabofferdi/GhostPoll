import { generateId, generateKey } from '../utils/nano'
import { redis, setJson } from '../utils/redis'
import { generateCustomQR, generateWhatsAppShareUrl } from '../utils/qrcode'
import { durationToMs, durationToSeconds } from '../utils/duration'
import type { CreateRoomRequest, CreateRoomResponse, Room, RoomDuration, RoomType, VoteMode } from '~/types'

export default defineEventHandler(async (event): Promise<CreateRoomResponse> => {
    try {
        const body = await readBody(event) as CreateRoomRequest

        const validTypes: RoomType[] = ['emoji_vote', 'poll']
        const roomType = body.type || 'emoji_vote'
        if (!validTypes.includes(roomType)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid room type' })
        }

        const question = body.question?.trim()
        if (roomType === 'poll' && !question) {
            throw createError({ statusCode: 400, statusMessage: 'Question is required for poll type' })
        }

        if (question && question.length > 200) {
            throw createError({ statusCode: 400, statusMessage: 'Question too long (max 200 characters)' })
        }

        const validModes: VoteMode[] = ['single_vote', 'allow_revote']
        const voteMode = body.voteMode || 'single_vote'
        if (!validModes.includes(voteMode)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid vote mode' })
        }

        const validDurations: RoomDuration[] = ['1h', '6h', '12h', '24h', '48h']
        const duration = body.duration || '24h'
        if (!validDurations.includes(duration)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid duration' })
        }

        const cleanOptions = (body.pollOptions || [])
            .map(option => option.trim())
            .filter(Boolean)

        if (roomType === 'poll' && (cleanOptions.length < 2 || cleanOptions.length > 10)) {
            throw createError({ statusCode: 400, statusMessage: 'Poll must have 2-10 options' })
        }

        const roomId = generateId()
        const adminToken = generateKey()
        const secretKey = generateKey()
        const now = Date.now()
        const expiresAt = now + durationToMs(duration)
        const ttlSeconds = durationToSeconds(duration)

        const roomData: Room = {
            id: roomId,
            adminToken,
            secretKey,
            question,
            type: roomType,
            voteMode,
            duration,
            pollOptions: roomType === 'poll'
                ? cleanOptions.map((text, index) => ({ id: `opt_${index}`, text, votes: 0 }))
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

        const config = useRuntimeConfig()
        const configuredBaseUrl = process.env.BASE_URL || process.env.NUXT_PUBLIC_BASE_URL || config.public?.baseUrl
        const baseUrl = (configuredBaseUrl || 'http://localhost:3000').replace(/\/$/, '')
        const publicUrl = `${baseUrl}/vote/${roomId}`
        const adminUrl = `${baseUrl}/admin?id=${roomId}&key=${adminToken}`
        const qrCodeDataUrl = await generateCustomQR(publicUrl, body.qrCustomization)
        const whatsappShareUrl = generateWhatsAppShareUrl(publicUrl, question)

        try {
            await setJson(`room:${roomId}`, roomData, ttlSeconds)

            if (roomType === 'emoji_vote') {
                const emojis = ['😍', '😊', '😐', '😕', '😢']
                await Promise.all(emojis.map(emoji => redis.hset(`votes:${roomId}`, emoji, '0')))
                await redis.expire(`votes:${roomId}`, ttlSeconds)
            } else {
                await Promise.all(roomData.pollOptions!.map(option => redis.hset(`poll:${roomId}`, option.id, '0')))
                await redis.expire(`poll:${roomId}`, ttlSeconds)
            }
        } catch (error) {
            console.error('[Rooms API DB Error]', error)
            throw createError({
                statusCode: 500,
                statusMessage: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
            })
        }

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
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
    }
})
