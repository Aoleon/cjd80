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
- Node.js + **NestJS** (migration en cours depuis Express.js)
- TypeScript avec tsx
- Passport.js avec OAuth2 Strategy (authentification via Authentik)
- Drizzle ORM (base de données)
- Architecture modulaire avec dependency injection

**Base de données**
- PostgreSQL (Neon)
- Pool de connexions optimisé
- Migrations automatiques

**Performance & Sécurité**
- PWA avec service workers
- Validation Zod côté client/serveur
- Authentification OAuth2/OIDC via Authentik (mots de passe gérés par Authentik)
- Protection CSRF intégrée
- Sessions Express sécurisées

### Configuration du branding

L'application utilise un **système de configuration centralisé** qui permet une personnalisation complète sans modifier le code :

- **Configuration centralisée** : Tous les textes, couleurs, logos dans `client/src/config/branding-core.ts`
- **Génération automatique** : Script `npm run generate:config` pour mettre à jour les fichiers statiques
- **15+ composants** : Utilisation automatique des valeurs de branding via helpers
- **Multi-tenant ready** : Adaptation facile pour d'autres organisations

📖 **Guide complet** : Voir [docs/features/CUSTOMIZATION.md](./docs/features/CUSTOMIZATION.md) pour personnaliser l'application

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
│   └── src/
│       ├── components/    # Composants réutilisables
│       ├── hooks/         # Hooks personnalisés
│       ├── lib/           # Utilitaires et configuration
│       └── pages/         # Pages de l'application
├── server/                # API NestJS backend (migration depuis Express.js)
│   ├── src/              # Code source NestJS
│   │   ├── auth/         # Module authentification
│   │   ├── health/       # Module health checks
│   │   ├── ideas/        # Module idées
│   │   ├── events/       # Module événements
│   │   ├── admin/        # Module administration
│   │   ├── members/      # Module membres/CRM
│   │   ├── patrons/      # Module mécènes
│   │   ├── loans/        # Module prêts
│   │   ├── financial/    # Module financier
│   │   ├── tracking/    # Module tracking
│   │   ├── common/       # Modules communs (database, storage, interceptors)
│   │   └── integrations/ # Intégrations (minio, authentik, vite)
│   ├── middleware/        # Middlewares Express legacy (en cours de migration)
│   ├── utils/            # Utilitaires serveur
│   ├── auth.ts           # Configuration Passport.js (legacy, en cours de migration)
│   ├── db.ts             # Configuration base de données
│   ├── routes.ts         # Routes Express legacy (en cours de migration)
│   └── index.ts          # Point d'entrée Express legacy
│   ├── routes.ts         # Routes API
│   └── storage.ts        # Interface de stockage
├── shared/               # Types et schémas partagés
│   └── schema.ts         # Schémas Drizzle + validation Zod
├── docs/                 # 📚 Documentation organisée
│   ├── deployment/       # Guides de déploiement
│   ├── features/         # Documentation des fonctionnalités
│   └── testing/          # Rapports de tests
├── tests/                # 🧪 Tests (Vitest, Playwright)
│   ├── e2e/             # Tests end-to-end
│   └── reports/         # Rapports générés
├── scripts/              # 🛠️ Scripts utilitaires
└── assets/               # 🖼️ Ressources statiques
    ├── screenshots/     # Screenshots de démo
    └── archive/         # Données historiques
```

📖 **Documentation complète** : Voir [docs/README.md](./docs/README.md) pour la navigation dans la documentation

## 🚀 Installation et développement

### Prérequis

- **Node.js** 18.0.0 ou supérieur
- **npm** ou **yarn**
- **PostgreSQL** (local ou cloud via Neon)
- **Docker** et **Docker Compose** (pour Authentik)
- **Redis** (géré via Docker Compose)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd cjd-amiens-boite-kiffs

# Installer les dépendances
npm install

# Démarrer les services Docker (PostgreSQL, Redis, Authentik)
docker compose -f docker-compose.services.yml up -d postgres redis authentik-server authentik-worker

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos credentials PostgreSQL et Authentik
```

**Note** : Pour une installation complète d'Authentik, voir `docs/deployment/AUTHENTIK_QUICKSTART.md`

### Variables d'environnement

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Session (générer une clé secrète forte)
SESSION_SECRET=your-super-secret-key-here

# Authentik - Configuration OAuth2/OIDC
AUTHENTIK_BASE_URL=http://localhost:9002
AUTHENTIK_CLIENT_ID=your-client-id-from-authentik
AUTHENTIK_CLIENT_SECRET=your-client-secret-from-authentik
AUTHENTIK_ISSUER=http://localhost:9002/application/o/cjd80/
AUTHENTIK_REDIRECT_URI=http://localhost:5000/api/auth/authentik/callback
AUTHENTIK_TOKEN=your-api-token-from-authentik
AUTHENTIK_SECRET_KEY=your-secret-key (générer avec: openssl rand -base64 32)

