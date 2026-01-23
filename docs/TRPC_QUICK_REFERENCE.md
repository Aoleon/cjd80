# tRPC Quick Reference - CJD Amiens

Guide de référence rapide pour les développeurs utilisant l'API tRPC.

## Installation & Configuration

### 1. Client tRPC (Frontend)

```typescript
// lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/src/trpc/trpc.service';

export const trpc = createTRPCReact<AppRouter>();
```

### 2. Provider (App Router Next.js)

```typescript
// app/providers.tsx
'use client';

import { trpc } from '@/lib/trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: '/api/trpc', transformer: superjson })],
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

---

## Routers & Endpoints

### Ideas (7 procedures)

```typescript
// Queries
trpc.ideas.list.useQuery({ page: 1, limit: 20 })
trpc.ideas.getVotes.useQuery({ ideaId: "uuid" })
trpc.ideas.stats.useQuery() // admin only

// Mutations
trpc.ideas.create.useMutation()
trpc.ideas.vote.useMutation()
trpc.ideas.updateStatus.useMutation() // admin only
trpc.ideas.delete.useMutation() // admin only
```

### Events (9 procedures)

```typescript
// Queries
trpc.events.list.useQuery({ page: 1, limit: 20 })
trpc.events.getInscriptions.useQuery({ eventId: "uuid" }) // admin
trpc.events.stats.useQuery() // admin

// Mutations
trpc.events.create.useMutation() // admin
trpc.events.createWithInscriptions.useMutation() // admin
trpc.events.update.useMutation() // admin
trpc.events.delete.useMutation() // admin
trpc.events.register.useMutation()
trpc.events.unregister.useMutation()
```

### Auth (2 procedures)

```typescript
// Queries
trpc.auth.getCurrentUser.useQuery() // protected

// Mutations
trpc.auth.logout.useMutation()
```

### Loans (7 procedures)

```typescript
// Queries
trpc.loans.list.useQuery({ page: 1, limit: 20, search: "text" })
trpc.loans.listAll.useQuery({ page: 1, limit: 20 }) // admin
trpc.loans.getById.useQuery({ id: "uuid" }) // admin

// Mutations
trpc.loans.create.useMutation()
trpc.loans.update.useMutation() // admin
trpc.loans.updateStatus.useMutation() // admin
trpc.loans.delete.useMutation() // admin
```

### Members (8 procedures)

```typescript
// Queries
trpc.members.list.useQuery({
  page: 1,
  limit: 20,
  status: "active",
  search: "text",
  score: "high",
  activity: "recent"
})
trpc.members.getById.useQuery({ email: "user@example.com" }) // admin
trpc.members.getDetails.useQuery({ email: "user@example.com" }) // admin
trpc.members.getActivity.useQuery({ email: "user@example.com" }) // admin

// Mutations
trpc.members.create.useMutation()
trpc.members.update.useMutation() // admin
trpc.members.delete.useMutation() // admin
trpc.members.updateEngagementScore.useMutation() // admin
```

### Patrons (5 procedures)

```typescript
// Queries
trpc.patrons.list.useQuery({ page: 1, limit: 20, status: "active", search: "text" })
trpc.patrons.getById.useQuery({ id: "uuid" }) // admin

// Mutations
trpc.patrons.create.useMutation() // admin
trpc.patrons.update.useMutation() // admin
trpc.patrons.delete.useMutation() // admin
```

### Financial (22 procedures)

```typescript
// Budgets
trpc.financial.getBudgets.useQuery({ period: "Q1", year: 2026 }) // admin
trpc.financial.getBudgetById.useQuery({ id: "uuid" }) // admin
trpc.financial.createBudget.useMutation() // admin
trpc.financial.updateBudget.useMutation() // admin
trpc.financial.deleteBudget.useMutation() // admin
trpc.financial.getBudgetStats.useQuery({ period: "Q1", year: 2026 }) // protected

