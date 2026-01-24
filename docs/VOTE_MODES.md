# 🗳️ Modes de Vote

## 📋 Vue d'ensemble

**Ephemeral Vote** propose **3 modes de vote** pour s'adapter à différents cas d'usage, tout en gardant le mode **éthique par défaut**.

---

## 🎯 Les 3 modes disponibles

### **1. `single_vote` (Recommandé - Par défaut)** ✅

**Principe :** 1 personne = 1 vote unique

**Comportement :**
- ✅ Chaque personne ne peut voter qu'une seule fois
- ✅ Impossible de changer d'avis
- ✅ Impossible de voter à nouveau
- ✅ **Mode le plus éthique et crédible**

**Use cases :**
- 📊 Feedback après un événement
- 🎤 Évaluation d'une conférence
- 📚 Satisfaction d'un cours
- 💼 Sondage d'équipe sérieux

**Message affiché :**
> "Vous avez déjà voté. Merci pour votre participation !"

---

### **2. `allow_revote` (Changement d'avis autorisé)** 🔄

**Principe :** 1 personne = 1 vote, mais peut le modifier

**Comportement :**
- ✅ Peut voter une première fois
- ✅ Peut **changer d'avis** et modifier son vote
- ✅ L'ancien vote est automatiquement annulé
- ⚠️ Toujours 1 seul vote actif par personne

**Use cases :**
- 🗳️ Sondage d'opinion évolutif
- 🎭 Vote pendant un débat (opinion qui change)
- 📈 Mesure de sentiment en temps réel

**Message affiché :**
> "Vous pouvez modifier votre vote à tout moment"

**Logique technique :**
```typescript
// Scénario : User vote 😍, puis change pour 😊
1. Premier vote : 😍 → Compteur 😍 = 1
2. Changement : 😊
   - Décrémente 😍 → Compteur 😍 = 0
   - Incrémente 😊 → Compteur 😊 = 1
   - Met à jour le fingerprint avec le nouvel emoji
```

---

### **3. `multiple_votes` (Applaudimètre)** 🎉

**Principe :** Votes illimités pour mesurer l'engagement

**Comportement :**
- ✅ Peut voter autant de fois qu'on veut
- ✅ Chaque vote incrémente le compteur
- ⚠️ **Pas de vérification de fingerprint**
- ⚠️ Mode "engagement" plutôt que "sondage"

**Use cases :**
- 👏 Applaudimètre en direct
- 🔥 Mesure d'enthousiasme
- 🎮 Gamification d'événement
- 📣 Encourager la participation

**Message affiché :**
> "Votez autant de fois que vous voulez !"

**⚠️ Avertissement :**
Ce mode est **moins crédible** pour un sondage sérieux, mais parfait pour mesurer l'**énergie** d'une salle.

---

## 🔧 Implémentation technique

### **Création d'une room avec mode personnalisé**

```typescript
// API Request
POST /api/rooms
{
  "question": "Comment s'est passé cet événement ?",
  "voteMode": "single_vote" // ou "allow_revote" ou "multiple_votes"
}
```

**Si non spécifié :** Défaut = `single_vote`

---

### **Logique de vote selon le mode**

```typescript
async function handleVote(roomId: string, emoji: string, fingerprint: string) {
  const room = await redis.getRoom(roomId);
  
  switch (room.voteMode) {
    case 'single_vote':
      // Vérifier si déjà voté
      if (await redis.hasVoted(roomId, fingerprint)) {
        throw new Error('already_voted');
      }
      // Enregistrer le vote
      await redis.incrementVote(roomId, emoji);
      await redis.markAsVoted(roomId, fingerprint, REDIS_TTL.voted);
      break;
      
    case 'allow_revote':
      // Récupérer le vote précédent
      const lastVote = await redis.getLastVote(roomId, fingerprint);
      
      if (lastVote) {
        // Annuler l'ancien vote
        await redis.decrementVote(roomId, lastVote);
      }
      
      // Enregistrer le nouveau vote
      await redis.incrementVote(roomId, emoji);
      await redis.setVoteWithEmoji(roomId, fingerprint, emoji, REDIS_TTL.voted);
      break;
      
    case 'multiple_votes':
      // Pas de vérification, vote direct
      await redis.incrementVote(roomId, emoji);
      // Pas de marqueur de fingerprint
      break;
  }
}
```

---

## 🎨 UX Frontend

### **Affichage du mode sur la page de vote**

```html
<!-- Mode single_vote -->
<div class="vote-mode-badge">
  🔒 1 vote unique
</div>

<!-- Mode allow_revote -->
<div class="vote-mode-badge">
  🔄 Vous pouvez modifier votre vote
</div>

<!-- Mode multiple_votes -->
<div class="vote-mode-badge">
  🎉 Votes illimités !
</div>
```

### **Feedback après vote**

| Mode | Message après vote |
|------|-------------------|
| `single_vote` | ✅ "Merci ! Votre vote a été enregistré" |
| `allow_revote` | ✅ "Vote enregistré. Vous pouvez le modifier à tout moment" |
| `multiple_votes` | ✅ "Vote enregistré ! Votez encore !" |

---

## 📊 Comparaison des modes

| Critère | `single_vote` | `allow_revote` | `multiple_votes` |
|---------|--------------|----------------|------------------|
| **Crédibilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Éthique** | ✅ Oui | ✅ Oui | ⚠️ Dépend du contexte |
| **Engagement** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complexité** | Simple | Moyenne | Simple |
| **Use case principal** | Sondage sérieux | Opinion évolutive | Applaudimètre |

---

## 🛡️ Sécurité & Éthique

### **Pourquoi `single_vote` par défaut ?**

1. **Crédibilité** : Les résultats sont fiables et non-manipulables
2. **Éthique** : Respecte le principe "1 personne = 1 voix"
3. **Transparence** : Les participants savent que c'est équitable
4. **Professionnalisme** : Utilisable en entreprise/école sans hésitation

### **Quand utiliser `allow_revote` ?**

- ✅ Débat en cours (opinion qui évolue)
- ✅ Sondage sur plusieurs jours
- ✅ Mesure de sentiment changeant
- ❌ **PAS pour un vote définitif**

### **Quand utiliser `multiple_votes` ?**

- ✅ Événement festif (applaudimètre)
- ✅ Gamification
- ✅ Mesure d'énergie/enthousiasme
- ❌ **JAMAIS pour un sondage sérieux**

---

## 🎯 Recommandations

### **Pour l'admin**

Lors de la création, on affiche :

```
┌─────────────────────────────────────────┐
│  Mode de vote :                         │
│                                         │
│  ○ 1 vote unique (recommandé)           │
│    Chaque personne vote une seule fois │
│                                         │
│  ○ Peut modifier son vote               │
│    Les participants peuvent changer     │
│    d'avis                               │
│                                         │
│  ○ Votes multiples (applaudimètre)      │
│    Pour mesurer l'engagement, pas un    │
│    sondage sérieux                      │
└─────────────────────────────────────────┘
```

### **Message de transparence**

Sur la page de vote, afficher clairement :

```
Mode actif : 1 vote unique
Les résultats sont équitables et non-manipulables.
```

---

## 🔮 Évolutions futures

- [ ] Mode `weighted_vote` (votes pondérés par rôle)
- [ ] Mode `ranked_choice` (classement des options)
- [ ] Limite de revotes (ex: max 3 changements)
- [ ] Historique des changements (admin uniquement)

---

*Cette feature renforce la **crédibilité** et la **flexibilité** d'Ephemeral Vote tout en gardant l'éthique comme priorité.*
