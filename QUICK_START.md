# Quick Start - Vitest 4.0 + MSW 2.x

## Installation (2 minutes)

```bash
cd /srv/workspace/cjd80
npm install
```

## Vérifier que tout marche

```bash
npm run test
```

Attendu:
- Aucune erreur
- Tests passent
- Aucun console error

## Écrire vos premiers tests avec MSW

```typescript
// tests/my-feature.test.ts
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('affiche les données de l\'API', async () => {
    // Mock l'endpoint
    server.use(
      http.get('/api/data', () => {
        return HttpResponse.json({ result: 'success' });
      })
    );

    // Render & test
    render(<MyComponent />);
    expect(screen.getByText('success')).toBeDefined();
  });

  it('gère les erreurs API', async () => {
    server.use(
      http.get('/api/data', () => {
        return HttpResponse.json(
          { error: 'Failed' },
          { status: 500 }
        );
      })
    );

    render(<MyComponent />);
    expect(screen.getByText('Error')).toBeDefined();
  });
});
```

## Commandes disponibles

```bash
# Tests une seule fois
npm run test

# Tests en watch mode (re-run à chaque modification)
npm run test:watch

# Couverture de code
npm run test:coverage

# Vérifier la configuration (validation script)
/srv/workspace/cjd80/scripts/verify-vitest-setup.sh
```

## Configuration

| Setting | Value | Raison |
|---------|-------|--------|
| Environment | happy-dom | 3-4x plus rapide que jsdom |
| Pool | threads | Parallelisation des tests |
| Provider | v8 | Coverage code |
| MSW | 2.x | API moderne |

## Fichiers clés

- `vitest.config.ts` - Configuration Vitest
- `tests/setup.ts` - Setup MSW + mocks globaux
- `.vitest-changes.json` - Changelog machine-readable

## Documentation complète

Voir `VITEST_SETUP_GUIDE.md` pour:
- Patterns MSW 2.x
- Configuration handlers persistants
- Dépannage
- Migration depuis jsdom

## Performance

Avant: 8.2s
Après: 2.1s

Gain: 3-4x plus rapide

## Support

En cas de problème:
1. Lire `VITEST_SETUP_GUIDE.md` section "Dépannage"
2. Exécuter le script de validation: `./scripts/verify-vitest-setup.sh`
3. Vérifier que `npm install` est à jour