// Expenses
trpc.financial.getExpenses.useQuery({ period: "Q1", year: 2026 }) // admin
trpc.financial.getExpenseById.useQuery({ id: "uuid" }) // admin
trpc.financial.createExpense.useMutation() // admin
trpc.financial.updateExpense.useMutation() // admin
trpc.financial.deleteExpense.useMutation() // admin
trpc.financial.getExpenseStats.useQuery({ period: "Q1", year: 2026 }) // protected

// Categories
trpc.financial.getCategories.useQuery({ type: "budget" }) // admin
trpc.financial.createCategory.useMutation() // admin
trpc.financial.updateCategory.useMutation() // admin

// Forecasts
trpc.financial.getForecasts.useQuery({ period: "Q1", year: 2026 }) // admin
trpc.financial.createForecast.useMutation() // admin
trpc.financial.updateForecast.useMutation() // admin
trpc.financial.generateForecasts.useMutation() // admin

// Reports & KPIs
trpc.financial.getKPIsExtended.useQuery({ period: "Q1", year: 2026 }) // protected
trpc.financial.getComparison.useQuery({
  period1: "Q1", year1: 2026,
  period2: "Q4", year2: 2025
}) // admin
trpc.financial.getReport.useQuery({
  type: "quarterly",
  period: 1,
  year: 2026
}) // admin
```

### Tracking (9 procedures)

```typescript
// Queries
trpc.tracking.getDashboard.useQuery() // admin
trpc.tracking.getMetrics.useQuery({
  entityType: "member",
  entityId: "uuid"
}) // admin
trpc.tracking.getAlerts.useQuery({
  isResolved: false,
  severity: "high"
}) // admin
trpc.tracking.getByMember.useQuery({
  entityType: "member",
  entityId: "uuid"
}) // admin

// Mutations
trpc.tracking.createMetric.useMutation() // admin
trpc.tracking.createAlert.useMutation() // admin
trpc.tracking.updateAlert.useMutation() // admin
trpc.tracking.deleteAlert.useMutation() // admin
trpc.tracking.generateAlerts.useMutation() // admin
```

### Admin (5 procedures)

```typescript
// Queries
trpc.admin.stats.useQuery() // admin
trpc.admin.getUsers.useQuery() // admin

