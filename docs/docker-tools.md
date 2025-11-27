# Outils Docker - Guide Complet

Ce document décrit les outils et scripts pour gérer Docker de manière efficace, au-delà des simples commandes `docker-compose`.

## 🎯 Pourquoi ces Outils?

Les scripts Docker fournis offrent:
- **Interface enrichie** : Commandes plus intuitives que `docker-compose`
- **Monitoring avancé** : Surveillance en temps réel avec auto-refresh
- **Sauvegarde automatique** : Gestion des volumes et restauration
- **Workflow développement** : Commandes optimisées pour le dev quotidien
- **Compatibilité** : Détection automatique docker-compose v1/v2, macOS/Linux

## 🛠️ Scripts Disponibles

### 1. **docker-manage.sh** - Gestion Complète des Conteneurs

Remplace les commandes `docker-compose` basiques par une interface plus riche.

```bash
# Démarrer
npm run docker up
npm run docker up --build

# Arrêter
npm run docker down
npm run docker down --force

# Redémarrer
npm run docker restart
npm run docker restart -s app

# Logs
npm run docker logs
npm run docker logs --follow
npm run docker logs -s app --tail 50

# Exécuter des commandes
npm run docker exec app npm test
npm run docker shell app
npm run docker shell db

# Construire
npm run docker build
npm run docker build --no-cache

# Statut et santé
npm run docker status
npm run docker health
npm run docker ps
npm run docker stats
npm run docker top
```

### 2. **docker-monitor.sh** - Monitoring en Temps Réel

Surveille les conteneurs, logs et métriques en temps réel.

```bash
# Statistiques en temps réel
npm run docker:monitor stats

# Logs en temps réel
npm run docker:monitor logs
npm run docker:monitor logs -s app

# Surveillance de la santé
npm run docker:monitor health
npm run docker:monitor health --interval 5

# Vue d'ensemble avec auto-refresh
npm run docker:monitor watch
npm run docker:monitor watch --interval 3

# Événements Docker
npm run docker:monitor events
```

### 3. **docker-backup.sh** - Sauvegarde et Restauration

Gère les sauvegardes des volumes Docker.

```bash
# Sauvegarder
npm run docker:backup backup --all
npm run docker:backup backup -v postgres_data

# Restaurer
npm run docker:backup restore -v postgres_data -d 2025-01-20

# Lister les sauvegardes
npm run docker:backup list

# Exporter/Importer
npm run docker:backup export postgres_data
npm run docker:backup import postgres_data backup.tar
```

### 4. **docker-dev.sh** - Commandes de Développement

Facilite le développement quotidien avec Docker.

```bash
# Initialiser un projet
npm run docker:dev init

# Environnement de développement
npm run docker:dev dev

# Tests et linting
npm run docker:dev test
npm run docker:dev lint

# Construction
npm run docker:dev build
npm run docker:dev rebuild

# Réinitialisation complète
npm run docker:dev reset

# Base de données
npm run docker:dev db-connect
npm run docker:dev db-migrate
npm run docker:dev db-seed

# Utilitaires
npm run docker:dev logs-follow
npm run docker:dev shell
```

## 📋 Workflows Courants

### Développement Quotidien

```bash
# 1. Démarrer l'environnement
npm run docker:dev dev

# 2. Suivre les logs
npm run docker:dev logs-follow

# 3. Ouvrir un shell
npm run docker:dev shell

# 4. Exécuter les tests
npm run docker:dev test
```

### Monitoring

```bash
# Vue d'ensemble
npm run docker:monitor watch

# Statistiques détaillées
npm run docker:monitor stats

# Santé des conteneurs
npm run docker:monitor health
```

### Sauvegarde

```bash
# Sauvegarder tous les volumes
npm run docker:backup backup --all

# Voir les sauvegardes
npm run docker:backup list

# Restaurer si nécessaire
npm run docker:backup restore -v postgres_data -d 2025-01-20
```

## 🔧 Configuration

### Fichier docker-compose.yml

Les scripts détectent automatiquement:
- `docker-compose.yml`
- `docker-compose.yaml`
- `.docker/docker-compose.yml`

Ou spécifiez avec `-f FILE`:

```bash
npm run docker up -f docker-compose.prod.yml
```

### Variables d'Environnement

```env
# Répertoire de sauvegarde
BACKUP_DIR=./backups

# Fichier docker-compose par défaut
COMPOSE_FILE=docker-compose.yml
```

## 🖥️ Compatibilité macOS / Linux

Tous les scripts fonctionnent sur macOS (développement) et Linux (serveurs). Ils détectent automatiquement:
- `docker-compose` (v1) ou `docker compose` (v2)
- L'environnement d'exécution
- Les outils disponibles

## 📚 Commandes Docker Natives

Les scripts utilisent les commandes Docker natives, donc compatibles avec:
- Docker Desktop (macOS/Windows)
- Docker Engine (Linux)
- Docker Swarm
- Kubernetes (via docker-compose)

## 🆘 Dépannage

### Docker n'est pas en cours d'exécution

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### Conteneurs ne démarrent pas

```bash
# Voir les logs
npm run docker logs

# Vérifier la santé
npm run docker health

# Reconstruire
npm run docker:dev rebuild
```

### Problèmes de volumes

```bash
# Voir les volumes
docker volume ls

# Inspecter un volume
docker volume inspect VOLUME_NAME

# Nettoyer
npm run docker clean
```

## 💡 Astuces

### Alias Utiles

Ajoutez dans votre `~/.zshrc` ou `~/.bashrc`:

```bash
alias dk='npm run docker'
alias dkm='npm run docker:monitor'
alias dkb='npm run docker:backup'
alias dkd='npm run docker:dev'
```

### Scripts Personnalisés

Créez vos propres scripts dans `scripts/` et ajoutez-les à `package.json`:

```json
"scripts": {
  "docker:custom": "./scripts/my-custom-docker-script.sh"
}
```

