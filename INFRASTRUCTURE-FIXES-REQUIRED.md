# Corrections Requises - Infrastructure CJD80

## Priorité CRITIQUE

### 1. Corriger l'erreur de build Next.js

**Fichier concerné**: `server/app/(protected)/admin/branding/page.tsx`

**Erreur**:
```
TypeError: Cannot read properties of null (reading 'useState')
```

**Actions**:
- Analyser l'utilisation des hooks React dans cette page
- Vérifier que useState est importé correctement depuis 'react'
- S'assurer qu'aucun hook n'est utilisé conditionnellement
- Vérifier que la page utilise 'use client' si nécessaire

**Test de validation**:
```bash
cd /srv/workspace/cjd80
npm run build
# Doit se terminer sans erreur
```

### 2. Corriger la configuration DATABASE_URL

**Fichier**: `/srv/workspace/cjd80/.env`

**Modification**:
```env
# Avant:
DATABASE_URL=postgresql://devuser:pUhk3vwiflaanYbbyLhpYvdllxsLpW2@dev_postgres:5432/cjd80

# Après (pour tests locaux):
DATABASE_URL=postgresql://devuser@localhost:5434/cjd80

# Ou (pour utiliser cjd-postgres):
DATABASE_URL=postgresql://devuser@localhost:5436/cjd80
```

**Test de validation**:
```bash
docker exec dev_postgres psql -U devuser -d cjd80 -c "SELECT 1"
# Doit retourner "1"
```

## Priorité MOYENNE

### 3. Corriger le healthcheck Docker

**Fichier**: `/srv/workspace/docker-compose.apps.yml`

**Section cjd80**:
```yaml
# Avant:
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1"]
  
# Après:
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:5001 || exit 1"]
```

**Ou aligner le PORT de l'application**:
```yaml
environment:
  - PORT=5000  # Au lieu de 5001 dans le code
```

### 4. Configurer les variables d'environnement VAPID

**Fichier**: `/srv/workspace/cjd80/.env`

**Ajouter**:
```env
VAPID_PUBLIC_KEY=<clé publique VAPID valide base64>
VAPID_PRIVATE_KEY=<clé privée VAPID valide>
```

**Générer des clés**:
```bash
npx web-push generate-vapid-keys
```

## Priorité BASSE (Optionnel)

### 5. Configurer Authentik (si requis en production)

```env
AUTHENTIK_BASE_URL=https://authentik.example.com
AUTHENTIK_CLIENT_ID=<client-id>
AUTHENTIK_CLIENT_SECRET=<client-secret>
AUTHENTIK_ISSUER=https://authentik.example.com/application/o/cjd80/
```

### 6. Configurer SMTP (si emails requis)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@example.com
```

## Validation Finale

Après avoir appliqué les corrections critiques, exécuter:

```bash
cd /srv/workspace/cjd80

# 1. Rebuild
npm install --legacy-peer-deps
npm run build

# 2. Démarrer le serveur
PORT=5001 NODE_ENV=test DATABASE_URL="postgresql://devuser@localhost:5434/cjd80" npx tsx --tsconfig tsconfig.server.json server/src/main.ts &

# 3. Attendre le démarrage (30 secondes)
sleep 30

# 4. Tester le health endpoint
curl -s http://localhost:5001/api/health | jq

# 5. Exécuter les tests Playwright
npm run test:playwright -- run -f tests/e2e/e2e/health-checks.spec.ts

# 6. Vérifier le rapport
npm run test:playwright -- report
```

## Résultat Attendu

Après corrections:
- Build Next.js: ✅ Succès
- Serveur démarre: ✅ Port 5001 en écoute
- `/api/health`: ✅ Retourne JSON avec status healthy
- Tests Playwright: ✅ 11/11 passent
- Container Docker: ✅ Health status = healthy

---

**Date**: 2026-01-23
**Rapport complet**: `/srv/workspace/cjd80/tests/e2e/infrastructure-health-report.md`
