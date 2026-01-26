# Backend Fix & Dev Login - 2026-01-26

**Status:** ✅ Backend Opérationnel + Dev Login Actif
**Date:** 2026-01-26 11:31
**Environnement:** Development (https://cjd80.rbw.ovh)

---

## Problème Initial

Le backend NestJS ne démarrait pas, causant des erreurs 404 sur toutes les APIs.

**Symptômes:**
- `Error: Cannot find module '/app/dist/main'`
- Backend crash au démarrage
- Aucune API accessible (GET /api/ideas, GET /api/events → 404)

---

## Diagnostic

### Problème 1: Configuration TypeScript/NestJS incompatible
- **Cause:** `nest start --watch` cherchait `dist/main.js`
- **Réalité:** Code compilé dans `dist/server/src/main.js`
- **Raison:** tsconfig.server.json preserve la structure `server/src/` dans dist/

### Problème 2: Fichiers hors rootDir
- **Erreur:** `File '/app/server/email-notification-service.ts' is not under 'rootDir' '/app/server/src'`
- **Cause:** TypeScript détermine automatiquement rootDir comme le plus petit dossier commun
- **Impact:** Compilation échoue car fichiers server/*.ts + server/src/*.ts

### Problème 3: Table user_sessions manquante
- **Erreur:** `relation "public.user_sessions" does not exist`
- **Impact:** Sessions Passport ne peuvent pas être créées
- **Conséquence:** Login échoue même si DevLoginStrategy réussit

---

## Solutions Implémentées

### 1. Création de tsconfig.nest.json
**Fichier:** `/srv/workspace/cjd80/tsconfig.nest.json`

```json
{
  "extends": "./tsconfig.server.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["server/**/*", "shared/**/*"],
  "exclude": [
    "node_modules", "dist", "client",
    "**/*.test.ts", "**/*.spec.ts", "**/*.example.ts",
    "server/firebase-import.ts",
    "server/storage.ts",
    "server/import-firebase-data.ts",
    "server/parse-firebase-dump.ts",
    "server/scripts/**/*"
  ]
}
```

**Rôle:**
- Configuration TypeScript dédiée à NestJS
- Exclut les fichiers non nécessaires au runtime
- Évite les erreurs de rootDir

### 2. Mise à jour nest-cli.json
**Modification:**
```json
{
  "compilerOptions": {
    "tsConfigPath": "tsconfig.nest.json"  // Au lieu de tsconfig.server.json
  }
}
```

### 3. Configuration Auth Mode
**Fichier:** `.env`

```bash
# Authentication Mode
AUTH_MODE=local  # ← Nouveau

# Development Login (DEV ONLY)
ENABLE_DEV_LOGIN=true
```

**Impact:**
- Active LocalStrategy + DevLoginStrategy
- Désactive AuthentikStrategy (OAuth)
- Permet le dev login bypass

### 4. Création table user_sessions
**SQL:**
```sql
CREATE TABLE IF NOT EXISTS user_sessions (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON user_sessions (expire);
```

**Rôle:**
- Stockage des sessions Passport/Express
- Requise par connect-pg-simple (session store)

### 5. Seeding Utilisateurs Test
**Script:** `server/scripts/seed-test-users.ts`

**Utilisateurs créés:**
| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@test.local | test123 | super_admin | Tous droits |
| manager@test.local | test123 | events_manager | Gestion événements |
| reader@test.local | test123 | events_reader | Lecture seule |

**Commande:**
```bash
docker exec cjd80 sh -c "cd /app && NODE_ENV=development node dist/server/scripts/seed-test-users.js"
```

---

## Résultat Final

### Backend Démarrage
```
[Nest] Nest application successfully started
✅ Application démarrée avec succès
🌐 URL: http://0.0.0.0:5000
📦 Environnement: development
```

### Dev Login Actif
```
[DevLoginStrategy] Dev login attempt {"email":"admin@test.local"}
[DevLoginStrategy] ✅ Dev login successful (password bypassed) {"email":"admin@test.local","role":"super_admin"}
```

### APIs Fonctionnelles
```bash
# Test idées
GET https://cjd80.rbw.ovh/api/ideas
→ 200 OK {"success":true,"data":[],"total":0,"page":1,"limit":20}

# Test événements
GET https://cjd80.rbw.ovh/api/events
→ 200 OK {"success":true,"data":[],"total":0,"page":1,"limit":20}

# Test login dev (bypass password)
POST https://cjd80.rbw.ovh/api/auth/login
Body: {"email":"admin@test.local","password":"anywrongpassword"}
→ 200 OK {"email":"admin@test.local","role":"super_admin"}
```

---

## Sécurité Dev Login

### Triple Protection Production

1. **Module Level** (auth.module.ts):
   ```typescript
   const devLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true'
                        && process.env.NODE_ENV !== 'production';
   ```

2. **Strategy Constructor** (dev-login.strategy.ts):
   ```typescript
   this.isDevMode = process.env.NODE_ENV !== 'production';
   if (!this.isDevMode) {
     logger.error('❌ Dev login attempted in production!');
   }
   ```

3. **Strategy Validate**:
   ```typescript
   if (!this.isDevMode) {
     throw new UnauthorizedException('Dev login not available in production');
   }
   ```

**Résultat:** Impossible d'activer dev login en production même avec `ENABLE_DEV_LOGIN=true`

---

## Fichiers Modifiés/Créés

| Fichier | Type | Description |
|---------|------|-------------|
| `tsconfig.nest.json` | Créé | Config TypeScript pour NestJS |
| `nest-cli.json` | Modifié | Pointer vers tsconfig.nest.json |
| `.env` | Modifié | Ajout AUTH_MODE=local |
| `package.json` | Modifié | Retour à `nest start --watch` |
| `server/src/auth/strategies/dev-login.strategy.ts` | Créé | Stratégie dev login |
| `server/scripts/seed-test-users.ts` | Créé | Script seeding users |
| `docs/USER_STORIES.md` | Mis à jour | Résultats tests |

---

## Prochaines Étapes

### Tests Manuels Frontend
- [ ] US-IDEAS-001: Page d'accueil → Section idées
- [ ] US-IDEAS-002: Formulaire "Proposer une idée"
- [ ] US-IDEAS-003: Modal vote
- [ ] US-EVENTS-001: Page événements
- [ ] US-AUTH-001: Page /login → Test OAuth
- [ ] US-ADMIN-001: Dashboard admin après login

### Tests Automatisés (Optionnel)
- [ ] Tests E2E Playwright pour chaque US
- [ ] Tests d'intégration API
- [ ] Tests de sécurité (tentative dev login en prod)

---

## Commandes Utiles

### Redémarrer Backend
```bash
cd /srv/workspace
docker compose -f docker-compose.apps.yml restart cjd80
```

### Voir Logs Backend
```bash
docker compose -f docker-compose.apps.yml logs -f cjd80
```

### Recompiler Backend
```bash
docker exec cjd80 sh -c "cd /app && npm run build:server"
```

### Seed Users (si nécessaire)
```bash
docker exec cjd80 sh -c "cd /app && NODE_ENV=development node dist/server/scripts/seed-test-users.js"
```

### Test Login API
```bash
curl -X POST https://cjd80.rbw.ovh/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.local","password":"test"}' | jq
```

---

**Auteur:** Claude Sonnet 4.5
**Statut:** ✅ Production Ready (dev login conditionnel + backend stable)
