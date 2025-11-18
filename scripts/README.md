# Scripts de Contrôle et Déploiement - CJD80

Ce répertoire contient les scripts pour contrôler et déployer l'application CJD80 sur le serveur de production.

## 📋 Scripts Disponibles

### 1. `ssh-control.sh` - Contrôle SSH du Serveur

Script principal pour contrôler le serveur via SSH.

**Usage :**
```bash
./scripts/ssh-control.sh [commande]
```

**Commandes disponibles :**
- `check` - Vérification complète du déploiement
- `status` - État de l'application
- `health` - Health check de l'application
- `logs` - Derniers logs de l'application
- `restart` - Redémarrer l'application
- `agent` - Lire le fichier agent.md du serveur
- `menu` - Menu interactif (par défaut)

**Exemples :**
```bash
# Vérification complète
./scripts/ssh-control.sh check

# Health check
./scripts/ssh-control.sh health

# Voir les logs
./scripts/ssh-control.sh logs

# Menu interactif
./scripts/ssh-control.sh menu
```

**Configuration :**
Les identifiants SSH sont configurés dans le script :
- Host: `141.94.31.162`
- User: `thibault`
- Port: `22`

---

### 2. `check-latest-version.sh` - Vérification de Version

Vérifie la version actuellement installée et compare avec la dernière version disponible.

**Usage :**
```bash
./scripts/check-latest-version.sh
```

**Fonctionnalités :**
- ✅ Vérifie la version actuelle installée
- ✅ Compare avec la dernière version disponible
- ✅ Vérifie la disponibilité de l'image Docker
- ✅ Teste l'état de l'installation actuelle
- ✅ Affiche un rapport complet

**Exemple de sortie :**
```
📦 Version actuellement installée
   Image Docker: ghcr.io/aoleon/cjd80:main-4498f16
   Commit SHA: 4498f16

🔍 Vérification de la dernière version
   Dernier commit: 857c152
   Image attendue: ghcr.io/aoleon/cjd80:main-857c152

📊 Comparaison des versions
   ⚠️  Le serveur n'est pas à jour
   Différence: 8 commits
```

---

### 3. `deploy-latest-version.sh` - Déploiement de la Dernière Version

Déploie automatiquement la dernière version disponible sur le serveur.

**Usage :**
```bash
./scripts/deploy-latest-version.sh
```

**Fonctionnalités :**
- ✅ Vérifie la disponibilité de l'image Docker
- ✅ Crée un backup de la version actuelle
- ✅ Met à jour le repository Git
- ✅ Déploie la nouvelle version
- ✅ Vérifie le déploiement
- ✅ Rollback automatique en cas d'échec

**Processus :**
1. Récupère la dernière version depuis `origin/main`
2. Vérifie que l'image Docker existe dans GHCR
3. Demande confirmation avant de déployer
4. Crée un backup de la version actuelle
5. Met à jour le repository Git sur le serveur
6. Déploie la nouvelle version
7. Vérifie le health check
8. Propose un rollback en cas d'échec

**Exemple d'utilisation :**
```bash
$ ./scripts/deploy-latest-version.sh

🚀 Déploiement de la dernière version
   Dernière version: ghcr.io/aoleon/cjd80:main-857c152

⚠️  Vous êtes sur le point de déployer la version 857c152
Continuer? (y/N): y

📦 Sauvegarde de la version actuelle
   ✅ Backup créé: ghcr.io/aoleon/cjd80:backup-20251118-100000

🔄 Mise à jour du repository Git
   ✅ Repository mis à jour

🚀 Déploiement de la nouvelle version
   ✅ Déploiement terminé

✅ Vérification du déploiement
   ✅ Health check réussi !

✅ Déploiement réussi !
```

---

## 🔧 Prérequis

### Outils Requis

1. **sshpass** - Pour l'authentification SSH avec mot de passe
   ```bash
   # macOS
   brew install hudochenkov/sshpass/sshpass
   
   # Linux
   sudo apt-get install sshpass
   ```

2. **jq** (optionnel) - Pour le parsing JSON
   ```bash
   # macOS
   brew install jq
   
   # Linux
   sudo apt-get install jq
   ```

3. **Git** - Pour la gestion des versions

### Configuration SSH

Les scripts utilisent `sshpass` pour l'authentification automatique. Les identifiants sont configurés dans les scripts :

```bash
VPS_HOST="141.94.31.162"
VPS_USER="thibault"
VPS_PORT="22"
VPS_PASS="@Tibo4713234"
```

