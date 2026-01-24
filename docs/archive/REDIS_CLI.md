# 🗳️ GhostPoll Redis CLI

## 📋 Outils Disponibles

### 1. CLI Standalone (Recommandé pour tests)
```bash
# Aide
node redis-standalone.js help

# Créer une room de test
node redis-standalone.js create-test [roomId]

# Ajouter des votes de test
node redis-standalone.js vote-test <roomId> <emoji>

# Simuler des votes réalistes
node redis-standalone.js simulate [roomId]

# Voir les résultats
node redis-standalone.js votes <roomId>

# Nettoyer
node redis-standalone.js cleanup [roomId]
```

### 2. Scripts NPM (Raccourcis)
```bash
# Suite de tests complète
npm run redis:test

# Créer room de test
npm run redis:create

# Simuler votes
npm run redis:simulate

# Aide
npm run redis:help

# Nettoyer
npm run redis:cleanup
```

### 3. Script de Test Automatisé
```bash
# Test complet avec room DEMO123
./test-redis.sh
```

## 🎯 Cas d'Usage

### Test Rapide
```bash
# 1. Créer room
npm run redis:create

# 2. Simuler votes
npm run redis:simulate

# 3. Tester l'interface web
# Vote: http://localhost:3000/vote?id=TEST123
# Admin: http://localhost:3000/admin?id=TEST123&key=testkey123
```

### Test Personnalisé
```bash
# Créer room custom
node redis-standalone.js create-test MYROOM

# Ajouter votes manuels
node redis-standalone.js vote-test MYROOM 😍
node redis-standalone.js vote-test MYROOM 😊

# Voir résultats
node redis-standalone.js votes MYROOM
```

### Debugging Production
```bash
# Voir une room spécifique
node redis-standalone.js room ABC123

# Voir les votes
node redis-standalone.js votes ABC123
```

## 🔧 Emojis Supportés

- 😍 Excellent
- 😊 Bien  
- 😐 Moyen
- 😕 Décevant
- 😢 Très mauvais

## 📝 Notes

- **Standalone CLI**: Utilise un stockage en mémoire pour les tests
- **Production**: L'app utilise Upstash Redis avec TTL automatique
- **URLs générées**: Pointent vers localhost:3000 par défaut
- **Clé admin**: `testkey123` pour toutes les rooms de test

## 🚀 Workflow de Test

1. **Créer room**: `npm run redis:create`
2. **Simuler données**: `npm run redis:simulate`  
3. **Tester interface**: Ouvrir les URLs générées
4. **Nettoyer**: `npm run redis:cleanup`

## 🔍 Debugging

```bash
# Voir toutes les commandes
node redis-standalone.js help

# Test complet automatisé
./test-redis.sh

# Vérifier une room
node redis-standalone.js room TEST123
```
