# Outils SSH et GitHub Actions

Ce document décrit les outils installés pour gérer les connexions SSH et GitHub Actions.

## 🖥️ Environnements

- **macOS** : Environnement de développement local
- **Linux** : Serveurs de production/staging

Les scripts détectent automatiquement l'environnement et s'adaptent en conséquence.

## 🛠️ Outils Installés

### 1. **GitHub CLI (gh)** - Interface en Ligne de Commande GitHub
Client officiel GitHub pour gérer les dépôts, issues, pull requests et Actions.

**Installation:**
```bash
brew install gh
gh auth login
```

**Fonctionnalités:**
- ✅ Gestion des workflows GitHub Actions
- ✅ Visualisation des exécutions et logs
- ✅ Création et gestion des issues/PRs
- ✅ Gestion des dépôts
- ✅ Authentification sécurisée

### 2. **act** - Test Local des GitHub Actions
Permet de tester les workflows GitHub Actions localement sans push.

**Installation:**
```bash
brew install act
```

**Fonctionnalités:**
- ✅ Exécution locale des workflows
- ✅ Test avant commit
- ✅ Support Docker pour les runners
- ✅ Mode dry-run

### 3. **mosh** - Connexion SSH Robuste
Alternative à SSH avec reconnexion automatique et meilleure gestion de la latence.

**Installation:**
```bash
brew install mosh
```

**Fonctionnalités:**
- ✅ Reconnexion automatique
- ✅ Meilleure gestion de la latence
- ✅ Support des connexions instables
- ✅ Synchronisation d'état

### 4. **sshfs** - Système de Fichiers SSH
Monte un système de fichiers distant localement via SSH.

**Installation:**

**Sur macOS (développement):**
```bash
# Nécessite macFUSE (installation manuelle avec mot de passe admin)
brew install --cask macfuse
brew install gromgit/fuse/sshfs-mac
```

**Sur Linux (serveurs):**
```bash
# Debian/Ubuntu
sudo apt-get install sshfs

# RHEL/CentOS
sudo yum install fuse-sshfs

# Arch
sudo pacman -S sshfs
```

**Fonctionnalités:**
- ✅ Montage de répertoires distants
- ✅ Accès transparent aux fichiers
- ✅ Support des permissions
- ✅ Cache local

## 🔧 Configuration Initiale

### Vérifier et Installer les Outils

```bash
# Vérifier les outils installés
npm run ssh:setup check

# Installer les outils manquants
npm run ssh:setup install

# Configurer les clés SSH
npm run ssh:setup setup-keys

# Tester une connexion
npm run ssh:setup test-connection
```

## 📋 Scripts Disponibles

### Déploiement Rapide

#### `deploy` - Déploiement Complet
```bash
npm run deploy -e production
npm run deploy -e staging -b develop
npm run deploy -e production --dry-run
```

Déploiement en une commande qui combine:
- Synchronisation des fichiers (si serveur spécifié)
- Commit et push des changements
- Déclenchement du déploiement GitHub Actions

### SSH

#### `ssh:setup` - Configuration et Vérification
```bash
npm run ssh:setup check          # Vérifier les outils
npm run ssh:setup install        # Installer les outils manquants
npm run ssh:setup setup-keys     # Configurer les clés SSH
npm run ssh:setup test-connection # Tester une connexion
```

#### `ssh:connect` - Connexion Interactive
```bash
npm run ssh:connect
npm run ssh:connect -- -s production
npm run ssh:connect -- --interactive
npm run ssh:connect -- --list
```

**Options:**
- `-s, --server SERVER` - Nom du serveur
- `-u, --user USER` - Nom d'utilisateur
- `-p, --port PORT` - Port SSH (défaut: 22)
- `-k, --key KEY` - Chemin vers la clé SSH
- `-i, --interactive` - Mode interactif
- `-l, --list` - Lister les serveurs configurés
- `-c, --config` - Éditer la configuration SSH

#### `ssh:sync` - Synchronisation de Fichiers
```bash
npm run ssh:sync push -s production
npm run ssh:sync pull -s staging -r /var/www
npm run ssh:sync sync -s production --dry-run
npm run ssh:sync watch -s production
```

