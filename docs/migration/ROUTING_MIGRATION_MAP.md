# Mapping des Routes - Wouter → Next.js App Router

**Date**: 2026-01-22
**Statut**: Structure créée, migration des pages en cours

## 📊 Vue d'Ensemble

**Total**: 31 routes à migrer

| Catégorie | Routes | Statut |
|-----------|--------|--------|
| Pages publiques | 6 | ✅ Structure créée |
| Pages auth | 3 | ✅ Structure créée |
| Pages admin legacy | 7 | ✅ Structure créée |
| Pages admin modulaires | 14 | ✅ Structure créée |
| Autres | 2 | ✅ Structure créée |

## 🗺️ Mapping Détaillé

### Pages Publiques

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/` | `app/(public)/page.tsx` | `client/src/pages/home-page.tsx` | ✅ Créé (test) |
| `/propose` | `app/(public)/propose/page.tsx` | `client/src/pages/propose-page.tsx` | ⏳ À migrer |
| `/events` | `app/(public)/events/page.tsx` | `client/src/pages/events-page.tsx` | ⏳ À migrer |
| `/tools` | `app/(public)/tools/page.tsx` | `client/src/pages/tools-page.tsx` | ⏳ À migrer |
| `/loan` | `app/(public)/loan/page.tsx` | `client/src/pages/loan-page.tsx` | ⏳ À migrer |
| `/statuts` | `app/(public)/statuts/page.tsx` | `client/src/pages/status-page.tsx` | ⏳ À migrer |

### Pages Authentification

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/auth` | `app/(auth)/login/page.tsx` | `client/src/pages/auth-page.tsx` | ⏳ À migrer |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | `client/src/pages/forgot-password.tsx` | ⏳ À migrer |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | `client/src/pages/reset-password.tsx` | ⏳ À migrer |

### Pages Admin - Legacy (à maintenir temporairement)

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin` | `app/(protected)/admin/page.tsx` | `client/src/pages/admin-page.tsx` | ⏳ À migrer |
| `/admin/patrons` | `app/(protected)/admin/patrons/page.tsx` | `client/src/pages/admin-patrons-page.tsx` | ⏳ À migrer |
| `/admin/sponsorships` | `app/(protected)/admin/sponsorships/page.tsx` | `client/src/pages/admin-sponsorships-page.tsx` | ⏳ À migrer |
| `/admin/members` | `app/(protected)/admin/members/page.tsx` | `client/src/pages/admin-members-page.tsx` | ⏳ À migrer |
| `/admin/tracking` | `app/(protected)/admin/tracking/page.tsx` | `client/src/pages/admin-tracking-page.tsx` | ⏳ À migrer |
| `/admin/branding` | `app/(protected)/admin/branding/page.tsx` | `client/src/pages/admin-branding-page.tsx` | ⏳ À migrer |
| `/admin/email-config` | `app/(protected)/admin/email-config/page.tsx` | `client/src/pages/admin-email-config-page.tsx` | ⏳ À migrer |

### Pages Admin - Dashboard

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin/dashboard` | `app/(protected)/admin/dashboard/page.tsx` | `client/src/pages/admin-dashboard-page.tsx` | ⏳ À migrer |

### Pages Admin - CRM

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin/crm/members` | `app/(protected)/admin/crm/members/page.tsx` | `client/src/pages/admin/crm/members-page.tsx` | ⏳ À migrer |
| `/admin/crm/patrons` | `app/(protected)/admin/crm/patrons/page.tsx` | `client/src/pages/admin/crm/patrons-page.tsx` | ⏳ À migrer |

### Pages Admin - Content

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin/content/ideas` | `app/(protected)/admin/content/ideas/page.tsx` | `client/src/pages/admin/content/ideas-page.tsx` | ⏳ À migrer |
| `/admin/content/events` | `app/(protected)/admin/content/events/page.tsx` | `client/src/pages/admin/content/events-page.tsx` | ⏳ À migrer |
| `/admin/content/loans` | `app/(protected)/admin/content/loans/page.tsx` | `client/src/pages/admin/content/loans-page.tsx` | ⏳ À migrer |

