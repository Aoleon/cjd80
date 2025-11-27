#!/bin/bash

# Script pour se connecter à un serveur distant via SSH
# Gère les configurations SSH et les clés
# Compatible macOS (dev) et Linux (serveurs)

set -e

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

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration par défaut
SSH_CONFIG_FILE="$HOME/.ssh/config"
SSH_KEY_DIR="$HOME/.ssh"

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [OPTIONS] [SERVER]

Connecte à un serveur distant via SSH avec gestion automatique des clés.

Options:
  -h, --help          Afficher cette aide
  -s, --server SERVER Nom du serveur (depuis .env ou SSH config)
  -u, --user USER     Nom d'utilisateur (défaut: depuis .env ou \$USER)
  -p, --port PORT     Port SSH (défaut: 22)
  -k, --key KEY       Chemin vers la clé SSH privée
  -i, --interactive   Mode interactif pour choisir le serveur
  -c, --config        Éditer la configuration SSH
  -l, --list          Lister les serveurs configurés

Exemples:
  $0 -s production
  $0 -s staging -u deploy
  $0 --interactive
  $0 --list

Variables d'environnement (dans .env):
  SSH_HOST=hostname.com
  SSH_USER=username
  SSH_PORT=22
  SSH_KEY=~/.ssh/id_rsa
EOF
}

# Lister les serveurs configurés
list_servers() {
  echo "📋 Serveurs configurés dans ~/.ssh/config:"
  echo ""
  if [ -f "$SSH_CONFIG_FILE" ]; then
    grep -E "^Host " "$SSH_CONFIG_FILE" | sed 's/Host /  - /' | sort
  else
    echo "  Aucun serveur configuré"
  fi
  echo ""
  echo "📋 Variables d'environnement disponibles:"
  if [ -f .env ]; then
    grep -E "^SSH_" .env | sed 's/^/  - /' || echo "  Aucune variable SSH trouvée"
  else
    echo "  Fichier .env non trouvé"
  fi
}

# Mode interactif
interactive_mode() {
  echo "🔍 Sélection du serveur:"
  echo ""
  
  # Collecter les serveurs depuis SSH config
  servers=()
  if [ -f "$SSH_CONFIG_FILE" ]; then
    while IFS= read -r line; do
      if [[ $line =~ ^Host[[:space:]]+(.+)$ ]]; then
        servers+=("${BASH_REMATCH[1]}")
      fi
    done < "$SSH_CONFIG_FILE"
  fi
  
  # Ajouter les serveurs depuis .env
  if [ -f .env ] && grep -q "SSH_HOST" .env; then
    servers+=("env-server")
  fi
  
  if [ ${#servers[@]} -eq 0 ]; then
    echo "❌ Aucun serveur configuré"
    echo "💡 Configurez un serveur dans ~/.ssh/config ou utilisez les variables d'environnement"
    exit 1
  fi
  
  echo "Serveurs disponibles:"
  for i in "${!servers[@]}"; do
    echo "  $((i+1)). ${servers[$i]}"
  done
  echo ""
  read -p "Choisissez un serveur (1-${#servers[@]}): " choice
  
  if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#servers[@]} ]; then
    SERVER="${servers[$((choice-1))]}"
  else
    echo "❌ Choix invalide"
    exit 1
  fi
}

# Éditer la configuration SSH
edit_config() {
  if [ ! -f "$SSH_CONFIG_FILE" ]; then
    mkdir -p "$SSH_KEY_DIR"
    touch "$SSH_CONFIG_FILE"
    chmod 600 "$SSH_CONFIG_FILE"
  fi
  
  ${EDITOR:-nano} "$SSH_CONFIG_FILE"
  echo "✅ Configuration SSH éditée"
}

# Générer une clé SSH si elle n'existe pas
generate_key() {
  key_path="$1"
  if [ ! -f "$key_path" ]; then
    echo "🔑 Génération d'une nouvelle clé SSH..."
    # Utiliser ed25519 (recommandé) ou RSA en fallback
    if ssh-keygen -t ed25519 -f "$key_path" -C "$(whoami)@$(hostname)-$(date +%Y)" -N "" 2>/dev/null; then
      echo "✅ Clé ed25519 générée: $key_path"
    else
      echo "⚠️  ed25519 non disponible, utilisation de RSA..."
      ssh-keygen -t rsa -b 4096 -f "$key_path" -C "$(whoami)@$(hostname)-$(date +%Y)" -N ""
      echo "✅ Clé RSA générée: $key_path"
    fi
    echo "📋 Clé publique:"
    cat "${key_path}.pub"
    echo ""
    echo "💡 Pour copier sur un serveur Linux:"
    echo "   ssh-copy-id -i ${key_path}.pub user@server"
  fi
}

# Main
SERVER=""
USER=""
PORT=""
KEY=""
INTERACTIVE=false
LIST=false
CONFIG=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -s|--server)
      SERVER="$2"
      shift 2
      ;;
    -u|--user)
      USER="$2"
      shift 2
      ;;
    -p|--port)
      PORT="$2"
      shift 2
      ;;
    -k|--key)
      KEY="$2"
      shift 2
      ;;
    -i|--interactive)
      INTERACTIVE=true
      shift
      ;;
    -l|--list)
      LIST=true
      shift
      ;;
    -c|--config)
      CONFIG=true
      shift
      ;;
    *)
      if [ -z "$SERVER" ]; then
        SERVER="$1"
      fi
      shift
      ;;
  esac
done

if [ "$LIST" = true ]; then
  list_servers
  exit 0
fi

if [ "$CONFIG" = true ]; then
  edit_config
  exit 0
fi

if [ "$INTERACTIVE" = true ] || [ -z "$SERVER" ]; then
  interactive_mode
fi

# Déterminer les paramètres de connexion
if [ -z "$USER" ]; then
  USER="${SSH_USER:-$USER}"
fi

if [ -z "$PORT" ]; then
  PORT="${SSH_PORT:-22}"
fi

if [ -z "$KEY" ]; then
  KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
fi

# Vérifier si le serveur est dans SSH config
if [ -f "$SSH_CONFIG_FILE" ] && grep -q "^Host $SERVER$" "$SSH_CONFIG_FILE"; then
  echo "✅ Connexion à $SERVER via SSH config..."
  ssh "$SERVER"
else
  # Utiliser les variables d'environnement ou le serveur fourni
  HOST="${SSH_HOST:-$SERVER}"
  
  if [ -z "$HOST" ]; then
    echo "❌ Aucun serveur spécifié"
    show_help
    exit 1
  fi
  
  # Générer la clé si nécessaire
  generate_key "$KEY"
  
  # Options SSH selon l'OS et l'environnement
  SSH_OPTS="-i $KEY -p $PORT"
  
  # Options supplémentaires pour meilleure compatibilité
  SSH_OPTS="$SSH_OPTS -o ServerAliveInterval=60"
  SSH_OPTS="$SSH_OPTS -o ServerAliveCountMax=3"
  SSH_OPTS="$SSH_OPTS -o ConnectTimeout=10"
  
  # Sur macOS, désactiver certaines options qui peuvent causer des problèmes
  if [ "$OS" = "macos" ]; then
    SSH_OPTS="$SSH_OPTS -o AddKeysToAgent=yes"
  fi
  
  echo "✅ Connexion à $USER@$HOST:$PORT..."
  echo "   Environnement: $OS → Linux (serveur)"
  ssh $SSH_OPTS "$USER@$HOST"
fi

