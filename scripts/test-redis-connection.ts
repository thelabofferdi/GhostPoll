// Test Redis connection
import { redis } from './server/utils/redis'

async function testRedis() {
  try {
    console.log('🔌 Testing Redis connection...')
    
    // Test basic operations
    await redis.set('test:connection', 'success', { ex: 60 })
    const result = await redis.get('test:connection')
    
    if (result === 'success') {
      console.log('✅ Redis connection successful!')
      
      // Test hash operations
      await redis.hset('test:hash', 'field1', 'value1')
      const hashResult = await redis.hget('test:hash', 'field1')
      
      if (hashResult === 'value1') {
        console.log('✅ Redis hash operations working!')
      }
      
      // Cleanup
      await redis.del('test:connection')
      await redis.del('test:hash')
      
      console.log('🧹 Test cleanup complete')
      console.log('🎉 Redis is ready for production!')
      
    } else {
      console.log('❌ Redis connection failed')
    }
    
  } catch (error) {
    console.error('❌ Redis error:', error.message)
  }
}

testRedis()
