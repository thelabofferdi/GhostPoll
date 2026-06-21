import { generateCustomQR } from '../utils/qrcode'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const data = typeof query.data === 'string' ? query.data : ''

  if (!data || data.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid QR data' })
  }

  const dataUrl = await generateCustomQR(data)
  if (!dataUrl) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate QR code' })
  }

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'no-store')
  return Buffer.from(base64, 'base64')
})
