# Plan de Migration NextJS + tRPC + NestJS Backend

**Date**: 2026-01-22
**Version**: 1.0
**Auteur**: Claude Code

## 📋 Vue d'Ensemble

### Architecture Cible

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                      NextJS 15 (App Router)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Server       │  │ Client       │  │ shadcn/ui      │ │
│  │ Components   │  │ Components   │  │ Components     │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ tRPC (Type-safe)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      tRPC LAYER                             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Ideas Router │  │ Events Router│  │ Admin Router   │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Internal Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND - NestJS                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Controllers  │  │ Services     │  │ Database        │ │
│  │ (REST API)   │  │ (Business)   │  │ (Drizzle ORM)   │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Stack Technologique

**Frontend (NextJS)**
- Next.js 15.1+ (App Router)
- React 19
- TypeScript 5.6+
- Tailwind CSS 4.x
- shadcn/ui (conservé)
- TanStack Query v5 (via tRPC)

**Communication Layer (tRPC)**
- @trpc/server ^11.0
- @trpc/client ^11.0
- @trpc/react-query ^11.0
- @trpc/next ^11.0
- Zod pour validation

**Backend (NestJS - existant)**
- NestJS 11.x (déjà en place)
- Services exposés via tRPC routers
- Drizzle ORM 0.39+
- PostgreSQL

## 🎯 Objectifs

### Fonctionnels
- ✅ Type-safety end-to-end automatique
- ✅ SSR (Server-Side Rendering) pour meilleures performances
- ✅ SEO amélioré pour pages publiques
- ✅ Streaming SSR pour UX optimale
- ✅ Route handlers Next.js pour webhooks

### Techniques
- ✅ Réduction drastique du boilerplate
- ✅ Autocomplétion complète IDE
- ✅ Détection d'erreurs à la compilation
- ✅ Pas de génération de code (vs OpenAPI)
- ✅ Cache et optimisations Next.js

### Non-Fonctionnels
- ⚠️ Migration progressive sans downtime
- ⚠️ Compatibilité avec infra Docker existante
- ⚠️ Build via Bun (package manager) + Node runtime

## 📁 Structure Cible du Projet

```
/srv/workspace/cjd80/
├── app/                          # 🆕 NextJS App Router
│   ├── (auth)/                   # Route group - Authentification
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/                 # Route group - Pages publiques
│   │   ├── page.tsx             # Home
│   │   ├── events/
│   │   │   └── page.tsx
│   │   └── propose/
│   │       └── page.tsx
│   ├── (protected)/             # Route group - Pages protégées
│   │   ├── admin/
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── members/
│   │   │   ├── events/
│   │   │   └── branding/
│   │   └── loan/
│   │       └── page.tsx
│   ├── api/                     # Route handlers (webhooks, etc.)
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts     # tRPC endpoint
│   ├── layout.tsx               # Root layout
│   ├── providers.tsx            # Client providers
│   └── globals.css              # Styles globaux
│
├── components/                   # 🔄 Composants partagés (migrés depuis client/)
│   ├── ui/                      # shadcn/ui components
│   ├── features/                # Feature-specific components
│   └── layout/                  # Layout components
│
├── lib/                         # 🔄 Utilitaires (migrés depuis client/lib)
│   ├── trpc/                    # 🆕 tRPC configuration
│   │   ├── client.ts           # tRPC React client
│   │   ├── server.ts           # tRPC server setup
│   │   └── react.tsx           # tRPC React provider
│   ├── utils.ts
│   └── constants.ts
│
├── server/                      # ✅ Backend NestJS (existant)
│   ├── src/
│   │   ├── trpc/               # 🆕 tRPC integration avec NestJS
│   │   │   ├── trpc.module.ts
│   │   │   ├── trpc.service.ts
│   │   │   └── routers/
│   │   │       ├── ideas.router.ts
│   │   │       ├── events.router.ts
│   │   │       ├── admin.router.ts
│   │   │       └── index.ts    # App router
│   │   ├── ideas/              # ✅ Modules NestJS existants
│   │   ├── events/
│   │   ├── admin/
│   │   └── ...
│   └── storage.ts
│
├── shared/                      # ✅ Types partagés (existant)
│   └── schema.ts               # Drizzle schemas + Zod
│
├── client/                      # 🗑️ À SUPPRIMER après migration
│   └── src/
│       ├── pages/              # Anciennes pages React
│       └── components/         # Anciens composants
│
├── next.config.js              # 🆕 Config Next.js
├── tsconfig.json               # 🔄 Mis à jour pour Next.js
├── package.json                # 🔄 Nouvelles dépendances
└── docker-compose.apps.yml     # 🔄 Mis à jour pour Next.js
```

