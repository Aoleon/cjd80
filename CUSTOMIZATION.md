# 🎨 Guide de Personnalisation - Application CJD

Ce guide explique comment personnaliser l'application pour l'adapter à une autre organisation en modifiant le branding, les couleurs, les logos et tous les éléments visuels et textuels.

---

## 📋 Table des matières

1. [Introduction](#-introduction)
2. [Configuration Centralisée](#-configuration-centralisée)
3. [Remplacement des Assets](#-remplacement-des-assets)
4. [Génération des Fichiers Statiques](#-génération-des-fichiers-statiques)
5. [Modification des Couleurs Tailwind](#-modification-des-couleurs-tailwind-optionnel)
6. [Checklist de Personnalisation](#-checklist-de-personnalisation)
7. [Exemple de Personnalisation](#-exemple-de-personnalisation)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Introduction

Cette application utilise un **système de configuration centralisée** qui permet de personnaliser tous les aspects visuels et textuels en modifiant un seul fichier principal.

### Avantages de ce système :
- ✅ **Simplicité** : Modifier un seul fichier au lieu de 20+ fichiers dispersés
- ✅ **Cohérence** : Garantit que tous les éléments utilisent les mêmes valeurs
- ✅ **Rapidité** : Personnalisation complète en moins de 30 minutes
- ✅ **Sécurité** : Moins de risques d'oublier un fichier ou de créer des incohérences

---

## ⚙️ Configuration Centralisée

### 📍 Localisation
Le fichier principal de configuration se trouve à :
```
client/src/config/branding-core.ts
```

### 📝 Structure de l'objet `brandingCore`

Ce fichier contient toutes les informations de branding organisées en sections :

#### 1️⃣ **Organization** - Informations de l'organisation
```typescript
organization: {
  name: "CJD Amiens",                    // Nom court de l'organisation
  fullName: "Centre des Jeunes Dirigeants d'Amiens",  // Nom complet
  tagline: "Application collaborative pour...",        // Slogan/Description
  url: "https://votre-domaine.com",                   // Site web
  email: "contact@cjd-amiens.fr",                     // Email de contact
}
```

#### 2️⃣ **App** - Informations de l'application
```typescript
app: {
  name: "CJD Amiens - Boîte à Kiffs",    // Titre complet (affiché dans l'onglet)
  shortName: "CJD Amiens",                // Nom court (PWA, mobile)
  description: "Application interne...",   // Description (SEO, partages)
  ideaBoxName: "Boîte à Kiffs",           // Nom personnalisé de la boîte à idées
}
```

#### 3️⃣ **Colors** - Palette de couleurs (format hexadécimal)
```typescript
colors: {
  primary: "#00a844",       // Couleur principale (boutons, liens, etc.)
  primaryDark: "#008835",   // Variante sombre (survol, états actifs)
  primaryLight: "#00c94f",  // Variante claire (backgrounds légers)
  secondary: "#1a1a1a",     // Couleur secondaire (textes, bordures)
  background: "#f9fafb",    // Couleur de fond de l'application
}
```

#### 4️⃣ **Fonts** - Typographie
```typescript
fonts: {
  primary: "Lato",          // Police principale (doit être disponible sur Google Fonts)
  googleFontsUrl: "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap",
  weights: [300, 400, 700, 900],  // Graisses utilisées
}
```

#### 5️⃣ **PWA** - Métadonnées Progressive Web App
```typescript
pwa: {
  themeColor: "#00a844",        // Couleur de thème (barre d'adresse mobile)
  backgroundColor: "#f9fafb",   // Couleur de fond au chargement
  display: "standalone",         // Mode d'affichage (standalone/fullscreen/minimal-ui)
  orientation: "portrait-primary", // Orientation préférée
  categories: ["business", "productivity", "social"],
  lang: "fr-FR",                // Langue de l'application
}
```

#### 6️⃣ **Social** - Métadonnées réseaux sociaux
```typescript
social: {
  ogType: "website",           // Type Open Graph (website/article/etc.)
  twitterCard: "summary",      // Type de carte Twitter
}
```

#### 7️⃣ **Links** - Liens externes
```typescript
links: {
  website: "https://cjd-amiens.fr",           // Site web principal
  support: "mailto:support@cjd-amiens.fr",    // Contact support
}
```

---

## 🖼️ Remplacement des Assets

### 📍 Où placer les nouveaux assets ?

Les images et logos doivent être placés dans le dossier :
```
attached_assets/
```

💡 **Note** : Ce dossier est à la racine du projet (pas dans `client/src/`). L'alias `@assets` dans le code fait référence à ce dossier.

### 🔄 Mise à jour des imports dans `branding.ts`

Après avoir ajouté vos nouveaux assets, vous devez mettre à jour le fichier :
```
client/src/config/branding.ts
```

#### Exemple : Remplacer le logo

1. **Ajoutez votre logo** dans `attached_assets/mon-logo.png`

2. **Modifiez l'import** dans `branding.ts` :
```typescript
// Avant
import logoUrl from "@assets/logo-cjd-social_1756108273665.jpg";

// Après
import logoUrl from "@assets/mon-logo.png";
```

#### Exemple : Remplacer l'image "Boîte à Kiffs"

1. **Ajoutez votre image** dans `attached_assets/ma-boite-idees.jpg`

2. **Modifiez l'import** dans `branding.ts` :
```typescript
// Avant
import boiteKiffImageUrl from "@assets/boite-kiff_1756106212980.jpeg";

// Après
import boiteKiffImageUrl from "@assets/ma-boite-idees.jpg";
```

### 📱 Icônes PWA

Les icônes pour l'application mobile (PWA) se trouvent dans :
```
client/public/icon-192.jpg    (192×192 pixels)
client/public/icon-512.jpg    (512×512 pixels)
```

⚠️ **Important** : 
- Ces fichiers doivent garder les mêmes noms
- Format recommandé : JPG ou PNG
- Dimensions exactes requises : 192×192 et 512×512 pixels

---

## 🔧 Génération des Fichiers Statiques

Après avoir modifié `branding-core.ts`, vous devez **générer les fichiers statiques** qui utilisent cette configuration.

### 💡 Commande à exécuter

```bash
npm run generate:config
```

### ✨ Ce que cette commande fait

Cette commande exécute le script `scripts/generate-static-config.ts` qui génère automatiquement :

1. **`client/index.html`** - Fichier HTML principal avec :
   - Meta tags SEO (title, description)
   - Meta tags PWA (theme-color, apple-mobile-web-app)
   - Meta tags Open Graph (partage sur réseaux sociaux)
   - Liens vers les polices Google Fonts
   - Favicon et icônes

2. **`client/public/manifest.json`** - Manifeste PWA avec :
   - Nom et description de l'application
   - Icônes et couleurs du thème
   - Configuration d'affichage mobile
   - Raccourcis de l'application

### 🔄 Quand exécuter cette commande ?

Exécutez `npm run generate:config` après avoir modifié :
- Les informations de l'organisation
- Le nom de l'application
- Les couleurs du thème
- La police principale

---

## 🎨 Modification des Couleurs Tailwind (Optionnel)

### 📍 Localisation
```
tailwind.config.ts
```

### ⚠️ Pourquoi les couleurs sont-elles hardcodées ?

Les couleurs CJD sont définies directement dans `tailwind.config.ts` pour éviter des problèmes de build et de performance. Cela permet à Tailwind de générer le CSS sans dépendre d'imports dynamiques.

### 🔧 Comment modifier les couleurs ?

Si vous souhaitez changer les couleurs utilisées dans les classes Tailwind `cjd-green-*`, modifiez :

```typescript
// Dans tailwind.config.ts
const CJD_GREEN = "#00a844";        // Votre couleur principale
const CJD_GREEN_DARK = "#008835";   // Version plus sombre

// Ces constantes sont utilisées dans :
colors: {
  'cjd-green': {
    DEFAULT: CJD_GREEN,
    dark: CJD_GREEN_DARK,
    light: '#e8f5e8',
  },
}
```

💡 **Astuce** : Si vous changez ces couleurs, assurez-vous qu'elles correspondent aux couleurs définies dans `branding-core.ts` pour maintenir la cohérence.

---

## ✅ Checklist de Personnalisation

Suivez cette checklist pour personnaliser complètement l'application :

### 📝 Configuration

- [ ] **Modifier `organization`** dans `client/src/config/branding-core.ts`
  - [ ] name
  - [ ] fullName
  - [ ] tagline
  - [ ] url
  - [ ] email

- [ ] **Modifier `app`** dans `client/src/config/branding-core.ts`
  - [ ] name
  - [ ] shortName
  - [ ] description
  - [ ] ideaBoxName

- [ ] **Modifier `colors`** dans `client/src/config/branding-core.ts`
  - [ ] primary
  - [ ] primaryDark
  - [ ] primaryLight
  - [ ] secondary
  - [ ] background

- [ ] **Modifier `fonts`** (si nécessaire)
  - [ ] primary
  - [ ] googleFontsUrl

- [ ] **Modifier `links`**
  - [ ] website
  - [ ] support

### 🖼️ Assets

- [ ] **Remplacer le logo**
  - [ ] Ajouter le nouveau logo dans `attached_assets/`
  - [ ] Mettre à jour l'import dans `client/src/config/branding.ts`

- [ ] **Remplacer l'image de la boîte à idées**
  - [ ] Ajouter la nouvelle image dans `attached_assets/`
  - [ ] Mettre à jour l'import dans `client/src/config/branding.ts`

- [ ] **Remplacer les icônes PWA**
  - [ ] `client/public/icon-192.jpg` (192×192 pixels)
  - [ ] `client/public/icon-512.jpg` (512×512 pixels)

### 🔧 Génération et Configuration

- [ ] **Exécuter la génération de configuration**
  ```bash
  npm run generate:config
  ```

- [ ] **(Optionnel) Mettre à jour les couleurs Tailwind**
  - [ ] Modifier `CJD_GREEN` dans `tailwind.config.ts`
  - [ ] Modifier `CJD_GREEN_DARK` dans `tailwind.config.ts`

### 🧪 Tests

- [ ] **Tester l'application en développement**
  ```bash
  npm run dev
  ```

- [ ] **Vérifier visuellement**
  - [ ] Logo affiché correctement
  - [ ] Couleurs appliquées partout
  - [ ] Titre de l'onglet correct
  - [ ] Image de la boîte à idées affichée
  - [ ] Thème PWA correct sur mobile

- [ ] **Build de production**
  ```bash
  npm run build
  ```

- [ ] **Vérifier qu'il n'y a pas d'erreurs TypeScript**
  ```bash
  npm run check
  ```

---

## 💼 Exemple de Personnalisation

Voici un exemple concret de transformation de **"CJD Amiens"** en **"Mon Organisation"**.

### Avant (CJD Amiens)

```typescript
// client/src/config/branding-core.ts
export const brandingCore = {
  organization: {
    name: "CJD Amiens",
    fullName: "Centre des Jeunes Dirigeants d'Amiens",
    tagline: "Application collaborative pour le partage d'idées et la gestion d'événements",
    url: "https://votre-domaine.com",
    email: "contact@cjd-amiens.fr",
  },
  
  app: {
    name: "CJD Amiens - Boîte à Kiffs",
    shortName: "CJD Amiens",
    description: "Application interne du Centre des Jeunes Dirigeants d'Amiens...",
    ideaBoxName: "Boîte à Kiffs",
  },
  
  colors: {
    primary: "#00a844",
    primaryDark: "#008835",
    primaryLight: "#00c94f",
    secondary: "#1a1a1a",
    background: "#f9fafb",
  },
  
  // ... reste du fichier
}
```

### Après (Mon Organisation)

```typescript
// client/src/config/branding-core.ts
export const brandingCore = {
  organization: {
    name: "Mon Organisation",
    fullName: "Mon Organisation - Innovation & Collaboration",
    tagline: "Plateforme collaborative pour l'innovation et le partage d'idées",
    url: "https://mon-organisation.com",
    email: "contact@mon-organisation.com",
  },
  
  app: {
    name: "Mon Organisation - Idées",
    shortName: "Mon Orga",
    description: "Application collaborative de Mon Organisation pour la gestion d'idées et d'événements",
    ideaBoxName: "Boîte à Idées",
  },
  
  colors: {
    primary: "#2563eb",      // Bleu moderne
    primaryDark: "#1e40af",  // Bleu foncé
    primaryLight: "#3b82f6", // Bleu clair
    secondary: "#1f2937",    // Gris foncé
    background: "#f3f4f6",   // Gris très clair
  },
  
  // ... reste du fichier
}
```

### Modifications dans `branding.ts`

```typescript
// client/src/config/branding.ts

// Avant
import logoUrl from "@assets/logo-cjd-social_1756108273665.jpg";
import boiteKiffImageUrl from "@assets/boite-kiff_1756106212980.jpeg";

// Après
import logoUrl from "@assets/logo-mon-organisation.png";
import boiteKiffImageUrl from "@assets/image-boite-idees.jpg";
```

### Modifications dans `tailwind.config.ts` (Optionnel)

```typescript
// tailwind.config.ts

// Avant
const CJD_GREEN = "#00a844";
const CJD_GREEN_DARK = "#008835";

// Après
const CJD_GREEN = "#2563eb";      // Utiliser la nouvelle couleur principale
const CJD_GREEN_DARK = "#1e40af"; // Utiliser la nouvelle couleur sombre
```

### Commandes à exécuter

```bash
# 1. Générer les fichiers statiques
npm run generate:config

# 2. Tester en développement
npm run dev

# 3. Build de production
npm run build
```

---

## 🔍 Troubleshooting

### ❌ Les images ne s'affichent pas

**Problème** : Le logo ou l'image de la boîte à idées ne s'affiche pas.

**Solutions** :
1. Vérifiez que le fichier existe bien dans `attached_assets/`
2. Vérifiez que l'import dans `client/src/config/branding.ts` correspond au bon nom de fichier
3. Vérifiez que le chemin utilise `@assets/` et non un chemin relatif
4. Redémarrez le serveur de développement (`npm run dev`)

```typescript
// ✅ Correct
import logoUrl from "@assets/mon-logo.png";

// ❌ Incorrect
import logoUrl from "../attached_assets/mon-logo.png";
```

### ❌ Les couleurs ne sont pas appliquées

**Problème** : Les couleurs modifiées n'apparaissent pas dans l'application.

**Solutions** :
1. Vérifiez que vous avez exécuté `npm run generate:config` après modification
2. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
3. Vérifiez que les couleurs sont au format hexadécimal correct (`#RRGGBB`)
4. Pour les couleurs Tailwind, vérifiez `tailwind.config.ts`

```bash
# Générer les fichiers statiques
npm run generate:config

# Redémarrer le serveur
npm run dev
```

### ❌ Le titre de l'onglet n'est pas mis à jour

**Problème** : Le titre dans l'onglet du navigateur n'a pas changé.

**Solutions** :
1. Vérifiez que vous avez modifié `app.name` dans `branding-core.ts`
2. Exécutez `npm run generate:config` pour régénérer `index.html`
3. Videz le cache du navigateur
4. Rechargez la page

### ❌ L'application ne démarre pas

**Problème** : Erreurs TypeScript au démarrage.

**Solutions** :
1. Vérifiez la syntaxe dans `branding-core.ts` (virgules, guillemets, accolades)
2. Exécutez `npm run check` pour voir les erreurs TypeScript
3. Vérifiez que tous les imports dans `branding.ts` pointent vers des fichiers existants

```bash
# Vérifier les erreurs TypeScript
npm run check

# Si pas d'erreur, redémarrer
npm run dev
```

### ❌ Les icônes PWA ne fonctionnent pas

**Problème** : Les icônes ne s'affichent pas lors de l'installation PWA.

**Solutions** :
1. Vérifiez que les fichiers existent : `client/public/icon-192.jpg` et `icon-512.jpg`
2. Vérifiez les dimensions exactes : 192×192 et 512×512 pixels
3. Gardez les mêmes noms de fichiers (ne pas renommer)
4. Exécutez `npm run generate:config` pour mettre à jour le manifeste
5. Videz le cache du Service Worker :
   - Chrome DevTools → Application → Clear storage → Clear site data

### ❌ La police Google Fonts ne se charge pas

**Problème** : La police personnalisée n'apparaît pas.

**Solutions** :
1. Vérifiez que l'URL Google Fonts est correcte et accessible
2. Vérifiez que le nom de la police correspond exactement (sensible à la casse)
3. Exécutez `npm run generate:config` pour mettre à jour `index.html`
4. Vérifiez la connexion internet (Google Fonts nécessite une connexion)

```typescript
// Exemple correct
fonts: {
  primary: "Roboto",  // Nom exact de la police
  googleFontsUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  weights: [300, 400, 500, 700],
}
```

### 🆘 Besoin d'aide supplémentaire ?

Si vous rencontrez d'autres problèmes :

1. **Consultez les logs du serveur** lors du démarrage avec `npm run dev`
2. **Ouvrez la console du navigateur** (F12) pour voir les erreurs JavaScript
3. **Vérifiez les erreurs TypeScript** avec `npm run check`
4. **Consultez la documentation** dans `replit.md` pour les détails du projet

---

## 📚 Ressources

- [Configuration centralisée](client/src/config/branding-core.ts) - Fichier principal de configuration
- [Assets & imports](client/src/config/branding.ts) - Configuration avec assets
- [Script de génération](scripts/generate-static-config.ts) - Génération des fichiers statiques
- [Configuration Tailwind](tailwind.config.ts) - Personnalisation des couleurs Tailwind

---

**✨ Vous êtes maintenant prêt à personnaliser l'application !**

Suivez la checklist étape par étape et vous aurez une application personnalisée en moins de 30 minutes. Bonne personnalisation ! 🚀
