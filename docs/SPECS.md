# 🎯 Spécifications Fonctionnelles

## 📋 MVP (Version 1.0)

### **User Stories**

#### **En tant qu'organisateur**

1. **Créer une room**
   - Je clique sur "Créer un vote"
   - **Je choisis le mode de vote** :
     - 🔒 **1 vote unique** (recommandé) : Chaque personne vote une seule fois
     - 🔄 **Peut modifier** : Les participants peuvent changer d'avis
     - 🎉 **Votes multiples** : Applaudimètre (engagement)
   - Je reçois instantanément :
     - Un QR Code à projeter/imprimer
     - Un lien court (`ephemeral.vote/r/ABC123`)
     - Un lien admin (`ephemeral.vote/r/ABC123?admin=...`)
   - **Temps : < 2 secondes**

2. **Suivre les résultats en temps réel**
   - J'ouvre le lien admin
   - Je vois les votes s'afficher en direct
   - Je peux verrouiller les résultats
   - Je peux exporter en JSON
   - **Rafraîchissement : toutes les 2 secondes**

3. **Fermer la room**
   - Je clique sur "Fermer le vote"
   - Les participants ne peuvent plus voter
   - Les résultats restent consultables jusqu'à expiration
   - **Action irréversible**

---

#### **En tant que participant**

 1. **Accéder au vote**
   - Je scanne le QR Code ou clique sur le lien
   - J'arrive directement sur la page de vote
   - **Pas de chargement, pas d'inscription**

2. **Voter**
   - Je vois 5 emojis : 😍 😊 😐 😕 😢
   - Je clique sur mon choix
   - Je vois une confirmation immédiate
   - **Temps : < 1 seconde**

3. **Voir les résultats**
   - Après avoir voté, je vois les résultats en temps réel
   - Je ne peux plus changer mon vote
   - **Transparence totale**

---

## 🎨 Wireframes (ASCII)

### **Page d'accueil**

```
┌─────────────────────────────────────────┐
│                                         │
│         🗳️  EPHEMERAL VOTE              │
│                                         │
│   Feedback honnête. Anonyme. Éphémère. │
│                                         │
│   ┌───────────────────────────────┐    │
│   │  [Créer un vote maintenant]   │    │
│   └───────────────────────────────┘    │
│                                         │
│   ✓ Pas de compte                      │
│   ✓ Auto-destruction 24h               │
│   ✓ Zero tracking                      │
│                                         │
└─────────────────────────────────────────┘
```

---

### **Page de création (résultat)**

```
┌─────────────────────────────────────────┐
│  ✅ Votre vote est prêt !               │
│                                         │
│  Room ID : ABC123                       │
│  Expire dans : 23h 59min                │
│                                         │
│  ┌─────────────────┐                   │
│  │                 │                   │
│  │   [QR CODE]     │                   │
│  │                 │                   │
│  └─────────────────┘                   │
│                                         │
│  Lien public :                          │
│  ephemeral.vote/r/ABC123                │
│  [📋 Copier]                            │
│                                         │
│  Lien admin (gardez-le secret) :       │
│  ephemeral.vote/r/ABC123?admin=a1b2... │
│  [📋 Copier]  [📥 Télécharger QR]      │
│                                         │
└─────────────────────────────────────────┘
```

---

### **Page de vote (participant)**

```
┌─────────────────────────────────────────┐
│  Comment s'est passé cet événement ?    │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌───┐│
│  │ 😍  │ │ 😊  │ │ 😐  │ │ 😕  │ │😢 ││
│  │     │ │     │ │     │ │     │ │   ││
│  │ 42  │ │ 28  │ │ 15  │ │  8  │ │ 3 ││
│  └─────┘ └─────┘ └─────┘ └─────┘ └───┘│
│                                         │
│  96 votes • Expire dans 18h             │
│                                         │
└─────────────────────────────────────────┘
```

---

### **Page admin (organisateur)**

```
┌─────────────────────────────────────────┐
│  🔐 Dashboard Admin - Room ABC123       │
│                                         │
│  Status : 🟢 Actif                      │
│  Expire dans : 18h 42min                │
│  Total votes : 96                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 😍 ████████████████░░░░ 44%  42 │   │
│  │ 😊 ██████████░░░░░░░░░░ 29%  28 │   │
│  │ 😐 █████░░░░░░░░░░░░░░░ 16%  15 │   │
│  │ 😕 ██░░░░░░░░░░░░░░░░░░  8%   8 │   │
│  │ 😢 █░░░░░░░░░░░░░░░░░░░  3%   3 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [🔒 Verrouiller]  [📥 Exporter JSON]  │
│  [🗑️ Fermer maintenant]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Spécifications Techniques

### **Endpoints API**

#### **POST /api/rooms**
Créer une nouvelle room

**Request :**
```json
{
  "question": "Comment s'est passé cet événement ?", // optionnel
  "voteMode": "single_vote" // optionnel (défaut: "single_vote")
}
```

**Response :**
```json
{
  "roomId": "ABC123",
  "publicUrl": "https://ephemeral.vote/r/ABC123",
  "adminUrl": "https://ephemeral.vote/r/ABC123?admin=a1b2c3d4...",
  "qrCodeDataUrl": "data:image/png;base64,...",
  "expiresAt": 1737396368000
}
```

---

#### **POST /api/vote**
Soumettre un vote

**Request :**
```json
{
  "roomId": "ABC123",
  "emoji": "😍",
  "fingerprint": "a1b2c3d4e5f6..." // généré côté client
}
```

**Response :**
```json
{
  "success": true,
  "currentResults": {
    "😍": 43,
    "😊": 28,
    "😐": 15,
    "😕": 8,
    "😢": 3
  }
}
```

**Errors :**
```json
// 409 Conflict
{ "error": "already_voted", "message": "Vous avez déjà voté" }

