import { closeRedis, redis } from '../server/utils/redis'

const args = process.argv.slice(2)
const command = args[0]

async function main() {
  try {
    switch (command) {
      case 'get':
        if (!args[1]) throw new Error('Usage: tsx redis-cli.ts get <key>')
        const value = await redis.get(args[1])
        console.log(value || 'null')
        break

      case 'set':
        if (!args[1] || !args[2]) throw new Error('Usage: tsx redis-cli.ts set <key> <value> [ttl]')
        const ttl = args[3] ? { ex: parseInt(args[3]) } : undefined
        await redis.set(args[1], args[2], ttl)
        console.log('OK')
        break

      case 'hgetall':
        if (!args[1]) throw new Error('Usage: tsx redis-cli.ts hgetall <key>')
        const hash = await redis.hgetall(args[1])
        console.log(JSON.stringify(hash, null, 2))
        break

      case 'votes':
        if (!args[1]) throw new Error('Usage: tsx redis-cli.ts votes <roomId>')
        const votesKey = `votes:${args[1]}`
        const votes = await redis.hgetall(votesKey)
        console.log(`Votes for room ${args[1]}:`)
        Object.entries(votes).forEach(([emoji, count]) => {
          console.log(`${emoji}: ${count}`)
        })
        break

      case 'room':
        if (!args[1]) throw new Error('Usage: tsx redis-cli.ts room <roomId>')
        const roomData = await redis.get(`room:${args[1]}`)
        if (roomData) {
          const room = JSON.parse(roomData as string)
          console.log(`Room ${args[1]}:`)
          console.log(`Question: ${room.question}`)
          console.log(`Mode: ${room.voteMode}`)
          console.log(`Status: ${room.status}`)
          console.log(`Created: ${room.createdAt}`)
          console.log(`Expires: ${room.expiresAt}`)
          console.log(`Locked: ${room.locked}`)
        } else {
          console.log('Room not found')
        }
        break

      case 'create-test':
        const testRoomId = args[1] || 'TEST123'
        const adminToken = 'testkey123'
        const now = Date.now()
        const testRoomData = {
          id: testRoomId,
          adminToken,
          secretKey: 'testsecret123',
          question: 'How was this test?',
          type: 'emoji_vote',
          voteMode: 'single_vote',
          duration: '24h',
          status: 'active',
          createdAt: now,
          expiresAt: now + 24 * 60 * 60 * 1000,
          locked: false,
          analytics: {
            totalParticipants: 0,
            peakActivity: 0,
            lastActivity: now
          },
          resultsVisibility: 'public',
          isRevealed: false
        }
        await redis.set(`room:${testRoomId}`, JSON.stringify(testRoomData), { ex: 86400 })
        
        // Initialize votes
        const emojis = ['😍', '😊', '😐', '😕', '😢']
        for (const emoji of emojis) {
          await redis.hset(`votes:${testRoomId}`, emoji, '0')
        }
        
        console.log(`✅ Created test room: ${testRoomId}`)
        console.log(`🔑 Admin key: ${adminToken}`)
        console.log(`🗳️  Vote URL: http://localhost:3000/vote/${testRoomId}`)
        console.log(`⚙️  Admin URL: http://localhost:3000/admin?id=${testRoomId}&key=${adminToken}`)
        break

      case 'vote-test':
        if (!args[1] || !args[2]) throw new Error('Usage: tsx redis-cli.ts vote-test <roomId> <emoji>')
        const voteRoomId = args[1]
        const emoji = args[2]
        const validEmojis = ['😍', '😊', '😐', '😕', '😢']
        
        if (!validEmojis.includes(emoji)) {
          throw new Error(`Invalid emoji. Use: ${validEmojis.join(' ')}`)
        }
        
        await redis.hincrby(`votes:${voteRoomId}`, emoji, 1)
        console.log(`✅ Added vote ${emoji} to room ${voteRoomId}`)
        break

      case 'cleanup':
        const cleanupRoomId = args[1] || 'TEST123'
        await redis.del(`room:${cleanupRoomId}`)
        await redis.del(`votes:${cleanupRoomId}`)
        console.log(`🧹 Cleaned up room: ${cleanupRoomId}`)
        break

      case 'help':
      default:
        console.log(`
🗳️  GhostPoll Redis CLI

Usage: tsx scripts/redis-cli.ts <command> [args...]

Commands:
  get <key>                 Get value
  set <key> <value> [ttl]   Set value with TTL
  hgetall <key>             Get hash
  
  room <roomId>             Show room details
  votes <roomId>            Show vote results
  create-test [roomId]      Create test room
  vote-test <roomId> <emoji> Add test vote
  cleanup [roomId]          Delete test data
  
Examples:
  tsx scripts/redis-cli.ts create-test
  tsx scripts/redis-cli.ts vote-test TEST123 😍
  tsx scripts/redis-cli.ts votes TEST123
  tsx scripts/redis-cli.ts room TEST123
  tsx scripts/redis-cli.ts cleanup TEST123
        `)
        break
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().finally(async () => {
  await closeRedis()
})
