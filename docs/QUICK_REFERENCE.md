# Guide de Référence Rapide - Outils DevOps

Guide rapide pour tous les outils installés pour le développement, le déploiement et la gestion.

## 🗄️ Base de Données PostgreSQL

```bash
# Connexion interactive
npm run db:connect

# Monitoring temps réel
npm run db:monitor

# Statistiques détaillées
npm run db:stats
```

## 🔐 SSH - Connexions Serveurs

```bash
# Configuration initiale
npm run ssh:setup check          # Vérifier les outils
npm run ssh:setup install        # Installer les outils
npm run ssh:setup setup-keys     # Configurer les clés SSH

# Connexion
npm run ssh:connect              # Mode interactif
npm run ssh:connect -s production # Serveur spécifique

# Synchronisation de fichiers
npm run ssh:sync push -s production    # Pousser vers serveur
npm run ssh:sync pull -s staging        # Tirer depuis serveur
npm run ssh:sync watch -s production    # Surveillance auto

# Tunnels SSH (port forwarding)
npm run ssh:tunnel create -s production -L 3000 -R 3000
npm run ssh:tunnel list                  # Lister les tunnels
npm run ssh:tunnel kill 3000             # Arrêter un tunnel

# Montage système de fichiers
npm run ssh:mount mount -s production -r /var/www -l ./remote
npm run ssh:mount unmount
```

## 🐳 Docker

```bash
# Gestion des conteneurs
npm run docker up              # Démarrer
npm run docker down            # Arrêter
npm run docker restart         # Redémarrer
npm run docker logs --follow   # Logs en temps réel
npm run docker status          # Statut détaillé
npm run docker health          # Vérifier la santé
npm run docker exec app bash   # Exécuter une commande
npm run docker shell app        # Ouvrir un shell

# Monitoring
npm run docker:monitor watch   # Vue d'ensemble auto-refresh
npm run docker:monitor stats   # Statistiques temps réel
npm run docker:monitor health  # Surveillance santé
npm run docker:monitor logs    # Logs temps réel

# Sauvegarde
npm run docker:backup backup --all
npm run docker:backup restore -v postgres_data -d 2025-01-20
npm run docker:backup list

# Développement
npm run docker:dev dev         # Environnement de dev
npm run docker:dev test        # Exécuter les tests
npm run docker:dev rebuild     # Reconstruire complètement
npm run docker:dev db-connect  # Connexion DB
npm run docker:dev db-migrate  # Migrations
```

## 🚀 GitHub Actions & Déploiement

```bash
# Workflows GitHub Actions
npm run gh:actions list          # Lister les workflows
npm run gh:actions status        # Statut des exécutions
npm run gh:actions test          # Tester localement
npm run gh:actions watch         # Surveiller en temps réel

# Déploiement
npm run gh:deploy deploy -e production
npm run gh:deploy status -e production
npm run gh:deploy rollback -e production
npm run gh:deploy logs -e production

# Pull Requests
npm run gh:pr create -t "Feature: ..."
npm run gh:pr list
npm run gh:pr view 123
npm run gh:pr merge 123

# Déploiement rapide (tout-en-un)
npm run deploy -e production
npm run deploy -e staging -b develop
```

## 📋 Workflows Courants

### Déploiement Complet

```bash
# 1. Vérifier les changements
git status

# 2. Synchroniser les fichiers (optionnel)
npm run ssh:sync push -s production

# 3. Déployer via GitHub Actions
npm run deploy -e production

# 4. Surveiller le déploiement
npm run gh:actions watch
```

### Développement avec Tunnel

```bash
# 1. Créer un tunnel vers la base de données
npm run ssh:tunnel create -s production -L 5432 -R 5432 -b

# 2. Se connecter à la base via le tunnel
npm run db:connect  # Utilise localhost:5432 via le tunnel

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

# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Configuration SSH (~/.ssh/config)

```ssh-config
Host production
    HostName production.example.com
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host staging
    HostName staging.example.com
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

## 🚀 Déploiement Complet

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

# Statut
npm run deploy:full status
```

## 📊 Monitoring Système

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

## 🧪 Tests Playwright

```bash
# Exécuter les tests
npm run test:playwright run
npm run test:playwright run -f tests/e2e/test.spec.ts
npm run test:playwright run --headed

# UI interactif
npm run test:playwright ui

# Déboguer
npm run test:playwright debug -f tests/e2e/test.spec.ts

# Rapports
npm run test:playwright report

# Analyse
npm run test:analyze stats
npm run test:analyze failures
npm run test:analyze flaky

# Maintenance
npm run test:maintenance clean
npm run test:maintenance update
npm run test:maintenance check
```

## 🔧 Maintenance

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

## 🆘 Dépannage

### Problème de connexion SSH
```bash
# Tester la connexion
npm run ssh:setup test-connection

# Vérifier les clés
ls -la ~/.ssh/

# Vérifier la configuration
cat ~/.ssh/config
```

### Problème de synchronisation
```bash
# Test en mode dry-run
npm run ssh:sync push -s production --dry-run

# Vérifier les permissions
npm run ssh:connect -s production
# Puis sur le serveur: ls -la /var/www
```

### Problème GitHub Actions
```bash
# Vérifier l'authentification
gh auth status

# Voir les logs détaillés
npm run gh:actions logs RUN_ID

# Tester localement
npm run gh:actions test
```

## 📚 Documentation Complète

- **Base de données**: `docs/database-tools.md`
- **SSH et GitHub**: `docs/ssh-and-github-tools.md`

