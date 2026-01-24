import { $fetch } from 'ofetch'

const BASE_URL = 'http://localhost:3000'

async function runTest() {
    console.log('🚀 Starting Anti-Cheat Stress Test')

    // 1. Create a Room
    console.log('\n📝 Creating Test Room...')
    const room = await $fetch(`${BASE_URL}/api/rooms`, {
        method: 'POST',
        body: { type: 'emoji_vote' }
    })
    console.log('✅ Room created:', room.roomId)

    // 2. Simulate 15 votes from same IP (Volume Limit is 10)
    console.log('\n🤖 Simulating 15 votes from same IP (Limit is 10)...')

    let successCount = 0
    let blockCount = 0

    for (let i = 1; i <= 15; i++) {
        try {
            // Unique fingerprint for each vote to bypass Layer 1 (Identity), testing Layer 2 (IP Cap)
            const fingerprint = `data:image/png;base64,fakefingerprint${i}${Math.random()}`

            await $fetch(`${BASE_URL}/api/vote`, {
                method: 'POST',
                headers: {
                    'User-Agent': 'StressTestBot/1.0'
                },
                body: {
                    roomId: room.roomId,
                    emoji: '😍',
                    fingerprint // changing fingerprint
                }
            })
            console.log(`✅ Vote ${i}: Accepted`)
            successCount++
        } catch (e: any) {
            if (e.statusCode === 429) {
                console.log(`🛡️ Vote ${i}: BLOCKED (429 Too Many Requests)`)
                blockCount++
            } else {
                console.log(`❌ Vote ${i}: Error ${e.statusCode}`, e.message)
            }
        }
        // Small delay to avoid Speed Limit (Layer 3) blocking us before Volume Limit (Layer 2)
        await new Promise(r => setTimeout(r, 600))
    }

    console.log('\n📊 Results:')
    console.log(`Accepted: ${successCount} (Expected 10)`)
    console.log(`Blocked:  ${blockCount}  (Expected 5)`)

    if (successCount === 10 && blockCount >= 5) {
        console.log('\n✅ TEST PASSED: Volume Limit works!')
    } else {
        console.log('\n❌ TEST FAILED: Unexpected results')
        process.exit(1)
    }
}

runTest()
