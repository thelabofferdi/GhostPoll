#!/bin/bash

echo "🗳️  GhostPoll Redis CLI Test Suite"
echo "=================================="

# Test 1: Create test room
echo ""
echo "📝 Test 1: Creating test room..."
node redis-standalone.js create-test DEMO123

# Test 2: Add some votes
echo ""
echo "🗳️  Test 2: Adding test votes..."
node redis-standalone.js vote-test DEMO123 😍
node redis-standalone.js vote-test DEMO123 😍
node redis-standalone.js vote-test DEMO123 😊
node redis-standalone.js vote-test DEMO123 😐

# Test 3: Show results
echo ""
echo "📊 Test 3: Showing results..."
node redis-standalone.js votes DEMO123

# Test 4: Simulate more votes
echo ""
echo "🎭 Test 4: Simulating realistic votes..."
node redis-standalone.js simulate DEMO123

# Test 5: Final results
echo ""
echo "📈 Test 5: Final results..."
node redis-standalone.js votes DEMO123

echo ""
echo "✅ All tests completed!"
echo ""
echo "🌐 You can now test the web interface:"
echo "   Vote: http://localhost:3000/vote?id=DEMO123"
echo "   Admin: http://localhost:3000/admin?id=DEMO123&key=testkey123"
echo ""
echo "🧹 To cleanup: node redis-standalone.js cleanup DEMO123"
