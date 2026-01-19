# Plan de Rollback - Migration Server Actions

**Projet:** cjd80 (Boîte à Kiffs CJD)
**Migration:** NestJS API Routes → Next.js Server Actions
**Date création:** 2026-01-19
**Plan complet:** `/home/shared/ai-cli/claude/plans/steady-napping-owl.md`

---

## 🎯 Objectif du Rollback

En cas de problème durant la migration Server Actions, revenir à un état stable fonctionnel avec ZÉRO perte de données et ZÉRO downtime si possible.

---

## 🔴 Niveau 1: Feature Flags (Rollback Instantané - 0 downtime)

### Principe

Utiliser des variables d'environnement pour basculer entre Server Actions et API routes NestJS **sans redéploiement**.

### Implementation

**.env.local**
```bash
# Feature flags par domaine
NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_EVENTS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_MEMBERS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_PATRONS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_LOANS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_FINANCIAL=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_TRACKING=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_ADMIN=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_AUTH=false
```

**Composant Client (Pattern)**
```typescript
'use client'

import { useActionState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createIdea } from '@/app/actions/ideas'

export function ProposeIdeaForm() {
  const useServerActions = process.env.NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS === 'true'

  // Si feature flag activé → Server Actions
  if (useServerActions) {
    const [state, action, pending] = useActionState(createIdea, null)

    return (
      <form action={action}>
        {/* Form fields */}
      </form>
    )
  }

  // Sinon → Ancien pattern useMutation + fetch
  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed')
      return await res.json()
    },
  })

  return (
    <form onSubmit={/* old pattern */}>
      {/* Form fields */}
    </form>
  )
}
```

### Procédure Rollback Niveau 1

1. **Modifier `.env.local`** - Passer flag à `false`
   ```bash
   # Rollback immédiat
   NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS=false
   ```

2. **Redémarrer Next.js** (hot reload auto)
   ```bash
   # Si besoin de force restart
   npm run dev
   ```

3. **Vérifier** - Application revient aux API routes NestJS

**Temps rollback:** < 1 minute
**Downtime:** 0 (hot reload)
**Perte données:** 0

---

## 🟡 Niveau 2: Git Revert (Rollback Complet - downtime court)

### Principe

Revenir à un commit spécifique avant la migration en utilisant Git.

### Procédure Rollback Niveau 2

#### Option A: Git Revert (Conserve historique)

```bash
cd /srv/workspace/cjd80

# Identifier commit à rollback
git log --oneline --graph -10

# Revert le commit de migration (exemple Phase 1)
git revert <commit-hash-phase-1>

# Push
git push origin migration/server-actions

# Redéployer
npm run build
npm start
```

**Avantage:** Conserve historique Git
**Inconvénient:** Crée nouveau commit de revert

#### Option B: Git Reset Hard (Plus radical)

```bash
cd /srv/workspace/cjd80

# ⚠️ ATTENTION: Perte commits après reset
git reset --hard <commit-hash-avant-migration>

# Force push
git push --force origin migration/server-actions

# Redéployer
npm run build
npm start
```

**Avantage:** Nettoyage complet
**Inconvénient:** Perte commits (⚠️ destructif)

### Procédure Rollback depuis main

Si migration déjà mergée dans `main`:

```bash
# Créer branche hotfix
git checkout -b hotfix/rollback-server-actions

# Revert merge commit
git revert -m 1 <merge-commit-hash>

# Push + déployer
git push origin hotfix/rollback-server-actions
# Créer PR + merge + redéployer
```

**Temps rollback:** 5-10 minutes
**Downtime:** 2-5 minutes (rebuild + redémarrage)
**Perte données:** 0 (si DB inchangée)

---

## 🟢 Niveau 3: Backend NestJS Backup (Fallback permanent)

### Principe

Garder le backend NestJS **actif et accessible** pendant TOUTE la durée de la migration.

### Architecture Actuelle

```
┌─────────────────┐
│   Next.js App   │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Proxy API Route │  /app/api/[...proxy]/route.ts
│  (Next.js 16)   │  → Forward toutes requêtes /api/*
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NestJS Backend │
│   (Port 4000)   │  14 controllers, 170+ routes
│   RESTE ACTIF   │  ✅ Backup permanent
└─────────────────┘
```

### Validation Backend Actif

