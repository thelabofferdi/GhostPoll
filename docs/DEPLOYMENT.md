# 🚀 Guide de Déploiement - GhostPoll

Ce guide vous accompagne dans le déploiement de GhostPoll sur Cloudflare Pages avec Upstash Redis.

---

## 📋 Prérequis

1. **Compte Cloudflare** (gratuit) : https://dash.cloudflare.com/sign-up
2. **Compte Upstash** (gratuit) : https://console.upstash.com/
3. **Node.js 18+** installé localement
4. **Git** configuré

---

## 🗄️ Étape 1 : Configuration Upstash Redis

### 1.1 Créer une base de données Redis

1. Connectez-vous à [Upstash Console](https://console.upstash.com/)
2. Cliquez sur **"Create Database"**
3. Configurez :
   - **Name** : `ghostpoll-prod`
   - **Type** : `Regional` (plus rapide)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs
   - **TLS** : Activé (recommandé)
4. Cliquez sur **"Create"**

### 1.2 Récupérer les credentials

Une fois la base créée :

1. Allez dans l'onglet **"Details"**
2. Copiez :
   - **UPSTASH_REDIS_REST_URL** (format : `https://xxx.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long token alphanumérique)

⚠️ **Gardez ces valeurs secrètes !**

---

## ☁️ Étape 2 : Déploiement sur Cloudflare Pages

### 2.1 Préparer le projet

```bash
# Installer les dépendances
npm install

# Tester en local (optionnel)
npm run dev

# Build de production
npm run build
```

### 2.2 Déployer via Wrangler CLI

```bash
# Installer Wrangler (CLI Cloudflare)
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Déployer
npx wrangler pages deploy .output/public --project-name=ghostpoll
```

### 2.3 Configurer les variables d'environnement

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez votre projet **"ghostpoll"**
3. Allez dans **Settings > Environment Variables**
4. Ajoutez les variables suivantes :

| Variable | Valeur | Production | Preview |
|----------|--------|------------|---------|
| `UPSTASH_REDIS_URL` | `https://xxx.upstash.io` | ✅ | ✅ |
| `UPSTASH_REDIS_TOKEN` | `votre_token_upstash` | ✅ | ✅ |
| `BASE_URL` | `https://ghostpoll.pages.dev` | ✅ | ❌ |

5. Cliquez sur **"Save"**

### 2.4 Re-déployer pour appliquer les variables

```bash
npx wrangler pages deploy .output/public --project-name=ghostpoll
```

---

## 🔧 Étape 3 : Configuration du domaine personnalisé (Optionnel)

### 3.1 Ajouter un domaine custom

1. Dans Cloudflare Pages, allez dans **Custom Domains**
2. Cliquez sur **"Set up a custom domain"**
3. Entrez votre domaine (ex: `ghostpoll.com`)
4. Suivez les instructions pour configurer les DNS

### 3.2 Mettre à jour BASE_URL

Une fois le domaine configuré, mettez à jour la variable `BASE_URL` :

```
BASE_URL=https://ghostpoll.com
```

---

## ✅ Étape 4 : Vérification

### 4.1 Tester l'application

1. Ouvrez votre URL Cloudflare Pages (ex: `https://ghostpoll.pages.dev`)
2. Créez un poll de test
3. Vérifiez que :
   - Le QR code s'affiche
   - Les liens sont copiables
   - La redirection vers `/created` fonctionne

### 4.2 Vérifier Redis

Dans Upstash Console :

1. Allez dans **Data Browser**
2. Vous devriez voir les clés créées :
   - `room:XXXXXX`
   - `admin:XXXXXX`

---

## 🔄 Déploiement continu (CI/CD)

### Option 1 : GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

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
          directory: .output/public
```

### Option 2 : Cloudflare Git Integration

1. Dans Cloudflare Pages, allez dans **Settings > Builds & deployments**
2. Connectez votre repository GitHub
3. Configurez :
   - **Build command** : `npm run build`
   - **Build output directory** : `.output/public`
4. Chaque push sur `main` déclenchera un déploiement automatique

---

## 📊 Monitoring

### Upstash Dashboard

- **Métriques** : Requêtes/s, latence, utilisation mémoire
- **Logs** : Commandes Redis exécutées
- **Alertes** : Configurez des alertes email

### Cloudflare Analytics

- **Trafic** : Visiteurs, pages vues
- **Performance** : Temps de chargement, Core Web Vitals
- **Erreurs** : Logs des erreurs 4xx/5xx

---

## 🐛 Troubleshooting

### Erreur : "Redis configuration missing"

**Cause** : Variables d'environnement non configurées

**Solution** :
1. Vérifiez que `UPSTASH_REDIS_URL` et `UPSTASH_REDIS_TOKEN` sont bien définies
2. Re-déployez après avoir ajouté les variables

### Erreur : "Failed to create room"

**Cause** : Problème de connexion à Redis

**Solution** :
1. Vérifiez que votre base Upstash est active
2. Testez la connexion avec `curl` :
   ```bash
   curl https://YOUR_REDIS_URL/get/test \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Les polls ne s'affichent pas

**Cause** : Problème de routage ou de build

**Solution** :
1. Vérifiez les logs Cloudflare Pages
2. Re-build en local : `npm run build`
3. Testez avec `npm run preview`

---

## 🔐 Sécurité

### Bonnes pratiques

1. ✅ **Ne jamais commit** `.env` dans Git
2. ✅ **Utiliser des tokens** différents pour dev/prod
3. ✅ **Activer TLS** sur Upstash
4. ✅ **Limiter les CORS** en production
5. ✅ **Monitorer** les accès suspects

### Rotation des secrets

Pour changer le token Upstash :

1. Générez un nouveau token dans Upstash Console
2. Mettez à jour la variable dans Cloudflare
3. Re-déployez
4. Supprimez l'ancien token

---

## 📈 Optimisations

### Performance

- **Edge Caching** : Activé par défaut sur Cloudflare
- **Compression** : Gzip/Brotli automatique
- **HTTP/3** : Activé par défaut

### Coûts

**Free Tier Upstash** :
- 10,000 commandes/jour
- 256 MB RAM
- Suffisant pour ~1000 polls actifs

**Free Tier Cloudflare Pages** :
- 500 builds/mois
- Bande passante illimitée
- 100 domaines custom

---

## 🎉 C'est terminé !

Votre application GhostPoll est maintenant en production ! 🚀

**Prochaines étapes** :
- Partagez votre URL sur Twitter/LinkedIn
- Collectez du feedback
- Consultez les analytics

**Besoin d'aide ?**
- GitHub Issues : [lien vers votre repo]
- Documentation Nuxt : https://nuxt.com/docs
- Documentation Cloudflare : https://developers.cloudflare.com/pages/
