#!/bin/bash

# Script pour configurer SSH et les outils selon l'environnement
# Détecte automatiquement macOS (dev) ou Linux (serveur)

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

echo "🖥️  Environnement détecté: $OS"
echo ""

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND]

Configure SSH et les outils selon l'environnement (macOS ou Linux).

Commands:
  check              Vérifier les outils installés
  install            Installer les outils manquants
  setup-keys         Configurer les clés SSH
  test-connection    Tester une connexion SSH
  generate-key       Générer une nouvelle clé SSH

Options:
  -h, --help         Afficher cette aide

Exemples:
  $0 check
  $0 install
  $0 setup-keys
EOF
}

# Vérifier les outils
check_tools() {
  echo "🔍 Vérification des outils..."
  echo ""
  
  local missing=0
  
  # Outils de base
  if command -v ssh &> /dev/null; then
    echo "✅ ssh: $(ssh -V 2>&1 | head -1)"
  else
    echo "❌ ssh: non installé"
    missing=$((missing + 1))
  fi
  
  if command -v ssh-keygen &> /dev/null; then
    echo "✅ ssh-keygen: installé"
  else
    echo "❌ ssh-keygen: non installé"
    missing=$((missing + 1))
  fi
  
  # Outils optionnels selon l'OS
  case "$OS" in
    macos)
      if command -v mosh &> /dev/null; then
        echo "✅ mosh: $(mosh --version 2>&1 | head -1)"
      else
        echo "⚠️  mosh: non installé (optionnel)"
      fi
      
      if command -v sshfs &> /dev/null; then
        echo "✅ sshfs: installé"
      else
        echo "⚠️  sshfs: non installé (nécessite macFUSE)"
      fi
      ;;
    linux)
      if command -v mosh &> /dev/null; then
        echo "✅ mosh: $(mosh --version 2>&1 | head -1)"
      else
        echo "⚠️  mosh: non installé (optionnel)"
      fi
      
      if command -v sshfs &> /dev/null; then
        echo "✅ sshfs: installé"
      else
        echo "⚠️  sshfs: non installé"
      fi
      ;;
  esac
  
  # GitHub CLI (utile pour les deux)
  if command -v gh &> /dev/null; then
    echo "✅ gh: $(gh --version 2>&1 | head -1)"
  else
    echo "⚠️  gh: non installé (optionnel, pour GitHub Actions)"
  fi
  
  echo ""
  if [ $missing -eq 0 ]; then
    echo "✅ Tous les outils essentiels sont installés"
  else
    echo "❌ $missing outil(s) manquant(s)"
    echo "💡 Utilisez: $0 install"
  fi
}

# Installer les outils
install_tools() {
  echo "📦 Installation des outils pour $OS..."
  echo ""
  
  case "$OS" in
    macos)
      echo "Installation via Homebrew..."
      if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew n'est pas installé"
        echo "📦 Installation: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
      fi
      
      # Outils de base
      brew install mosh || echo "⚠️  mosh déjà installé ou erreur"
      
      # sshfs nécessite macFUSE (installation manuelle)
      echo ""
      echo "📋 Pour sshfs sur macOS:"
      echo "   1. brew install --cask macfuse (nécessite mot de passe admin)"
      echo "   2. brew install gromgit/fuse/sshfs-mac"
      echo ""
      echo "   Ou utilisez directement: brew install --cask macfuse"
      
      # GitHub CLI
      brew install gh || echo "⚠️  gh déjà installé ou erreur"
      ;;
      
    linux)
      echo "Installation via le gestionnaire de paquets..."
      
      # Détecter la distribution
      if command -v apt-get &> /dev/null; then
        echo "Distribution: Debian/Ubuntu"
        sudo apt-get update
        sudo apt-get install -y openssh-client mosh sshfs
      elif command -v yum &> /dev/null; then
        echo "Distribution: RHEL/CentOS"
        sudo yum install -y openssh-clients mosh fuse-sshfs
      elif command -v pacman &> /dev/null; then
        echo "Distribution: Arch"
        sudo pacman -S --noconfirm openssh mosh sshfs
      elif command -v dnf &> /dev/null; then
        echo "Distribution: Fedora"
        sudo dnf install -y openssh-clients mosh fuse-sshfs
      else
        echo "❌ Gestionnaire de paquets non reconnu"
        echo "💡 Installez manuellement: openssh, mosh, sshfs"
        exit 1
      fi
      
      # GitHub CLI
      if command -v gh &> /dev/null; then
        echo "✅ gh déjà installé"
      else
        echo "📦 Installation de GitHub CLI..."
        type -p curl >/dev/null || (echo "curl est requis" && exit 1)
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update && sudo apt install gh
      fi
      ;;
      
    *)
      echo "❌ OS non supporté: $OS"
      exit 1
      ;;
  esac
  
  echo ""
  echo "✅ Installation terminée"
}

# Configurer les clés SSH
setup_keys() {
  echo "🔑 Configuration des clés SSH..."
  echo ""
  
  SSH_DIR="$HOME/.ssh"
  mkdir -p "$SSH_DIR"
  chmod 700 "$SSH_DIR"
  
  # Vérifier les clés existantes
  if [ -f "$SSH_DIR/id_ed25519" ] || [ -f "$SSH_DIR/id_rsa" ]; then
    echo "✅ Clés SSH trouvées:"
    ls -la "$SSH_DIR"/id_* 2>/dev/null | awk '{print "   "$9" ("$5")"}'
    echo ""
    read -p "Générer une nouvelle clé? (y/N): " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Configuration terminée"
      return
    fi
  fi
  
  # Générer une nouvelle clé
  echo "Génération d'une nouvelle clé SSH..."
  read -p "Email pour la clé (optionnel): " email
  
  key_type="ed25519"
  key_path="$SSH_DIR/id_$key_type"
  
  if [ -n "$email" ]; then
    ssh-keygen -t "$key_type" -f "$key_path" -C "$email" -N ""
  else
    ssh-keygen -t "$key_type" -f "$key_path" -C "$(whoami)@$(hostname)" -N ""
  fi
  
  echo ""
  echo "✅ Clé générée: $key_path"
  echo "📋 Clé publique:"
  cat "${key_path}.pub"
  echo ""
  echo "💡 Pour copier la clé sur un serveur:"
  echo "   ssh-copy-id -i ${key_path}.pub user@server"
}

# Tester une connexion
test_connection() {
  echo "🧪 Test de connexion SSH..."
  echo ""
  
  read -p "Serveur (user@host): " server
  
  if [ -z "$server" ]; then
    echo "❌ Serveur requis"
    exit 1
  fi
  
  echo "Test de connexion à $server..."
  ssh -o ConnectTimeout=5 -o BatchMode=yes "$server" echo "✅ Connexion réussie" || {
    echo "❌ Échec de la connexion"
    echo "💡 Vérifiez:"
    echo "   - Le serveur est accessible"
    echo "   - Les clés SSH sont configurées"
    echo "   - Le firewall autorise le port SSH"
  }
}

# Main
COMMAND="${1:-check}"

case "$COMMAND" in
  check)
    check_tools
    ;;
  install)
    install_tools
    ;;
  setup-keys)
    setup_keys
    ;;
  test-connection)
    test_connection
    ;;
  generate-key)
    setup_keys
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

