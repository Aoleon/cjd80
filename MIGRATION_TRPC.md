# Migration des composants vers tRPC

## Résumé

Migration complète des composants restants vers tRPC pour une meilleure type-safety et une architecture client-serveur plus robuste.

## Date

2026-01-22

## Composants migrés

### 1. LoanItemsSection
- **Fichier ancien:** `client/src/components/loan-items-section.tsx`
- **Fichier nouveau:** `components/loan-items-section-next.tsx`
- **Router tRPC créé:** `server/src/trpc/routers/loans.router.ts`
- **Hooks tRPC utilisés:**
  - `trpc.loans.list.useQuery()` - Liste paginée des items de prêt
  - `trpc.loans.create.useMutation()` - Création d'une proposition de prêt
- **Changements:**
  - Remplacement de `useQuery` TanStack Query par `trpc.loans.list.useQuery()`
  - Remplacement de `useMutation` par `trpc.loans.create.useMutation()`
  - Utilisation de `utils.loans.list.invalidate()` pour rafraîchir les données
  - Conservation de toute la logique métier (debounce, pagination, formulaire)

### 2. VoteModal
- **Fichier ancien:** `client/src/components/vote-modal.tsx`
- **Fichier nouveau:** `components/vote-modal-next.tsx`
- **Hooks tRPC utilisés:**
  - `trpc.ideas.vote.useMutation()` - Création d'un vote
- **Changements:**
  - Remplacement de `useMutation` avec `apiRequest` par `trpc.ideas.vote.useMutation()`
  - Utilisation de `utils.ideas.list.invalidate()` pour rafraîchir les données
  - Conservation de la gestion de l'identité utilisateur (remember me, localStorage)

### 3. EventRegistrationModal
- **Fichier ancien:** `client/src/components/event-registration-modal.tsx`
- **Fichier nouveau:** `components/event-registration-modal-next.tsx`
- **Hooks tRPC utilisés:**
  - `trpc.events.register.useMutation()` - Inscription à un événement
  - `trpc.events.unregister.useMutation()` - Déclaration d'absence
- **Changements:**
  - Remplacement de `useMutation` avec `apiRequest` par les mutations tRPC
  - Utilisation de `utils.events.list.invalidate()` pour rafraîchir les données
  - Conservation de toute la logique métier (formulaire dual mode, redirection externe)

### 4. AdminHeader
- **Fichier ancien:** `client/src/components/admin-header.tsx`
- **Fichier nouveau:** `components/admin-header-next.tsx`
- **Hooks Next.js utilisés:**
  - `useRouter()` from `next/navigation` - Navigation Next.js
  - `usePathname()` from `next/navigation` - Détection de la route active
- **Changements:**
  - Remplacement de `useLocation` (Wouter) par `useRouter` et `usePathname` (Next.js)
  - Remplacement de `setLocation()` par `router.push()`
  - Utilisation de `pathname` au lieu de `location`
  - Conservation de toute la structure de navigation (dropdowns, modules, mobile menu)

## Backend - Router tRPC Loans créé

### Fichier: `server/src/trpc/routers/loans.router.ts`

**Endpoints exposés:**
- `loans.list` (public) - Liste paginée avec recherche
- `loans.create` (public) - Créer une proposition
- `loans.listAll` (admin) - Liste complète admin
- `loans.getById` (admin) - Récupérer un item
- `loans.update` (admin) - Mettre à jour un item
- `loans.updateStatus` (admin) - Mettre à jour le statut
- `loans.delete` (admin) - Supprimer un item

### Intégration

Le router loans a été intégré dans:
1. `server/src/trpc/routers/index.ts` - Ajout du router loans
2. `server/src/trpc/trpc.service.ts` - Injection du LoansService
3. `server/src/trpc/trpc.module.ts` - Import du LoansModule

## Pages mises à jour

### `/app/(public)/loan/page.tsx`
- Import mis à jour pour utiliser `loan-items-section-next.tsx`

### `/components/ideas-section-next.tsx`
- Import mis à jour pour utiliser `vote-modal-next.tsx`

### `/components/events-section-next.tsx`
- Import mis à jour pour utiliser `event-registration-modal-next.tsx`

## Avantages de la migration

1. **Type-safety complète:** Les types sont automatiquement inférés entre le client et le serveur
2. **Meilleure DX:** Autocomplétion et erreurs TypeScript en temps réel
3. **Moins de code boilerplate:** Plus besoin de `apiRequest`, `queryClient.invalidateQueries` manuel
4. **Architecture unifiée:** Tous les composants Next.js utilisent maintenant tRPC
5. **Invalidation automatique:** Les mutations invalident automatiquement les queries liées

## Compatibilité

- Les anciens composants dans `client/src/components/` restent disponibles pour l'ancien code Wouter
- Les nouveaux composants dans `components/` sont spécifiques à Next.js
- Migration progressive possible: les deux versions peuvent coexister

## Tests à effectuer

1. **LoanItemsSection:**
   - [ ] Liste des items de prêt s'affiche correctement
   - [ ] Recherche fonctionne avec debounce
   - [ ] Pagination fonctionne
   - [ ] Création d'une proposition fonctionne
   - [ ] Rate limiting est respecté
   - [ ] Invalidation des queries après création

2. **VoteModal:**
   - [ ] Modal s'ouvre et se ferme
   - [ ] Vote est enregistré
   - [ ] Remember me fonctionne
   - [ ] Clear identity fonctionne
   - [ ] Invalidation des queries après vote

3. **EventRegistrationModal:**
   - [ ] Inscription à un événement fonctionne
   - [ ] Déclaration d'absence fonctionne
   - [ ] Redirection externe fonctionne
   - [ ] Remember me fonctionne
   - [ ] Invalidation des queries après inscription/désinscription

4. **AdminHeader:**
   - [ ] Navigation fonctionne correctement
   - [ ] Route active est bien détectée
   - [ ] Dropdowns fonctionnent
   - [ ] Mobile menu fonctionne
   - [ ] Logout fonctionne

## Prochaines étapes

- Supprimer les anciens composants une fois la migration complète validée
- Mettre à jour les tests pour utiliser les nouveaux composants
- Documenter les patterns tRPC pour les futurs développeurs

## Auteur

Claude Sonnet 4.5 (Migration tRPC)