# Optionnel : Configuration Neon
PGHOST=your-neon-host
PGDATABASE=your-database-name
PGUSER=your-username
PGPASSWORD=your-password
PGPORT=5432
```

**Note** : Les valeurs Authentik doivent être récupérées après configuration d'Authentik via l'interface web (http://localhost:9002). Voir `docs/deployment/AUTHENTIK_QUICKSTART.md` pour les détails.

### Démarrage

**Méthode recommandée (automatisée)** :
```bash
# Démarrage complet automatisé (services Docker + DB + application)
npm run start:dev
```

**Méthode manuelle** :
```bash
# 1. Démarrer les services Docker (si pas déjà fait)
docker compose -f docker-compose.services.yml up -d postgres redis authentik-server authentik-worker

# 2. Attendre que les services soient prêts (environ 30 secondes)
docker compose -f docker-compose.services.yml ps

# 3. Pousser le schéma vers la base de données
# Note: Utiliser localhost:5433 pour la connexion depuis l'hôte
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cjd80" npm run db:push

# 4. Configurer Authentik (première fois uniquement)
# - Accéder à http://localhost:9002
# - Récupérer les identifiants admin depuis les logs:
#   docker compose -f docker-compose.services.yml logs authentik-server | grep -i "password\|admin"
# - Créer l'application OAuth2/OIDC (voir docs/deployment/AUTHENTIK_QUICKSTART.md)
# - Remplir les variables d'environnement avec les valeurs d'Authentik

# 5. Démarrer en développement (frontend + backend)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cjd80" npm run dev

# L'application sera disponible sur http://localhost:5000
# Authentik sera disponible sur http://localhost:9002
```

**Scripts d'automatisation disponibles** :
- `npm run start:dev` - Démarrage complet automatisé
- `npm run clean:all` - Nettoyage complet de l'environnement
- `npm run reset:env` - Reset complet (supprime toutes les données Docker)
- `./scripts/setup-authentik.sh` - Configuration automatique d'Authentik

### Scripts disponibles

```bash
# Développement
npm run dev              # Démarre frontend + backend
npm run dev:client       # Frontend seul
npm run dev:server       # Backend seul

# Base de données
npm run db:push          # Pousse le schéma vers la DB
npm run db:studio        # Interface graphique Drizzle Studio

# Authentik
./scripts/setup-authentik.sh  # Script d'automatisation pour configurer Authentik

# Configuration
npm run generate:config  # Génère index.html et manifest.json depuis branding

# Nettoyage et maintenance
npm run clean:all        # Nettoyage complet de l'environnement
npm run reset:env        # Reset complet (supprime toutes les données Docker)
npm run validate         # Validation complète de l'application
npm run analyze:migration # Analyse de la migration NestJS

