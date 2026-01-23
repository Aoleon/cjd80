# API Documentation - CJD Amiens "Boîte à Kiffs"

**Version:** 2.0.0
**Base URL:** `http://localhost:5000` (dev) | `https://cjd80.rbw.ovh` (prod)
**Swagger UI:** `/api/docs`
**OpenAPI JSON:** `/api/docs-json`

## Table des matières

- [Introduction](#introduction)
- [Authentification](#authentification)
- [Modules API](#modules-api)
  - [Auth - Authentification](#auth---authentification)
  - [Ideas - Idées collaboratives](#ideas---idées-collaboratives)
  - [Events - Événements](#events---événements)
  - [Loans - Prêts matériel](#loans---prêts-matériel)
  - [Members - CRM Membres](#members---crm-membres)
  - [Patrons - CRM Sponsors](#patrons---crm-sponsors)
  - [Financial - Gestion financière](#financial---gestion-financière)
  - [Tracking - Suivi et alertes](#tracking---suivi-et-alertes)
  - [Admin - Administration](#admin---administration)
  - [Branding - Configuration branding](#branding---configuration-branding)
  - [Chatbot - Chatbot IA](#chatbot---chatbot-ia)
  - [Features - Fonctionnalités](#features---fonctionnalités)
  - [Health - Monitoring](#health---monitoring)
- [Codes de statut HTTP](#codes-de-statut-http)
- [Permissions et rôles](#permissions-et-rôles)

---

## Introduction

L'API CJD Amiens est construite avec **NestJS 11** et utilise une architecture modulaire. Elle propose 11 modules fonctionnels couvrant la gestion collaborative d'idées, d'événements, de prêts, ainsi qu'un CRM complet pour les membres et sponsors.

**Caractéristiques principales:**
- Authentification OAuth2/OIDC via Authentik (ou locale en dev)
- 133+ endpoints documentés avec OpenAPI 3.0
- Rate limiting sur les endpoints publics
- System de permissions granulaires basé sur les rôles
- Pagination sur toutes les listes
- Upload de fichiers (images pour les prêts)

---

## Authentification

### Méthodes d'authentification

#### 1. OAuth2 (Production - Authentik)
```http
GET /api/auth/authentik
```
Redirige vers Authentik pour l'authentification. Après validation, l'utilisateur est redirigé vers `/api/auth/authentik/callback`.

**Callback:**
```http
GET /api/auth/authentik/callback
```

#### 2. Login local (Développement)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@cjd-amiens.fr",
  "password": "SecurePassword123"
}
```

**Réponse (200 OK):**
```json
{
  "email": "admin@cjd-amiens.fr",
  "role": "super_admin",
  "permissions": ["admin.view", "admin.edit", "admin.manage", "ideas.read", "ideas.manage", "ideas.delete", "events.read", "events.write", "events.delete"]
}
```

### Mode d'authentification actuel
```http
GET /api/auth/mode
```

**Réponse:**
```json
{
  "mode": "oauth"
}
```

### Obtenir l'utilisateur connecté
```http
GET /api/auth/user
Authorization: Bearer <session-cookie>
```

### Déconnexion
```http
POST /api/auth/logout
```

### Réinitialisation de mot de passe (mode local uniquement)

**1. Demander un lien de réinitialisation:**
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**2. Valider le token:**
```http
GET /api/auth/reset-password/validate?token=abcd1234efgh5678
```

**3. Réinitialiser le mot de passe:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abcd1234efgh5678",
  "password": "NewSecurePassword123"
}
```

---

## Modules API

### Auth - Authentification

**Tag:** `auth`
**Description:** Gestion de l'authentification OAuth2 Authentik et locale

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/auth/authentik` | GET | Non | Initier le flow OAuth2 |
| `/api/auth/authentik/callback` | GET | Non | Callback OAuth2 |
| `/api/auth/login` | POST | Non | Login local ou redirection OAuth2 |
| `/api/auth/logout` | POST | Non | Déconnexion |
| `/api/auth/user` | GET | Oui | Obtenir l'utilisateur connecté |
| `/api/auth/mode` | GET | Non | Mode d'authentification |
| `/api/auth/forgot-password` | POST | Non | Demander réinitialisation mot de passe |
| `/api/auth/reset-password/validate` | GET | Non | Valider un token de réinitialisation |
| `/api/auth/reset-password` | POST | Non | Réinitialiser le mot de passe |

---

### Ideas - Idées collaboratives

**Tag:** `ideas`
**Description:** Gestion collaborative des idées avec système de votes

#### Endpoints publics

**Liste des idées (avec pagination):**
```http
GET /api/ideas?page=1&limit=20
```

**Réponse (200 OK):**
```json
{
  "ideas": [
    {
      "id": "uuid-123",
      "title": "Organiser une journée team building",
      "description": "Il serait intéressant d'organiser...",
      "authorName": "Jean Dupont",
      "authorEmail": "jean@example.com",
      "status": "pending",
      "voteCount": 15,
      "createdAt": "2026-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Créer une idée (publique, rate-limited: 20 req/15min):**
```http
POST /api/ideas
Content-Type: application/json

{
  "title": "Organiser une journée team building",
  "description": "Il serait intéressant d'organiser une activité...",
  "authorName": "Jean Dupont",
  "authorEmail": "jean@example.com"
}
```

**Voter pour une idée (publique, rate-limited: 10 req/1min):**
```http
POST /api/votes
Content-Type: application/json

{
  "ideaId": "uuid-123",
  "voterEmail": "voter@example.com"
}
```

#### Endpoints protégés (admin)

**Supprimer une idée (permission: ideas.delete):**
```http
DELETE /api/ideas/{id}
Authorization: Bearer <session-cookie>
```

**Mettre à jour le statut (permission: ideas.manage):**
```http
PATCH /api/ideas/{id}/status
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "status": "approved"
}
```
*Statuts possibles:* `pending`, `approved`, `rejected`, `in_progress`, `completed`

**Voir les votes d'une idée (permission: ideas.read):**
```http
GET /api/ideas/{id}/votes
Authorization: Bearer <session-cookie>
```

---

### Events - Événements

**Tag:** `events`
**Description:** Gestion des événements avec inscriptions et désinscriptions

#### Endpoints publics

**Liste des événements:**
```http
GET /api/events?page=1&limit=20
```

**S'inscrire à un événement (rate-limited: 20 req/15min):**
```http
POST /api/inscriptions
Content-Type: application/json

{
  "eventId": "uuid-123",
  "participantName": "Marie Martin",
  "participantEmail": "marie@example.com"
}
```

**Se désinscrire d'un événement:**
```http
POST /api/unsubscriptions
Content-Type: application/json

{
  "eventId": "uuid-123",
  "participantEmail": "marie@example.com"
}
```

#### Endpoints protégés (admin)

**Créer un événement (permission: events.write):**
```http
POST /api/events
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "title": "Soirée networking",
  "description": "Rencontre professionnelle entre membres CJD",
  "date": "2026-02-15T19:00:00Z",
  "location": "Salle des fêtes, Amiens",
  "maxParticipants": 50
}
```

**Créer un événement avec inscriptions pré-remplies:**
```http
POST /api/events/with-inscriptions
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "event": { /* données événement */ },
  "inscriptions": [
    { "participantName": "Alice", "participantEmail": "alice@example.com" }
  ]
}
```

**Mettre à jour un événement:**
```http
PUT /api/events/{id}
Authorization: Bearer <session-cookie>
```

**Supprimer un événement (permission: events.delete):**
```http
DELETE /api/events/{id}
Authorization: Bearer <session-cookie>
```

**Voir les inscriptions (permission: events.read):**
```http
GET /api/events/{id}/inscriptions
Authorization: Bearer <session-cookie>
```

---

### Loans - Prêts matériel

**Tag:** `loans`
**Description:** Gestion des objets disponibles en prêt

#### Endpoints publics

**Liste des objets disponibles:**
```http
GET /api/loan-items?page=1&limit=20&search=projecteur
```

**Créer une demande de prêt (rate-limited):**
```http
POST /api/loan-items
Content-Type: application/json

{
  "name": "Projecteur vidéo",
  "description": "Pour conférence",
  "borrowerEmail": "user@example.com"
}
```

#### Endpoints protégés (admin)

**Tous les objets de prêt (permission: admin.view):**
```http
GET /api/admin/loan-items?page=1&limit=20&search=projecteur
Authorization: Bearer <session-cookie>
```

**Détails d'un objet:**
```http
GET /api/admin/loan-items/{id}
Authorization: Bearer <session-cookie>
```

**Mettre à jour un objet (permission: admin.edit):**
```http
PUT /api/admin/loan-items/{id}
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "name": "Projecteur vidéo HD",
  "description": "Mis à jour",
  "quantity": 2,
  "location": "Bureau 201"
}
```

**Mettre à jour le statut:**
```http
PATCH /api/admin/loan-items/{id}/status
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "status": "borrowed"
}
```
*Statuts possibles:* `available`, `borrowed`, `maintenance`, `unavailable`

**Supprimer un objet:**
```http
DELETE /api/admin/loan-items/{id}
Authorization: Bearer <session-cookie>
```

**Uploader une photo (max 5MB, JPG/PNG/WebP):**
```http
POST /api/admin/loan-items/{id}/photo
Authorization: Bearer <session-cookie>
Content-Type: multipart/form-data

photo: <binary-file>
```

---

### Members - CRM Membres

**Tag:** `members`
**Description:** CRM complet pour la gestion des membres avec tags, tâches et relations

#### Endpoint public

**Proposer un nouveau membre:**
```http
POST /api/members/propose
Content-Type: application/json

{
  "email": "nouveau@example.com",
  "firstName": "Nouveau",
  "lastName": "Membre",
  "company": "Entreprise XYZ"
}
```

#### Endpoints protégés (admin.view)

**Liste des membres avec filtres:**
```http
GET /api/admin/members?page=1&limit=20&status=active&search=Dupont&score=high&activity=recent
Authorization: Bearer <session-cookie>
```

**Détails d'un membre:**
```http
GET /api/admin/members/{email}
Authorization: Bearer <session-cookie>
```

**Activités d'un membre:**
```http
GET /api/admin/members/{email}/activities
Authorization: Bearer <session-cookie>
```

**Vue détaillée (avec stats):**
```http
GET /api/admin/members/{email}/details
Authorization: Bearer <session-cookie>
```

**Mettre à jour un membre:**
```http
PATCH /api/admin/members/{email}
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678"
}
```

**Supprimer un membre (permission: admin.manage):**
```http
DELETE /api/admin/members/{email}
Authorization: Bearer <session-cookie>
```

#### Subscriptions (abonnements)

```http
GET /api/admin/members/{email}/subscriptions
POST /api/admin/members/{email}/subscriptions
```

#### Tags

```http
GET /api/admin/member-tags                    # Liste tous les tags
POST /api/admin/member-tags                   # Créer un tag
PATCH /api/admin/member-tags/{id}             # Modifier un tag
DELETE /api/admin/member-tags/{id}            # Supprimer un tag

GET /api/admin/members/{email}/tags           # Tags d'un membre
POST /api/admin/members/{email}/tags          # Assigner un tag
DELETE /api/admin/members/{email}/tags/{tagId} # Retirer un tag
```

#### Tasks (tâches)

```http
GET /api/admin/members/{email}/tasks          # Tâches d'un membre
POST /api/admin/members/{email}/tasks         # Créer une tâche
PATCH /api/admin/member-tasks/{id}            # Modifier une tâche
DELETE /api/admin/member-tasks/{id}           # Supprimer une tâche
```

#### Relations

```http
GET /api/admin/members/{email}/relations      # Relations d'un membre
POST /api/admin/members/{email}/relations     # Créer une relation
DELETE /api/admin/member-relations/{id}       # Supprimer une relation
```

---

### Patrons - CRM Sponsors

**Tag:** `patrons`
**Description:** CRM pour la gestion des sponsors (mécènes) avec dons, propositions, actualités et sponsorings

#### Endpoint public/authentifié

**Proposer un nouveau sponsor:**
```http
POST /api/patrons/propose
Authorization: Bearer <session-cookie> (optionnel)
Content-Type: application/json

{
  "email": "sponsor@example.com",
  "companyName": "Entreprise ABC",
  "contactName": "Pierre Durand"
}
```

#### Endpoints protégés (admin.manage)

**Liste des sponsors avec filtres:**
```http
GET /api/patrons?page=1&limit=20&status=active&search=ABC
Authorization: Bearer <session-cookie>
```

**Rechercher par email:**
```http
GET /api/patrons/search/email?email=sponsor@example.com
Authorization: Bearer <session-cookie>
```

**Détails d'un sponsor:**
```http
GET /api/patrons/{id}
Authorization: Bearer <session-cookie>
```

**Créer un sponsor:**
```http
POST /api/patrons
Authorization: Bearer <session-cookie>
```

**Mettre à jour un sponsor:**
```http
PATCH /api/patrons/{id}
Authorization: Bearer <session-cookie>
```

**Supprimer un sponsor:**
```http
DELETE /api/patrons/{id}
Authorization: Bearer <session-cookie>
```

#### Donations (dons)

```http
GET /api/donations                            # Tous les dons
POST /api/patrons/{id}/donations              # Créer un don
GET /api/patrons/{id}/donations               # Dons d'un sponsor
PATCH /api/donations/{id}                     # Modifier un don
DELETE /api/donations/{id}                    # Supprimer un don
```

#### Proposals (propositions d'idées)

```http
GET /api/patrons/{id}/proposals               # Propositions d'un sponsor
PATCH /api/proposals/{id}                     # Modifier une proposition
DELETE /api/proposals/{id}                    # Supprimer une proposition
```

#### Updates (actualités)

```http
POST /api/patrons/{id}/updates                # Créer une actualité
GET /api/patrons/{id}/updates                 # Actualités d'un sponsor
PATCH /api/patron-updates/{id}                # Modifier une actualité
DELETE /api/patron-updates/{id}               # Supprimer une actualité
```

#### Sponsorships (sponsorings d'événements)

```http
GET /api/sponsorships                         # Tous les sponsorings
GET /api/sponsorships/stats                   # Statistiques sponsorings
POST /api/patrons/{patronId}/sponsorships     # Créer un sponsoring
GET /api/patrons/{patronId}/sponsorships      # Sponsorings d'un sponsor
PATCH /api/sponsorships/{id}                  # Modifier un sponsoring
DELETE /api/sponsorships/{id}                 # Supprimer un sponsoring
```

---

### Financial - Gestion financière

**Tag:** `financial`
**Description:** Gestion des budgets, dépenses, catégories, prévisions et rapports financiers

*Tous les endpoints nécessitent l'authentification et les permissions appropriées (admin.view ou admin.manage).*

#### Budgets

```http
GET /api/admin/finance/budgets?period=Q1&year=2026&category=events
GET /api/admin/finance/budgets/{id}
POST /api/admin/finance/budgets (permission: admin.manage)
PUT /api/admin/finance/budgets/{id} (permission: admin.manage)
DELETE /api/admin/finance/budgets/{id} (permission: admin.manage)
GET /api/admin/finance/budgets/stats?period=Q1&year=2026
```

#### Expenses (dépenses)

```http
GET /api/admin/finance/expenses?period=Q1&year=2026&category=events&budgetId=uuid-123
GET /api/admin/finance/expenses/{id}
POST /api/admin/finance/expenses (permission: admin.manage)
PUT /api/admin/finance/expenses/{id} (permission: admin.manage)
DELETE /api/admin/finance/expenses/{id} (permission: admin.manage)
GET /api/admin/finance/expenses/stats?period=Q1&year=2026
```

#### Categories

```http
GET /api/admin/finance/categories?type=budget
POST /api/admin/finance/categories (permission: admin.manage)
PUT /api/admin/finance/categories/{id} (permission: admin.manage)
```

#### Forecasts (prévisions)

```http
GET /api/admin/finance/forecasts?period=Q2&year=2026&category=marketing
POST /api/admin/finance/forecasts (permission: admin.manage)
PUT /api/admin/finance/forecasts/{id} (permission: admin.manage)
POST /api/admin/finance/forecasts/generate (permission: admin.manage)
```

**Générer des prévisions:**
```http
POST /api/admin/finance/forecasts/generate
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "period": "Q3",
  "year": 2026
}
```

#### KPIs & Reports

```http
GET /api/admin/finance/kpis/extended?period=Q1&year=2026
GET /api/admin/finance/comparison?period1=Q1&year1=2025&period2=Q1&year2=2026
GET /api/admin/finance/reports/{type}?period=1&year=2026
```
*Types de rapports:* `monthly`, `quarterly`, `yearly`

---

### Tracking - Suivi et alertes

**Tag:** `tracking`
**Description:** Système de suivi et d'alertes pour les membres et sponsors

*Tous les endpoints nécessitent l'authentification.*

#### Dashboard

```http
GET /api/tracking/dashboard (permission: admin.view)
Authorization: Bearer <session-cookie>
```

#### Metrics (métriques de suivi)

```http
GET /api/tracking/metrics?entityType=member&entityId=uuid-123&metricType=engagement
POST /api/tracking/metrics (permission: admin.manage)
```

**Query params:**
- `entityType`: `member` ou `patron`
- `entityId`: ID de l'entité
- `entityEmail`: Email de l'entité
- `metricType`: Type de métrique
- `startDate`: Date début (ISO 8601)
- `endDate`: Date fin (ISO 8601)
- `limit`: Limite de résultats

#### Alerts (alertes)

```http
GET /api/tracking/alerts?entityType=member&isRead=false&severity=high
POST /api/tracking/alerts (permission: admin.manage)
PUT /api/tracking/alerts/{id} (permission: admin.manage)
POST /api/tracking/alerts/generate (permission: admin.manage)
```

**Générer des alertes automatiques:**
```http
POST /api/tracking/alerts/generate
Authorization: Bearer <session-cookie>
```

---

### Admin - Administration

**Tag:** `admin`
**Description:** Routes d'administration centralisées

*Tous les endpoints nécessitent l'authentification.*

#### Ideas (administration)

```http
GET /api/admin/ideas?page=1&limit=20 (permission: admin.view)
PUT /api/admin/ideas/{id} (permission: admin.edit)
PATCH /api/admin/ideas/{id}/status (permission: admin.edit)
PATCH /api/admin/ideas/{id}/featured (permission: admin.edit)
POST /api/admin/ideas/{id}/transform-to-event (permission: admin.edit)
GET /api/admin/ideas/{ideaId}/votes (permission: admin.view)
```

#### Events (administration)

```http
GET /api/admin/events?page=1&limit=20 (permission: admin.view)
PUT /api/admin/events/{id} (permission: admin.edit)
PATCH /api/admin/events/{id}/status (permission: admin.edit)
GET /api/admin/events/{eventId}/inscriptions (permission: admin.view)
```

#### Inscriptions

```http
GET /api/admin/inscriptions/{eventId} (permission: admin.view)
POST /api/admin/inscriptions (permission: admin.edit)
POST /api/admin/inscriptions/bulk (permission: admin.edit)
DELETE /api/admin/inscriptions/{inscriptionId} (permission: admin.edit)
```

#### Votes

```http
GET /api/admin/votes/{ideaId} (permission: admin.view)
POST /api/admin/votes (permission: admin.edit)
DELETE /api/admin/votes/{voteId} (permission: admin.edit)
```

#### Administrators

```http
GET /api/admin/administrators (permission: admin.manage)
GET /api/admin/pending-admins (permission: admin.manage)
POST /api/admin/administrators (permission: admin.manage)
PATCH /api/admin/administrators/{email}/role (permission: admin.manage)
PATCH /api/admin/administrators/{email}/status (permission: admin.manage)
PATCH /api/admin/administrators/{email}/info (permission: admin.manage)
DELETE /api/admin/administrators/{email} (permission: admin.manage)
PATCH /api/admin/administrators/{email}/approve (permission: admin.manage)
DELETE /api/admin/administrators/{email}/reject (permission: admin.manage)
```

#### Dashboard & Stats

```http
GET /api/admin/stats (permission: admin.view)
GET /api/admin/db-health (permission: admin.view)
GET /api/admin/pool-stats (permission: admin.view)
```

#### Development Requests (demandes de développement)

```http
GET /api/admin/development-requests (permission: admin.manage)
POST /api/admin/development-requests (permission: admin.edit)
PUT /api/admin/development-requests/{id} (permission: admin.manage)
PATCH /api/admin/development-requests/{id}/status (permission: admin.manage)
POST /api/admin/development-requests/{id}/sync (permission: admin.manage)
DELETE /api/admin/development-requests/{id} (permission: admin.manage)
```

#### Logs & Tests

```http
GET /api/admin/errors?limit=100 (permission: admin.view)
GET /api/admin/test-email (permission: admin.manage)
GET /api/admin/test-email-simple (permission: admin.manage)
```

#### Feature Configuration

```http
GET /api/admin/features
PUT /api/admin/features/{featureKey} (permission: admin.manage)
```

#### Email Configuration

```http
GET /api/admin/email-config (permission: admin.view)
PUT /api/admin/email-config (permission: admin.manage)
```

#### Frontend Error Logs

```http
POST /api/logs/frontend-error
```

---

### Branding - Configuration branding

**Tag:** `branding`
**Description:** Configuration du branding (couleurs, logos, textes)

**Obtenir la configuration (publique):**
```http
GET /api/admin/branding
```

**Mettre à jour la configuration (permission: admin.manage):**
```http
PUT /api/admin/branding
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "config": "{\"colors\": {\"primary\": \"#3B82F6\"}}"
}
```

---

### Chatbot - Chatbot IA

**Tag:** `chatbot`
**Description:** Interroger la base de données en langage naturel via IA (SQL naturel)

**Interroger le chatbot (permission: admin.view):**
```http
POST /api/admin/chatbot/query
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "question": "Combien d'idées ont été approuvées ce mois ?",
  "context": "dashboard"
}
```

**Réponse (200 OK):**
```json
{
  "success": true,
  "answer": "Il y a 15 idées approuvées ce mois.",
  "sql": "SELECT COUNT(*) FROM ideas WHERE status = 'approved' AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())",
  "data": [{ "count": 15 }]
}
```

---

### Features - Fonctionnalités

**Tag:** `features`
**Description:** Gestion des feature flags

**Obtenir toutes les fonctionnalités (publique):**
```http
GET /api/features
```

**Obtenir une fonctionnalité par clé:**
```http
GET /api/features/{featureKey}
```

**Activer/désactiver une fonctionnalité (permission: admin.manage):**
```http
PUT /api/features/{featureKey}
Authorization: Bearer <session-cookie>
Content-Type: application/json

{
  "enabled": true
}
```

---

### Health - Monitoring

**Tag:** `health`
**Description:** Health checks et monitoring de l'application

**Health check global:**
```http
GET /api/health
```

**Database health:**
```http
GET /api/health/db
```

**Health check détaillé (authentifié):**
```http
GET /api/health/detailed
Authorization: Bearer <session-cookie>
```

**Readiness probe (Kubernetes):**
```http
GET /api/health/ready
```

**Liveness probe (Kubernetes):**
```http
GET /api/health/live
```

**Version de l'application:**
```http
GET /api/version
```

**Status complet:**
```http
GET /api/status/all
```

---

## Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 OK | Requête réussie |
| 201 Created | Ressource créée avec succès |
| 204 No Content | Suppression réussie, pas de contenu à retourner |
| 400 Bad Request | Données invalides |
| 401 Unauthorized | Non authentifié |
| 403 Forbidden | Permission refusée |
| 404 Not Found | Ressource non trouvée |
| 429 Too Many Requests | Rate limit dépassé |
| 500 Internal Server Error | Erreur serveur |

---

## Permissions et rôles

### Rôles disponibles

| Rôle | Description |
|------|-------------|
| `super_admin` | Tous les droits, y compris gestion des administrateurs |
| `ideas_manager` | Gestion complète des idées (lecture, écriture, suppression) |
| `ideas_reader` | Lecture des idées et votes uniquement |
| `events_manager` | Gestion complète des événements |
| `events_reader` | Lecture des événements uniquement |

### Permissions

Les permissions sont granulaires et vérifiées au niveau de chaque endpoint:

**Ideas:**
- `ideas.read` - Lire les idées et votes
- `ideas.manage` - Modifier le statut des idées
- `ideas.delete` - Supprimer des idées

**Events:**
- `events.read` - Lire les événements et inscriptions
- `events.write` - Créer et modifier des événements
- `events.delete` - Supprimer des événements

**Admin:**
- `admin.view` - Voir le dashboard et les données admin
- `admin.edit` - Modifier les données (idées, événements, prêts)
- `admin.manage` - Gestion complète (admins, features, emails)

---

## Exemples d'utilisation

### Scénario 1: Créer et voter pour une idée

```bash
# 1. Créer une idée (publique)
curl -X POST http://localhost:5000/api/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Organiser une soirée networking",
    "description": "Rencontre entre jeunes dirigeants",
    "authorName": "Jean Dupont",
    "authorEmail": "jean@example.com"
  }'

# 2. Voter pour l'idée
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "uuid-retourné-par-étape-1",
    "voterEmail": "voteur@example.com"
  }'

# 3. Admin: Approuver l'idée
curl -X PATCH http://localhost:5000/api/ideas/uuid-123/status \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{"status": "approved"}'
```

### Scénario 2: Gérer un événement

```bash
# 1. Admin: Créer un événement
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{
    "title": "Soirée networking",
    "description": "Rencontre professionnelle",
    "date": "2026-02-15T19:00:00Z",
    "location": "Amiens",
    "maxParticipants": 50
  }'

# 2. Public: S'inscrire
curl -X POST http://localhost:5000/api/inscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "uuid-event",
    "participantName": "Marie Martin",
    "participantEmail": "marie@example.com"
  }'

# 3. Admin: Voir les inscriptions
curl -X GET http://localhost:5000/api/events/uuid-event/inscriptions \
  -H "Cookie: connect.sid=..."
```

---

## Ressources utiles

- **Swagger UI:** Accédez à `/api/docs` pour l'interface interactive
- **OpenAPI JSON:** `/api/docs-json` pour le schéma complet
- **Health check:** `/api/health` pour le status de l'application
- **Version:** `/api/version` pour la version déployée

---

**Documentation générée automatiquement le 2026-01-22**
**Total d'endpoints documentés:** 133+
