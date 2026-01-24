# ✅ Checklist de Déploiement - GhostPoll

## 📦 Préparation (Terminé)

- [x] Nettoyage du code
  - [x] Suppression des commentaires inutiles
  - [x] Harmonisation des types
  - [x] Amélioration de la gestion d'erreurs
- [x] Configuration des fichiers
  - [x] `.gitignore` créé
  - [x] `.env.example` mis à jour
  - [x] `wrangler.toml` créé
  - [x] `server/types/index.ts` créé
- [x] Documentation
  - [x] `docs/DEPLOYMENT.md` créé
  - [x] `README.md` mis à jour
  - [x] Checklist de déploiement créée

## 🔧 Configuration Upstash (À faire)

- [ ] Créer un compte Upstash (https://console.upstash.com/)
- [ ] Créer une base de données Redis
  - Nom suggéré : `ghostpoll-prod`
  - Type : Regional
  - Région : Choisir la plus proche de vos utilisateurs
- [ ] Copier les credentials :
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`

## ☁️ Configuration Cloudflare (À faire)

- [ ] Créer un compte Cloudflare (https://dash.cloudflare.com/)
- [ ] Installer Wrangler CLI : `npm install -g wrangler`
- [ ] Se connecter : `wrangler login`
- [ ] Premier déploiement :
  ```bash
  npm run build
  npx wrangler pages deploy .output/public --project-name=ghostpoll
  ```
- [ ] Configurer les variables d'environnement dans Cloudflare Dashboard
  - [ ] `UPSTASH_REDIS_URL`
  - [ ] `UPSTASH_REDIS_TOKEN`
  - [ ] `BASE_URL` (ex: https://ghostpoll.pages.dev)

## 🧪 Tests Post-Déploiement (À faire)

- [ ] Ouvrir l'URL de production
- [ ] Créer un poll de test
- [ ] Vérifier :
  - [ ] Le QR code s'affiche correctement
  - [ ] Les liens sont copiables
  - [ ] La redirection vers `/created` fonctionne
  - [ ] Les données sont bien stockées dans Redis (vérifier Upstash Console)

## 🎨 Améliorations Futures (Optionnel)

### Phase 1 : Compléter le MVP
- [ ] Implémenter la page de vote (`/vote?id=XXXXXX`)
- [ ] Implémenter la page admin (`/admin?id=XXXXXX&key=YYYYYY`)
- [ ] Ajouter l'API de vote (`POST /api/vote`)
- [ ] Ajouter l'API de résultats (`GET /api/results/:roomId`)
- [ ] Implémenter l'anti-spam (fingerprinting)
- [ ] Ajouter les résultats en temps réel (SSE ou polling)

### Phase 2 : Optimisations
- [ ] Ajouter des analytics (Cloudflare Web Analytics)
- [ ] Implémenter le rate limiting
- [ ] Ajouter des tests E2E (Playwright)
- [ ] Optimiser les images et assets
- [ ] Configurer un domaine personnalisé

### Phase 3 : Features avancées
- [ ] Mode sondage avec plusieurs questions
- [ ] Export des résultats en PDF
- [ ] Durée de vie configurable (1h, 12h, 24h, 48h)
- [ ] Thèmes de couleur personnalisés
- [ ] Intégration Telegram Bot

## 📊 Monitoring (Après déploiement)

- [ ] Configurer les alertes Upstash
- [ ] Activer Cloudflare Analytics
- [ ] Surveiller les erreurs dans les logs Cloudflare
- [ ] Vérifier les métriques de performance

## 🔐 Sécurité (Important)

- [x] `.env` est dans `.gitignore`
- [ ] Les secrets Upstash ne sont jamais committés
- [ ] TLS activé sur Upstash
- [ ] CORS configuré correctement
- [ ] Rate limiting implémenté (à faire)

---

## 🚀 Commandes Rapides

### Développement Local
```bash
npm run dev          # Lancer le serveur de dev
npm run build        # Build de production
npm run preview      # Prévisualiser le build
```

### Déploiement
```bash
# Build et déploiement en une commande
npm run build && npx wrangler pages deploy .output/public --project-name=ghostpoll
```

### Vérification
```bash
# Tester la connexion Redis (remplacer par vos credentials)
curl https://YOUR_REDIS_URL/get/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes

- **Free Tier Upstash** : 10,000 commandes/jour (suffisant pour ~1000 polls actifs)
- **Free Tier Cloudflare** : Bande passante illimitée, 500 builds/mois
- **Coût total** : 0€/mois pour commencer ! 🎉

---

**Dernière mise à jour** : 2026-01-20
**Statut** : Prêt pour le déploiement ✅
