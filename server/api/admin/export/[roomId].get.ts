import { redis } from '../../../utils/redis'
import type { Room } from '~/types'

export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 501,
    statusMessage: 'PDF export temporarily disabled'
  })
})
