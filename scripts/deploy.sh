#!/bin/bash

echo "🚀 Déploiement GhostPoll sur Cloudflare Pages"

# Build de l'application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Instructions pour le déploiement manuel
echo ""
echo "🔧 Pour déployer manuellement:"
echo "1. Connectez-vous à Cloudflare Dashboard"
echo "2. Allez dans Pages > Create a project"
echo "3. Uploadez le dossier 'dist/'"
echo "4. Configurez les variables d'environnement:"
echo "   - UPSTASH_REDIS_URL=your_redis_url"
echo "   - UPSTASH_REDIS_TOKEN=your_redis_token"
echo "   - BASE_URL=https://your-domain.pages.dev"
echo ""
echo "📁 Fichiers prêts dans: ./dist/"
echo "🌐 Ou utilisez: npx wrangler pages deploy dist --project-name ghostpoll"
echo "   (nécessite une authentification interactive)"