### Pages Admin - Finance

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin/finance/sponsorships` | `app/(protected)/admin/finance/sponsorships/page.tsx` | `client/src/pages/admin/finance/sponsorships-page.tsx` | ⏳ À migrer |
| `/admin/finance/dashboard` | `app/(protected)/admin/finance/dashboard/page.tsx` | `client/src/pages/admin/finance/dashboard-page.tsx` | ⏳ À migrer |
| `/admin/finance/budgets` | `app/(protected)/admin/finance/budgets/page.tsx` | `client/src/pages/admin/finance/budgets-page.tsx` | ⏳ À migrer |
| `/admin/finance/expenses` | `app/(protected)/admin/finance/expenses/page.tsx` | `client/src/pages/admin/finance/expenses-page.tsx` | ⏳ À migrer |
| `/admin/finance/forecasts` | `app/(protected)/admin/finance/forecasts/page.tsx` | `client/src/pages/admin/finance/forecasts-page.tsx` | ⏳ À migrer |
| `/admin/finance/reports` | `app/(protected)/admin/finance/reports/page.tsx` | `client/src/pages/admin/finance/reports-page.tsx` | ⏳ À migrer |

### Pages Admin - Settings

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/admin/settings/branding` | `app/(protected)/admin/settings/branding/page.tsx` | `client/src/pages/admin/settings/branding-page.tsx` | ⏳ À migrer |
| `/admin/settings/email-config` | `app/(protected)/admin/settings/email-config/page.tsx` | `client/src/pages/admin/settings/email-config-page.tsx` | ⏳ À migrer |
| `/admin/settings/features` | `app/(protected)/admin/settings/features/page.tsx` | `client/src/pages/admin/settings/features-page.tsx` | ⏳ À migrer |

### Autres Pages

| Wouter Route | Next.js App Router | Fichier Original | Statut |
|--------------|-------------------|------------------|--------|
| `/onboarding` | `app/(protected)/onboarding/page.tsx` | `client/src/pages/onboarding-page.tsx` | ⏳ À migrer |
| `/test-error` | `app/(public)/test-error/page.tsx` | `client/src/pages/test-error-page.tsx` | ⏳ À migrer |
| `*` (404) | `app/not-found.tsx` | `client/src/pages/not-found.tsx` | ⏳ À migrer |

## 📁 Structure des Dossiers App Router

```
app/
├── (public)/                    # Route group - Pages publiques
│   ├── layout.tsx              # Layout public (pas de protection)
│   ├── page.tsx                # Home "/"
│   ├── propose/
│   │   └── page.tsx            # "/propose"
│   ├── events/
│   │   └── page.tsx            # "/events"
│   ├── tools/
│   │   └── page.tsx            # "/tools"
│   ├── loan/
│   │   └── page.tsx            # "/loan"
│   ├── statuts/
│   │   └── page.tsx            # "/statuts"
│   └── test-error/
│       └── page.tsx            # "/test-error"
│
├── (auth)/                      # Route group - Authentification
│   ├── layout.tsx              # Layout auth
│   ├── login/
│   │   └── page.tsx            # "/login" (ancien /auth)
│   ├── forgot-password/
│   │   └── page.tsx            # "/forgot-password"
│   └── reset-password/
│       └── page.tsx            # "/reset-password"
│
├── (protected)/                 # Route group - Pages protégées
│   ├── layout.tsx              # Layout avec vérification auth
│   ├── onboarding/
│   │   └── page.tsx            # "/onboarding"
│   └── admin/
│       ├── page.tsx            # "/admin" (dashboard principal)
│       ├── dashboard/
│       │   └── page.tsx        # "/admin/dashboard"
│       ├── patrons/
│       │   └── page.tsx        # "/admin/patrons" (legacy)
│       ├── members/
│       │   └── page.tsx        # "/admin/members" (legacy)
│       ├── tracking/
│       │   └── page.tsx        # "/admin/tracking"
│       ├── branding/
│       │   └── page.tsx        # "/admin/branding" (legacy)
│       ├── email-config/
│       │   └── page.tsx        # "/admin/email-config" (legacy)
│       ├── crm/
│       │   ├── members/
│       │   │   └── page.tsx    # "/admin/crm/members"
│       │   └── patrons/
│       │       └── page.tsx    # "/admin/crm/patrons"
│       ├── content/
│       │   ├── ideas/
│       │   │   └── page.tsx    # "/admin/content/ideas"
│       │   ├── events/
│       │   │   └── page.tsx    # "/admin/content/events"
│       │   └── loans/
│       │       └── page.tsx    # "/admin/content/loans"
│       ├── finance/
│       │   ├── sponsorships/
│       │   │   └── page.tsx    # "/admin/finance/sponsorships"
│       │   ├── dashboard/
│       │   │   └── page.tsx    # "/admin/finance/dashboard"
│       │   ├── budgets/
│       │   │   └── page.tsx    # "/admin/finance/budgets"
│       │   ├── expenses/
│       │   │   └── page.tsx    # "/admin/finance/expenses"
│       │   ├── forecasts/
│       │   │   └── page.tsx    # "/admin/finance/forecasts"
│       │   └── reports/
│       │       └── page.tsx    # "/admin/finance/reports"
│       └── settings/
│           ├── branding/
│           │   └── page.tsx    # "/admin/settings/branding"
│           ├── email-config/
│           │   └── page.tsx    # "/admin/settings/email-config"
│           └── features/
│               └── page.tsx    # "/admin/settings/features"
│
├── layout.tsx                   # Root layout (providers, metadata)
├── providers.tsx                # Client providers (tRPC, Query, Theme)
├── globals.css                  # Styles globaux
└── not-found.tsx               # Page 404
```

