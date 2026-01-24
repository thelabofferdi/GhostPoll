// Direct Redis test
const REDIS_URL = 'https://resolved-swan-41335.upstash.io'
const REDIS_TOKEN = 'AaF3AAIncDJmNTQ2ZGIwNmRkYWI0ZjMwYTJjYmU0NGNiNDczY2UwYXAyNDEzMzU'

async function testUpstash() {
  try {
    console.log('🔌 Testing Upstash Redis connection...')
    
    // Test SET
    const setResponse = await fetch(`${REDIS_URL}/SET/test:connection/success/EX/60`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    })
    const setResult = await setResponse.json()
    console.log('SET result:', setResult)
    
    // Test GET
    const getResponse = await fetch(`${REDIS_URL}/GET/test:connection`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
    })
    const getResult = await getResponse.json()
    console.log('GET result:', getResult)
    
    if (getResult.result === 'success') {
      console.log('✅ Redis connection successful!')
      
      // Test HSET
      await fetch(`${REDIS_URL}/HSET/test:hash/field1/value1`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      })
      
      // Test HGET
      const hgetResponse = await fetch(`${REDIS_URL}/HGET/test:hash/field1`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      })
      const hgetResult = await hgetResponse.json()
      console.log('HGET result:', hgetResult)
      
      if (hgetResult.result === 'value1') {
        console.log('✅ Redis hash operations working!')
      }
      
      // Cleanup
      await fetch(`${REDIS_URL}/DEL/test:connection`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      })
      await fetch(`${REDIS_URL}/DEL/test:hash`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
      })
      
      console.log('🧹 Cleanup complete')
      console.log('🎉 Upstash Redis is ready!')
      
    } else {
      console.log('❌ Redis test failed')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testUpstash()
