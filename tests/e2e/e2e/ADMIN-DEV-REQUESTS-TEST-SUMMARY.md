# US-ADMIN-004: Tests E2E - Système Tickets Développement

## Overview

Tests E2E complets pour la gestion des demandes développement (bug/feature) avec synchronisation GitHub.

**Fichier:** `/srv/workspace/cjd80/tests/e2e/e2e/admin-dev-requests.spec.ts`
**Base URL:** https://cjd80.rbw.ovh
**Auth:** admin@test.local / devmode

## User Story

En tant qu'admin, je veux créer demandes développement (bug/feature) synchronisées GitHub pour tracer améliorations.

## Endpoints Testés (6)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/development-requests` | Récupère la liste des demandes |
| POST | `/api/admin/development-requests` | Crée une nouvelle demande |
| PUT | `/api/admin/development-requests/:id` | Met à jour une demande |
| PATCH | `/api/admin/development-requests/:id/status` | Change le statut |
| POST | `/api/admin/development-requests/:id/sync` | Synchronise avec GitHub |
| DELETE | `/api/admin/development-requests/:id` | Supprime une demande |

## Test Suites (7 suites)

### 1. Navigation & List (2 tests)

- ✅ Voir la page de gestion des development requests
- ✅ API GET /api/admin/development-requests retourne la liste

**Validations:**
- Page chargée avec titre visible
- Tableau/liste présent
- API retourne array de données
- Structure: { success, data: [] }

### 2. CRUD Operations (5 tests)

- ✅ Créer un bug report
- ✅ Créer une feature request
- ✅ Modifier une demande
- ✅ Changer le statut
- ✅ Supprimer une demande

**Validations CRUD:**
- Type: 'bug' | 'feature'
- Champs: title, description, priority
- Status: 'pending', 'in_progress', 'done', 'cancelled'
- Response structure avec ID généré

### 3. Filtering (2 tests)

- ✅ Filtrer par type (bug/feature)
- ✅ Filtrer par statut

**Query Parameters Testés:**
- `?type=bug`
- `?type=feature`
- `?status=pending`
- `?status=in_progress`
- `?status=done`
- `?status=cancelled`

### 4. GitHub Sync (1 test)

- ✅ Synchroniser une demande avec GitHub

**Validations:**
- POST /api/admin/development-requests/:id/sync
- Response: { success, data }
- Optional: githubIssueUrl contains 'github.com'

### 5. UI Integration (2 tests)

- ✅ Afficher et interagir avec la page UI
- ✅ Afficher la liste des demandes

**Validations UI:**
- Bouton créer/ajouter présent
- Formulaire avec champs: type, title, description
- Liste visible avec items ou message vide

### 6. Priority Levels (1 test)

- ✅ Créer avec différentes priorités

**Priorités Testées:**
- low
- medium
- high
- critical

### 7. Status Workflow (2 tests)

- ✅ Workflow complet des statuts (pending → in_progress → done)
- ✅ Permettre l'annulation (status → cancelled)

**Validations Workflow:**
- Initial status: 'pending'
- Transitions correctes entre statuts
- Annulation possible depuis n'importe quel état

## Total Tests: 15+

| Catégorie | Count |
|-----------|-------|
| Navigation | 2 |
| CRUD | 5 |
| Filtering | 2 |
| GitHub Sync | 1 |
| UI Integration | 2 |
| Priority Levels | 1 |
| Status Workflow | 2 |
| **TOTAL** | **15** |

## Critères d'Acceptation Couverts ✅

| # | Critère | Test |
|---|---------|------|
| 1 | Créer demande (bug/feature, titre/description/priorité) | Tests 2, 3, 6 |
| 2 | Liste demandes avec filtres | Tests 1, 4, 5 |
| 3 | Sync GitHub (issue auto) | Test 7 |
| 4 | Mettre à jour statut | Test 8 |

## Session 2026-01-26

**Status:** ✅ COMPLETED

**Fichier créé:**
- `/srv/workspace/cjd80/tests/e2e/e2e/admin-dev-requests.spec.ts` (627 lignes)

**Helpers Implémentés:**
- `loginAsAdmin()` - Authentication
- `navigateToDevRequests()` - Navigation
- `getSessionCookie()` - Session management

**Couverture API:**
- 100% des 6 endpoints
- Test de chaque action CRUD
- Filtrage par type et statut
- Synchronisation GitHub
- Workflow complet des statuts
- Tous les niveaux de priorité

## Exécution

```bash
# Run all tests
npm test tests/e2e/e2e/admin-dev-requests.spec.ts

# Run specific suite
npm test tests/e2e/e2e/admin-dev-requests.spec.ts --grep "Navigation"

# Debug mode
npx playwright test tests/e2e/e2e/admin-dev-requests.spec.ts --debug
```

## Notes

- Base URL: https://cjd80.rbw.ovh (tests full stack)
- Auth: admin@test.local / devmode
- Tous les tests utilisent .rbw.ovh (Traefik/HTTPS/CORS inclus)
- Tests API avec session cookie extraction
- UI tests avec attente de chargement (networkidle)
- Store global pour ID preservation entre tests
- Type-safe avec TypeScript strict