## 🔄 Différences Wouter vs Next.js App Router

### Routing

| Feature | Wouter | Next.js App Router |
|---------|--------|-------------------|
| **Déclaration** | `<Route path="/admin" component={Admin} />` | Dossier `app/admin/page.tsx` |
| **Routes imbriquées** | Flat dans Switch | Hiérarchie de dossiers |
| **Layouts** | Wrapping manuel | `layout.tsx` automatique |
| **Route groups** | N/A | `(nom)` pour grouper sans affecter URL |
| **Protection** | `<ProtectedRoute>` wrapper | Middleware + layout |
| **Lazy loading** | `lazy(() => import())` | Automatique par Next.js |

### Navigation

| Feature | Wouter | Next.js App Router |
|---------|--------|-------------------|
| **Link** | `<Link href="/path">` (wouter) | `<Link href="/path">` (next/link) |
| **Redirect** | `useLocation()[1]("/path")` | `redirect("/path")` ou `useRouter().push()` |
| **Params** | `useParams()` | Props `params` automatique |
| **Query** | `useSearch()` | Props `searchParams` automatique |

### Avantages Next.js App Router

1. **File-system routing**: Structure auto-découverte
2. **Layouts imbriqués**: Réutilisation automatique
3. **Server Components**: SSR par défaut
4. **Streaming**: Loading UI progressive
5. **Metadata API**: SEO intégré
6. **Route groups**: Organisation sans impact URL

## 🚀 Plan de Migration

### Phase 1: Pages Publiques (Priorité 1)
1. ✅ Structure de dossiers créée
2. ⏳ Migrer HomePage
3. ⏳ Migrer EventsPage
4. ⏳ Migrer ProposePage
5. ⏳ Migrer LoanPage
6. ⏳ Migrer ToolsPage
7. ⏳ Migrer StatusPage

### Phase 2: Pages Auth (Priorité 2)
1. ⏳ Migrer AuthPage → login
2. ⏳ Migrer ForgotPasswordPage
3. ⏳ Migrer ResetPasswordPage

### Phase 3: Admin Dashboard (Priorité 3)
1. ⏳ Migrer AdminDashboardPage
2. ⏳ Migrer AdminPage (legacy)

### Phase 4: Pages Admin Modulaires (Priorité 4)
1. ⏳ CRM (members, patrons)
2. ⏳ Content (ideas, events, loans)
3. ⏳ Finance (all pages)
4. ⏳ Settings (all pages)

### Phase 5: Cleanup (Priorité 5)
1. ⏳ Supprimer pages legacy
2. ⏳ Nettoyer dossier client/
3. ⏳ Mettre à jour documentation

## 📝 Notes de Migration

### Feature Guards
Wouter utilise `<FeatureGuard>` pour certaines pages:
- `/propose` → ideas feature
- `/events` → events feature
- `/loan` → loan feature

**Action**: Créer un HOC ou Server Component pour vérifier les features

### Protected Routes
Wouter utilise `<ProtectedRoute>` wrapper

**Action**: Utiliser middleware.ts + layout.tsx pour vérifier auth

### Suspense Boundaries
Wouter utilise `<Suspense fallback={<AdminPageFallback />}>`

**Action**: Next.js gère automatiquement avec loading.tsx

### Base Path
Wouter supporte `VITE_BASE_PATH` pour déploiement

**Action**: Configurer `basePath` dans next.config.js si nécessaire

## ✅ Checklist par Page

Pour chaque page migrée:
- [ ] Créer `page.tsx` dans le bon dossier
- [ ] Migrer le code du composant
- [ ] Convertir les imports (`@/` paths)
- [ ] Remplacer `useQuery` par `trpc.*.useQuery`
- [ ] Remplacer `useMutation` par `trpc.*.useMutation`
- [ ] Remplacer `Link` de wouter par `Link` de next
- [ ] Tester la route
- [ ] Marquer comme ✅ dans ce document

---

**Prochaine étape**: Migrer HomePage comme référence pour les autres pages
