#!/usr/bin/env node

import { redis } from './server/utils/redis.js'

const args = process.argv.slice(2)
const command = args[0]

async function main() {
  try {
    switch (command) {
      case 'get':
        if (!args[1]) throw new Error('Usage: redis-cli.js get <key>')
        const value = await redis.get(args[1])
        console.log(value || 'null')
        break

      case 'set':
        if (!args[1] || !args[2]) throw new Error('Usage: redis-cli.js set <key> <value> [ttl]')
        const ttl = args[3] ? { ex: parseInt(args[3]) } : undefined
        await redis.set(args[1], args[2], ttl)
        console.log('OK')
        break

      case 'del':
        if (!args[1]) throw new Error('Usage: redis-cli.js del <key>')
        await redis.del(args[1])
        console.log('OK')
        break

      case 'exists':
        if (!args[1]) throw new Error('Usage: redis-cli.js exists <key>')
        const exists = await redis.exists(args[1])
        console.log(exists ? '1' : '0')
        break

      case 'hget':
        if (!args[1] || !args[2]) throw new Error('Usage: redis-cli.js hget <key> <field>')
        const hvalue = await redis.hget(args[1], args[2])
        console.log(hvalue || 'null')
        break

      case 'hgetall':
        if (!args[1]) throw new Error('Usage: redis-cli.js hgetall <key>')
        const hash = await redis.hgetall(args[1])
        console.log(JSON.stringify(hash, null, 2))
        break

      case 'hset':
        if (!args[1] || !args[2] || !args[3]) throw new Error('Usage: redis-cli.js hset <key> <field> <value>')
        await redis.hset(args[1], args[2], args[3])
        console.log('OK')
        break

      case 'hincrby':
        if (!args[1] || !args[2] || !args[3]) throw new Error('Usage: redis-cli.js hincrby <key> <field> <increment>')
        const newVal = await redis.hincrby(args[1], args[2], parseInt(args[3]))
        console.log(newVal)
        break

      case 'rooms':
        console.log('Active rooms:')
        // Mock implementation - in real Redis you'd use SCAN
        for (let i = 0; i < 10; i++) {
          const roomId = `room:TEST${i}`
          const exists = await redis.exists(roomId)
          if (exists) {
            const room = await redis.get(roomId)
            console.log(`${roomId}: ${room}`)
          }
        }
        break

      case 'votes':
        if (!args[1]) throw new Error('Usage: redis-cli.js votes <roomId>')
        const votesKey = `votes:${args[1]}`
        const votes = await redis.hgetall(votesKey)
        console.log(`Votes for room ${args[1]}:`)
        console.log(JSON.stringify(votes, null, 2))
        break

      case 'create-test-room':
        const roomId = args[1] || 'TEST123'
        const roomData = {
          id: roomId,
          question: 'Test question?',
          voteMode: 'single_vote',
          status: 'active',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          locked: false
        }
        await redis.set(`room:${roomId}`, JSON.stringify(roomData), { ex: 86400 })
        await redis.set(`admin:${roomId}`, 'testadminkey', { ex: 86400 })
        console.log(`Created test room: ${roomId}`)
        console.log(`Admin key: testadminkey`)
        break

      case 'cleanup':
        console.log('Cleaning up test data...')
        const testKeys = ['room:TEST123', 'admin:TEST123', 'votes:TEST123']
        for (const key of testKeys) {
          await redis.del(key)
        }
        console.log('Cleanup complete')
        break

      case 'help':
      default:
        console.log(`
Redis CLI for GhostPoll

Usage: node redis-cli.js <command> [args...]

Commands:
  get <key>                     Get value
  set <key> <value> [ttl]       Set value with optional TTL
  del <key>                     Delete key
  exists <key>                  Check if key exists
  hget <key> <field>            Get hash field
  hgetall <key>                 Get all hash fields
  hset <key> <field> <value>    Set hash field
  hincrby <key> <field> <inc>   Increment hash field
  
  rooms                         List active rooms
  votes <roomId>                Show votes for room
  create-test-room [roomId]     Create test room
  cleanup                       Remove test data
  help                          Show this help

Examples:
  node redis-cli.js get room:ABC123
  node redis-cli.js votes ABC123
  node redis-cli.js create-test-room
  node redis-cli.js cleanup
        `)
        break
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
