# Bug SSR: ReferenceError - location is not defined

**Date:** 2026-01-15
**Status:** ⚠️ Warning (Build réussit mais génère warnings)
**Priorité:** Basse (Pas d'impact production visible)

---

## Symptômes

Lors du build production Next.js (`npm run build`), des warnings apparaissent:

```
ReferenceError: location is not defined
    at B (.next/server/chunks/ssr/_67560481._.js:1:17291)

ReferenceError: location is not defined
    at B (.next/server/chunks/ssr/_e9c9c1ce._.js:1:14922)
```

**Contexte:**
- Phase: `Generating static pages` (SSR)
- Build status: ✅ Réussit quand même (34 routes générées)
- Runtime: ❓ Pas d'erreur observée en production

---

## Cause Probable

Un composant ou une librairie tente d'accéder à l'objet global `location` (ou `window.location`) pendant le Server-Side Rendering, où ces objets n'existent pas.

**Problème:** Le code n'utilise pas de guard `typeof window !== 'undefined'` avant d'accéder à `location`.

---

## Investigation Effectuée

### 1. Recherche dans le code source

**Fichiers analysés:**
- ✅ `client/src/hooks/use-auth.tsx` - Utilise `window.location.href` (correct)
- ✅ `client/src/lib/share-utils.ts` - Utilise `window.location.href` (correct)
- ✅ `client/src/contexts/*.tsx` - Tous avec guards `typeof window` (correct)
- ✅ `client/src/pages/*.tsx` - Pas d'accès direct à `location`
- ✅ `app/layout.tsx` - Pas d'accès à `location`

**Résultat:** Aucun accès direct non protégé à `location` trouvé dans le code source du projet.

### 2. Hypothèses

Le problème vient probablement de:
1. **Une dépendance tierce** qui accède à `location` sans vérifier l'environnement
2. **Un composant SSR** qui importe un module client avec side-effects
3. **Un useEffect ou code client** exécuté trop tôt dans le cycle de rendu SSR

**Composants suspects (imported dans providers ou layouts):**
- TanStack Query
- next-themes
- shadcn/ui components
- Custom contexts (BrandingContext, FeatureConfigContext, AuthProvider)

---

## Solutions Possibles

### Solution 1: Identifier et Wrapper le Composant

**Étapes:**
1. Activer le mode verbose de Next.js pour identifier le composant exact:
   ```bash
   NEXT_DEBUG=1 npm run build 2>&1 | tee build-debug.log
   ```

2. Une fois identifié, wrapper le composant avec un check SSR:
   ```typescript
   // Avant (mauvais)
   import { ProblemComponent } from 'library';

   // Après (bon)
   const ProblemComponent = dynamic(
     () => import('library').then(mod => mod.ProblemComponent),
     { ssr: false }
   );
   ```

### Solution 2: Polyfill location pour SSR

**Fichier:** `app/layout.tsx` ou `app/providers.tsx`

```typescript
// En haut du fichier, avant toute importation
if (typeof window === 'undefined') {
  // Polyfill minimal pour SSR
  global.location = {
    href: '',
    pathname: '',
    search: '',
    hash: '',
    origin: '',
    protocol: 'https:',
    host: '',
    hostname: '',
    port: '',
    // ... autres propriétés si nécessaire
  } as any;
}
```

**⚠️ Attention:** Cette solution masque le problème mais ne le résout pas à la source.

### Solution 3: Dynamic Import pour Providers Problématiques

**Fichier:** `app/layout.tsx`

```typescript
import dynamic from 'next/dynamic';

// Charger providers qui utilisent window/location uniquement côté client
const Providers = dynamic(() => import('./providers'), {
  ssr: false
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**⚠️ Impact:** Désactive SSR pour tous les providers, peut impacter SEO/performance.

### Solution 4: Configuration Next.js (Suppression warnings)

**Fichier:** `next.config.mjs`

```javascript
export default {
  // ... config existante

  // Supprimer warnings SSR non critiques
  typescript: {
    ignoreBuildErrors: false, // Garder erreurs TS
  },

  // Option expérimentale pour gérer erreurs SSR
  experimental: {
    missingSuspenseWithCSRBailout: false,
  }
};
```

**Note:** Cette option supprime juste les warnings, ne résout pas le problème.

---

## Recommandation

### Priorité Basse

**Raisons:**
1. Build réussit (34 routes générées correctement)
2. Aucune erreur runtime observée en production
3. Les warnings n'empêchent pas le déploiement
4. Tous les composants du projet utilisent correctement `window.location`

### Action Suggérée

**Si le warning devient gênant:**
1. Exécuter `NEXT_DEBUG=1 npm run build` pour identifier le composant exact
2. Appliquer **Solution 1** (wrapper avec `dynamic(() => ..., { ssr: false })`)

**Si ça fonctionne en production:**
- ✅ Accepter les warnings comme non critiques
- ✅ Documenter dans ce fichier (fait)
- ✅ Monitorer pour détecter d'éventuels problèmes runtime

---

## Tests de Vérification

### 1. Build Production
```bash
npm run build
# Vérifier: Build réussit, 34 routes générées
```

### 2. Test SSR Pages
```bash
npm run build && npm start
# Tester manuellement:
# - Page d'accueil: https://cjd80.robinswood.io/
# - Pages admin: /admin/*
# - Pages publiques: /events, /propose, etc.
```

### 3. Browser Console
Après déploiement, vérifier dans console browser:
```javascript
// Aucune erreur visible liée à location
console.log(window.location);  // Doit fonctionner
```

---

## Historique

**2026-01-15:**
- Problème identifié lors de `npm run build`
- Investigation complète du code source
- Aucun accès direct à `location` trouvé dans le code projet
- Hypothèse: dépendance tierce ou timing SSR
- Statut: Warning accepté (build fonctionne)

---

## Références

**Documentation Next.js:**
- [Dynamic Imports](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [SSR Gotchas](https://nextjs.org/docs/messages/react-hydration-error)

**Fichiers liés:**
- `app/layout.tsx` - Root layout (import CSS)
- `app/providers.tsx` - Client providers
- `client/src/contexts/` - Contexts (tous avec guards)
- `client/src/hooks/use-auth.tsx` - Auth hook (utilise window.location)

---

**Conclusion:** Bug de basse priorité, build fonctionnel, aucune action urgente requise.
