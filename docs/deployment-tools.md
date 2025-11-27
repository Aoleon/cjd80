# Outils de Déploiement et Maintenance - Guide Complet

Ce document décrit les outils avancés pour le déploiement complet, le monitoring système et la maintenance automatique.

## 🚀 Scripts Disponibles

### 1. **deploy-full.sh** - Déploiement Complet

Combine Docker, SSH, GitHub Actions et base de données pour un déploiement complet.

```bash
# Déploiement local (Docker uniquement)
npm run deploy:full local
npm run deploy:full local --build --migrate

# Déploiement distant (SSH + Docker)
npm run deploy:full remote -s production
npm run deploy:full remote -s staging --build

# Déploiement GitHub Actions
npm run deploy:full github -e production
npm run deploy:full github -e staging -b develop

# Déploiement complet (tout)
npm run deploy:full full -e production -s production
npm run deploy:full full -e staging -s staging --build --migrate --backup

# Rollback
npm run deploy:full rollback -e production -s production

# Statut
npm run deploy:full status
```

**Options:**
- `-e, --env ENV` - Environnement (production, staging, dev)
- `-s, --server SERVER` - Serveur SSH
- `-b, --branch BRANCH` - Branche à déployer
- `-t, --tag TAG` - Tag/version spécifique
- `--build` - Reconstruire les images
- `--migrate` - Exécuter les migrations DB
- `--backup` - Créer une sauvegarde avant déploiement
- `--dry-run` - Simulation sans modifications

### 2. **system-monitor.sh** - Monitoring Système Global

Surveille Docker, base de données, disque, mémoire et réseau.

```bash
# Vue d'ensemble complète
npm run monitor overview
npm run monitor overview --interval 3

# Monitoring spécifique
npm run monitor docker
npm run monitor database
npm run monitor system
npm run monitor network

# Surveillance continue
npm run monitor watch
npm run monitor watch --interval 5
```

**Fonctionnalités:**
- Vue d'ensemble avec auto-refresh
- Monitoring Docker (conteneurs, stats, santé)
- Monitoring base de données
- Monitoring système (CPU, RAM, disque)
- Monitoring réseau (ports, connexions)
- Surveillance continue avec rafraîchissement configurable

### 3. **maintenance.sh** - Maintenance Automatique

Nettoie, optimise et maintient le système automatiquement.

```bash
# Nettoyage
npm run maintenance clean
npm run maintenance clean --force

# Optimisation
npm run maintenance optimize

# Sauvegarde
npm run maintenance backup

# Mise à jour
npm run maintenance update
npm run maintenance update --force

# Vérification
npm run maintenance check

# Maintenance complète
npm run maintenance full
npm run maintenance full --force
npm run maintenance full --dry-run
```

**Commandes:**
- `clean` - Nettoyage complet (Docker, node_modules, logs, cache)
- `optimize` - Optimisation du système
- `backup` - Sauvegarde automatique
- `update` - Mise à jour des dépendances
- `check` - Vérification de santé
- `full` - Maintenance complète (tout)

## 📋 Workflows Recommandés

### Déploiement Production

```bash
# 1. Vérification
npm run maintenance check

# 2. Sauvegarde
npm run maintenance backup

# 3. Déploiement
npm run deploy:full full -e production -s production --build --migrate

# 4. Monitoring
npm run monitor watch
```

### Maintenance Hebdomadaire

```bash
# Maintenance complète
npm run maintenance full

# Vérification
npm run maintenance check
```

### Monitoring Continu

```bash
# Surveillance en arrière-plan
npm run monitor watch --interval 10
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db

# SSH
SSH_HOST=production.example.com
SSH_USER=deploy
SSH_PORT=22

# Déploiement
DEPLOY_ENV=production
DEPLOY_SERVER=production
```

### Fichiers de Configuration

Les scripts détectent automatiquement:
- `docker-compose.yml`
- `.env`
- Configuration SSH (`~/.ssh/config`)

## 🆘 Dépannage

### Déploiement échoue

```bash
# Vérifier le statut
npm run deploy:full status

# Voir les logs
npm run docker logs

# Rollback
npm run deploy:full rollback -e production -s production
```

### Problèmes de performance

```bash
# Monitoring
npm run monitor overview

# Optimisation
npm run maintenance optimize
```

### Nettoyage d'urgence

```bash
# Nettoyage complet
npm run maintenance clean --force

# Reconstruction
npm run docker:dev rebuild
```

## 💡 Astuces

### Automatisation

Créez un cron job pour la maintenance automatique:

```bash
# Maintenance quotidienne à 2h du matin
0 2 * * * cd /path/to/project && npm run maintenance backup

# Maintenance hebdomadaire le dimanche à 3h
0 3 * * 0 cd /path/to/project && npm run maintenance full
```

### Intégration CI/CD

Les scripts peuvent être intégrés dans GitHub Actions:

```yaml
- name: Deploy
  run: npm run deploy:full github -e production
```

### Monitoring Proactif

Utilisez `system-monitor.sh` avec alertes pour détecter les problèmes avant qu'ils n'affectent les utilisateurs.