⚠️ **Sécurité :** Pour un usage en production, considérez utiliser des clés SSH au lieu de mots de passe.

---

## 📊 Workflow Recommandé

### 1. Vérifier l'État Actuel

```bash
# Vérification complète
./scripts/ssh-control.sh check

# Vérifier la version
./scripts/check-latest-version.sh
```

### 2. Préparer le Déploiement

```bash
# S'assurer que les commits sont poussés
git push origin main

# Vérifier que le workflow GitHub Actions a buildé l'image
# Aller sur: https://github.com/Aoleon/cjd80/actions
```

### 3. Déployer

```bash
# Déployer la dernière version
./scripts/deploy-latest-version.sh
```

### 4. Vérifier le Déploiement

```bash
# Health check
./scripts/ssh-control.sh health

# Voir les logs
./scripts/ssh-control.sh logs

# Vérifier la version
./scripts/check-latest-version.sh
```

---

## 🚨 Dépannage

### Problème : "sshpass n'est pas installé"

**Solution :**
```bash
# macOS
brew install hudochenkov/sshpass/sshpass

# Linux
sudo apt-get install sshpass
```

### Problème : "Permission denied"

**Solution :**
- Vérifier que le mot de passe SSH est correct
- Vérifier que l'utilisateur a les permissions sur le serveur
- Essayer de se connecter manuellement : `ssh thibault@141.94.31.162`

### Problème : "Image non disponible dans GHCR"

**Solution :**
1. Vérifier que les commits sont poussés sur `origin/main`
2. Vérifier que le workflow GitHub Actions a réussi
3. Attendre que l'image soit buildée et poussée
4. Vérifier l'image : `docker pull ghcr.io/aoleon/cjd80:main-857c152`

### Problème : "Health check échoué"

**Solution :**
```bash
# Voir les logs détaillés
./scripts/ssh-control.sh logs

# Vérifier l'état du conteneur
ssh thibault@141.94.31.162
cd /docker/cjd80
docker compose ps
docker compose logs --tail=100 cjd-app
```

### Problème : "Repository non synchronisé"

**Solution :**
```bash
# Sur le serveur
ssh thibault@141.94.31.162
cd /docker/cjd80
git fetch origin main
git status
# Résoudre les conflits si nécessaire
```

---

## 📚 Documentation Complémentaire

- **Rapport de vérification :** `docs/deployment/VERSION_CHECK_REPORT.md`
- **Résumé de déploiement :** `docs/deployment/DEPLOYMENT_SUMMARY.md`
- **Rapport de contrôle serveur :** `docs/deployment/SERVER_CONTROL_REPORT.md`
- **Guide de déploiement :** `docs/deployment/DEPLOYMENT.md`
- **Configuration Remote-SSH :** `.vscode/REMOTE_SSH_SETUP.md`

---

## 🔐 Sécurité

### Recommandations

1. **Clés SSH :** Utiliser des clés SSH au lieu de mots de passe
2. **Secrets :** Ne pas commiter les mots de passe dans le code
3. **Permissions :** Limiter les permissions des scripts
4. **Audit :** Vérifier régulièrement les logs d'accès

### Configuration avec Clés SSH

Pour utiliser des clés SSH au lieu de mots de passe :

1. Générer une clé SSH :
   ```bash
   ssh-keygen -t ed25519 -C "cjd80-deploy" -f ~/.ssh/cjd80_deploy
   ```

2. Copier la clé publique sur le serveur :
   ```bash
   ssh-copy-id -i ~/.ssh/cjd80_deploy.pub thibault@141.94.31.162
   ```

3. Modifier les scripts pour utiliser la clé :
   ```bash
   ssh_exec() {
       ssh -i ~/.ssh/cjd80_deploy -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$@"
   }
   ```

---

## 📝 Notes

- Les scripts sont conçus pour être exécutés depuis la racine du projet
- Tous les scripts nécessitent `sshpass` pour l'authentification
- Les scripts créent des fichiers temporaires dans `/tmp/` pour stocker des informations
- Les scripts utilisent des couleurs pour améliorer la lisibilité (ANSI)

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `./scripts/ssh-control.sh logs`
2. Vérifier l'état : `./scripts/ssh-control.sh check`
3. Consulter la documentation : `docs/deployment/`
4. Vérifier le fichier `agent.md` sur le serveur : `./scripts/ssh-control.sh agent`
