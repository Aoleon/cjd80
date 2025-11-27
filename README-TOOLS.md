# 🛠️ Outils de Développement - Guide Complet

Ce projet inclut une suite complète d'outils pour le développement, le déploiement et la gestion.

## 📚 Documentation

- **[Guide de Référence Rapide](docs/QUICK_REFERENCE.md)** - Commandes essentielles
- **[Outils Base de Données](docs/database-tools.md)** - PostgreSQL
- **[Outils SSH et GitHub](docs/ssh-and-github-tools.md)** - SSH, GitHub Actions, Déploiement

## 🚀 Démarrage Rapide

### 1. Vérification de Santé

```bash
npm run health
```

Vérifie l'état de tous les outils et la configuration.

### 2. Configuration Initiale

```bash
# Outils SSH
npm run ssh:setup check
npm run ssh:setup install
npm run ssh:setup setup-keys

# Base de données
npm run db:connect  # Test de connexion

# GitHub
npm run gh:auth     # Authentification
```

## 📋 Commandes par Catégorie

### Base de Données PostgreSQL

```bash
npm run db:connect   # Connexion interactive (pgcli)
npm run db:monitor   # Monitoring temps réel (pg_activity)
npm run db:stats     # Statistiques détaillées
```

### SSH - Connexions Serveurs

```bash
# Configuration
npm run ssh:setup check
npm run ssh:setup install
npm run ssh:setup setup-keys

# Connexion
npm run ssh:connect
npm run ssh:connect -s production

# Synchronisation
npm run ssh:sync push -s production
npm run ssh:sync pull -s staging
npm run ssh:sync watch -s production

# Tunnels
npm run ssh:tunnel create -s production -L 3000 -R 3000
npm run ssh:tunnel list

# Montage
npm run ssh:mount mount -s production
npm run ssh:mount unmount
```

### Docker

```bash
# Gestion
npm run docker up
npm run docker down
npm run docker restart
npm run docker logs --follow
npm run docker status
npm run docker health

# Monitoring
npm run docker:monitor watch
npm run docker:monitor stats
npm run docker:monitor health

# Sauvegarde
npm run docker:backup backup --all
npm run docker:backup restore -v VOLUME -d DATE

# Développement
npm run docker:dev dev
npm run docker:dev test
npm run docker:dev rebuild
npm run docker:dev db-connect
```

### Déploiement Complet

```bash
# Déploiement local
npm run deploy:full local --build

# Déploiement distant
npm run deploy:full remote -s production

# Déploiement GitHub Actions
npm run deploy:full github -e production

# Déploiement complet
npm run deploy:full full -e production -s production --build --migrate

# Rollback
npm run deploy:full rollback -e production -s production
```

### Monitoring Système

```bash
# Vue d'ensemble
npm run monitor overview

# Monitoring spécifique
npm run monitor docker
npm run monitor database
npm run monitor system

# Surveillance continue
npm run monitor watch
```

### Tests Playwright

```bash
# Exécuter les tests
npm run test:playwright run
npm run test:playwright ui
npm run test:playwright debug -f tests/e2e/test.spec.ts

# Analyse
npm run test:analyze stats
npm run test:analyze failures
npm run test:analyze flaky

# Maintenance
npm run test:maintenance clean
npm run test:maintenance update
npm run test:maintenance check
```

### Maintenance

```bash
# Nettoyage
npm run maintenance clean

# Optimisation
npm run maintenance optimize

# Sauvegarde
npm run maintenance backup

# Maintenance complète
npm run maintenance full
```

### GitHub Actions & Déploiement

```bash
# Workflows
npm run gh:actions list
npm run gh:actions status
npm run gh:actions test
npm run gh:actions watch

# Déploiement
npm run gh:deploy deploy -e production
npm run gh:deploy status -e production
npm run gh:deploy rollback -e production

# Pull Requests
npm run gh:pr create -t "Feature: ..."
npm run gh:pr list
npm run gh:pr merge 123

# Déploiement rapide
npm run deploy -e production
```

## 🎯 Workflows Courants

### Déploiement Complet

```bash
# Option 1: Déploiement rapide (recommandé)
npm run deploy -e production

# Option 2: Étape par étape
npm run ssh:sync push -s production
npm run gh:deploy deploy -e production
npm run gh:actions watch
```

### Développement avec Accès Distant

```bash
# 1. Créer un tunnel vers la DB
npm run ssh:tunnel create -s production -L 5432 -R 5432 -b

# 2. Se connecter à la base
npm run db:connect

# 3. Arrêter le tunnel
npm run ssh:tunnel kill 5432
```

### Synchronisation Continue

```bash
# Surveiller et synchroniser automatiquement
npm run ssh:sync watch -s staging
```

## 🔧 Configuration

### Variables d'Environnement (.env)

```env
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db

# SSH
SSH_HOST=production.example.com
SSH_USER=deploy
SSH_PORT=22
SSH_KEY=~/.ssh/id_ed25519
SSH_REMOTE_PATH=/var/www/app
SSH_LOCAL_PATH=./remote

# Synchronisation
SYNC_LOCAL_PATH=.
SYNC_REMOTE_PATH=~/app
```

### Configuration SSH (~/.ssh/config)

```ssh-config
Host production
    HostName production.example.com
    User deploy
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
```

## 🆘 Dépannage

### Vérification de Santé

```bash
npm run health
```

### Problèmes Courants

**Connexion SSH échoue:**
```bash
npm run ssh:setup test-connection
npm run ssh:setup setup-keys
```

**Synchronisation lente:**
```bash
npm run ssh:sync push -s production --dry-run  # Vérifier d'abord
```

**GitHub Actions ne se déclenche pas:**
```bash
npm run gh:actions list
npm run gh:auth status
```

## 📖 Documentation Complète

Consultez les guides détaillés:
- `docs/QUICK_REFERENCE.md` - Référence rapide
- `docs/database-tools.md` - Outils PostgreSQL
- `docs/ssh-and-github-tools.md` - SSH et GitHub Actions

