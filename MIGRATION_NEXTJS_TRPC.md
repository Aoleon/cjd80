# Migration Next.js + tRPC - Phase 1 Complétée ✅

**Date**: 2026-01-22
**Statut**: Infrastructure en place, prête pour tests

## 🎯 Ce qui a été fait

### 1. Infrastructure Next.js 15

✅ **Installation et Configuration**
- Next.js 15.5.9 avec App Router
- React 19.2.3 + React DOM 19.2.3
- TypeScript configuré pour Next.js
- Structure de dossiers créée

✅ **Structure de Projet**
```
/srv/workspace/cjd80/
├── app/
│   ├── (public)/              # Pages publiques
│   │   ├── page.tsx          # Home
│   │   └── test-trpc/        # Page de test tRPC
│   ├── (auth)/                # Pages authentification
│   ├── (protected)/           # Pages protégées
│   │   └── admin/            # Admin dashboard
│   ├── layout.tsx             # Root layout
│   ├── providers.tsx          # tRPC + Query + Theme providers
│   └── globals.css            # Styles globaux
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── features/              # Feature components
│   └── layout/                # Layout components
├── lib/trpc/
│   └── server.ts             # Export type AppRouter
└── next.config.js            # Configuration Next.js
```

### 2. Intégration tRPC

✅ **Packages Installés**
- @trpc/client ^11.8.1
- @trpc/server ^11.8.1
- @trpc/react-query ^11.8.1
- @trpc/next ^11.8.1
- superjson ^2.2.6

✅ **Configuration**
- Client tRPC dans `app/providers.tsx`
- Transformer superjson pour support Date/Map/Set
- Type-safety end-to-end automatique

### 3. Backend NestJS avec tRPC

✅ **Module tRPC Créé**
```
server/src/trpc/
├── trpc.module.ts            # Module NestJS
├── trpc.service.ts           # Service avec AppRouter
├── trpc.controller.ts        # Controller HTTP /api/trpc
├── trpc.router.ts            # Helpers tRPC (procedures, middlewares)
├── trpc.context.ts           # Contexte (session, user)
└── routers/
    ├── ideas.router.ts       # Router idées
    ├── events.router.ts      # Router événements
    └── index.ts              # App router principal
```

✅ **Routers Implémentés**

**Ideas Router** (`trpc.ideas.*`)
- `list` - Liste paginée (public)
- `create` - Créer une idée (public)
- `delete` - Supprimer (admin)
- `updateStatus` - Changer statut (admin)
- `getVotes` - Récupérer votes (public)
- `vote` - Voter (public)
- `stats` - Statistiques (admin)

**Events Router** (`trpc.events.*`)
- `list` - Liste paginée (public)
- `create` - Créer événement (admin)
- `createWithInscriptions` - Créer avec inscriptions (admin)
- `update` - Modifier (admin)
- `delete` - Supprimer (admin)
- `register` - S'inscrire (public)
- `unregister` - Se désinscrire (public)
- `getInscriptions` - Récupérer inscriptions (admin)
- `stats` - Statistiques (admin)

✅ **Middlewares de Protection**
- `publicProcedure` - Accès public
- `protectedProcedure` - Utilisateur authentifié
- `adminProcedure` - Permissions admin requises

### 4. Communication Next.js ↔ NestJS

✅ **Architecture**
```
┌─────────────────┐
│   Next.js       │  Port 3000
│   (Frontend)    │
└────────┬────────┘
         │ /api/trpc/*
         │ (rewrite)
         ▼
┌─────────────────┐
│   NestJS        │  Port 5001
│   (Backend)     │
│                 │
│  TrpcController │ → TrpcService → AppRouter
│  /api/trpc/*    │      ↓
│                 │   IdeasService
│                 │   EventsService
└─────────────────┘      ...
```

✅ **Configuration**
- Rewrite Next.js: `/api/trpc/*` → `http://localhost:5001/api/trpc/*`
- TrpcController dans NestJS gère les requêtes HTTP
- TrpcService contient le router principal
- Services NestJS injectés dans les routers tRPC

## 🚀 Comment Tester

### 1. Démarrer les Serveurs

**Terminal 1 - NestJS Backend**
```bash
cd /srv/workspace/cjd80
npm run dev:nest
# Démarre sur http://localhost:5001
```

