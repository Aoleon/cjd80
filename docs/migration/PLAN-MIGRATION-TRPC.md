# Plan Migration Server Actions + tRPC - CJD80

**Version**: 2.0 (Architecture tRPC)
**Date**: 2026-01-19
**Status**: Phase 1.1 ✅ | Phase 1.5 (tRPC Setup) 🔄

---

## 🎯 Architecture Cible

### Modèle Hybride: RSC + TanStack + Server Actions + tRPC

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📖 LECTURE (Read)                                           │
│  ┌─────────────────────────────────────────────────┐        │
│  │  RSC (Server Components)                        │        │
│  │  ├─ fetch() pour données initiales              │        │
│  │  └─ Drizzle ORM direct (queries simples)        │        │
│  └─────────────────────────────────────────────────┘        │
│           ↓                                                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Client Components                               │        │
│  │  └─ TanStack Query (cache + real-time)          │        │
│  └─────────────────────────────────────────────────┘        │
│                                                               │
│  ✍️  ÉCRITURE (Write)                                        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Client Components                               │        │
│  │  ├─ Forms (react-hook-form + Zod)               │        │
│  │  └─ useMutation (TanStack Query)                │        │
│  └─────────────────────────────────────────────────┘        │
│           ↓                                                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │  SERVER ACTIONS ('use server')                  │        │
│  │  ├─ Validation (Zod schemas)                    │        │
│  │  ├─ Rate limiting                                │        │
│  │  └─ Routing logique:                             │        │
│  │      ├─ CRUD simple → Drizzle direct            │        │
│  │      └─ Business logic → tRPC Client             │        │
│  └─────────────────────────────────────────────────┘        │
│           ↓                                                  │
└───────────┼─────────────────────────────────────────────────┘
            │
            ├──── [Mutations simples] ──→ 💾 PostgreSQL
            │                               (via Drizzle)
            │
            └──── [Business logic] ──→ 🔌 tRPC Client
                                           ↓
                  ┌────────────────────────────────────────┐
                  │       NESTJS BACKEND                   │
                  │  ┌──────────────────────────────────┐ │
                  │  │  tRPC Server (trpc-nestjs)      │ │
                  │  │  ├─ Type-safe procedures         │ │
                  │  │  └─ Expose NestJS Services       │ │
                  │  └──────────────────────────────────┘ │
                  │             ↓                          │
                  │  ┌──────────────────────────────────┐ │
                  │  │  NestJS Services                 │ │
                  │  │  ├─ Business Logic               │ │
                  │  │  ├─ Validations complexes        │ │
                  │  │  ├─ Transactions multi-tables    │ │
                  │  │  └─ Intégrations externes        │ │
                  │  └──────────────────────────────────┘ │
                  │             ↓                          │
                  │         💾 PostgreSQL                  │
                  │         (via Drizzle)                  │
                  └────────────────────────────────────────┘
```

---

## 🎨 Principes Architecture

### ✅ Quand utiliser Drizzle DIRECT (Server Actions)

**Routes CRUD simples**:
- ✅ Créer une idée (INSERT simple + validation Zod)
- ✅ Voter pour une idée (INSERT + check doublon)
- ✅ S'inscrire à un événement (INSERT + check doublon)
- ✅ Proposer un membre (INSERT + status "proposed")

**Caractéristiques**:
- 1 table concernée
- Validation Zod suffisante
- Pas de business logic complexe
- Pas d'intégrations externes
- Query < 50 lignes

**Avantages**:
- ⚡ Plus rapide (pas de hop réseau)
- 🔒 Type-safe (Zod + Drizzle)
- 🎯 Code simple et lisible

**Exemple** (Phase 1.1 actuelle):
```typescript
// app/actions/ideas.ts
'use server'

