# 🚀 GhostPoll - DEPLOYMENT GUIDE

## ✅ Status: READY TO DEPLOY

**Build Complete**: 562 kB (171 kB gzip)  
**Redis**: Configured with Upstash  
**Files**: Ready in `dist/` folder

---

## 🌐 Deployment Options

### Option 1: Wrangler CLI (Recommended)
```bash
npx wrangler pages deploy dist --project-name ephemeral-vote
```
*Note: Requires interactive terminal*

### Option 2: Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Pages** > **Create a project** > **Upload assets**
3. Upload the entire `dist/` folder
4. Set project name: `ephemeral-vote`
5. Deploy!

### Option 3: GitHub Integration
1. Push this repo to GitHub
2. Connect repo to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Auto-deploy on every push

---

## 🔧 Environment Variables

**Already configured in `wrangler.toml`:**
```toml
[vars]
UPSTASH_REDIS_URL = "https://resolved-swan-41335.upstash.io"
UPSTASH_REDIS_TOKEN = "AaF3AAIncDJmNTQ2ZGIwNmRkYWI0ZjMwYTJjYmU0NGNiNDczY2UwYXAyNDEzMzU"
BASE_URL = "https://ephemeral-vote.pages.dev"
```

**If using Dashboard deployment, add these manually in:**
Pages > Settings > Environment variables

---

## 📁 Deployment Files

```
dist/
├── _worker.js/         # Nitro server (562 kB)
├── _nuxt/             # Client assets
├── assets/            # Static files
├── _routes.json       # Routing config
├── _headers           # HTTP headers
└── _redirects         # URL redirects
```

---

## 🎯 Post-Deployment

1. **Test the live app** at your Cloudflare Pages URL
2. **Create a test poll** to verify Redis connection
3. **Check admin panel** functionality
4. **Test mobile responsiveness**

---

## 🆘 Troubleshooting

**If Redis connection fails:**
- Verify environment variables in Cloudflare Dashboard
- Check Upstash Redis is active
- Test with: `node test-upstash.js`

**If build fails:**
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies installed

---

**🎊 Ready to launch GhostPoll!**

*Deploy now and start collecting ephemeral feedback!*