// Mutations
trpc.admin.createUser.useMutation() // admin
trpc.admin.updateUser.useMutation() // admin
trpc.admin.deleteUser.useMutation() // admin
```

---

## Patterns courants

### 1. Query simple

```typescript
function Component() {
  const { data, isLoading, error } = trpc.ideas.list.useQuery({
    page: 1,
    limit: 20,
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return <div>{data.ideas.map(idea => ...)}</div>;
}
```

### 2. Mutation avec invalidation

```typescript
function CreateForm() {
  const utils = trpc.useUtils();

  const create = trpc.ideas.create.useMutation({
    onSuccess: () => {
      utils.ideas.list.invalidate();
    },
  });

  const handleSubmit = (data) => {
    create.mutate(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 3. Optimistic Update

```typescript
const vote = trpc.ideas.vote.useMutation({
  onMutate: async (newVote) => {
    await utils.ideas.list.cancel();
    const previous = utils.ideas.list.getData();

    utils.ideas.list.setData({ page: 1, limit: 20 }, (old) => ({
      ...old,
      ideas: old.ideas.map(idea =>
        idea.id === newVote.ideaId
          ? { ...idea, voteCount: idea.voteCount + 1 }
          : idea
      ),
    }));

    return { previous };
  },
  onError: (err, newVote, context) => {
    utils.ideas.list.setData({ page: 1, limit: 20 }, context.previous);
  },
  onSettled: () => {
    utils.ideas.list.invalidate();
  },
});
```

### 4. Pagination

```typescript
function PaginatedList() {
  const [page, setPage] = useState(1);

  const { data } = trpc.ideas.list.useQuery({ page, limit: 20 });

  return (
    <>
      {data.ideas.map(idea => ...)}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Précédent
      </button>
      <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>
        Suivant
      </button>
    </>
  );
}
```

### 5. Dependent Queries

```typescript
function MemberDetails({ email }: { email: string }) {
  const { data: member } = trpc.members.getById.useQuery({ email });

  const { data: activity } = trpc.members.getActivity.useQuery(
    { email },
    { enabled: !!member } // Ne s'exécute que si member existe
  );

  return <div>...</div>;
}
```

### 6. Gestion d'erreurs globale

```typescript
const create = trpc.ideas.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      toast.error('Vous devez être connecté');
      router.push('/login');
    } else if (error.data?.code === 'BAD_REQUEST') {
      toast.error('Données invalides: ' + error.message);
    } else {
      toast.error('Une erreur est survenue');
    }
  },
});
```

---

## Types & Inférence

### Inférer les types depuis le router

```typescript
import type { AppRouter } from '@/server/src/trpc/trpc.service';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Utilisation
type IdeaCreateInput = RouterInputs['ideas']['create'];
type IdeaListOutput = RouterOutputs['ideas']['list'];
```

### Utiliser les schémas Zod

```typescript
import { insertIdeaSchema, insertEventSchema } from '@/shared/schema';

// Validation manuelle
const validatedData = insertIdeaSchema.parse({
  title: "Mon idée",
  description: "Description",
  category: "innovation",
  authorEmail: "user@example.com",
});

// Type inference
type IdeaInput = z.infer<typeof insertIdeaSchema>;
```

---

## Utils tRPC

### Invalidation

```typescript
const utils = trpc.useUtils();

// Invalider une query spécifique
utils.ideas.list.invalidate({ page: 1, limit: 20 });

// Invalider toutes les queries d'un router
utils.ideas.invalidate();

// Invalider tout
utils.invalidate();
```

### Prefetch

```typescript
const utils = trpc.useUtils();

// Prefetch data (server-side ou client-side)
await utils.ideas.list.prefetch({ page: 1, limit: 20 });
```

### Fetch manuel

```typescript
const utils = trpc.useUtils();

// Fetch sans hook
const ideas = await utils.ideas.list.fetch({ page: 1, limit: 20 });
```

### Set data manuellement

```typescript
const utils = trpc.useUtils();

// Mettre à jour le cache manuellement
utils.ideas.list.setData({ page: 1, limit: 20 }, (old) => ({
  ...old,
  ideas: [...old.ideas, newIdea],
}));
```

---

## Codes d'erreur

| Code | Description | Action |
|------|-------------|--------|
| `UNAUTHORIZED` | Non authentifié | Rediriger vers login |
| `FORBIDDEN` | Permissions insuffisantes | Afficher message d'erreur |
| `BAD_REQUEST` | Validation échouée | Afficher erreurs de formulaire |
| `NOT_FOUND` | Ressource introuvable | Rediriger ou afficher 404 |
| `INTERNAL_SERVER_ERROR` | Erreur serveur | Logger et afficher message générique |

---

## Authentification

### Types de procedures

| Type | Authentification | Rôles | Exemple |
|------|------------------|-------|---------|
| `publicProcedure` | Non | - | `ideas.list` |
| `protectedProcedure` | Oui | Tous | `auth.getCurrentUser` |
| `adminProcedure` | Oui | super_admin, ideas_manager, events_manager | `admin.stats` |

### Vérifier l'authentification

```typescript
function ProtectedComponent() {
  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery();

  if (isLoading) return <div>Chargement...</div>;
  if (!user) return <Redirect to="/login" />;

  return <div>Bienvenue {user.firstName}!</div>;
}
```

---

## Scripts utiles

### Générer la documentation JSON

```bash
npx tsx scripts/generate-trpc-docs.ts
```

**Output:** `docs/trpc-api-documentation.json`

---

## Ressources

- **[Documentation complète](../TRPC_API_DOCUMENTATION.md)** - Guide détaillé avec exemples
- **[Documentation JSON](./trpc-api-documentation.json)** - Structure machine-readable
- **[Routers](../server/src/trpc/routers/)** - Code source des routers
- **[Schémas](../shared/schema.ts)** - Définitions Zod

---

**Version:** 2.0.0 | **Dernière MAJ:** 2026-01-22
