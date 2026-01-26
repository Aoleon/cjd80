# Dev Login Implementation - CJD80

**Date:** 2026-01-26
**Status:** ✅ Implémenté
**Package:** `@robinswood/auth@3.1.4` + Dev Login Strategy

---

## Vue d'Ensemble

Intégration de `@robinswood/auth` depuis Verdaccio privé avec une stratégie de **Dev Login** pour bypass l'authentification en développement.

### Objectifs

1. ✅ Utiliser `@robinswood/auth` depuis https://verdaccio.robinswood.io/
2. ✅ Dev Login bypass activé en dev (mot de passe non vérifié)
3. ✅ Formulaire d'auth standard fonctionne aussi (avec IDs test)
4. ✅ Dev Login **automatiquement désactivé** en production

---

## Architecture

### Package @robinswood/auth

**Installé:** v3.1.4
**Registry:** `@robinswood:registry=https://verdaccio.robinswood.io/`

**Fonctionnalités disponibles:**
- JWT Authentication
- Local Auth (email/password avec bcrypt)
- Refresh Tokens
- OAuth (Azure AD, Google)
- RBAC Permissions
- Password Reset
- Rate Limiting
- Drizzle ORM Support

**Utilisé actuellement:** Base types uniquement (stratégies custom pour CJD80)

---

## Dev Login Strategy

### Fichier: `server/src/auth/strategies/dev-login.strategy.ts`

**Comportement:**
- **Développement:** Bypass complet de la vérification du mot de passe
- **Production:** Rejette automatiquement toute tentative (throw UnauthorizedException)
- **Validation:** Email doit exister en DB, statut `active`

**Code:**
```typescript
@Injectable()
export class DevLoginStrategy extends PassportStrategy(Strategy, 'dev-login') {
  private readonly isDevMode: boolean;

  constructor(private storageService: StorageService) {
    super({ usernameField: 'email', passwordField: 'password' });

    // CRITICAL: Check environment at startup
    this.isDevMode = process.env.NODE_ENV !== 'production';

    if (this.isDevMode) {
      logger.warn('[DevLoginStrategy] ⚠️  DEV LOGIN ENABLED - Password checks bypassed');
    }
  }

  async validate(email: string, password: string): Promise<Admin> {
    // CRITICAL: Reject in production
    if (!this.isDevMode) {
      throw new UnauthorizedException('Dev login not available in production');
    }

    // Fetch user (password ignored)
    const userResult = await this.storageService.storage.getUser(email);

    // Validate user exists and is active
    // ...

    return user;
  }
}
```

**Logs générés:**
```
[DevLoginStrategy] ⚠️  DEV LOGIN ENABLED - Password checks bypassed
[DevLoginStrategy] Test accounts: admin@test.local, manager@test.local, reader@test.local
[DevLoginStrategy] ✅ Dev login successful (password bypassed)
```

---

## Configuration

### Variables d'Environnement

**Fichier `.env`:**
```bash
NODE_ENV=development
ENABLE_DEV_LOGIN=true
```

**Comportement:**
- `ENABLE_DEV_LOGIN=true` + `NODE_ENV ≠ production` → Dev Login actif
- `NODE_ENV=production` → Dev Login **forcément désactivé** (double protection)
- `ENABLE_DEV_LOGIN=false` → Fallback sur LocalStrategy standard

### Priorité des Stratégies

**Controller logic:**
```typescript
// Choisir la stratégie : dev-login en priorité si activé, sinon local
const strategy = this.devLoginEnabled ? 'dev-login' : 'local';
passport.authenticate(strategy, (err, user, info) => { ... });
```

**Ordre:**
1. **Dev Login** (si `ENABLE_DEV_LOGIN=true` ET `NODE_ENV ≠ production`)
2. **Local Strategy** (vérification bcrypt standard)
3. **OAuth Authentik** (si `AUTH_MODE=oauth`)

---

## Comptes de Test

### Seeding Script

**Fichier:** `server/scripts/seed-test-users.ts`
**Usage:**
```bash
bun server/scripts/seed-test-users.ts
```

**Comptes créés:**

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| `admin@test.local` | `test123` | `super_admin` | Tous droits |
| `manager@test.local` | `test123` | `events_manager` | Gestion événements |
| `reader@test.local` | `test123` | `events_reader` | Lecture seule |

**Comportement avec Dev Login:**
- Password `test123` fonctionne (bcrypt vérifié)
- **Tout autre password fonctionne aussi** (bypass actif)
- `admin@test.local` + `wrongpass` → ✅ Login réussi

**Comportement sans Dev Login:**
- Seulement `test123` fonctionne
- `admin@test.local` + `wrongpass` → ❌ "Identifiants invalides"

---

## Sécurité

### Protection Production

**Triple vérification:**

1. **Module level** (`auth.module.ts`):
   ```typescript
   const devLoginEnabled = process.env.ENABLE_DEV_LOGIN === 'true'
                        && process.env.NODE_ENV !== 'production';
   ```

2. **Strategy constructor**:
   ```typescript
   this.isDevMode = process.env.NODE_ENV !== 'production';
   if (!this.isDevMode) {
     logger.error('❌ Dev login attempted in production!');
   }
   ```

