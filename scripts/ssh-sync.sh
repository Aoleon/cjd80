#!/bin/bash

# Script pour synchroniser des fichiers entre macOS (dev) et Linux (serveurs)
# Utilise rsync pour une synchronisation efficace

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

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

OS=$(detect_os)

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Synchronise des fichiers entre macOS (dev) et Linux (serveurs) via rsync.

Commands:
  push                Pousser les fichiers locaux vers le serveur
  pull                Tirer les fichiers du serveur vers local
  sync                Synchronisation bidirectionnelle (interactive)
  watch               Surveiller et synchroniser automatiquement

Options:
  -h, --help          Afficher cette aide
  -s, --server        Nom du serveur (depuis .env ou SSH config)
  -l, --local PATH    Chemin local (défaut: .)
  -r, --remote PATH   Chemin distant (défaut: ~/app)
  -u, --user USER     Nom d'utilisateur
  -e, --exclude FILE  Fichier d'exclusion (.gitignore par défaut)
  --dry-run           Simulation sans transfert réel
  --delete            Supprimer les fichiers obsolètes sur la destination

Exemples:
  $0 push -s production
  $0 pull -s staging -r /var/www
  $0 sync -s production --dry-run
  $0 watch -s production

Variables d'environnement (dans .env):
  SSH_HOST=hostname.com
  SSH_USER=username
  SYNC_LOCAL_PATH=.
  SYNC_REMOTE_PATH=~/app
EOF
}

# Vérifier que rsync est installé
check_rsync() {
  if ! command -v rsync &> /dev/null; then
    echo "❌ rsync n'est pas installé"
    case "$OS" in
      macos)
        echo "📦 Installation: rsync est inclus avec macOS"
        ;;
      linux)
        echo "📦 Installation: sudo apt-get install rsync"
        ;;
    esac
    exit 1
  fi
}

# Construire les options rsync
build_rsync_opts() {
  local opts="-avz"
  local exclude_file="${1:-.gitignore}"
  
  # Options de base
  opts="$opts --progress"
  opts="$opts --human-readable"
  
  # Exclusions communes
  opts="$opts --exclude='.git'"
  opts="$opts --exclude='node_modules'"
  opts="$opts --exclude='.env'"
  opts="$opts --exclude='.DS_Store'"
  opts="$opts --exclude='*.log'"
  opts="$opts --exclude='dist'"
  opts="$opts --exclude='.next'"
  opts="$opts --exclude='.cache'"
  
  # Fichier d'exclusion si présent
  if [ -f "$exclude_file" ]; then
    opts="$opts --exclude-from='$exclude_file'"
  fi
  
  echo "$opts"
}

# Pousser vers le serveur
push_files() {
  check_rsync
  
  local server="${SSH_HOST:-}"
  local user="${SSH_USER:-$USER}"
  local local_path="${SYNC_LOCAL_PATH:-.}"
  local remote_path="${SYNC_REMOTE_PATH:-~/app}"
  local exclude_file=".gitignore"
  local dry_run=""
  local delete=""
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -s|--server)
        server="$2"
        shift 2
        ;;
      -l|--local)
        local_path="$2"
        shift 2
        ;;
      -r|--remote)
        remote_path="$2"
        shift 2
        ;;
      -u|--user)
        user="$2"
        shift 2
        ;;
      -e|--exclude)
        exclude_file="$2"
        shift 2
        ;;
      --dry-run)
        dry_run="--dry-run"
        shift
        ;;
      --delete)
        delete="--delete"
        shift
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
  
  local opts=$(build_rsync_opts "$exclude_file")
  if [ -n "$delete" ]; then
    opts="$opts --delete"
  fi
  
  echo "📤 Poussage vers $user@$server:$remote_path..."
  echo "   Source: $local_path"
  echo "   Destination: $user@$server:$remote_path"
  if [ -n "$dry_run" ]; then
    echo "   Mode: simulation (dry-run)"
  fi
  echo ""
  
  rsync $opts $dry_run "$local_path/" "$user@$server:$remote_path/"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Synchronisation terminée"
  else
    echo ""
    echo "❌ Échec de la synchronisation"
    exit 1
  fi
}

