#!/bin/bash

# Script pour monter un système de fichiers distant via SSH
# Utilise sshfs pour monter un répertoire distant localement

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Monte ou démonte un système de fichiers distant via SSH.

Commands:
  mount              Monter le système de fichiers distant
  unmount            Démonter le système de fichiers distant
  status             Voir le statut des montages

Options:
  -h, --help         Afficher cette aide
  -s, --server       Nom du serveur (depuis .env ou SSH config)
  -r, --remote PATH  Chemin distant (défaut: ~)
  -l, --local PATH   Chemin local de montage (défaut: ./remote)
  -u, --user USER    Nom d'utilisateur

Exemples:
  $0 mount
  $0 mount -s production -r /var/www -l ./production-fs
  $0 unmount
  $0 status

Variables d'environnement (dans .env):
  SSH_HOST=hostname.com
  SSH_USER=username
  SSH_REMOTE_PATH=/var/www
  SSH_LOCAL_PATH=./remote
EOF
}

# Détecter l'OS
detect_os() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      echo "linux"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# Vérifier que sshfs est installé
check_sshfs() {
  if ! command -v sshfs &> /dev/null; then
    local os=$(detect_os)
    echo "❌ sshfs n'est pas installé"
    case "$os" in
      macos)
        echo "📦 Installation sur macOS:"
        echo "   1. brew install --cask macfuse"
        echo "   2. brew install gromgit/fuse/sshfs-mac"
        echo ""
        echo "   Note: macFUSE nécessite une installation manuelle avec mot de passe admin"
        ;;
      linux)
        echo "📦 Installation sur Linux:"
        echo "   Debian/Ubuntu: sudo apt-get install sshfs"
        echo "   RHEL/CentOS: sudo yum install fuse-sshfs"
        echo "   Arch: sudo pacman -S sshfs"
        ;;
      *)
        echo "📦 Installation: consultez la documentation de votre distribution"
        ;;
    esac
    exit 1
  fi
}

# Monter le système de fichiers
mount_remote() {
  check_sshfs
  
  local server="${SSH_HOST:-}"
  local user="${SSH_USER:-$USER}"
  local remote_path="${SSH_REMOTE_PATH:-~}"
  local local_path="${SSH_LOCAL_PATH:-./remote}"
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -s|--server)
        server="$2"
        shift 2
        ;;
      -r|--remote)
        remote_path="$2"
        shift 2
        ;;
      -l|--local)
        local_path="$2"
        shift 2
        ;;
      -u|--user)
        user="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
  
  if [ -z "$server" ]; then
    echo "❌ Serveur non spécifié"
    echo "💡 Utilisez -s SERVER ou définissez SSH_HOST dans .env"
    exit 1
  fi
  
  # Créer le répertoire de montage s'il n'existe pas
  mkdir -p "$local_path"
  
  # Vérifier si déjà monté
  if mountpoint -q "$local_path" 2>/dev/null; then
    echo "⚠️  $local_path est déjà monté"
    echo "💡 Utilisez: $0 unmount pour démonter d'abord"
    exit 1
  fi
  
  local os=$(detect_os)
  local sshfs_opts="-o follow_symlinks,default_permissions"
  
  # Options spécifiques selon l'OS
  case "$os" in
    macos)
      # Sur macOS, utiliser allow_other peut nécessiter des permissions spéciales
      sshfs_opts="$sshfs_opts,volname=$(basename $local_path)"
      ;;
    linux)
      # Sur Linux, options standard
      ;;
  esac
  
  echo "📁 Montage de $user@$server:$remote_path vers $local_path..."
  echo "   OS détecté: $os"
  sshfs "$user@$server:$remote_path" "$local_path" $sshfs_opts
  
  if [ $? -eq 0 ]; then
    echo "✅ Système de fichiers monté avec succès"
    echo "💡 Accédez au répertoire: cd $local_path"
    echo "💡 Pour démonter: $0 unmount"
  else
    echo "❌ Échec du montage"
    exit 1
  fi
}

# Démonter le système de fichiers
unmount_remote() {
  local local_path="${SSH_LOCAL_PATH:-./remote}"
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -l|--local)
        local_path="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
  
  if [ ! -d "$local_path" ]; then
    echo "⚠️  Répertoire de montage non trouvé: $local_path"
    exit 1
  fi
  
  if ! mountpoint -q "$local_path" 2>/dev/null; then
    echo "⚠️  $local_path n'est pas monté"
    exit 1
  fi
  
  echo "📁 Démonte de $local_path..."
  umount "$local_path"
  
  if [ $? -eq 0 ]; then
    echo "✅ Système de fichiers démonté avec succès"
  else
    echo "❌ Échec du démontage"
    echo "💡 Essayez: sudo umount $local_path"
    exit 1
  fi
}

# Voir le statut
show_status() {
  local local_path="${SSH_LOCAL_PATH:-./remote}"
  
  echo "📊 Statut des montages SSH:"
  echo ""
  
  if mountpoint -q "$local_path" 2>/dev/null; then
    echo "✅ $local_path est monté"
    df -h "$local_path" | tail -1
  else
    echo "❌ $local_path n'est pas monté"
  fi
  
  echo ""
  echo "📋 Tous les montages sshfs:"
  mount | grep sshfs || echo "  Aucun montage sshfs actif"
}

# Main
COMMAND="${1:-status}"
shift || true

case "$COMMAND" in
  mount)
    mount_remote "$@"
    ;;
  unmount|umount)
    unmount_remote "$@"
    ;;
  status)
    show_status
    ;;
  -h|--help|help)
    show_help
    ;;
  *)
    echo "❌ Commande inconnue: $COMMAND"
    show_help
    exit 1
    ;;
esac

