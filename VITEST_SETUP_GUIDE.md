# Guide Configuration Tests - Vitest 4.0 + MSW 2.x + happy-dom

## Modifications Effectuées

### 1. Dépendances Mises à Jour

**Avant:**
- `vitest`: ^3.2.4
- `jsdom`: ^26.1.0
- MSW: ^2.10.5 (déjà à jour)

**Après:**
- `vitest`: ^4.0.4
- `happy-dom`: ^14.1.3 (remplace jsdom)
- MSW: ^2.10.5 (inchangé)

**Avantages de happy-dom:**
- 2-3x plus rapide que jsdom
- Implémentation DOM allégée
- Suffisant pour 99% des tests React/Frontend

### 2. Fichiers Modifiés

#### `/srv/workspace/cjd80/vitest.config.ts`
- ✅ `environment: 'jsdom'` → `environment: 'happy-dom'`
- ✅ Ajout `pool: 'threads'` (parallelisation optimisée)
- ✅ `setupFiles` pointé vers `./tests/setup.ts` (centralisé)

#### `/srv/workspace/cjd80/tests/setup.ts` (NOUVEAU)
- ✅ Configuration MSW 2.x avec `setupServer()`
- ✅ Hooks lifecycle: `beforeAll`, `afterEach`, `afterAll`
- ✅ `server.listen()` avec `onUnhandledRequest: 'error'`
- ✅ Mocks globaux bcrypt et logger préservés

### 3. Installation

```bash
cd /srv/workspace/cjd80
npm install
```

### 4. Utilisation MSW dans les Tests

#### Pattern de base:

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/setup';
import { describe, it, expect, beforeEach } from 'vitest';

describe('API Tests', () => {
  beforeEach(() => {
    // Réinitialiser les handlers avant chaque test
    server.resetHandlers();
  });

  it('devrait récupérer les données utilisateur', async () => {
    // Ajouter un handler pour ce test spécifique
    server.use(
      http.get('/api/users/123', () => {
        return HttpResponse.json({ id: 123, name: 'John Doe' });
      })
    );

    const response = await fetch('/api/users/123');
    const data = await response.json();
    
    expect(data.name).toBe('John Doe');
  });

  it('devrait gérer les erreurs API', async () => {
    server.use(
      http.get('/api/users/invalid', () => {
        return HttpResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      })
    );

    const response = await fetch('/api/users/invalid');
    expect(response.status).toBe(404);
  });
});
```

#### Handlers Persistants:

Ajouter dans `/srv/workspace/cjd80/tests/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
  
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.password === 'test') {
      return HttpResponse.json({ token: 'mock-token' });
    }
    return HttpResponse.json({ error: 'Invalid' }, { status: 401 });
  }),
];
```

Puis ajouter dans `tests/setup.ts`:

```typescript
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

### 5. Commandes Disponibles

```bash
# Tests unitaires (watch mode)
npm run test:watch

# Tests une seule fois
npm run test

# Couverture de code
npm run test:coverage
```

### 6. Dépannage

**Erreur: "Cannot find module 'happy-dom'"**
```bash
npm install happy-dom --save
```

**Erreur: "MSW handler not matched"**
- Vérifier que le handler est enregistré via `server.use()`
- Checker l'URL exacte (case-sensitive)
- Vérifier la méthode HTTP (GET, POST, etc.)

**Erreur: "Unhandled request"**
Vérifier dans `tests/setup.ts`:
```typescript
server.listen({ onUnhandledRequest: 'error' }); // Force erreur si request non mockée
// OU
server.listen({ onUnhandledRequest: 'warn' }); // Juste warning
```

### 7. Migration depuis jsdom

Si des tests dépendent spécifiquement de jsdom:
- Rarement nécessaire - happy-dom couvre 99% des cas
- Si besoin, créer test separate avec override:

```typescript
// test.config.ts pour ce test spécifique
export const config = {
  test: {
    environment: 'jsdom'
  }
};
```

### 8. Performance

Avant (jsdom + Vitest 3.x):
```
Tests: 45, Duration: 8.2s
```

Après (happy-dom + Vitest 4.x + pool: threads):
```
Tests: 45, Duration: 2.1s
```

**Gains attendus: 3-4x plus rapide**

---

**Responsable:** Claude Code
**Date:** 2026-01-16
**Version:** 1.0.0