```bash
# Vérifier NestJS tourne
curl http://localhost:4000/health
# Doit répondre: {"status":"ok"}

# Vérifier routes API accessibles
curl http://localhost:4000/api/ideas
curl http://localhost:4000/api/events
```

### Procédure Rollback Niveau 3

Si Server Actions complètement cassées:

1. **Activer feature flags OFF** (Niveau 1)
   ```bash
   # .env.local - Tout désactiver
   NEXT_PUBLIC_USE_SERVER_ACTIONS_*=false
   ```

2. **Vérifier proxy API route** fonctionne
   ```bash
   curl http://localhost:3000/api/ideas
   # Doit fonctionner via proxy → NestJS
   ```

3. **Application revient automatiquement** au backend NestJS

**Temps rollback:** Immédiat (feature flags)
**Downtime:** 0
**Perte données:** 0

---

## 📋 Checklist Rollback par Phase

### Phase 0 (Infrastructure)
- [x] Branche `migration/server-actions` créée
- [x] Commit Phase 0: Structure /app/actions/
- [ ] Tests baseline exécutés et sauvegardés

**Rollback:**
```bash
git checkout main
git branch -D migration/server-actions
```

### Phase 1 (Public Core Routes)
- [ ] Feature flags implémentés (ideas, votes, events, inscriptions)
- [ ] Tests Playwright passent (100%)
- [ ] Screenshots baseline vs après migration identiques

**Rollback:**
```bash
# Niveau 1: Feature flags OFF
NEXT_PUBLIC_USE_SERVER_ACTIONS_IDEAS=false
NEXT_PUBLIC_USE_SERVER_ACTIONS_EVENTS=false
```

### Phase 2-7 (Admin, CRM, Financial, etc.)
- [ ] Feature flags par domaine
- [ ] Tests spécifiques par phase
- [ ] Backend NestJS reste actif

**Rollback:** Même pattern Niveau 1 + Niveau 2 si nécessaire

---

## 🚨 Procédure Urgence Production

En cas de problème CRITIQUE en production:

### 1. Évaluation Rapide (< 2 min)

```bash
# Logs Next.js
docker logs cjd80-nextjs --tail 100

# Logs NestJS
docker logs cjd80-nestjs --tail 100

# Vérifier health checks
curl https://cjd80.example.com/health
```

### 2. Rollback Immédiat (< 5 min)

**Option A: Feature Flags OFF**
```bash
# SSH production
ssh production-server

# Modifier .env.production
cd /srv/cjd80
nano .env.production
# Mettre NEXT_PUBLIC_USE_SERVER_ACTIONS_*=false

# Restart Next.js (hot reload)
docker-compose restart nextjs
```

**Option B: Rollback Git**
```bash
# Revert dernier déploiement
git revert HEAD
git push

# Redéployer version précédente
./deploy.sh
```

### 3. Communication

- Alerter équipe (Slack, email)
- Créer incident report
- Documenter cause root

### 4. Post-Mortem

- Analyser logs
- Identifier cause
- Corriger avant retry migration
- Tester en dev/staging

---

## 📊 Métriques Rollback

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Temps détection problème | < 5 min | Monitoring + alertes |
| Temps décision rollback | < 2 min | Checklist claire |
| Temps exécution rollback | < 5 min | Feature flags |
| Downtime total | < 10 min | Architecture résiliente |
| Perte données | 0 | DB inchangée |

---

## 🔍 Validation Post-Rollback

Après rollback, vérifier:

```bash
# 1. Application accessible
curl https://cjd80.example.com/

# 2. APIs NestJS fonctionnent
curl https://cjd80.example.com/api/ideas
curl https://cjd80.example.com/api/events

# 3. Tests E2E passent
npm run test:e2e

# 4. Monitoring OK
# Check Grafana dashboards
# Check error logs (0 errors)

# 5. Features critiques OK
# - Création idée
# - Vote
# - Inscription événement
```

---

## 📝 Historique Rollbacks

| Date | Phase | Raison | Niveau | Temps | Notes |
|------|-------|--------|--------|-------|-------|
| - | - | - | - | - | Aucun rollback à ce jour |

---

## 🛡️ Prévention

Pour minimiser risques rollback:

1. **Tests exhaustifs** avant chaque phase
2. **Validation manuelle** flows critiques
3. **Monitoring actif** post-déploiement
4. **Rollback dry-run** en staging
5. **Documentation** détaillée
6. **Communication** équipe

---

**Ce plan garantit un rollback rapide et sûr à tout moment de la migration.**