export async function createIdea(prevState: any, formData: FormData) {
  // 1. Rate limiting
  const allowed = await rateLimit(ip, 'create-idea', 20, 15 * 60)
  if (!allowed) return createError('Rate limit')

  // 2. Validation Zod
  const result = insertIdeaSchema.safeParse(rawData)
  if (!result.success) return formatZodError(result.error)

  // 3. Direct Drizzle
  const [idea] = await db.insert(ideas).values([ideaData]).returning()
  if (!idea) return createError('Insert failed')

  // 4. Revalidation
  await revalidateIdeas()

  return createSuccess(idea, 'Idée créée')
}
```

---

### ✅ Quand utiliser tRPC (Server Actions → NestJS)

**Routes avec business logic**:
- ✅ Convertir idée → événement (2+ tables, logique métier)
- ✅ Import bulk inscriptions (parsing CSV, transactions, emails)
- ✅ Génération prévisions financières (calculs complexes, agrégations)
- ✅ Synchronisation GitHub (API externe, webhooks)
- ✅ Notifications push + email (intégrations Gotify/Listmonk)

**Caractéristiques**:
- 2+ tables avec relations
- Business logic métier (calculs, transformations)
- Transactions complexes
- Intégrations externes (APIs, webhooks)
- Réutilisation code NestJS existant

**Avantages**:
- 🔒 Type-safe end-to-end (tRPC)
- ♻️  Réutilisation services NestJS existants
- 🎯 Logique métier centralisée
- 🧪 Testabilité (services NestJS)

**Exemple** (Phase 2+ futur):
```typescript
// app/actions/ideas.ts
'use server'

import { trpcClient } from '@/lib/trpc-client'

export async function convertIdeaToEvent(ideaId: string) {
  // 1. Auth
  const user = await requireAuth()

  // 2. Validation simple
  if (!ideaId) return createError('ID requis')

  // 3. Appel tRPC (type-safe)
  try {
    const event = await trpcClient.ideas.convertToEvent.mutate({
      ideaId,
      userId: user.id,
    })

    // 4. Revalidation
    await revalidateIdeas()
    await revalidateEvents()

    return createSuccess(event, 'Idée convertie en événement')
  } catch (error) {
    return createError('Erreur conversion')
  }
}
```

**Backend NestJS** (service réutilisé):
```typescript
// server/src/ideas/ideas.service.ts
async convertToEvent(ideaId: string, userId: string) {
  return await this.db.transaction(async (tx) => {
    // 1. Get idea
    const idea = await tx.select().from(ideas).where(eq(ideas.id, ideaId))
    if (!idea) throw new NotFoundException()

    // 2. Create event
    const event = await tx.insert(events).values({
      title: idea.title,
      description: idea.description,
      status: 'draft',
      createdBy: userId,
    }).returning()

    // 3. Update idea status
    await tx.update(ideas)
      .set({ status: 'converted_to_event', convertedEventId: event.id })
      .where(eq(ideas.id, ideaId))

    // 4. Create notification
    await this.notificationService.notifyIdeaConverted(idea, event)

    return event
  })
}
```

**tRPC Router** (expose service):
```typescript
// server/src/ideas/ideas.trpc.ts
import { publicProcedure, router } from '../trpc/trpc-router'
import { z } from 'zod'

