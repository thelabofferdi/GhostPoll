# 🚀 Guide de Déploiement Rapide - GhostPoll

**Déploiement sur Cloudflare Pages via CLI**

---

## 📋 Prérequis

Avant de déployer, vous devez avoir :
- [ ] Un compte Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
- [ ] Une base Redis Upstash créée : https://console.upstash.com/

---

## 🗄️ Étape 1 : Créer la Base Redis Upstash (5 min)

### 1.1 Créer un compte Upstash
1. Aller sur https://console.upstash.com/
2. S'inscrire (gratuit)
3. Vérifier l'email

### 1.2 Créer une base Redis
1. Cliquer sur **"Create Database"**
2. Configurer :
   - **Name** : `ghostpoll-prod`
   - **Type** : `Regional` (plus rapide)
   - **Region** : Choisir la plus proche (ex: `eu-west-1` pour l'Europe)
   - **TLS** : Activé ✅
3. Cliquer sur **"Create"**

### 1.3 Récupérer les credentials
1. Dans l'onglet **"Details"**
2. Copier et sauvegarder :
   ```
   UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
   ```

⚠️ **Gardez ces valeurs en sécurité !**

---

## ☁️ Étape 2 : Déployer sur Cloudflare Pages (5 min)

### 2.1 Se connecter à Cloudflare

```bash
npx wrangler login
```

Cela va :
1. Ouvrir votre navigateur
2. Vous demander de vous connecter à Cloudflare
3. Autoriser Wrangler

### 2.2 Déployer l'application

```bash
npx wrangler pages deploy dist --project-name=ghostpoll
```

Cloudflare va :
1. Créer le projet "ghostpoll"
2. Uploader les fichiers du dossier `dist/`
3. Déployer sur son réseau global
4. Vous donner une URL (ex: `https://ghostpoll.pages.dev`)

**Temps estimé** : 1-2 minutes

---

## 🔧 Étape 3 : Configurer les Variables d'Environnement (3 min)

### 3.1 Accéder au Dashboard Cloudflare

1. Aller sur https://dash.cloudflare.com/
2. Cliquer sur **"Workers & Pages"**
3. Sélectionner votre projet **"ghostpoll"**
4. Aller dans **"Settings"** → **"Environment variables"**

### 3.2 Ajouter les variables

Cliquer sur **"Add variable"** pour chaque variable :

| Variable Name | Value | Production | Preview |
|---------------|-------|------------|---------|
| `UPSTASH_REDIS_URL` | `https://xxx.upstash.io` | ✅ | ✅ |
| `UPSTASH_REDIS_TOKEN` | `Axxxxx...` | ✅ | ✅ |
| `BASE_URL` | `https://ghostpoll.pages.dev` | ✅ | ❌ |

**Important** : 
- Cochez **"Encrypt"** pour chaque variable
- Cliquez sur **"Save"** après chaque ajout

### 3.3 Re-déployer pour appliquer les variables

```bash
npx wrangler pages deploy dist --project-name=ghostpoll
```

Ou dans le Dashboard Cloudflare :
- Aller dans **"Deployments"**
- Cliquer sur **"Retry deployment"** sur le dernier déploiement

---

## ✅ Étape 4 : Tester l'Application (2 min)

### 4.1 Ouvrir l'URL

Votre application est maintenant en ligne à :
```
https://ghostpoll.pages.dev
```

### 4.2 Tests à effectuer

- [ ] **Page d'accueil** : Vérifier que le design s'affiche correctement
- [ ] **Créer un poll** :
  - Entrer une question
  - Choisir un mode de vote
  - Cliquer sur "Create Ghost Poll"
- [ ] **Page de confirmation** :
  - Vérifier que le QR code s'affiche
  - Copier le lien public
- [ ] **Page de vote** :
  - Ouvrir le lien public
  - Voter avec un emoji
  - Vérifier que les résultats s'affichent
- [ ] **Dashboard admin** :
  - Ouvrir le lien admin
  - Vérifier les statistiques
  - Tester l'export JSON
  - Tester le verrouillage

### 4.3 Vérifier Redis

1. Retourner sur https://console.upstash.com/
2. Aller dans **"Data Browser"**
3. Vous devriez voir les clés créées :
   - `room:XXXXXX`
   - `admin:XXXXXX`
   - `votes:XXXXXX`

---

## 🎨 Étape 5 : Domaine Personnalisé (Optionnel)

### 5.1 Ajouter un domaine custom

1. Dans Cloudflare Pages → **"Custom domains"**
2. Cliquer sur **"Set up a custom domain"**
3. Entrer votre domaine (ex: `ghostpoll.com`)
4. Suivre les instructions DNS

### 5.2 Mettre à jour BASE_URL

Une fois le domaine configuré :
1. Aller dans **"Settings"** → **"Environment variables"**
2. Modifier `BASE_URL` :
   ```
   BASE_URL=https://ghostpoll.com
   ```
3. Re-déployer

---

## 🔄 Déploiements Futurs

### Déploiement manuel

Après chaque modification du code :

```bash
# 1. Build
npm run build

# 2. Deploy
npx wrangler pages deploy dist --project-name=ghostpoll
```

### Déploiement automatique (CI/CD)

**Option 1 : Via Git Integration**

1. Push votre code sur GitHub
2. Dans Cloudflare Pages → **"Settings"** → **"Builds & deployments"**
3. Connecter votre repo GitHub
4. Configurer :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
5. Chaque push sur `main` déclenchera un déploiement automatique

**Option 2 : Via GitHub Actions**

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ghostpoll
          directory: dist
```

---

## 📊 Monitoring

### Cloudflare Analytics

Dans le Dashboard Cloudflare Pages :
- **Analytics** : Trafic, visiteurs, pages vues
- **Logs** : Erreurs et requêtes
- **Performance** : Core Web Vitals

### Upstash Metrics

Dans Upstash Console :
- **Metrics** : Requêtes/s, latence, mémoire
- **Logs** : Commandes Redis exécutées

---

## 🐛 Troubleshooting

### Erreur : "Redis configuration missing"

**Cause** : Variables d'environnement non configurées

**Solution** :
1. Vérifier que `UPSTASH_REDIS_URL` et `UPSTASH_REDIS_TOKEN` sont bien définies
2. Re-déployer après avoir ajouté les variables

### Erreur : "Failed to create room"

**Cause** : Problème de connexion à Redis

**Solution** :
1. Vérifier que votre base Upstash est active
2. Tester la connexion :
   ```bash
   curl https://YOUR_REDIS_URL/get/test \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Les résultats ne s'affichent pas

**Cause** : Problème de polling ou de réseau

**Solution** :
1. Vérifier la console du navigateur (F12)
2. Vérifier les logs Cloudflare
3. Tester avec un autre navigateur

---

## 🎉 C'est Terminé !

Votre application **GhostPoll** est maintenant en production ! 🚀

**URL de production** : `https://ghostpoll.pages.dev`

**Prochaines étapes** :
- Partager l'URL sur les réseaux sociaux
- Collecter du feedback
- Monitorer les analytics
- Ajouter de nouvelles features

**Besoin d'aide ?**
- Documentation Nuxt : https://nuxt.com/docs
- Documentation Cloudflare : https://developers.cloudflare.com/pages/
- Documentation Upstash : https://docs.upstash.com/redis

---

**Bravo ! 🎊**