## 🔧 Configuration Technique

### 1. next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo - Backend NestJS séparé
  output: 'standalone',

  // TypeScript strict
  typescript: {
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Images optimization
  images: {
    domains: ['localhost', 'cjd80.rbw.ovh'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'dev_minio',
        port: '9000',
      },
    ],
  },

  // Rewrites pour backend NestJS
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. tRPC Server Setup

**server/src/trpc/trpc.service.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { IdeasService } from '../ideas/ideas.service';
import { EventsService } from '../events/events.service';
// ... autres services

export const t = initTRPC.create();

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

@Injectable()
export class TrpcService {
  constructor(
    private readonly ideasService: IdeasService,
    private readonly eventsService: EventsService,
    // ... inject autres services
  ) {}

  // Router principal qui appelle les services NestJS
  appRouter = t.router({
    ideas: ideasRouter,
    events: eventsRouter,
    admin: adminRouter,
    // ...
  });
}

export type AppRouter = TrpcService['appRouter'];
```

### 3. tRPC Client Setup

**lib/trpc/client.ts**
```typescript
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/src/trpc/trpc.service';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers: () => {
        return {
          'x-trpc-source': 'nextjs-client',
        };
      },
    }),
  ],
});
```

**lib/trpc/react.tsx**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import type { AppRouter } from '@/server/src/trpc/trpc.service';

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## 🚀 Plan de Migration

### Phase 1: Setup Infrastructure (Semaine 1)

#### Jour 1-2: Installation et Configuration
- [ ] Installer Next.js 15 et dépendances
- [ ] Configurer next.config.js
- [ ] Setup Tailwind CSS 4 + PostCSS
- [ ] Migrer configuration TypeScript

#### Jour 3-4: tRPC Setup
- [ ] Installer packages tRPC
- [ ] Créer TrpcService dans NestJS
- [ ] Setup tRPC client pour Next.js
- [ ] Créer premier router de test

#### Jour 5: Testing Infrastructure
- [ ] Tester communication Next.js ↔ tRPC ↔ NestJS
- [ ] Configurer environnements (.env)
- [ ] Setup Docker avec Next.js

### Phase 2: Migration Composants de Base (Semaine 2)

#### Layout et Navigation
- [ ] Migrer Root Layout (app/layout.tsx)
- [ ] Migrer Header/Footer
- [ ] Migrer Navigation/Sidebar
- [ ] Setup Providers (TRPCProvider, ThemeProvider)

#### Composants UI shadcn
- [ ] Copier composants ui/ depuis client/
- [ ] Adapter imports pour Next.js
- [ ] Tester tous les composants

### Phase 3: Migration Pages Publiques (Semaine 3)

#### Pages à migrer
- [ ] Home page (/)
- [ ] Events page (/events)
- [ ] Propose page (/propose)
- [ ] Auth pages (/login, /callback)

#### Pour chaque page
1. Créer route dans app/(public)/
2. Convertir useQuery → trpc.useQuery
3. Adapter Server Components si possible
4. Tester fonctionnalité complète

### Phase 4: Migration Pages Admin (Semaine 4-5)

#### Dashboard et Settings
- [ ] Admin Dashboard (/admin)
- [ ] Members page (/admin/members)
- [ ] Events management (/admin/events)
- [ ] Branding config (/admin/branding)

#### Pages Financières
- [ ] Sponsorships (/admin/finance/sponsorships)
- [ ] Tracking (/admin/tracking)
- [ ] Loans (/admin/loans)

### Phase 5: tRPC Routers Complets (Semaine 5-6)

#### Création de tous les routers
- [ ] ideas.router.ts (list, create, vote, updateStatus)
- [ ] events.router.ts (list, create, register, update)
- [ ] admin.router.ts (stats, users, settings)
- [ ] members.router.ts (CRUD membres)
- [ ] patrons.router.ts (CRUD mécènes)
- [ ] financial.router.ts (sponsorships, tracking)
- [ ] auth.router.ts (session, user info)

### Phase 6: Optimisations Next.js (Semaine 7)

#### Performance
- [ ] Identifier pages pour Server Components
- [ ] Optimiser images avec next/image
- [ ] Setup ISR pour pages statiques
- [ ] Streaming SSR pour pages lentes

#### SEO
- [ ] Metadata pour toutes les pages
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] OpenGraph images

### Phase 7: Testing et Déploiement (Semaine 8)

#### Tests
- [ ] Tests E2E Playwright sur Next.js
- [ ] Tests d'intégration tRPC
- [ ] Performance testing
- [ ] Tests de compatibilité mobile

#### Déploiement
- [ ] Build Next.js en production
- [ ] Configurer Docker Compose
- [ ] Tester reverse proxy Traefik
- [ ] Migration progressive (blue-green)

## 🔄 Stratégie de Migration Progressive

### Option A: Routing par proxy (Recommandé)

**Configuration Traefik**:
```yaml
# Nouveau service Next.js
cjd80-next:
  image: node:20-bullseye
  command: npm run start
  ports:
    - "3000:3000"
  labels:
    - "traefik.http.routers.cjd80-next.rule=Host(`cjd80.rbw.ovh`) && PathPrefix(`/next`)"

