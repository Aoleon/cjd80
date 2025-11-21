# 🧪 Guide de Test du Déploiement Automatique

**Date :** 2025-01-29  
**Objectif :** Tester le déploiement automatique via tags Git

## 📋 Prérequis

Avant de tester, assurez-vous que :

- ✅ Les secrets GitHub Actions sont configurés (`VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`)
- ✅ L'environnement `production-cjd80` est configuré dans GitHub
- ✅ Le serveur server1 est accessible et configuré
- ✅ Le workflow `.github/workflows/deploy.yml` est à jour

## 🧪 Test 1 : Déploiement via Tag Git

### Étape 1 : Préparer le test

```bash
# 1. S'assurer que vous êtes sur main et à jour
git checkout main
git pull origin main

# 2. Vérifier que vous avez les dernières modifications
git log --oneline -5
```

### Étape 2 : Créer un tag de test

```bash
# Créer un tag de test (ex: v0.0.1-test)
git tag v0.0.1-test -m "Test déploiement automatique"

# Pousser le tag
git push origin v0.0.1-test
```

### Étape 3 : Vérifier le déclenchement

1. Allez sur **GitHub** → **Actions**
2. Vérifiez que le workflow **🚀 Deploy Multi-Servers** s'est déclenché
3. Cliquez sur le workflow en cours
4. Vérifiez que :
   - ✅ Le job `build-and-push` démarre
   - ✅ Le job `deploy` démarre pour server1
   - ✅ Tous les jobs sont verts

### Étape 4 : Vérifier les logs

Dans les logs du workflow, vérifiez :

1. **Build & Push :**
   - ✅ Image tag généré : `ghcr.io/aoleon/cjd80:0.0.1-test`
   - ✅ Image tag avec v : `ghcr.io/aoleon/cjd80:v0.0.1-test`
   - ✅ Latest tag : `ghcr.io/aoleon/cjd80:latest`
   - ✅ Build réussi
   - ✅ Push vers GHCR réussi

2. **Deploy :**
   - ✅ Connexion SSH réussie
   - ✅ Authentification GHCR réussie
   - ✅ Pull de l'image réussi
   - ✅ Script de déploiement exécuté
   - ✅ Health check réussi

### Étape 5 : Vérifier sur le serveur

```bash
# Se connecter au serveur
ssh thibault@141.94.31.162

# Vérifier l'image Docker
docker images | grep cjd80

# Vous devriez voir :
# ghcr.io/aoleon/cjd80    v0.0.1-test    ...
# ghcr.io/aoleon/cjd80    0.0.1-test     ...
# ghcr.io/aoleon/cjd80    latest         ...

# Vérifier le conteneur
cd /docker/cjd80
docker compose ps

# Vérifier les logs
docker compose logs --tail=50 cjd-app

# Vérifier le health check
curl http://localhost:5000/api/health
```

### Étape 6 : Vérifier l'application en production

```bash
# Health check public
curl https://cjd80.fr/api/health

# Vérifier que l'application répond
curl https://cjd80.fr
```

## 🧪 Test 2 : Déploiement via Push sur main

### Étape 1 : Faire un commit de test

```bash
# Créer un fichier de test
echo "# Test deployment" > test-deploy.md
git add test-deploy.md
git commit -m "test: test deployment via main push"
git push origin main
```

### Étape 2 : Vérifier le déclenchement

1. Allez sur **GitHub** → **Actions**
2. Vérifiez que le workflow s'est déclenché
3. Vérifiez que l'image tag utilise le SHA : `ghcr.io/aoleon/cjd80:main-{SHA}`

## 🧪 Test 3 : Déploiement manuel via Workflow Dispatch

### Étape 1 : Déclencher manuellement

1. Allez sur **GitHub** → **Actions** → **🚀 Deploy Multi-Servers**
2. Cliquez sur **Run workflow**
3. Choisissez :
   - **Branch :** `main`
   - **Server :** `server1`
4. Cliquez sur **Run workflow**

### Étape 2 : Vérifier le déploiement

Suivez les mêmes étapes que pour le Test 1.

## ✅ Checklist de Validation

Après chaque test, vérifiez :

- [ ] Le workflow s'est déclenché correctement
- [ ] Tous les jobs sont verts
- [ ] L'image Docker a été créée avec les bons tags
- [ ] L'image a été poussée vers GHCR
- [ ] Le déploiement sur le serveur a réussi
- [ ] Le conteneur est en cours d'exécution
- [ ] Le health check répond correctement
- [ ] L'application est accessible publiquement

## 🐛 Dépannage

### Le workflow ne se déclenche pas

**Problème :** Le tag n'a pas déclenché le workflow

**Solutions :**
1. Vérifiez que le tag suit le format `v*.*.*` (ex: `v1.0.0`)
2. Vérifiez que le tag a été poussé : `git push origin v1.0.0`
3. Vérifiez les logs GitHub Actions

### L'image n'est pas créée

**Problème :** Le build échoue

**Solutions :**
1. Vérifiez les logs du job `build-and-push`
2. Vérifiez que `Dockerfile` existe et est valide
3. Vérifiez que les dépendances sont installées

### Le déploiement échoue

**Problème :** Le job `deploy` échoue

**Solutions :**
1. Vérifiez les secrets GitHub Actions
2. Vérifiez la connexion SSH
3. Vérifiez que le serveur est accessible
4. Vérifiez les logs du serveur : `docker compose logs cjd-app`

### Le health check échoue

**Problème :** Le health check ne répond pas

**Solutions :**
1. Vérifiez que le conteneur est en cours d'exécution : `docker compose ps`
2. Vérifiez les logs : `docker compose logs cjd-app`
3. Vérifiez que le port 5000 est accessible
4. Vérifiez la configuration Traefik

## 📊 Résultats Attendus

### Pour un Tag Git (v1.0.0)

```
✅ Workflow déclenché automatiquement
✅ Image tag : ghcr.io/aoleon/cjd80:1.0.0
✅ Image tag avec v : ghcr.io/aoleon/cjd80:v1.0.0
✅ Latest tag : ghcr.io/aoleon/cjd80:latest
✅ Déploiement sur server1 réussi
✅ Health check réussi
✅ Application accessible sur https://cjd80.fr
```

### Pour un Push sur main

```
✅ Workflow déclenché automatiquement
✅ Image tag : ghcr.io/aoleon/cjd80:main-{SHA}
✅ Latest tag : ghcr.io/aoleon/cjd80:latest
✅ Déploiement sur server1 réussi
✅ Health check réussi
✅ Application accessible sur https://cjd80.fr
```

## 🎯 Prochaines Étapes

Après validation des tests :

1. ✅ Supprimer le tag de test : `git push origin --delete v0.0.1-test`
2. ✅ Créer un tag de production : `git tag v1.0.0`
3. ✅ Pousser le tag : `git push origin v1.0.0`
4. ✅ Vérifier le déploiement en production

## 📚 Documentation Complémentaire

- `docs/deployment/VERSIONING.md` : Guide complet du versionnement
- `docs/deployment/DEPLOYMENT_TAGS_SETUP.md` : Configuration du déploiement sur tags
- `docs/deployment/SERVERS_CONFIG.md` : Configuration des serveurs