export const ideasRouter = router({
  convertToEvent: publicProcedure
    .input(z.object({
      ideaId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.ideasService.convertToEvent(
        input.ideaId,
        input.userId
      )
    }),
})
```

---

## 📊 Décision Matrix: Direct DB vs tRPC

| Critère | Direct DB | tRPC | Exemple |
|---------|-----------|------|---------|
| **Tables** | 1 table | 2+ tables | Create idea (1) vs Convert idea→event (2+) |
| **Business Logic** | Simple (validation) | Complexe (calculs, transformations) | Insert vs Forecast generation |
| **Transactions** | Non | Oui | Single INSERT vs Multi-table update |
| **Intégrations** | Non | Oui (APIs, webhooks) | Direct save vs GitHub sync |
| **Réutilisation** | N/A | Services NestJS | New code vs Existing service |
| **Lignes code** | < 50 lignes | 50+ lignes | Simple CRUD vs Complex flow |

---

## 🏗️ Nouvelle Stratégie Migration - 8 Phases

### Phase 0: Préparation Infrastructure ✅ COMPLÉTÉ
- Structure `/app/actions/` créée
- Helpers auth, revalidation, errors
- Tests Playwright baseline
- Branch `migration/server-actions`
- Feature flags rollback

---

### Phase 1.1: Routes Publiques CRUD Simples ✅ COMPLÉTÉ
**Durée**: 3 jours
**Commit**: `b4f31af`

**Server Actions Direct DB**:
- ✅ `createIdea()` - INSERT ideas
- ✅ `createVote()` - INSERT votes + check doublon
- ✅ `registerForEvent()` - INSERT inscriptions + check doublon
- ✅ `unsubscribeFromEvent()` - INSERT unsubscriptions
- ✅ `proposeMember()` - INSERT members (status "proposed")
- ✅ `createLoanItemRequest()` - INSERT loan_items

**Composants migrés**:
- ✅ propose-page.tsx (idées + membres)
- ✅ vote-modal.tsx
- ✅ event-registration-modal.tsx

**Validation**:
- ✅ Build Next.js OK (0 erreurs TypeScript)
- ✅ Feature flags implémentés
- ⚠️ Tests Playwright (infra Docker à configurer)

---

### Phase 1.5: Setup tRPC Infrastructure 🔄 NOUVELLE PHASE
**Durée**: 2-3 jours
**Priorité**: HAUTE - Bloquant pour phases suivantes

#### Objectif
Préparer l'infrastructure tRPC pour permettre aux Server Actions d'appeler le backend NestJS de manière type-safe.

#### Actions

**1. Installer dépendances tRPC**
```bash
# Backend NestJS
npm install --save @trpc/server trpc-nestjs-adapter zod

# Frontend Next.js (client tRPC)
npm install --save @trpc/client @trpc/react-query @trpc/next
```

**2. Setup tRPC Server (NestJS)**

Créer `/server/src/trpc/`:
```
server/src/trpc/
├── trpc-router.ts        # Router principal tRPC
├── trpc-context.ts       # Context (user, db, services)
├── trpc-middleware.ts    # Auth, logging, error handling
└── trpc.module.ts        # Module NestJS
```

**Exemple `trpc-router.ts`**:
```typescript
import { initTRPC } from '@trpc/server'
import { Context } from './trpc-context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(authMiddleware)

// Router principal (merge tous les routers)
export const appRouter = router({
  ideas: ideasRouter,
  events: eventsRouter,
  members: membersRouter,
  // ... autres routers
})

export type AppRouter = typeof appRouter
```

**3. Exposer tRPC dans NestJS**

Ajouter endpoint `/api/trpc/[trpc]`:
```typescript
// server/src/trpc/trpc.controller.ts
@Controller('api/trpc')
export class TRPCController {
  constructor(private readonly trpcService: TRPCService) {}

  @All('*')
  async handleTRPC(@Req() req: Request, @Res() res: Response) {
    return await this.trpcService.handleRequest(req, res)
  }
}
```

**4. Setup tRPC Client (Next.js)**

Créer `/lib/trpc-client.ts`:
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/src/trpc/trpc-router'

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_TRPC_URL || 'http://localhost:3000/api/trpc',
      headers: () => ({
        // Forward auth cookies
        cookie: document.cookie,
      }),
    }),
  ],
})

// Server-side client (pour Server Actions)
export const trpcServerClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.TRPC_SERVER_URL || 'http://localhost:3000/api/trpc',
      headers: async () => {
        // Forward cookies from Server Actions context
        const { cookies } = await import('next/headers')
        return {
          cookie: cookies().toString(),
        }
      },
    }),
  ],
})
```

**5. Créer premier router tRPC de test**

`/server/src/ideas/ideas.trpc.ts`:
```typescript
import { router, publicProcedure } from '../trpc/trpc-router'
import { z } from 'zod'

export const ideasRouter = router({
  // Test simple: get idea by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(ideas)
        .where(eq(ideas.id, input.id))
        .limit(1)
    }),

  // Test mutation: convertir idée → événement
  convertToEvent: publicProcedure
    .input(z.object({
      ideaId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.ideasService.convertToEvent(
        input.ideaId,
        input.userId
      )
    }),
})
```

**6. Tests validation tRPC**

Créer test Server Action qui utilise tRPC:
```typescript
// app/actions/__tests__/trpc-test.ts
'use server'

import { trpcServerClient } from '@/lib/trpc-client'

export async function testTRPCConnection() {
  try {
    const idea = await trpcServerClient.ideas.getById.query({ id: 'test-id' })
    return { success: true, data: idea }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

#### Validation Phase 1.5
- [ ] tRPC server installé et configuré dans NestJS
- [ ] Endpoint `/api/trpc` accessible
- [ ] tRPC client fonctionne depuis Server Actions
- [ ] Premier router de test (ideas) opérationnel
- [ ] Type inference fonctionne (autocomplete)
- [ ] Tests unitaires tRPC passent

---

### Phase 2: Admin Ideas/Events Management (4-5 jours)

**Server Actions Direct DB** (CRUD simple):
- `deleteIdea(id)` - DELETE simple
- `updateIdeaStatus(id, status)` - UPDATE simple
- `deleteEvent(id)` - DELETE simple
- `updateEventStatus(id, status)` - UPDATE simple

**Server Actions via tRPC** (Business logic):
- `convertIdeaToEvent(id)` - Transaction 2 tables + notification
- `bulkImportInscriptions(eventId, data[])` - Parsing CSV + emails
- `toggleIdeaFeatured(id)` - Update + cache invalidation complexe

**Pattern**:
```typescript
// Direct DB (simple UPDATE)
export async function updateIdeaStatus(ideaId: string, status: string) {
  await requireAuth()
  const result = await db
    .update(ideas)
    .set({ status })
    .where(eq(ideas.id, ideaId))
  await revalidateIdeas()
  return createSuccess(result)
}

// tRPC (business logic)
export async function convertIdeaToEvent(ideaId: string) {
  const user = await requireAuth()
  const event = await trpcServerClient.ideas.convertToEvent.mutate({
    ideaId,
    userId: user.id,
  })
  await revalidateIdeas()
  await revalidateEvents()
  return createSuccess(event)
}
```

---

### Phase 3: CRM Members Management (4-5 jours)

**Server Actions Direct DB**:
- `updateMember(email, data)` - UPDATE simple
- `deleteMember(email)` - DELETE simple
- `assignTagToMember(email, tagId)` - INSERT simple

**Server Actions via tRPC**:
- `createMemberSubscription(email, data)` - Multi-tables + calcul expiration
- `generateMemberReport(email)` - Agrégations complexes
- `syncMemberActivities(email)` - Intégration tracking

---

### Phase 4-7: Patrons, Financial, Config, Auth
**Même logique**: Direct DB pour CRUD simple, tRPC pour business logic

---

## 📊 Métriques Migration

### Répartition estimée

| Type | Nombre | % |
|------|--------|---|
| **Direct DB** (CRUD simple) | ~80 actions | 65% |
| **tRPC** (Business logic) | ~40 actions | 35% |
| **TOTAL** | **120 actions** | 100% |

### Gains attendus

**Performance**:
- Direct DB: -30% latence vs NestJS (pas de hop réseau)
- tRPC: Équivalent NestJS actuel

**Type-Safety**:
- Direct DB: Zod + Drizzle (type-safe)
- tRPC: Zod + tRPC (type-safe end-to-end)
- ❌ Fetch naïf: Aucune garantie type

**Maintenance**:
- Direct DB: Code simple, lisible
- tRPC: Réutilisation services NestJS existants

---

## 🚀 Next Steps Immédiats

### 1. Valider Phase 1.1 ✅
- ✅ Build OK
- ✅ TypeScript strict OK
- ✅ Feature flags OK
- ⚠️ Tests Playwright (à configurer)

### 2. Lancer Phase 1.5 (tRPC Setup) 🔄
**Priorité**: HAUTE - Bloquant pour Phase 2+

**Actions**:
1. Installer dépendances tRPC (backend + frontend)
2. Setup tRPC server dans NestJS
3. Créer tRPC client pour Server Actions
4. Créer premier router test (ideas.convertToEvent)
5. Valider type inference fonctionne
6. Tests unitaires tRPC

**Durée estimée**: 2-3 jours

---

## 💡 Avantages Architecture Hybride

### vs Migration 100% Server Actions Direct DB
- ❌ Duplication logique métier NestJS
- ❌ Perte services existants (notifications, intégrations)
- ❌ Tests à réécrire

### vs Migration 100% Server Actions + Fetch NestJS
- ❌ Pas de type-safety
- ❌ Maintenance cauchemar (drift types)
- ❌ Refactoring impossible

### ✅ Hybride Direct DB + tRPC
- ✅ Performance (Direct DB pour CRUD simple)
- ✅ Type-safety (tRPC pour business logic)
- ✅ Réutilisation (services NestJS existants)
- ✅ Maintenabilité (code simple + services testés)

---

**Architecture validée par**: Thibault + Claude Sonnet 4.5
**Date**: 2026-01-19
**Version**: 2.0 (tRPC)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
