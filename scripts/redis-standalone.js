// Standalone Redis CLI for GhostPoll
// Usage: node redis-standalone.js <command> [args...]

// Simple Redis client for testing
class MockRedis {
  constructor() {
    this.store = new Map()
  }

  async get(key) {
    const item = this.store.get(key)
    if (!item) return null
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key)
      return null
    }
    return item.value
  }

  async set(key, value, options = {}) {
    const expiresAt = options.ex ? Date.now() + (options.ex * 1000) : undefined
    this.store.set(key, { value, expiresAt })
  }

  async del(key) {
    this.store.delete(key)
  }

  async hget(key, field) {
    const data = await this.get(key)
    if (!data) return null
    const hash = JSON.parse(data)
    return hash[field] || null
  }

  async hset(key, field, value) {
    let data = await this.get(key)
    const hash = data ? JSON.parse(data) : {}
    hash[field] = value
    await this.set(key, JSON.stringify(hash))
  }

  async hgetall(key) {
    const data = await this.get(key)
    return data ? JSON.parse(data) : {}
  }

  async hincrby(key, field, increment) {
    const current = await this.hget(key, field) || '0'
    const newValue = parseInt(current) + increment
    await this.hset(key, field, newValue.toString())
    return newValue
  }
}

const redis = new MockRedis()
const args = process.argv.slice(2)
const command = args[0]

async function main() {
  try {
    switch (command) {
      case 'create-test':
        const roomId = args[1] || 'TEST123'
        const roomData = {
          id: roomId,
          question: 'How was this test session?',
          voteMode: 'single_vote',
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          locked: false
        }
        
        await redis.set(`room:${roomId}`, JSON.stringify(roomData), { ex: 86400 })
        await redis.set(`admin:${roomId}`, 'testkey123', { ex: 86400 })
        
        // Initialize votes
        const emojis = ['😍', '😊', '😐', '😕', '😢']
        for (const emoji of emojis) {
          await redis.hset(`votes:${roomId}`, emoji, '0')
        }
        
        console.log(`✅ Created test room: ${roomId}`)
        console.log(`🔑 Admin key: testkey123`)
        console.log(`🗳️  Vote URL: http://localhost:3000/vote?id=${roomId}`)
        console.log(`⚙️  Admin URL: http://localhost:3000/admin?id=${roomId}&key=testkey123`)
        break

      case 'vote-test':
        if (!args[1] || !args[2]) throw new Error('Usage: node redis-standalone.js vote-test <roomId> <emoji>')
        const voteRoomId = args[1]
        const emoji = args[2]
        const validEmojis = ['😍', '😊', '😐', '😕', '😢']
        
        if (!validEmojis.includes(emoji)) {
          throw new Error(`Invalid emoji. Use: ${validEmojis.join(' ')}`)
        }
        
        const newCount = await redis.hincrby(`votes:${voteRoomId}`, emoji, 1)
        console.log(`✅ Added vote ${emoji} to room ${voteRoomId} (total: ${newCount})`)
        break

      case 'votes':
        if (!args[1]) throw new Error('Usage: node redis-standalone.js votes <roomId>')
        const votesData = await redis.hgetall(`votes:${args[1]}`)
        console.log(`🗳️  Votes for room ${args[1]}:`)
        Object.entries(votesData).forEach(([emoji, count]) => {
          console.log(`  ${emoji}: ${count}`)
        })
        break

      case 'room':
        if (!args[1]) throw new Error('Usage: node redis-standalone.js room <roomId>')
        const roomDataStr = await redis.get(`room:${args[1]}`)
        if (roomDataStr) {
          const room = JSON.parse(roomDataStr)
          console.log(`🏠 Room ${args[1]}:`)
          console.log(`  Question: ${room.question}`)
          console.log(`  Mode: ${room.voteMode}`)
          console.log(`  Status: ${room.status}`)
          console.log(`  Created: ${room.createdAt}`)
          console.log(`  Expires: ${room.expiresAt}`)
          console.log(`  Locked: ${room.locked}`)
        } else {
          console.log('❌ Room not found')
        }
        break

      case 'cleanup':
        const cleanupId = args[1] || 'TEST123'
        await redis.del(`room:${cleanupId}`)
        await redis.del(`admin:${cleanupId}`)
        await redis.del(`votes:${cleanupId}`)
        console.log(`🧹 Cleaned up room: ${cleanupId}`)
        break

      case 'simulate':
        const simRoomId = args[1] || 'TEST123'
        console.log(`🎭 Simulating votes for room ${simRoomId}...`)
        
        const simEmojis = ['😍', '😊', '😐', '😕', '😢']
        const votes = [5, 8, 3, 2, 1] // Simulate realistic vote distribution
        
        for (let i = 0; i < simEmojis.length; i++) {
          for (let j = 0; j < votes[i]; j++) {
            await redis.hincrby(`votes:${simRoomId}`, simEmojis[i], 1)
          }
        }
        
        console.log('✅ Simulation complete!')
        console.log('📊 Results:')
        const results = await redis.hgetall(`votes:${simRoomId}`)
        Object.entries(results).forEach(([emoji, count]) => {
          console.log(`  ${emoji}: ${count}`)
        })
        break

      case 'help':
      default:
        console.log(`
🗳️  GhostPoll Redis CLI (Standalone)

Usage: node redis-standalone.js <command> [args...]

Commands:
  create-test [roomId]       Create test room (default: TEST123)
  vote-test <roomId> <emoji> Add test vote
  votes <roomId>             Show vote results  
  room <roomId>              Show room details
  simulate [roomId]          Simulate realistic votes
  cleanup [roomId]           Delete test data
  help                       Show this help

Examples:
  node redis-standalone.js create-test
  node redis-standalone.js vote-test TEST123 😍
  node redis-standalone.js simulate TEST123
  node redis-standalone.js votes TEST123
  node redis-standalone.js cleanup TEST123

Note: This uses in-memory storage for testing.
For production Redis, configure UPSTASH_REDIS_URL in your environment.
        `)
        break
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
