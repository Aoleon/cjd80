# Analyse Architecture Express/NestJS

**Date:** 30 novembre 2025  
**Mise à jour:** 30 novembre 2025 - Nettoyage du code legacy mort  
**Objectif:** Clarifier l'état actuel de la migration Express → NestJS

---

## 🎯 Résumé Exécutif

**L'application est désormais 100% NestJS pour l'API.** Les fichiers Express legacy (`server/index.ts`, `server/routes.ts`) sont marqués comme deprecated et ne sont plus chargés.

---

## 🔍 État Actuel

### Point d'Entrée
| Fichier | Technologie | Utilisé | Compilé par |
|---------|------------|---------|-------------|
| `server/src/main.ts` | **NestJS** | ✅ OUI | tsup → `dist/main.js` |
| `server/index.ts` | Express | ❌ DEPRECATED | - |
| `server/routes.ts` | Express | ❌ DEPRECATED | - |

**Conclusion:** L'application utilise **NestJS comme point d'entrée unique**.

---

## 📊 Comparaison des Endpoints

### NestJS Controllers (ACTIF)
| Module | Route Préfixe | Endpoints |
|--------|---------------|-----------|
| HealthController | `/api/health` | 7 |
| StatusController | `/api` | Inclus |
| AuthController | `/api/auth` | 5 |
| AdminController | `/api/admin` | 43 |
| LogsController | `/api/logs` | Inclus |
| FinancialController | `/api/admin/finance` | 22 |
| TrackingController | `/api/tracking` | 7 |
| LoansController | `/api/loan-items` | 8 |
| PatronsController | `/api/patrons` | 25 |
| MembersController | `/api/members` + `/api/admin/members` | 23 |
| ChatbotController | `/api/admin/chatbot` | 1 |
| BrandingController | `/api/admin/branding` | 2 |
| SetupController | `/api/setup` | 4 |
| EventsController | `/api/events` | 8 |
| IdeasController | `/api/ideas` | 6 |

**Total NestJS:** ~161 endpoints actifs

### Express Legacy (INACTIF)
| Fichier | Endpoints | Statut |
|---------|-----------|--------|
| `server/routes.ts` | 174 | ❌ Non chargé |

---

## 🔗 Composants Hybrides

### 1. Session & Passport (Express middleware dans NestJS)

```typescript
// server/src/main.ts (lignes 40-45)
const expressApp = app.getHttpAdapter().getInstance() as Express;
expressApp.use(session(sessionConfig));
expressApp.use(passport.initialize());
expressApp.use(passport.session());
```

**Pourquoi hybride:** NestJS n'a pas de module session natif. On utilise l'adaptateur Express sous-jacent.

**Alternative Nest pure:** 
- Utiliser `@nestjs/passport` avec stratégies JWT uniquement (sans sessions)
- Ou créer un middleware NestJS pour `express-session`

### 2. Fichiers Statiques (Production)

```typescript
// server/src/main.ts (lignes 72-83)
if (process.env.NODE_ENV !== 'development') {
  const expressStatic = (await import('express')).default.static;
  expressApp.use(expressStatic(distPath));
  expressApp.get('*', (req, res) => { /* SPA fallback */ });
}
```

**Alternative Nest pure:**
- Utiliser `@nestjs/serve-static` module
- Installer: `npm install @nestjs/serve-static`

### 3. Vite Middleware (Développement)

```typescript
// server/src/main.ts (lignes 89-96)
await setupVite(expressApp, httpServer);
```

**Pourquoi acceptable:** En développement uniquement, pas d'impact production.

---

## ✅ Ce qui est déjà "Nest Pur"

1. **Routing API** - Tous les controllers utilisent les décorateurs NestJS
2. **Dependency Injection** - Services injectés via constructeurs
3. **Guards & Interceptors** - `JwtAuthGuard`, `PermissionGuard`, `LoggingInterceptor`
4. **Exception Filters** - `HttpExceptionFilter` global
5. **Rate Limiting** - `@nestjs/throttler`
6. **Scheduling** - `@nestjs/schedule`
7. **Configuration** - Module `ConfigModule` personnalisé

---

## 🎯 Options de Migration

### Option A: Statu Quo (Recommandé pour l'instant)

