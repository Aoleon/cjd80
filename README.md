# CJD Amiens - Application Web Interne "Boîte à Kiffs"

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## 📋 Vue d'ensemble

Application web interne moderne pour le **Centre des Jeunes Dirigeants (CJD) d'Amiens** permettant la gestion collaborative d'idées innovantes, l'organisation d'événements avec intégration HelloAsso, et une interface d'administration complète.

### Fonctionnalités principales

- **💡 Gestion d'idées collaborative** : Proposition, vote et suivi d'idées avec workflow flexible
- **📅 Événements avec HelloAsso** : Création, gestion et inscriptions automatisées
- **👥 CRM intégré** : Gestion des mécènes et membres avec scoring d'engagement
- **🔐 Interface d'administration** : Dashboard avec statistiques, gestion complète des données
- **📱 Progressive Web App (PWA)** : Installation native, utilisation hors ligne, notifications push
- **🔔 Notifications Push** : Notifications riches avec actions inline (voter, s'inscrire)
- **🎨 Branding personnalisable** : Configuration centralisée pour adaptation facile à d'autres organisations
- **🎨 Système de couleurs sémantiques** : Thème unifié avec 4 familles de couleurs (success, warning, error, info) personnalisables via l'interface admin
- **📱 Fonctionnalités natives** : Partage natif, badge de notifications, vibrations personnalisées
- **🎨 Design responsive** : Interface optimisée mobile-first avec Tailwind CSS

## 🏗️ Architecture technique

### Stack technologique

**Frontend**
- React 18 avec TypeScript
- Vite (bundler et serveur de développement)
- Tailwind CSS + shadcn/ui (design system)
- TanStack Query (gestion d'état serveur)
- Wouter (routage léger)

**Backend**
- Node.js + Express.js
- TypeScript avec tsx
- Passport.js (authentification)
- Drizzle ORM (base de données)

**Base de données**
- PostgreSQL (Neon)
- Pool de connexions optimisé
- Migrations automatiques

**Performance & Sécurité**
- PWA avec service workers
- Validation Zod côté client/serveur
- Hachage Scrypt pour mots de passe
- Protection CSRF intégrée

### Configuration du branding

L'application utilise un **système de configuration centralisé** qui permet une personnalisation complète sans modifier le code :

- **Configuration centralisée** : Tous les textes, couleurs, logos dans `client/src/config/branding-core.ts`
- **Génération automatique** : Script `npm run generate:config` pour mettre à jour les fichiers statiques
- **15+ composants** : Utilisation automatique des valeurs de branding via helpers
- **Multi-tenant ready** : Adaptation facile pour d'autres organisations

📖 **Guide complet** : Voir [CUSTOMIZATION.md](./CUSTOMIZATION.md) pour personnaliser l'application

### Système de couleurs sémantiques

L'application utilise un **système de couleurs sémantiques unifié** pour garantir une cohérence visuelle et faciliter la personnalisation :

**Caractéristiques :**
- ✅ **Système unifié** : Toutes les couleurs Tailwind hardcodées (`bg-green-500`, `text-blue-600`, etc.) ont été remplacées par des classes sémantiques (`bg-success`, `text-error`, etc.) - 168+ instances migrées
- 🎨 **4 familles de couleurs sémantiques** : success (vert), warning (orange), error (rouge), info (bleu)
- 🌓 **Variantes light/dark** pour chaque couleur avec support mode sombre complet
- ⚙️ **Personnalisation totale** via l'interface admin `/admin/branding`
- 🔧 **17 couleurs configurables** : 12 sémantiques + 5 graphiques

**Avantages :**
- Modification globale des couleurs en un clic
- Cohérence visuelle garantie sur toute l'application
- Adaptation facile aux chartes graphiques d'autres organisations
- Accessibilité améliorée avec des contrastes testés

**Configuration :**
- Fichier source : `client/src/config/branding-core.ts`
- Variables CSS : `client/src/index.css`
- Interface admin : `/admin/branding` (SUPER_ADMIN uniquement)

### Structure du projet

```
├── client/                 # Application React frontend
│   ├── public/            # Assets statiques et PWA
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── hooks/         # Hooks personnalisés
│   │   ├── lib/           # Utilitaires et configuration
│   │   └── pages/         # Pages de l'application
├── server/                # API Express backend
│   ├── middleware/        # Middlewares personnalisés
│   ├── utils/            # Utilitaires serveur
│   ├── auth.ts           # Configuration Passport.js
│   ├── db.ts             # Configuration base de données
│   ├── routes.ts         # Routes API
│   └── storage.ts        # Interface de stockage
├── shared/               # Types et schémas partagés
│   └── schema.ts         # Schémas Drizzle + validation Zod
└── attached_assets/      # Assets du projet (logos, etc.)
```

## 🚀 Installation et développement

### Prérequis

- **Node.js** 18.0.0 ou supérieur
- **npm** ou **yarn**
- **PostgreSQL** (local ou cloud via Neon)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd cjd-amiens-boite-kiffs

# Installer les dépendances
npm install

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL
```

### Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Session (générer une clé secrète forte)
SESSION_SECRET=your-super-secret-key-here

# Optionnel : Configuration Neon
PGHOST=your-neon-host
PGDATABASE=your-database-name
PGUSER=your-username
PGPASSWORD=your-password
PGPORT=5432
```

### Démarrage

```bash
# Pousser le schéma vers la base de données
npm run db:push

# Démarrer en développement (frontend + backend)
npm run dev

# L'application sera disponible sur http://localhost:5000
```

### Scripts disponibles

```bash
# Développement
npm run dev              # Démarre frontend + backend
npm run dev:client       # Frontend seul
npm run dev:server       # Backend seul

# Base de données
npm run db:push          # Pousse le schéma vers la DB
npm run db:studio        # Interface graphique Drizzle Studio

# Configuration
npm run generate:config  # Génère index.html et manifest.json depuis branding

# Production
npm run build           # Build pour production
npm start              # Démarre en production
```

## 🗄️ Schéma de base de données

### Tables principales

**admins** - Utilisateurs administrateurs
```sql
- email (PRIMARY KEY)
- password (Scrypt hashed)
- added_by
- created_at
```

**ideas** - Idées proposées avec workflow flexible
```sql
- id (UUID)
- title, description
- proposed_by, proposed_by_email
- status (pending|approved|rejected|under_review|postponed|completed)
- deadline, created_at, updated_at, updated_by
```

**votes** - Votes sur les idées
```sql
- id (UUID)
- idea_id (FK)
- voter_name, voter_email
- created_at
- UNIQUE(idea_id, voter_email) -- Un vote par email par idée
```

**events** - Événements avec HelloAsso
```sql
- id (UUID)
- title, description, date, location
- max_participants, hello_asso_link
- status (draft|published|cancelled|postponed|completed)
- created_at, updated_at, updated_by
```

**inscriptions** - Inscriptions aux événements
```sql
- id (UUID)
- event_id (FK)
- participant_name, participant_email
- registration_date
- UNIQUE(event_id, participant_email) -- Une inscription par email par événement
```

## 🔐 Authentification et sécurité

### Système d'authentification

- **Session-based** avec Passport.js
- **Hachage Scrypt** pour les mots de passe
- **Protection CSRF** automatique
- **Rate limiting** sur les tentatives de connexion

### Compte administrateur par défaut

```
Email: admin@cjd-amiens.fr
Password: Admin123!
```

> ⚠️ **Important** : Changez ce mot de passe en production !

### Gestion des permissions

- **Routes publiques** : Visualisation des idées et événements
- **Routes protégées** : Administration (PREFIX `/admin/`)
- **Middleware auth** : Vérification automatique sur routes admin

## 🎨 Guide de style et UI/UX

### Couleurs et branding

L'application utilise un **système de branding et de couleurs centralisé** :

**Branding personnalisable :**
- **Configuration** : `client/src/config/branding-core.ts`
- **Interface admin** : `/admin/branding` pour personnalisation en direct (SUPER_ADMIN)
- **Couleur principale par défaut** : `#00a844` (vert CJD)
- **Police par défaut** : Lato (300, 400, 700, 900)

**Système de couleurs sémantiques :**
- **Success (vert)** : États positifs, validation, succès
- **Warning (orange)** : Avertissements, états d'attente
- **Error (rouge)** : Erreurs, rejets, suppression
- **Info (bleu)** : Information, en cours, neutre
- **Personnalisation** : 17 couleurs modifiables via `/admin/branding`

**Design system** : shadcn/ui + Tailwind CSS avec classes sémantiques

Pour personnaliser les couleurs, logos et textes :
1. **Via l'interface** : Se connecter en SUPER_ADMIN → `/admin/branding`
2. **Via le code** : Modifier `client/src/config/branding-core.ts` → Exécuter `npm run generate:config`
3. Redémarrer l'application

📖 **Guide détaillé** : [CUSTOMIZATION.md](./CUSTOMIZATION.md)

### Patterns responsifs

```css
/* Mobile-first approach */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

/* Breakpoints Tailwind */
sm: 640px   /* Mobile large */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Composants clés

- **IdeaCard** : Affichage des idées avec votes
- **EventCard** : Événements avec inscription HelloAsso
- **AdminSection** : Interface d'administration responsive
- **StatusBadge** : Badges de statut avec couleurs cohérentes
- **ShareButton** : Boutons de partage optimisés (icône seule, compact)

## 📱 Progressive Web App (PWA)

### Fonctionnalités PWA

- **Installation native** sur mobile/desktop
- **Cache intelligent** avec service workers
- **Queue hors ligne** avec synchronisation automatique (IndexedDB)
- **Notifications push riches** avec actions inline (voter, s'inscrire)
- **Badge API** : Compteur de notifications non lues
- **Partage natif** : Web Share API avec fallback clipboard
- **Vibrations personnalisées** : Feedback haptique pour les interactions
- **Utilisation hors ligne** pour consultation
- **Stratégies de cache** :
  - NetworkFirst : API et données dynamiques
  - CacheFirst : Assets statiques
  - StaleWhileRevalidate : Images et fonts

### Synchronisation automatique

- **Queue locale** : Actions enregistrées hors ligne (votes, inscriptions)
- **Sync automatique** : Toutes les heures ou au retour de connexion
- **Bannière de statut** : Indicateur visuel du mode hors ligne

### Configuration PWA

```javascript
// client/public/manifest.json
{
  "name": "CJD Amiens - Boîte à Kiffs",
  "short_name": "CJD Amiens",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#00a844"
}
```

## 🔄 API Documentation

### Endpoints principaux

**Idées**
```http
GET    /api/ideas              # Liste des idées approuvées
POST   /api/ideas              # Créer une idée
POST   /api/ideas/:id/vote     # Voter pour une idée

# Admin uniquement
GET    /api/admin/ideas        # Toutes les idées + stats
PATCH  /api/admin/ideas/:id/status  # Changer le statut
DELETE /api/admin/ideas/:id    # Supprimer une idée
```

**Événements**
```http
GET    /api/events             # Événements publics
POST   /api/events/:id/register  # S'inscrire à un événement

# Admin uniquement
GET    /api/admin/events       # Tous les événements + stats
POST   /api/admin/events       # Créer un événement
PUT    /api/admin/events/:id   # Modifier un événement
DELETE /api/admin/events/:id   # Supprimer un événement
```

**Authentification**
```http
POST   /api/register           # Créer un admin
POST   /api/login              # Connexion
POST   /api/logout             # Déconnexion
GET    /api/user               # Utilisateur connecté
```

**Branding**
```http
GET    /api/admin/branding     # Configuration branding actuelle (public)
PUT    /api/admin/branding     # Mettre à jour le branding (SUPER_ADMIN uniquement)
```

### Format des réponses

```typescript
// Succès
{
  "success": true,
  "data": T
}

// Erreur
{
  "success": false,
  "error": "Message d'erreur"
}
```

## 👥 CRM et gestion des membres

### Fonctionnalités CRM

**Gestion des mécènes**
- Création et modification de fiches mécènes
- Suivi des contributions
- Recherche et filtres avancés
- Onglets organisés (Tous, Actifs, Inactifs)

**Gestion des membres**
- Profils complets avec photo
- Scoring d'engagement automatique basé sur l'activité
- Timeline d'activité par membre
- Suivi des abonnements avec alertes d'expiration
- Recherche multi-critères

**Dashboard administrateur**
- Statistiques agrégées en temps réel
- Actions rapides
- Vue d'ensemble de la plateforme

## 🧪 Tests et qualité

### Validation des données

```typescript
// Exemple avec Zod
const createIdeaSchema = insertIdeaSchema.extend({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional()
});
```

### Patterns de sécurité

- **Validation systématique** des inputs avec Zod
- **Sanitisation** des données utilisateur
- **Transactions SQL** pour opérations critiques
- **Pool de connexions** optimisé avec monitoring

## 🚀 Déploiement

### Replit Deployments (Recommandé)

1. **Configuration automatique** via `replit.nix`
2. **Build automatique** avec `npm run build`
3. **Variables d'environnement** via secrets Replit
4. **HTTPS automatique** avec domaine `.replit.app`

### Système de purge du cache

L'application implémente plusieurs mécanismes pour garantir les mises à jour après déploiement :

#### 1. Headers de cache optimisés
- **HTML** : `no-cache, no-store, must-revalidate` - toujours récupérer la dernière version
- **Assets JS/CSS** : `max-age=31536000, immutable` - cache long pour les fichiers avec hash
- **Service Worker** : `no-cache` - force le rechargement du SW

#### 2. Script de déploiement (`deploy.sh`)
```bash
# Purge automatique des caches avant build
./deploy.sh
```
- Nettoie le dossier `dist/`
- Supprime le cache Vite (`node_modules/.vite`)
- Ajoute un timestamp de déploiement

#### 3. Cache Buster automatique
- Vérification automatique toutes les 5 minutes
- Rechargement forcé si nouvelle version détectée
- Nettoyage des caches navigateur et service worker

### Déploiement manuel

```bash
# Build production
npm run build

# Variables d'environnement
export NODE_ENV=production
export DATABASE_URL=your-production-db-url
export SESSION_SECRET=your-production-secret

# Démarrage
npm start
```

### Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Base de données provisionnée
- [ ] Schéma DB poussé (`npm run db:push`)
- [ ] Compte administrateur créé/sécurisé
- [ ] HTTPS activé
- [ ] Monitoring activé

## 🤝 Contribution

### Standards de code

- **TypeScript strict** activé
- **ESLint + Prettier** pour la cohérence
- **Conventional Commits** pour les messages
- **Composants fonctionnels** avec hooks

### Architecture pattern

```typescript
// Structure d'un composant
export function MyComponent({ prop }: Props) {
  // 1. Hooks d'état
  const [state, setState] = useState();
  
  // 2. Hooks de données
  const { data, isLoading } = useQuery();
  
  // 3. Mutations
  const mutation = useMutation();
  
  // 4. Handlers
  const handleAction = () => {};
  
  // 5. Render
  return <div></div>;
}
```

### Ajout de fonctionnalités

1. **Schéma** : Définir dans `shared/schema.ts`
2. **API** : Routes dans `server/routes.ts`
3. **Storage** : Interface dans `server/storage.ts`
4. **Frontend** : Composants + hooks
5. **Tests** : Validation manuelle complète

## 📞 Support et maintenance

### Monitoring intégré

- **Pool de connexions DB** avec statistiques
- **Logs structurés** avec performance tracking
- **Health checks** automatiques

### Problèmes courants

**Base de données**
```bash
# Réinitialiser le schéma
npm run db:push --force

# Vérifier la connexion
npx drizzle-kit studio
```

**Cache PWA**
```javascript
// Vider le cache dans DevTools
Application > Storage > Clear Storage
```

**Performance**
- Pool DB : max 20 connexions, idle 30s
- React Query : cache 5min par défaut
- Images : optimisation automatique Vite

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

**Développé pour le CJD Amiens** - Application moderne de gestion collaborative d'innovation