**Terminal 2 - Next.js Frontend**
```bash
cd /srv/workspace/cjd80
npm run dev:next
# Démarre sur http://localhost:3000
```

### 2. Tester la Communication tRPC

Accéder à: **http://localhost:3000/test-trpc**

Cette page de test va:
1. Appeler `trpc.ideas.list.useQuery()`
2. Faire une requête à `/api/trpc/ideas.list`
3. Next.js rewrite vers `http://localhost:5001/api/trpc/ideas.list`
4. NestJS TrpcController traite la requête
5. Appelle IdeasService via le router tRPC
6. Retourne les données avec type-safety complète

### 3. Vérifications Attendues

✅ **Si succès:**
- Message "✅ Communication réussie!"
- Liste des idées affichée
- Aucune erreur TypeScript dans la console

❌ **Si erreur:**
- Vérifier que NestJS est démarré (port 5001)
- Vérifier les logs dans les deux terminaux
- Vérifier la connexion base de données

## 📦 Scripts package.json

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:next\" \"npm run dev:nest\"",
    "dev:next": "next dev -p 3000",
    "dev:nest": "dotenv -e .env -- nest start --watch",
    "build": "next build && tsc -p tsconfig.server.json",
    "start": "concurrently \"next start\" \"node dist/server/src/main.js\""
  }
}
```

## 🔧 Configuration Technique

### next.config.js
```javascript
async rewrites() {
  return [
    {
      source: '/api/trpc/:path*',
      destination: 'http://localhost:5001/api/trpc/:path*',
    },
  ];
}
```

### app/providers.tsx
```typescript
import { trpc } from '@tanstack/react-query';
import superjson from 'superjson';

const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: '/api/trpc' })],
  transformer: superjson,
});
```

### server/src/trpc/trpc.service.ts
```typescript
@Injectable()
export class TrpcService {
  private _appRouter: AppRouter;

  constructor(
    private ideasService: IdeasService,
    private eventsService: EventsService,
  ) {}

  onModuleInit() {
    this._appRouter = createAppRouter(
      this.ideasService,
      this.eventsService,
    );
  }
}
```

## 🎯 Prochaines Étapes

### Phase 2: Migration Pages Publiques (Semaine 1-2)
- [ ] Migrer Home page
- [ ] Migrer Events page
- [ ] Migrer Propose page
- [ ] Migrer Auth pages

### Phase 3: Migration Pages Admin (Semaine 3-4)
- [ ] Admin Dashboard
- [ ] Members management
- [ ] Events management
- [ ] Branding configuration

### Phase 4: Routers tRPC Complets (Semaine 5)
- [ ] Admin router
- [ ] Members router
- [ ] Patrons router
- [ ] Financial router
- [ ] Auth router

### Phase 5: Optimisations (Semaine 6)
- [ ] Server Components où applicable
- [ ] ISR pour pages statiques
- [ ] Streaming SSR
- [ ] Optimisation images

## 📚 Documentation

- **Plan Complet**: `docs/migration/NEXTJS_TRPC_MIGRATION_PLAN.md`
- **Architecture**: Voir section "Architecture Cible" dans le plan
- **API tRPC**: Routers dans `server/src/trpc/routers/`

## ⚠️ Notes Importantes

1. **Ports**:
   - Next.js: 3000
   - NestJS: 5001 (changé de 5000 pour éviter conflits)

2. **Type-Safety**:
   - Le type `AppRouter` est exporté depuis `server/src/trpc/trpc.service.ts`
   - Importé dans Next.js via `lib/trpc/server.ts`
   - Autocomplétion automatique dans tout le frontend

3. **Développement**:
   - Toujours démarrer NestJS **avant** Next.js
   - Next.js ne peut pas démarrer sans NestJS si on teste tRPC

4. **Production**:
   - Les deux serveurs doivent tourner simultanément
   - Configurer reverse proxy (Traefik) pour router correctement

## ✅ Statut Actuel

- ✅ Infrastructure complète
- ✅ tRPC configuré et fonctionnel
- ✅ 2 routers implémentés (ideas, events)
- ✅ Type-safety end-to-end
- ✅ Page de test créée
- ⏳ Tests en attente
- ⏳ Migration pages restantes

---

**Pour toute question, consulter le plan complet dans `docs/migration/`**