**Conserver l'architecture hybride actuelle.**

| Avantage | Inconvénient |
|----------|--------------|
| ✅ Fonctionne parfaitement | ⚠️ Dépendance Express middleware |
| ✅ Pas de risque de régression | ⚠️ Code legacy à maintenir |
| ✅ Session OAuth compatible | |

**Effort:** 0  
**Risque:** 0

### Option B: Migration Partielle

**Remplacer les fichiers statiques par `@nestjs/serve-static`.**

```typescript
// app.module.ts
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'dist/public'),
      exclude: ['/api*'],
    }),
    // ... autres modules
  ],
})
```

| Avantage | Inconvénient |
|----------|--------------|
| ✅ Plus "propre" NestJS | ⚠️ Nécessite tests de régression |
| ✅ Supprime code Express | ⚠️ Headers cache à reconfigurer |

**Effort:** 2-4h  
**Risque:** Faible

### Option C: Migration Complète (Sessions JWT)

**Remplacer les sessions Express par JWT stateless.**

| Avantage | Inconvénient |
|----------|--------------|
| ✅ 100% NestJS | ❌ Changement d'authentification |
| ✅ Scalable horizontalement | ❌ OAuth flow à adapter |
| ✅ Pas de session store | ❌ Refonte frontend login |

**Effort:** 2-3 jours  
**Risque:** Élevé (breaking changes)

---

## 🗑️ Fichiers Legacy (Statut)

### Fichiers Express Legacy

| Fichier | Lignes | Statut | Action |
|---------|--------|--------|--------|
| `server/index.ts` | 245 | ⚠️ DEPRECATED | Supprimer après 2026-01-31 |
| `server/routes.ts` | 4514 | ⚠️ DEPRECATED | Supprimer après 2026-01-31 |
| `server/auth.ts` | ~200 | ⚠️ DEPRECATED | Supprimer après 2026-01-31 |
| `server/storage.ts` | ~2000 | ✅ UTILISÉ | Conserver (utilisé par NestJS) |

**Note:** Les fichiers deprecated ont été marqués avec des commentaires `@deprecated` en haut du fichier.

### Services Legacy (Consolidés)

| Service Legacy | Service NestJS | Statut |
|---------------|----------------|--------|
| `server/services/minio-service.ts` | `server/src/integrations/minio/minio.service.ts` | ⚠️ DEPRECATED |
| `server/services/authentik-service.ts` | `server/src/integrations/authentik/authentik.service.ts` | ⚠️ DEPRECATED |
| `server/services/user-sync-service.ts` | `server/src/auth/user-sync.service.ts` | ⚠️ DEPRECATED |

**Note:** Les services legacy sont conservés pour les scripts CLI (`scripts/migrate-to-minio.ts`) mais ne sont plus utilisés par l'application principale.

---

## 📋 Recommandation

### ✅ Réalisé (30 nov 2025)
- [x] Suppression du code legacy mort dans `main.ts`
- [x] Marquage des fichiers `server/index.ts` et `server/routes.ts` comme deprecated
- [x] Marquage de `server/auth.ts` comme deprecated
- [x] Marquage des services legacy comme deprecated (minio, authentik, user-sync)
- [x] Vérification que l'API fonctionne à 100% via NestJS

### Moyen Terme (prochain sprint)
⬜ **Option B** - Migrer les fichiers statiques vers `@nestjs/serve-static`  
⬜ Supprimer définitivement les fichiers deprecated après validation (2026-01-31)  

### Long Terme (si scalabilité requise)
⬜ **Option C** - Envisager JWT stateless si multi-instance requise

---

## 🔧 Commandes de Vérification

```bash
# Vérifier que routes.ts n'est pas importé
grep -r "from.*routes" server/src/ --include="*.ts"

# Lister les imports d'index.ts
grep -r "from.*server/index" . --include="*.ts"

# Vérifier les endpoints NestJS actifs
grep -r "@(Get|Post|Put|Delete)" server/src/ --include="*.ts" | wc -l
```

---

**Conclusion:** L'application est déjà principalement NestJS. Les composants Express restants (session, static) sont des middlewares standard qui n'impactent pas la logique métier. Une migration complète n'est pas urgente mais peut être planifiée si nécessaire.