# Tirer du serveur
pull_files() {
  check_rsync
  
  local server="${SSH_HOST:-}"
  local user="${SSH_USER:-$USER}"
  local local_path="${SYNC_LOCAL_PATH:-.}"
  local remote_path="${SYNC_REMOTE_PATH:-~/app}"
  local exclude_file=".gitignore"
  local dry_run=""
  local delete=""
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -s|--server)
        server="$2"
        shift 2
        ;;
      -l|--local)
        local_path="$2"
        shift 2
        ;;
      -r|--remote)
        remote_path="$2"
        shift 2
        ;;
      -u|--user)
        user="$2"
        shift 2
        ;;
      -e|--exclude)
        exclude_file="$2"
        shift 2
        ;;
      --dry-run)
        dry_run="--dry-run"
        shift
        ;;
      --delete)
        delete="--delete"
        shift
        ;;
      *)
        shift
        ;;
    esac
  done
  
  if [ -z "$server" ]; then
    echo "❌ Serveur non spécifié"
    exit 1
  fi
  
  local opts=$(build_rsync_opts "$exclude_file")
  if [ -n "$delete" ]; then
    opts="$opts --delete"
  fi
  
  echo "📥 Tirage depuis $user@$server:$remote_path..."
  echo "   Source: $user@$server:$remote_path"
  echo "   Destination: $local_path"
  if [ -n "$dry_run" ]; then
    echo "   Mode: simulation (dry-run)"
  fi
  echo ""
  
  rsync $opts $dry_run "$user@$server:$remote_path/" "$local_path/"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Synchronisation terminée"
  else
    echo ""
    echo "❌ Échec de la synchronisation"
    exit 1
  fi
}

# Synchronisation interactive
sync_files() {
  echo "🔄 Synchronisation bidirectionnelle"
  echo ""
  echo "Choisissez la direction:"
  echo "  1. Push (local → serveur)"
  echo "  2. Pull (serveur → local)"
  echo "  3. Comparer d'abord (dry-run)"
  read -p "Choix (1-3): " choice
  
  case "$choice" in
    1)
      push_files "$@" --dry-run
      echo ""
      read -p "Confirmer le push? (y/N): " confirm
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        push_files "$@"
      fi
      ;;
    2)
      pull_files "$@" --dry-run
      echo ""
      read -p "Confirmer le pull? (y/N): " confirm
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        pull_files "$@"
      fi
      ;;
    3)
      echo "📊 Comparaison (dry-run)..."
      push_files "$@" --dry-run
      ;;
    *)
      echo "❌ Choix invalide"
      exit 1
      ;;
  esac
}

# Surveiller et synchroniser
watch_files() {
  if ! command -v fswatch &> /dev/null && [ "$OS" = "macos" ]; then
    echo "❌ fswatch n'est pas installé"
    echo "📦 Installation: brew install fswatch"
    exit 1
  fi
  
  if [ "$OS" = "linux" ] && ! command -v inotifywait &> /dev/null; then
    echo "❌ inotifywait n'est pas installé"
    echo "📦 Installation: sudo apt-get install inotify-tools"
    exit 1
  fi
  
  local server="${SSH_HOST:-}"
  local local_path="${SYNC_LOCAL_PATH:-.}"
  
  if [ -z "$server" ]; then
    echo "❌ Serveur non spécifié"
    exit 1
  fi
  
  echo "👀 Surveillance de $local_path..."
  echo "💡 Appuyez sur Ctrl+C pour arrêter"
  echo ""
  
  case "$OS" in
    macos)
      fswatch -o "$local_path" | while read f; do
        echo "📤 Changement détecté, synchronisation..."
        push_files -s "$server" -l "$local_path" "$@"
      done
      ;;
    linux)
      while inotifywait -r -e modify,create,delete,move "$local_path"; do
        echo "📤 Changement détecté, synchronisation..."
        push_files -s "$server" -l "$local_path" "$@"
      done
      ;;
  esac
}

# Main
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  push)
    push_files "$@"
    ;;
  pull)
    pull_files "$@"
    ;;
  sync)
    sync_files "$@"
    ;;
  watch)
    watch_files "$@"
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