# Backend NestJS (existant)
cjd80:
  # ...existant
  labels:
    - "traefik.http.routers.cjd80.rule=Host(`cjd80.rbw.ovh`)"
```

**Avantages**:
- Zéro downtime
- Rollback facile
- Test en production progressif

### Option B: Flag Feature Toggle

**Utiliser variable d'environnement**:
```typescript
const USE_NEXTJS = process.env.USE_NEXTJS === 'true';

// Dans le reverse proxy
if (USE_NEXTJS) {
  redirect to :3000
} else {
  redirect to :5000
}
```

## 📊 Métriques de Succès

### Performance
- [ ] Time to First Byte (TTFB) < 200ms
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] Bundle size < 200KB (initial)

### Développement
- [ ] 100% type-safety frontend ↔ backend
- [ ] Zéro any dans le code tRPC
- [ ] Autocomplétion fonctionnelle partout
- [ ] Build sans erreurs TypeScript

### Production
- [ ] Zero downtime pendant migration
- [ ] Rollback possible à chaque étape
- [ ] Logs et monitoring opérationnels
- [ ] Performance >= app actuelle

## ⚠️ Risques et Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Breaking changes Next.js 15 | Élevé | Moyen | Tests exhaustifs, migration progressive |
| Incompatibilité tRPC/NestJS | Élevé | Faible | POC d'abord, architecture testée |
| Régression fonctionnelle | Moyen | Moyen | Tests E2E complets, QA manuelle |
| Performance dégradée | Moyen | Faible | Benchmarks avant/après |
| Complexité accrue | Faible | Élevé | Documentation complète, formation |

## 📚 Documentation à Créer

- [ ] Guide d'architecture Next.js + tRPC
- [ ] Conventions de code pour routers tRPC
- [ ] Guide de migration de pages
- [ ] Documentation des Server Components
- [ ] Guide de déploiement Docker

## 🎯 Prochaines Étapes Immédiates

1. **Validation du plan** avec l'équipe
2. **Setup environnement de dev** (branche feature/nextjs-migration)
3. **POC tRPC** avec 1-2 endpoints
4. **Création structure** Next.js de base
5. **Migration première page** (Home) comme référence

---

**Durée estimée totale**: 8 semaines (2 mois)
**Effort**: 1 développeur full-time
**Blocage**: Aucun (migration progressive)