**Commandes:**
- `push` - Pousser les fichiers locaux vers le serveur
- `pull` - Tirer les fichiers du serveur vers local
- `sync` - Synchronisation bidirectionnelle interactive
- `watch` - Surveiller et synchroniser automatiquement

**Options:**
- `-s, --server` - Nom du serveur
- `-l, --local PATH` - Chemin local
- `-r, --remote PATH` - Chemin distant
- `--dry-run` - Simulation sans transfert
- `--delete` - Supprimer les fichiers obsolètes

#### `ssh:tunnel` - Tunnels SSH (Port Forwarding)
```bash
npm run ssh:tunnel create -s production -L 3000 -R 3000
npm run ssh:tunnel create -s production -L 5432 -R 5432 -H localhost -b
npm run ssh:tunnel list
npm run ssh:tunnel kill 3000
npm run ssh:tunnel kill-all
```

**Commandes:**
- `create` - Créer un tunnel SSH
- `list` - Lister les tunnels actifs
- `kill PORT` - Tuer un tunnel spécifique
- `kill-all` - Tuer tous les tunnels

**Exemples:**
- Application web: `-L 3000 -R 3000`
- Base de données: `-L 5432 -R 5432`
- Redis: `-L 6379 -R 6379`

#### `ssh:mount` - Monter un Système de Fichiers Distant
```bash
npm run ssh:mount mount
npm run ssh:mount mount -s production -r /var/www -l ./production-fs
npm run ssh:mount unmount
npm run ssh:mount status
```

**Commandes:**
- `mount` - Monter le système de fichiers
- `unmount` - Démonter le système de fichiers
- `status` - Voir le statut des montages

### GitHub Actions

#### `gh:deploy` - Déploiement via GitHub Actions
```bash
npm run gh:deploy deploy -e production
npm run gh:deploy deploy -e staging -b develop
npm run gh:deploy rollback -e production
npm run gh:deploy status -e production
npm run gh:deploy logs -e production
npm run gh:deploy list-environments
```

**Commandes:**
- `deploy` - Déclencher un déploiement
- `rollback` - Revenir à une version précédente
- `status` - Voir le statut du déploiement
- `logs` - Voir les logs du dernier déploiement
- `list-environments` - Lister les environnements disponibles

#### `gh:pr` - Gestion des Pull Requests
```bash
npm run gh:pr create -t "Feature: Nouvelle fonctionnalité"
npm run gh:pr list
npm run gh:pr view 123
npm run gh:pr review 123
npm run gh:pr merge 123
npm run gh:pr checkout 123
```

**Commandes:**
- `create` - Créer une nouvelle PR
- `list` - Lister les PRs
- `view PR_NUMBER` - Voir une PR
- `review PR_NUMBER` - Ouvrir une PR pour review
- `merge PR_NUMBER` - Merger une PR
- `close PR_NUMBER` - Fermer une PR
- `checkout PR_NUMBER` - Checkout une PR localement

#### `gh:actions` - Gestion des Workflows
```bash
npm run gh:actions list
npm run gh:actions status
npm run gh:actions run ci.yml
npm run gh:actions test ci.yml
npm run gh:actions logs 123456789
npm run gh:actions watch
```

**Commandes:**
- `list` - Lister les workflows disponibles
- `status` - Voir le statut des dernières exécutions
- `run WORKFLOW` - Exécuter un workflow
- `test [WORKFLOW]` - Tester un workflow localement avec act
- `logs RUN_ID` - Voir les logs d'une exécution
- `watch` - Surveiller les exécutions en cours
- `enable WORKFLOW` - Activer un workflow
- `disable WORKFLOW` - Désactiver un workflow

#### `gh:auth` - Authentification GitHub
```bash
npm run gh:auth
```

## 🔧 Configuration

### Configuration SSH

Éditez `~/.ssh/config` pour configurer vos serveurs:

