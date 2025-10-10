# 📊 Analyse de Couverture des Tests Playwright

## Routes API Actuellement Testées ✅

### Tests Actifs (1)
- ✅ **POST /api/ideas** - Création d'idée (test minimal)

### Tests Skippés (7 + 1 = 8 au total)
- ⏭️ POST /api/ideas (création multiple) - rate limiting
- ⏭️ POST /api/votes (votes) - rate limiting
- ⏭️ POST /api/admin/events (événements) - nécessite auth admin

## Routes API NON Testées ❌

### 🔍 Fonctionnalités Publiques Critiques

#### Health Checks (Monitoring)
- ❌ **GET /api/health** - Health check global
- ❌ **GET /api/health/db** - Health check database
- ❌ **GET /api/health/ready** - Readiness probe
- ❌ **GET /api/health/live** - Liveness probe

#### Lecture de Données (Public)
- ❌ **GET /api/ideas** - Lister les idées (avec pagination)
- ❌ **GET /api/events** - Lister les événements (avec pagination)
- ❌ **GET /api/ideas/:id/votes** - Récupérer les votes d'une idée (nécessite auth)

#### Inscriptions/Désinscriptions Événements (Public)
- ❌ **POST /api/inscriptions** - S'inscrire à un événement
- ❌ **POST /api/unsubscriptions** - Se désinscrire d'un événement

#### Proposition de Mécènes (Authentifié)
- ❌ **POST /api/patrons/propose** - Proposer un mécène (nécessite auth)
- ❌ **GET /api/ideas/:id/patrons** - Récupérer propositions mécènes pour idée

### 🔐 Fonctionnalités Admin (Nécessitent Auth)

#### Gestion Ideas Admin
- ❌ **GET /api/admin/ideas** - Lister toutes les idées (admin)
- ❌ **PATCH /api/admin/ideas/:id/status** - Changer statut idée
- ❌ **PATCH /api/admin/ideas/:id/featured** - Toggle idée mise en avant
- ❌ **POST /api/admin/ideas/:id/transform-to-event** - Transformer idée en événement

#### Gestion Events Admin
- ❌ **GET /api/admin/events** - Lister tous les événements
- ❌ **PUT /api/admin/events/:id** - Modifier événement
- ❌ **DELETE /api/admin/events/:id** - Supprimer événement

#### Gestion Votes Admin
- ❌ **GET /api/admin/votes/:ideaId** - Récupérer votes pour idée
- ❌ **DELETE /api/admin/votes/:voteId** - Supprimer un vote

#### Gestion Inscriptions Admin
- ❌ **DELETE /api/admin/inscriptions/:id** - Supprimer inscription
- ❌ **POST /api/admin/inscriptions/bulk** - Import bulk inscriptions

#### Notifications Push
- ❌ **GET /api/notifications/vapid-key** - Récupérer clé VAPID
- ❌ **POST /api/notifications/subscribe** - S'abonner aux notifications
- ❌ **POST /api/notifications/unsubscribe** - Se désabonner

#### Gestion Mécènes Admin
- ❌ **GET /api/patrons** - Lister mécènes
- ❌ **POST /api/patrons** - Créer mécène
- ❌ **PUT /api/patrons/:id** - Modifier mécène
- ❌ **DELETE /api/patrons/:id** - Supprimer mécène

## 🎯 Priorités de Tests

### Priorité 1 : Fonctionnalités Publiques (Sans Auth)
Ces tests peuvent être exécutés immédiatement sans authentification :

1. **Health Checks** - Critique pour monitoring
   - GET /api/health
   - GET /api/health/db
   - GET /api/health/ready
   - GET /api/health/live

2. **Lecture de Données** - Fonctionnalité publique principale
   - GET /api/ideas (vérifier pagination)
   - GET /api/events (vérifier pagination)

3. **Inscriptions Événements** - Workflow public complet
   - POST /api/inscriptions (créer inscription)
   - Vérifier déduplication (même email)

4. **Désinscriptions Événements** - Workflow public complet
   - POST /api/unsubscriptions

### Priorité 2 : Fonctionnalités Authentifiées (Nécessitent Setup)
Ces tests nécessitent une session authentifiée ou mock :

1. **Proposition Mécènes**
   - POST /api/patrons/propose (nécessite auth)

2. **Admin Ideas Management**
   - PATCH /api/admin/ideas/:id/status
   - PATCH /api/admin/ideas/:id/featured

### Priorité 3 : Fonctionnalités Admin Avancées
Tests avancés nécessitant auth admin complète :

1. **Gestion Complète Admin**
2. **Notifications Push**
3. **Bulk Operations**

## 🐛 Bugs Potentiels Identifiés

### 1. Validation des Idées (À Tester)
- ❓ Titre minimum 3 caractères (test existant skippé)
- ❓ Email valide requis
- ❓ Déduplication par titre

### 2. Pagination (À Tester)
- ❓ GET /api/ideas retourne bien format pagination
- ❓ GET /api/events retourne bien format pagination
- ❓ Limites de pagination respectées

### 3. Rate Limiting (Connu)
- ✅ 20 créations/15min - documenté et testé
- ❓ Autres endpoints rate limités?

### 4. Nettoyage des Données (À Vérifier)
- ✅ Nettoyage idées fonctionne
- ❓ Nettoyage inscriptions fonctionne
- ❓ Nettoyage unsubscriptions fonctionne

## 📋 Plan d'Action

### Phase 1 : Tests Sans Auth ✅
1. Créer `test/e2e/public-api.spec.ts` :
   - Health checks
   - Lecture idées/événements
   - Inscriptions/désinscriptions

### Phase 2 : Tests Avec Données ✅
1. Ajouter à `test/e2e/data-workflows.spec.ts` :
   - Workflow complet : Créer idée → Lire → Voter
   - Workflow complet : Créer événement → Lister → S'inscrire

### Phase 3 : Tests Admin (Si Nécessaire) ⏭️
1. Setup authentification mock ou réelle
2. Tester routes admin critiques

## 📈 Objectif de Couverture

**Cible** : Tester toutes les routes publiques (sans auth) + workflows critiques

**Routes Publiques à Tester** :
- ✅ POST /api/ideas (fait)
- ✅ POST /api/votes (fait, skippé)
- ❌ GET /api/ideas (à faire)
- ❌ GET /api/events (à faire)
- ❌ POST /api/inscriptions (à faire)
- ❌ POST /api/unsubscriptions (à faire)
- ❌ GET /api/health* (à faire)

**Total** : 5 routes publiques à tester + health checks

## ✅ Prochaines Étapes

1. **Créer test/e2e/public-api.spec.ts** avec :
   - 4 tests health checks
   - 2 tests lecture (ideas, events)
   - 2 tests inscriptions/unsubscriptions

2. **Créer test/e2e/data-workflows.spec.ts** avec :
   - 1 test workflow idée complet
   - 1 test workflow événement complet

**Total estimé** : 8 nouveaux tests couvrant toutes les fonctionnalités publiques critiques
