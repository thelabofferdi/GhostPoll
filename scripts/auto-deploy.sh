#!/bin/bash

echo "🚀 GhostPoll Auto-Deploy Script"
echo "==============================="

# Check if we have Cloudflare credentials
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Missing CLOUDFLARE_API_TOKEN environment variable"
    echo ""
    echo "To deploy automatically, you need:"
    echo "1. Get API token from https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Set: export CLOUDFLARE_API_TOKEN=your_token"
    echo "3. Run this script again"
    echo ""
    echo "🔧 Manual deployment:"
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Pages > Create project > Upload assets"
    echo "3. Upload dist/ folder"
    echo "4. Set name: ghostpoll"
    exit 1
fi

echo "✅ API token found"
echo "📦 Preparing deployment..."

# Build the project
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo "🚀 Deploying to Cloudflare Pages..."

# Deploy using wrangler
npx wrangler pages deploy dist --project-name ghostpoll --compatibility-date 2026-01-20

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "🌐 Your app is live at: https://ghostpoll.pages.dev"
    echo ""
    echo "🧪 Test it:"
    echo "- Create a poll"
    echo "- Test voting"
    echo "- Check admin panel"
else
    echo "❌ Deployment failed"
    echo "Try manual deployment via Cloudflare Dashboard"
fi