```ssh-config
Host production
    HostName production.example.com
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host staging
    HostName staging.example.com
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

Ou utilisez les variables d'environnement dans `.env`:

```env
SSH_HOST=production.example.com
SSH_USER=deploy
SSH_PORT=22
SSH_KEY=~/.ssh/id_rsa
SSH_REMOTE_PATH=/var/www
SSH_LOCAL_PATH=./remote
```

### Configuration GitHub

1. **Authentification:**
   ```bash
   gh auth login
   ```

2. **Vérifier l'authentification:**
   ```bash
   gh auth status
   ```

3. **Configurer le dépôt:**
   ```bash
   gh repo set-default
   ```

## 📚 Exemples d'Utilisation

### Connexion SSH

```bash
# Connexion simple
npm run ssh:connect -- -s production

# Mode interactif
npm run ssh:connect -- --interactive

# Lister les serveurs
npm run ssh:connect -- --list

# Éditer la configuration
npm run ssh:connect -- --config
```

### Montage de Système de Fichiers

```bash
# Monter le répertoire distant
npm run ssh:mount mount -s production -r /var/www -l ./production-fs

# Accéder aux fichiers
cd ./production-fs
ls -la

# Démonter
npm run ssh:mount unmount
```

### GitHub Actions

```bash
# Lister les workflows
npm run gh:actions list

# Voir le statut
npm run gh:actions status

# Exécuter un workflow
npm run gh:actions run ci.yml

# Tester localement
npm run gh:actions test ci.yml

# Voir les logs
npm run gh:actions logs 123456789

# Surveiller en temps réel
npm run gh:actions watch
```

### Test Local avec act

```bash
# Tester tous les workflows
npm run gh:actions test

# Tester un workflow spécifique
npm run gh:actions test ci.yml

# Mode dry-run
act --dry-run

# Avec événement spécifique
act push
act pull_request
```

## 🖥️ Différences macOS / Linux

### Installation des Outils

**macOS (Développement):**
- Utilise Homebrew pour l'installation
- `sshfs` nécessite macFUSE (installation manuelle avec mot de passe admin)
- Les scripts détectent automatiquement macOS et adaptent les commandes

**Linux (Serveurs):**
- Utilise les gestionnaires de paquets natifs (apt, yum, pacman, dnf)
- `sshfs` est disponible directement via les dépôts
- Les scripts détectent automatiquement Linux et utilisent les bonnes commandes

### Connexions SSH

Les scripts sont conçus pour :
- **macOS** : Se connecter depuis votre machine de développement
- **Linux** : Se connecter vers les serveurs Linux de production/staging

Les options SSH sont automatiquement adaptées selon l'environnement source.

### Exemple de Workflow

```bash
# Sur macOS (développement)
npm run ssh:setup check          # Vérifier les outils
npm run ssh:setup setup-keys     # Générer les clés SSH
npm run ssh:connect -s production  # Se connecter au serveur Linux

# Sur le serveur Linux (si vous y êtes connecté)
npm run ssh:setup install        # Installer les outils sur le serveur
```

## 🔐 Sécurité

### Clés SSH

1. **Générer une nouvelle clé:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Copier la clé publique sur le serveur:**
   ```bash
   ssh-copy-id user@server
   ```

3. **Tester la connexion:**
   ```bash
   ssh user@server
   ```

### GitHub Authentication

- Utilisez `gh auth login` pour une authentification sécurisée
- Les tokens sont stockés de manière sécurisée
- Support de 2FA (Two-Factor Authentication)

## 🚀 Commandes Rapides

```bash
# SSH
npm run ssh:connect          # Connexion interactive
npm run ssh:mount mount      # Monter le système de fichiers
npm run ssh:mount unmount    # Démonter

# GitHub Actions
npm run gh:actions list      # Lister les workflows
npm run gh:actions status    # Statut des exécutions
npm run gh:actions test      # Tester localement
npm run gh:actions watch     # Surveiller en temps réel
```

## 📖 Ressources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [act Documentation](https://github.com/nektos/act)
- [mosh Documentation](https://mosh.org/)
- [sshfs Documentation](https://github.com/libfuse/sshfs)
- [SSH Config Documentation](https://www.ssh.com/academy/ssh/config)

