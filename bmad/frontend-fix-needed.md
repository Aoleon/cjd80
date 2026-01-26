# Frontend Next.js - Problèmes Identifiés

**Date:** 2026-01-26 14:10
**Status:** 🚨 Frontend crash après première compilation

---

## Problème Principal

Next.js démarre, compile une page, puis s'arrête immédiatement:
```
[0] GET / 200 in 2.6s (compile: 2.2s, proxy.ts: 60ms, render: 248ms)
[0] npm run dev:next exited with code 0
```

**Impact:**
- Page https://cjd80.rbw.ovh/login retourne 502 Bad Gateway
- Frontend inaccessible
- Tests Playwright impossibles

---

## Diagnostics Effectués

### 1. Erreur initiale: build-manifest.json manquant
```
Error: ENOENT: no such file or directory,
open '/app/.next/dev/server/app/_not-found/page/build-manifest.json'
```

**Solution appliquée:** `rm -rf /app/.next` + restart
**Résultat:** Erreur résolue mais nouveau problème

### 2. Next.js s'arrête après 1ère requête
- Processus [0] (npm run dev:next) s'arrête avec code 0 (succès)
- Pas d'erreur apparente dans les logs
- Backend [1] (NestJS) continue de tourner normalement

---

## Causes Possibles

1. **Configuration concurrently défectueuse**
   - `concurrently "npm run dev:next" "npm run dev:nest"`
   - Peut-être qu'un processus qui se termine force l'arrêt de l'autre?

2. **Script dev:next problématique**
   - `next dev -p 3000 --turbopack`
   - Turbopack peut avoir un bug en mode watch

3. **Healthcheck Docker trop strict**
   - Le container est marqué "healthy" mais frontend crash

4. **Mémoire insuffisante**
   - Next.js + NestJS dans le même container

---

## Solutions à Tester

### Solution 1: Séparer concurrently (RECOMMANDÉ)
Modifier package.json:
```json
"dev": "concurrently --kill-others \"npm run dev:next\" \"npm run dev:nest\""
```

Flag `--kill-others` pour éviter qu'un processus qui se termine arrête les autres.

### Solution 2: Utiliser Turbopack avec --watch
```json
"dev:next": "next dev -p 3000 --turbopack --watch"
```

### Solution 3: Passer à webpack au lieu de Turbopack
```json
"dev:next": "next dev -p 3000"
```

### Solution 4: Containers séparés (BEST PRACTICE)
Créer deux containers:
- `cjd80-frontend` (Next.js sur port 3000)
- `cjd80-backend` (NestJS sur port 5000)

Avantages:
- Isolation complète
- Redémarrages indépendants
- Plus facile à déboguer
- Meilleure scalabilité

---

## Workaround Temporaire

En attendant la fix, utiliser directement le backend pour tester:

### Tester APIs Backend
```bash
# Auth API
curl -X POST https://cjd80.rbw.ovh/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.local","password":"test"}'

# Ideas API
curl https://cjd80.rbw.ovh/api/ideas

# Events API
curl https://cjd80.rbw.ovh/api/events
```

### Tests Playwright sur localhost
Si on fixe le frontend, lancer tests en local:
```bash
cd /srv/workspace/cjd80
docker exec cjd80 sh -c "cd /app && npm run dev:next" &
sleep 10
npx playwright test tests/e2e/e2e/user-stories.spec.ts
```

---

## Modifications Apportées (mais frontend crash persiste)

### 1. Ajout Dev Login UI ✅
**Fichier:** `app/(auth)/login/page.tsx`
- Encadré avec comptes de test visible en mode dev
- Emails cliquables pour remplir automatiquement
- Variable `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` ajoutée

### 2. Redirection après login ✅
**Fichier:** `hooks/use-auth.tsx`
- Ajout `window.location.href = isAdmin ? '/admin' : '/'`
- Redirection automatique vers dashboard admin ou home

### 3. Tests Playwright créés ✅
**Fichier:** `tests/e2e/e2e/user-stories.spec.ts`
- 11 tests couvrant US-AUTH-003, US-IDEAS-001, US-EVENTS-001, US-ADMIN-001
- Tests API + Tests UI
- Comptes de test configurés

---

## Prochaine Action Immédiate

**PRIORITÉ 1:** Fixer le crash Next.js

Option recommandée: **Séparer les containers**

1. Créer `docker-compose.cjd80-separated.yml`
2. Frontend dans container dédié
3. Backend dans container dédié
4. Reverse proxy nginx les relie

**Temps estimé:** 30 minutes

**Alternative rapide:** Modifier package.json pour utiliser `--kill-others=false` dans concurrently.

---

**Auteur:** Claude Sonnet 4.5
**Statut:** 🔴 Bloqué - Frontend inaccessible
