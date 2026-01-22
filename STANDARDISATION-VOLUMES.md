# Phase 2.3 : Standardisation Volumes cjd80

**Date:** 2026-01-05  
**Status:** ✅ COMPLÉTÉ

## Objectif
Standardiser la configuration Docker Compose de développement (docker-compose.dev.yml) pour aligner cjd80 avec le pattern utilisé par website-dnc.

## Modifications Effectuées

### 1. Ajout Docker Watch (HMR)
**Fichier:** `docker-compose.dev.yml`

Ajout de la section `develop.watch` pour le service `app` :

```yaml
develop:
  watch:
    # Frontend Next.js : Sync instantané (Turbopack HMR)
    - action: sync
      path: ./client/src
      target: /app/client/src
      ignore:
        - node_modules/
        - .next/
        - dist/

    # App directory Next.js : Sync instantané
    - action: sync
      path: ./client/app
      target: /app/client/app
      ignore:
        - node_modules/
        - .next/

    # Config Next.js : Sync + restart
    - action: sync+restart
      path: ./client/next.config.mjs
      target: /app/client/next.config.mjs

    # Backend NestJS/Server : Sync + restart
    - action: sync+restart
      path: ./server
      target: /app/server
      ignore:
        - node_modules/
        - dist/

    # Dependencies : Rebuild complet
    - action: rebuild
      path: ./package.json

    - action: rebuild
      path: ./client/package.json

    - action: rebuild
      path: ./server/package.json
```

**Bénéfice:** Hot Module Replacement (HMR) avec Turbopack pour rechargement instantané lors des modifications.

### 2. Ajout Exclusions Build Next.js
Ajout des exclusions `.next` aux volumes :

```yaml
volumes:
  # Exclusions build outputs
  - /app/dist
  - /app/build
  - /app/.next           # Nouveau
  - /app/client/.next    # Nouveau
```

**Bénéfice:** Évite conflits entre builds container et builds locaux.

### 3. Renommage Fichier
**Avant:** `docker-compose-dev.yml`  
**Après:** `docker-compose.dev.yml`

**Raison:** Cohérence avec website-dnc et convention standard (point au lieu de tiret).

### 4. Mise à Jour Commentaires
**Avant:**
```yaml
# Docker Watch disabled - Using bind mounts
```

**Après:**
```yaml
# Usage: docker compose -f docker-compose.dev.yml up --watch
```

## Décisions Importantes

### Volumes Nommés PostgreSQL/Redis Conservés
**CONSERVÉ:**
```yaml
volumes:
  postgres_data_dev:
    name: cjd80-postgres-dev
  redis_data_dev:
    name: cjd80-redis-dev
```

**Raison:** cjd80 a une stack backend complète (PostgreSQL + Redis), contrairement à website-dnc qui est front-only. Les volumes nommés sont **NÉCESSAIRES** pour la persistance des données en développement.

**Ce n'est PAS une régression** - c'est la configuration correcte pour un projet avec base de données.

## Tests de Validation

### Test Routes
**Commande:**
```bash
/tmp/test-cjd80-routes.sh
```

**Résultat:** ✅ **33/33 routes fonctionnent** (HTTP 200)

**Routes testées:**
- Pages publiques : /, /auth, /forgot-password, /reset-password, /status, /test-error, /onboarding, /events, /propose, /loan, /tools
- Admin : /admin, /admin/dashboard, /admin/branding, /admin/members, /admin/sponsorships, /admin/tracking, /admin/patrons, /admin/email-config
- Admin Content : /admin/content/ideas, /admin/content/events, /admin/content/loans
- Admin CRM : /admin/crm/members, /admin/crm/patrons
- Admin Finance : /admin/finance/dashboard, /admin/finance/budgets, /admin/finance/expenses, /admin/finance/forecasts, /admin/finance/reports, /admin/finance/sponsorships
- Admin Settings : /admin/settings/branding, /admin/settings/features, /admin/settings/email-config

## Utilisation

### Développement Standard
```bash
cd /srv/workspace/cjd80
docker compose -f docker-compose.dev.yml up
```

### Avec Docker Watch (Recommandé)
```bash
docker compose -f docker-compose.dev.yml up --watch
```

**Modifications synchronisées :**
- `./client/src`, `./client/app` → Sync instantané (HMR Turbopack)
- `./server` → Sync + restart container
- `*.config.mjs`, `package.json` → Rebuild

## Fichiers Modifiés

| Fichier | Action | Date |
|---------|--------|------|
| docker-compose-dev.yml | Renommé → docker-compose.dev.yml | 2026-01-05 |
| docker-compose.dev.yml | Ajout Docker Watch | 2026-01-05 |
| docker-compose.dev.yml | Ajout exclusions .next | 2026-01-05 |
| docker-compose.dev.yml | Mise à jour commentaires | 2026-01-05 |
| docker-compose-dev.yml.backup-20260105 | Backup créé | 2026-01-05 |

## Comparaison Avant/Après

### Avant Standardisation
- ❌ Docker Watch absent
- ❌ Pas d'exclusion .next
- ❌ Nom de fichier non standard (tiret au lieu de point)
- ✅ Volumes nommés DB (correct)
- ✅ Bind mounts corrects
- ✅ Réseau ia-webdev-network

### Après Standardisation
- ✅ Docker Watch configuré (HMR)
- ✅ Exclusions .next ajoutées
- ✅ Nom de fichier standard (docker-compose.dev.yml)
- ✅ Volumes nommés DB conservés (correct)
- ✅ Bind mounts corrects
- ✅ Réseau ia-webdev-network
- ✅ Configuration documentée
- ✅ Tous les tests passent (33/33 routes)

## Prochaines Étapes

Phase 2.4 : Tests et validation cjd80
- Tests E2E Playwright
- Validation fonctionnalités métier
- Vérification performance
- Validation production-ready

## Références

- Pattern source : `/srv/workspace/website-dnc/docker-compose.dev.yml`
- Documentation Docker Watch : https://docs.docker.com/compose/file-watch/
- Next.js Turbopack : https://nextjs.org/docs/app/api-reference/turbopack