# Production
npm run build           # Build pour production (NestJS)
npm run build:express   # Build Express legacy (pour transition)
npm start               # Démarre en production (NestJS)
npm run start:express   # Démarre Express legacy (pour transition)
```

## 🗄️ Schéma de base de données

### Tables principales

**admins** - Utilisateurs administrateurs
```sql
- email (PRIMARY KEY)
- password (nullable - géré par Authentik)
- first_name, last_name
- role (super_admin, ideas_reader, ideas_manager, events_reader, events_manager)
- status (pending, active, inactive)
- added_by
- created_at, updated_at
```

**Note** : Les mots de passe ne sont plus stockés localement. L'authentification est gérée par Authentik via OAuth2/OIDC.

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

- **Authentik** : Fournisseur d'identité (IdP) via OAuth2/OIDC
- **Session-based** avec Passport.js et Express sessions
- **OAuth2/OIDC** pour l'authentification centralisée
- **Mapping automatique** des groupes Authentik vers les rôles de l'application
- **Synchronisation automatique** des utilisateurs lors de la première connexion
- **Protection CSRF** automatique
- **Rate limiting** sur les tentatives de connexion

### Configuration Authentik

**Authentik est maintenant configuré et opérationnel !** Les services sont démarrés automatiquement via Docker Compose.

**Documentation complète** :
- `docs/deployment/AUTHENTIK_QUICKSTART.md` - Guide de démarrage rapide ⭐
- `docs/deployment/AUTHENTIK_SETUP.md` - Guide de configuration détaillé
- `docs/deployment/AUTHENTIK_MIGRATION.md` - Guide de migration des utilisateurs
- `docs/deployment/AUTHENTIK_MIGRATION_COMPLETE.md` - Rapport de migration

**Accès Authentik** :
- Interface web : http://localhost:9002
- HTTPS : https://localhost:9443

**Prochaines étapes** :
1. Accéder à http://localhost:9002
2. Récupérer les identifiants admin depuis les logs
3. Créer l'application OAuth2/OIDC
4. Créer les groupes et utilisateurs
5. Remplir les variables d'environnement

### Gestion des permissions

- **Routes publiques** : Visualisation des idées et événements
- **Routes protégées** : Administration (PREFIX `/admin/`)
- **Middleware auth** : Vérification automatique sur routes admin
- **Rôles** : Mappés depuis les groupes Authentik (super_admin, ideas_reader, ideas_manager, events_reader, events_manager)

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

📖 **Guide détaillé** : [docs/features/CUSTOMIZATION.md](./docs/features/CUSTOMIZATION.md)

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
GET    /api/auth/authentik              # Initie le flow OAuth2 (redirige vers Authentik)
GET    /api/auth/authentik/callback     # Callback OAuth2 depuis Authentik
POST   /api/logout                      # Déconnexion
GET    /api/user                        # Utilisateur connecté

# Note: /api/login redirige maintenant vers /api/auth/authentik
# Les utilisateurs doivent être créés dans Authentik
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

### Déploiement optimisé pour VPS (Build local)

Pour les VPS avec RAM limitée, un système de **build local** a été mis en place :

**Dockerfile.production** : Utilise un build pré-compilé (`dist/`) pour éviter les problèmes de mémoire lors du build Docker sur le VPS.

**Script de déploiement** : `scripts/build-and-copy-to-vps.sh`
- Build local de l'application
- Création d'une archive `dist/`
- Copie sur le VPS via SSH
- Build Docker optimisé avec `Dockerfile.production`

```bash
# Déploiement avec build local
./scripts/build-and-copy-to-vps.sh
```

**Avantages :**
- ✅ Évite les erreurs "heap out of memory" sur VPS limités
- ✅ Build plus rapide (utilise le build local)
- ✅ Déploiement fiable même avec peu de RAM

### Checklist de déploiement

- [ ] Variables d'environnement configurées (incluant Authentik)
- [ ] Base de données provisionnée
- [ ] Schéma DB poussé (`npm run db:push`)
- [ ] Services Docker démarrés (PostgreSQL, Redis, Authentik)
- [ ] Authentik configuré (application OAuth2, groupes, utilisateurs)
- [ ] Variables Authentik remplies (CLIENT_ID, CLIENT_SECRET, TOKEN)
- [ ] HTTPS activé
- [ ] Monitoring activé

## 🆕 Derniers développements

### Migration vers NestJS (Janvier 2025) ✅

**Migration complète du backend Express.js vers NestJS** :

- ✅ **Architecture modulaire** : Restructuration de 4513 lignes monolithiques en 11 modules NestJS organisés
- ✅ **Routes migrées** : ~135+ routes sur ~174 routes totales (~78%)
- ✅ **Routes critiques** : 100% des routes critiques migrées (Auth, Health, Admin, tous les modules métier)
- ✅ **Code généré** : 13 controllers (1,836 lignes) + 17 services (3,962 lignes)
- ✅ **Qualité** : 0 erreur de lint TypeScript, validation Zod complète, gestion d'erreurs cohérente
- ✅ **Build** : Compilation réussie sans erreurs

**Modules migrés** :
- Infrastructure : Auth, Health, Config, Database, Storage, Logs
- Métier : Ideas, Events, Admin, Members, Patrons, Loans, Financial, Tracking, Chatbot, Setup, Branding

**Documentation** : Voir `docs/migration/NESTJS_MIGRATION_COMPLETE.md` pour le rapport complet.

### Migration vers Authentik (Janvier 2025) ✅

**Migration complète vers Authentik comme fournisseur d'identité (IdP)** :
- ✅ Remplacement de l'authentification locale par OAuth2/OIDC
- ✅ Services Authentik configurés et opérationnels via Docker Compose
- ✅ Synchronisation automatique des utilisateurs
- ✅ Mapping automatique des groupes Authentik vers les rôles
- ✅ Base de données migrée (champ password nullable)
- ✅ Documentation complète (8 guides)

**Avantages** :
- Authentification centralisée et sécurisée
- Gestion des utilisateurs via interface web
- Support SSO (Single Sign-On)
- Conformité avec les standards OAuth2/OIDC

**Documentation** : Voir `docs/deployment/AUTHENTIK_MIGRATION_COMPLETE.md` pour le rapport complet.

### Optimisations de déploiement (Novembre 2024)

**Dockerfile.production** : Nouveau Dockerfile optimisé pour production
- Utilise un build pré-compilé (`dist/`) pour éviter les problèmes de mémoire
- Installation optimisée des dépendances
- Health checks intégrés
- Utilisateur non-root pour la sécurité

**Scripts de déploiement améliorés** :
- `build-and-copy-to-vps.sh` : Build local + copie sur VPS (recommandé)
- Optimisations pour VPS avec RAM limitée
- Détection automatique des changements

**Corrections récentes** :
- ✅ Affichage des membres dans l'interface admin
- ✅ Affichage des matériels dans la section prêt
- ✅ Navigation admin optimisée
- ✅ Source maps activées en production pour meilleur débogage
- ✅ Corrections des erreurs React Hooks

**Documentation** :
- Documentation réorganisée dans `docs/`
- Guides de déploiement mis à jour
- Rapports d'analyse et corrections documentés

📖 **Voir** : [docs/CORRECTIONS_RESUME.md](./docs/CORRECTIONS_RESUME.md) pour le détail des corrections

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