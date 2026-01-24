# 🔐 Politique de Confidentialité

**Dernière mise à jour : 19 janvier 2026**

---

## 🎯 Notre engagement

**Ephemeral Vote** est conçu pour être **le système de vote le plus respectueux de votre vie privée**.

Nous appliquons le principe **"Privacy by Design"** :
> Si nous ne collectons pas vos données, nous ne pouvons pas les perdre, les vendre ou les utiliser contre vous.

---

## ✅ Ce que nous NE faisons PAS

- ❌ **Pas de compte utilisateur** : Aucune inscription requise
- ❌ **Pas d'email collecté** : Nous ne savons pas qui vous êtes
- ❌ **Pas de cookies de tracking** : Aucun suivi publicitaire
- ❌ **Pas de revente de données** : Nous n'avons rien à vendre
- ❌ **Pas de stockage long terme** : Tout s'efface après 24h
- ❌ **Pas d'analytics intrusifs** : Pas de Google Analytics, Facebook Pixel, etc.

---

## 📊 Ce que nous collectons (temporairement)

### **Pour les organisateurs (création de room)**

Rien. Absolument rien d'identifiable.

### **Pour les votants**

Nous créons un **"fingerprint" anonyme** pour empêcher les votes multiples :

```
Hash(Adresse IP + Navigateur + Empreinte canvas)
```

**Caractéristiques :**
- ✅ Non-réversible (impossible de retrouver votre IP)
- ✅ Unique par room (pas de tracking cross-site)
- ✅ Éphémère (supprimé après 24h)
- ✅ Pas stocké dans votre navigateur

**Pourquoi ?**
Pour garantir "1 personne = 1 vote" sans vous demander de créer un compte.

---

## ⏱️ Durée de conservation

| Donnée | Durée | Méthode |
|--------|-------|---------|
| Votes | **24 heures max** | Suppression automatique (Redis TTL) |
| Fingerprints | **24 heures max** | Suppression automatique (Redis TTL) |
| Métadonnées room | **24 heures max** | Suppression automatique (Redis TTL) |
| Logs techniques | **7 jours max** | Rotation automatique |

**Aucune donnée n'est archivée, sauvegardée ou exportée vers un stockage long terme.**

---

## 🛡️ Sécurité

### **Chiffrement**

- ✅ Toutes les communications sont chiffrées (HTTPS/TLS 1.3)
- ✅ Les votes sont signés cryptographiquement (HMAC)
- ✅ Les tokens admin sont générés aléatoirement (32 caractères)

### **Hébergement**

- **Cloudflare Workers** : Edge computing (pas de serveur centralisé)
- **Upstash Redis** : Base de données serverless (chiffrée au repos)
- **Localisation** : Union Européenne (RGPD-compliant)

---

## 📝 Logs techniques

Nous conservons **uniquement** des logs d'infrastructure pour :
- Détecter les pannes
- Améliorer les performances
- Prévenir les abus (spam, DDoS)

**Ce que contiennent ces logs :**
```json
{
  "timestamp": "2026-01-19T19:26:08Z",
  "endpoint": "/api/vote",
  "statusCode": 200,
  "latency": 45,
  "region": "eu-west",
  "error": null
}
```

**Ce qu'ils NE contiennent PAS :**
- ❌ Adresses IP complètes
- ❌ Contenu des votes
- ❌ Identifiants personnels

---

## 🌍 Conformité RGPD

### **Base légale**

Nous ne traitons **aucune donnée personnelle** au sens du RGPD.

Les fingerprints anonymes sont considérés comme des **"mesures techniques"** pour prévenir la fraude, pas comme des données personnelles.

### **Vos droits**

Même si nous ne stockons rien de personnel, vous avez le droit de :

- **Accès** : Demander quelles données nous avons (réponse : aucune)
- **Rectification** : Impossible (nous n'avons rien à corriger)
- **Suppression** : Automatique après 24h
- **Portabilité** : L'organisateur peut exporter les résultats avant expiration

---

## 🚫 Ce que nous ne faisons JAMAIS

### **Partage avec des tiers**

Nous ne partageons **aucune donnée** avec :
- ❌ Annonceurs
- ❌ Courtiers en données
- ❌ Réseaux sociaux
- ❌ Services d'analytics tiers

### **Utilisation commerciale**

Nous n'utilisons **jamais** vos votes pour :
- ❌ Vous profiler
- ❌ Vous cibler publicitairement
- ❌ Entraîner des IA
- ❌ Créer des statistiques commerciales

---

## 🔄 Modifications de cette politique

Si nous modifions cette politique, nous :
1. Mettrons à jour la date en haut de cette page
2. Publierons un changelog sur notre page d'accueil
3. **Ne changerons JAMAIS** notre engagement "zero tracking"

---

## 📧 Contact

Des questions sur votre vie privée ?

- **Email** : privacy@ephemeral-vote.dev *(à créer)*
- **GitHub** : [github.com/votre-username/ephemeral-vote](https://github.com) *(à créer)*

Nous répondons sous **48h maximum**.

---

## 🏆 Notre promesse

> **"Votre feedback est précieux. Votre vie privée est sacrée."**

Nous croyons qu'il est possible de créer des outils utiles **sans sacrifier votre confidentialité**.

Si un jour nous devons changer ce modèle, nous **fermerons le service** plutôt que de trahir cette promesse.

---

*Conçu avec ❤️ pour respecter votre vie privée.*
