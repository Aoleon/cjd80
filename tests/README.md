# Tests Configuration - Vitest 4.0 + MSW 2.x

Ce dossier contient la configuration centralisée des tests pour le projet CJD80.

## Structure

- `setup.ts` - Configuration MSW 2.x et mocks globaux
- `handlers.ts` (optionnel) - Handlers HTTP réutilisables
- Autres fichiers: tests spécifiques

## Mise en Route

```bash
cd /srv/workspace/cjd80

# Installer les dépendances
npm install

# Lancer les tests
npm run test

# Lancer en watch mode
npm run test:watch

# Générer couverture
npm run test:coverage
```

## Configuration

- **Environment:** happy-dom (2-3x plus rapide que jsdom)
- **Pool:** threads (parallelisation optimisée)
- **Coverage Provider:** v8
- **MSW:** 2.x avec server.listen()

## Documentation Complète

Voir `/srv/workspace/cjd80/VITEST_SETUP_GUIDE.md`