// 429 Too Many Requests
{ "error": "rate_limit", "message": "Trop de votes, réessayez dans 30s" }

// 404 Not Found
{ "error": "room_not_found", "message": "Cette room n'existe pas ou a expiré" }

// 423 Locked
{ "error": "room_locked", "message": "Les votes sont fermés" }
```

---

#### **GET /api/results/:roomId**
Récupérer les résultats

**Response :**
```json
{
  "roomId": "ABC123",
  "question": "Comment s'est passé cet événement ?",
  "results": {
    "😍": 43,
    "😊": 28,
    "😐": 15,
    "😕": 8,
    "😢": 3
  },
  "total": 97,
  "locked": false,
  "expiresAt": 1737396368000
}
```

---

#### **POST /api/admin/lock**
Verrouiller une room (admin uniquement)

**Request :**
```json
{
  "roomId": "ABC123",
  "adminToken": "a1b2c3d4e5f6..."
}
```

**Response :**
```json
{
  "success": true,
  "locked": true
}
```

---

#### **POST /api/admin/close**
Fermer une room avant expiration (admin uniquement)

**Request :**
```json
{
  "roomId": "ABC123",
  "adminToken": "a1b2c3d4e5f6..."
}
```

**Response :**
```json
{
  "success": true,
  "message": "Room fermée et supprimée"
}
```

---

#### **GET /api/admin/export/:roomId**
Exporter les résultats en JSON (admin uniquement)

**Query params :**
```
?admin=a1b2c3d4e5f6...
```

**Response :**
```json
{
  "roomId": "ABC123",
  "question": "Comment s'est passé cet événement ?",
  "createdAt": 1737309968000,
  "exportedAt": 1737396368000,
  "results": {
    "😍": { "count": 43, "percentage": 44.3 },
    "😊": { "count": 28, "percentage": 28.9 },
    "😐": { "count": 15, "percentage": 15.5 },
    "😕": { "count": 8, "percentage": 8.2 },
    "😢": { "count": 3, "percentage": 3.1 }
  },
  "total": 97,
  "locked": true
}
```

---

#### **GET /api/status**
Statut du service

**Response :**
```json
{
  "status": "operational",
  "uptime": 99.97,
  "redis": "connected",
  "latency": 45,
  "version": "1.0.0"
}
```

---

## 🎨 Design System

### **Couleurs**

```css
:root {
  /* Primary */
  --color-primary: #6366f1;      /* Indigo */
  --color-primary-dark: #4f46e5;
  
  /* Emojis */
  --color-love: #ef4444;         /* Red */
  --color-happy: #10b981;        /* Green */
  --color-neutral: #6b7280;      /* Gray */
  --color-sad: #f59e0b;          /* Amber */
  --color-angry: #8b5cf6;        /* Purple */
  
  /* UI */
  --color-bg: #0f172a;           /* Slate 900 */
  --color-surface: #1e293b;      /* Slate 800 */
  --color-text: #f1f5f9;         /* Slate 100 */
  --color-text-muted: #94a3b8;   /* Slate 400 */
  
  /* Status */
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
}
```

### **Typography**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

:root {
  --font-family: 'Inter', system-ui, sans-serif;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### **Spacing**

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
}
```

### **Animations**

```css
/* Micro-interactions */
.button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Vote animation */
@keyframes vote-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.emoji-voted {
  animation: vote-pulse 0.3s ease-in-out;
}
```

---

## 🧪 Tests & Validation

### **Scénarios de test**

#### **Test 1 : Vote simple**
1. Créer une room
2. Ouvrir le lien public
3. Voter avec 😍
4. Vérifier que le compteur s'incrémente
5. Vérifier qu'on ne peut plus voter

#### **Test 2 : Anti-spam**
1. Créer une room
2. Essayer de voter 2 fois avec le même fingerprint
3. Vérifier l'erreur 409

#### **Test 3 : Rate limiting**
1. Créer une room
2. Envoyer 15 votes en 10 secondes
3. Vérifier l'erreur 429

#### **Test 4 : Expiration**
1. Créer une room avec TTL de 10 secondes (dev mode)
2. Attendre 11 secondes
3. Vérifier que la room n'existe plus

#### **Test 5 : Admin lock**
1. Créer une room
2. Voter 3 fois
3. Verrouiller via admin
4. Essayer de voter → erreur 423

---

## 📊 Métriques de succès

### **Performance**

- ⚡ Création de room : < 500ms
- ⚡ Soumission de vote : < 200ms
- ⚡ Récupération résultats : < 100ms
- ⚡ Génération QR Code : < 300ms

### **Fiabilité**

- 🎯 Uptime : > 99.9%
- 🎯 Taux d'erreur : < 0.1%
- 🎯 Latence p95 : < 500ms

### **Usage**

- 📈 Objectif : 100 rooms créées/jour (mois 1)
- 📈 Objectif : 1000 votes/jour (mois 1)
- 📈 Objectif : 50% des rooms avec > 10 votes

---

*Spécifications prêtes pour l'implémentation.*
