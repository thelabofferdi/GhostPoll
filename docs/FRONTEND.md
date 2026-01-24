# 🚀 Stack Moderne : Vue 3 + Nitro + UnoCSS

**Date :** 19 janvier 2026

---

## 📦 Stack Technique

### **Frontend**
- ⚡ **Vue 3** - Framework réactif moderne
- 🎨 **UnoCSS** - Atomic CSS engine (plus rapide que Tailwind)
- 🔧 **Composition API** - TypeScript-first
- 🎭 **Teleport** - Pour les modals
- 🔄 **Transitions** - Animations natives Vue

### **Backend**
- 🔥 **Nitro** - Server framework (UnJS)
- 📡 **API Routes** - File-based routing
- 🗄️ **Upstash Redis** - Serverless database
- 🔐 **TypeScript** - Type safety partout

### **Build & Deploy**
- ⚡ **Vite** - Build tool ultra-rapide
- ☁️ **Cloudflare Workers** - Edge deployment
- 📦 **Zero config** - Tout est intégré

---

## 🎯 Pourquoi cette stack ?

### **1. Performance** ⚡
- **Vite** : HMR instantané (< 100ms)
- **UnoCSS** : Génération CSS à la demande
- **Nitro** : Edge-first, latence minimale
- **Vue 3** : Virtual DOM optimisé

### **2. Developer Experience** 🛠️
- **TypeScript** partout
- **Hot Module Replacement**
- **Auto-imports** (composables, components)
- **File-based routing**

### **3. Production-Ready** 🚀
- **SSR/SSG** natif avec Nitro
- **Code splitting** automatique
- **Tree shaking** agressif
- **Cloudflare Workers** preset

### **4. Écosystème UnJS** 🌐
Tout vient du même écosystème :
- Nitro (server)
- Vue (frontend)
- UnoCSS (styling)
- VueUse (composables)

---

## 📁 Structure du projet

```
ephemeral-vote/
├── app/                      # Frontend Vue
│   ├── pages/               # Routes (file-based)
│   │   ├── index.vue        # Landing page
│   │   ├── vote.vue         # Page de vote
│   │   ├── created.vue      # Succès création
│   │   └── admin.vue        # Dashboard admin
│   ├── components/          # Composants réutilisables
│   │   ├── EmojiButton.vue
│   │   ├── ResultBar.vue
│   │   └── QRCode.vue
│   ├── composables/         # Logique réutilisable
│   │   ├── useFingerprint.ts
│   │   ├── useVote.ts
│   │   └── usePolling.ts
│   ├── layouts/             # Layouts
│   │   └── default.vue
│   └── assets/              # Assets statiques
│       └── css/
│           └── main.css
├── src/                      # Backend Nitro
│   ├── routes/              # API routes
│   │   ├── rooms.post.ts
│   │   ├── vote.post.ts
│   │   ├── results/[id].get.ts
│   │   └── admin/
│   ├── utils/               # Utilitaires
│   │   ├── redis.ts
│   │   ├── crypto.ts
│   │   └── id.ts
│   └── types/               # Types TypeScript
│       └── index.ts
├── nitro.config.ts          # Config Nitro
├── uno.config.ts            # Config UnoCSS
├── package.json
└── tsconfig.json
```

---

## 🎨 UnoCSS vs Tailwind

### **Pourquoi UnoCSS ?**

| Feature | UnoCSS | Tailwind |
|---------|--------|----------|
| **Performance** | ⚡⚡⚡ | ⚡⚡ |
| **Build time** | Instantané | ~1-2s |
| **Bundle size** | Plus petit | Plus gros |
| **Customization** | Total | Limité |
| **Presets** | Icons, Web Fonts | Aucun |

### **Shortcuts UnoCSS**

Au lieu d'écrire :
```html
<button class="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
```

On écrit :
```html
<button class="btn-primary">
```

---

## 🧩 Composants Vue créés

### **1. Page d'accueil** (`app/pages/index.vue`)

**Features :**
- ✅ Hero section avec animation
- ✅ Modal de création (Teleport)
- ✅ Sélection mode de vote (radio custom)
- ✅ Transitions Vue natives
- ✅ Composition API + TypeScript

**Composables utilisés :**
```typescript
const showModal = ref(false)
const voteMode = ref<VoteMode>('single_vote')
```

---

## 🔧 Prochaines étapes

### **1. Créer les pages manquantes**

```bash
app/pages/
├── vote.vue        # Page de vote (à créer)
├── created.vue     # Succès création (à créer)
└── admin.vue       # Dashboard admin (à créer)
```

### **2. Créer les composables**

```bash
app/composables/
├── useFingerprint.ts  # Canvas fingerprinting
├── useVote.ts         # Logique de vote
├── usePolling.ts      # Polling temps réel
└── useToast.ts        # Notifications
```

### **3. Créer les composants**

```bash
app/components/
├── EmojiButton.vue    # Bouton emoji interactif
├── ResultBar.vue      # Barre de résultat animée
├── QRCode.vue         # Affichage QR Code
├── Modal.vue          # Modal réutilisable
└── Toast.vue          # Toast notification
```

### **4. Backend Nitro**

```bash
src/routes/
├── rooms.post.ts           # POST /api/rooms
├── vote.post.ts            # POST /api/vote
├── results/[id].get.ts     # GET /api/results/:id
└── admin/
    ├── lock.post.ts        # POST /api/admin/lock
    ├── export.[id].get.ts  # GET /api/admin/export/:id
    └── close.post.ts       # POST /api/admin/close
```

---

## 🚀 Installation & Dev

```bash
# Installer les dépendances
npm install

# Dev server
npm run dev

# Build production
npm run build

# Preview production
npm run preview
```

---

## 💡 Avantages de cette stack

### **1. Réactivité native**
```vue
<script setup>
const count = ref(0) // Auto-reactive
</script>

<template>
  <div>{{ count }}</div> <!-- Auto-update -->
</template>
```

### **2. Auto-imports**
```vue
<script setup>
// Pas besoin d'importer ref, computed, watch, etc.
const data = ref([])
const filtered = computed(() => data.value.filter(...))
</script>
```

### **3. TypeScript natif**
```vue
<script setup lang="ts">
interface Props {
  roomId: string
  voteMode: VoteMode
}

const props = defineProps<Props>()
</script>
```

### **4. Composables réutilisables**
```typescript
// useFingerprint.ts
export function useFingerprint() {
  const fingerprint = ref('')
  
  onMounted(() => {
    fingerprint.value = generateFingerprint()
  })
  
  return { fingerprint }
}

// Dans un composant
const { fingerprint } = useFingerprint()
```

---

## 🎯 Résumé

| Aspect | Solution |
|--------|----------|
| **Frontend** | Vue 3 + Composition API |
| **Styling** | UnoCSS (atomic CSS) |
| **Backend** | Nitro (UnJS) |
| **Database** | Upstash Redis |
| **Deploy** | Cloudflare Workers |
| **Build** | Vite |
| **Types** | TypeScript strict |

**Résultat :** Stack moderne, performante et production-ready ! 🔥

---

*Prêt à créer les autres pages Vue ?* 🚀
