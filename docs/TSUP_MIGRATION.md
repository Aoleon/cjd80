# Migration vers tsup - Guide de Configuration

**Date:** 2025-11-30  
**Problème résolu:** Injection de dépendances NestJS avec tsx/esbuild

## Contexte

L'application NestJS utilisait `tsx` (basé sur esbuild) pour la transpilation TypeScript. Cependant, esbuild ne supporte pas correctement `emitDecoratorMetadata`, ce qui est essentiel pour l'injection de dépendances NestJS.

## Symptômes du Problème

- Tous les services injectés étaient `undefined` dans les controllers
- Erreurs `TypeError: Cannot read properties of undefined (reading 'methodName')`
- L'application démarrait mais aucun endpoint ne fonctionnait

## Solution Implémentée

### 1. Installation de tsup

```bash
npm install --save-dev tsup
```

### 2. Configuration tsup (`tsup.config.ts`)

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server/src/main.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: false,
  dts: false,
  tsconfig: 'tsconfig.server.json',
  external: [
    './vite.config.js',
    '../vite.config.js',
  ],
  skipNodeModulesBundle: true,
  esbuildOptions(options) {
    options.keepNames = true;
    options.mainFields = ['module', 'main'];
  },
  banner: {
    js: `import "reflect-metadata";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);`,
  },
});
```

### 3. Corrections des imports Express

Changer les imports de types Express de :
```typescript
import { Request, Response } from 'express';
```

À :
```typescript
import type { Request, Response } from 'express';
```

**Fichiers modifiés:**
- `server/src/auth/auth.controller.ts`
- `server/src/integrations/vite/vite.middleware.ts`
- `server/src/common/filters/http-exception.filter.ts`

### 4. Configuration du proxy Vite (`vite.config.ts`)

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    },
  },
},
```

## Scripts de Développement

```json
{
  "dev": "concurrently \"tsup && dotenv -e .env -- node dist/main.js\" \"vite --port 5173\"",
  "dev:api": "tsup && dotenv -e .env -- node dist/main.js",
  "dev:client": "vite --port 5173"
}
```

## Architecture de Développement

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend (Vite)   │────▶│   API (NestJS)      │
│   Port: 5173        │     │   Port: 5001        │
│                     │     │                     │
│   /api/* ─────────────────▶ Routes API          │
│   /* ──▶ Assets     │     │                     │
└─────────────────────┘     └─────────────────────┘
```

## Pourquoi tsup ?

| Transpiler | emitDecoratorMetadata | Vitesse | Stabilité |
|------------|----------------------|---------|-----------|
| tsx/esbuild | ❌ Non supporté | ⚡ Très rapide | ✅ Stable |
| ts-node | ✅ Supporté | 🐢 Lent | ✅ Stable |
| tsup | ✅ Supporté | ⚡ Rapide | ✅ Stable |
| SWC | ✅ Supporté | ⚡⚡ Très rapide | ⚠️ Config complexe |

tsup offre le meilleur compromis entre compatibilité avec les décorateurs NestJS et vitesse de compilation.

## Vérification

```bash
# Compiler avec tsup
npx tsup

# Vérifier que le bundle existe
ls -la dist/main.js

# Démarrer et tester
node dist/main.js &
curl http://localhost:5001/api/health
```

## Troubleshooting

### Erreur: "Named export 'Request' not found"

Utiliser `import type` au lieu de `import` pour les types Express.

### Erreur: "Cannot find module 'vite.config.js'"

Le middleware Vite n'est pas disponible en mode bundle. Utiliser le proxy Vite pour le développement.

### Services toujours undefined

Vérifier que `reflect-metadata` est importé au tout début de `main.ts`:
```typescript
import 'reflect-metadata';
```