3. **Strategy validate**:
   ```typescript
   if (!this.isDevMode) {
     throw new UnauthorizedException('Dev login not available in production');
   }
   ```

**Impossible d'activer en production même avec `ENABLE_DEV_LOGIN=true`**

### Logs d'Audit

**Startup logs:**
```
[AuthModule] Mode authentification: LOCAL (formulaire)
[AuthModule] ⚠️  DEV LOGIN ENABLED - Password bypass active for development
```

**Login logs:**
```
[DevLoginStrategy] Dev login attempt { email: 'admin@test.local' }
[DevLoginStrategy] ✅ Dev login successful (password bypassed) { email: '...', role: '...' }
```

---

## Intégration @robinswood/auth

### Configuration NPM

**Fichier `.npmrc`:**
```
@robinswood:registry=https://verdaccio.robinswood.io/
//verdaccio.robinswood.io/:_authToken=${VERDACCIO_TOKEN}
```

**Installation:**
```bash
npm install --save @robinswood/auth@latest
```

**Dependencies ajoutées:**
- `@robinswood/auth@^3.1.4`
- `bcrypt@^5.1.1` (peer dependency)

### Usage Actuel

**Actuellement:** Types et utilities uniquement
```typescript
// Potentiel futur usage
import {
  AuthUnifiedModule,
  LocalAuthService,
  PermissionsGuard
} from '@robinswood/auth';
```

**Stratégies:** Custom pour CJD80 (DevLoginStrategy, LocalStrategy, AuthentikStrategy)

**Raison:** CJD80 a une auth legacy avec Passport existante, migration progressive vers @robinswood/auth

---

## Tests

### Test Dev Login

**Avec `ENABLE_DEV_LOGIN=true`:**
```bash
curl -X POST https://cjd80.rbw.ovh/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.local","password":"anypassword"}'

# Response: 200 OK
# { "email": "admin@test.local", "role": "super_admin", ... }
```

### Test Login Standard

**Avec `ENABLE_DEV_LOGIN=false`:**
```bash
curl -X POST https://cjd80.rbw.ovh/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.local","password":"wrongpass"}'

# Response: 401 Unauthorized
# { "message": "Identifiants invalides" }
```

### Test Protection Production

**Forcer production:**
```bash
NODE_ENV=production ENABLE_DEV_LOGIN=true npm start
```

**Résultat:**
```
[AuthModule] Mode authentification: LOCAL (formulaire)
# Pas de warning dev login
# DevLoginStrategy non chargé
```

---

## Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `.npmrc` | Ajout registry Verdaccio |
| `package.json` | `@robinswood/auth@^3.1.4` |
| `.env` | `ENABLE_DEV_LOGIN=true` |
| `server/src/auth/strategies/dev-login.strategy.ts` | **Créé** - Stratégie dev login |
| `server/src/auth/auth.module.ts` | Import DevLoginStrategy + chargement conditionnel |
| `server/src/auth/auth.controller.ts` | Sélection stratégie (dev-login vs local) |
| `server/scripts/seed-test-users.ts` | **Créé** - Seeding users test |

---

## Migration Future (Optionnel)

### Utilisation Complète de @robinswood/auth

**Actuellement:** Stratégies custom + types @robinswood/auth

**Migration possible:**
1. Remplacer `LocalStrategy` custom par `LocalAuthService` de @robinswood/auth
2. Utiliser `AuthUnifiedModule.register()` au lieu de AuthModule custom
3. Créer un `IAuthStorageAdapter` pour Drizzle
4. Utiliser `PermissionsGuard` au lieu de PermissionGuard custom

**Effort estimé:** 2-3 jours
**Bénéfices:** Refresh tokens, OAuth standardisé, rate limiting, password reset intégré

---

## Troubleshooting

### Dev Login Ne S'Active Pas

**Vérifier:**
```bash
# Variables d'env
echo $NODE_ENV          # doit être ≠ production
echo $ENABLE_DEV_LOGIN  # doit être "true"

# Logs au startup
# Chercher: "[AuthModule] ⚠️  DEV LOGIN ENABLED"
```

### Utilisateurs Test Non Trouvés

**Exécuter seeding:**
```bash
cd /srv/workspace/cjd80
bun server/scripts/seed-test-users.ts
```

### Dev Login Fonctionne en Production

**Impossible par design**, mais si observé:
1. Vérifier `NODE_ENV` réellement = `production`
2. Checker logs backend pour warnings
3. Restart du container pour recharger env vars

---

## Prochaines Étapes (Optionnel)

1. **Frontend Dev Login UI:** Ajouter indicateur visuel "DEV MODE" sur login page
2. **More Test Users:** Ajouter roles spécifiques (ideas_manager, loans_manager, etc.)
3. **Migration Auth:** Adopter `AuthUnifiedModule` complet de @robinswood/auth
4. **OAuth Dev Bypass:** Créer Dev OAuth strategy pour tester flows OAuth sans Authentik

---

**Auteur:** Claude Sonnet 4.5
**Date:** 2026-01-26
**Status:** ✅ Production Ready (dev login conditionnel)
