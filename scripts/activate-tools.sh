#!/bin/bash

# Script d'activation de tous les outils
# Vérifie, installe et teste tous les outils disponibles

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

echo "🚀 Activation de tous les outils"
echo "🖥️  Environnement: $OS"
echo ""

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

ACTIVATED=0
FAILED=0
SKIPPED=0

# Fonction pour vérifier et activer un outil
check_tool() {
  local name="$1"
  local command="$2"
  local install_cmd="${3:-}"
  
  if command -v "$command" &> /dev/null; then
    echo "  ✅ $name"
    ACTIVATED=$((ACTIVATED + 1))
    return 0
  else
    if [ -n "$install_cmd" ]; then
      echo "  ⚠️  $name (non installé)"
      echo "     Installation: $install_cmd"
      SKIPPED=$((SKIPPED + 1))
    else
      echo "  ❌ $name (non disponible)"
      FAILED=$((FAILED + 1))
    fi
    return 1
  fi
}

# Fonction pour vérifier un script npm
check_npm_script() {
  local script="$1"
  local description="$2"
  
  # Vérifier si le script existe dans package.json
  if grep -q "\"$script\"" package.json 2>/dev/null; then
    # Vérifier si le script est exécutable
    local script_path=$(grep "\"$script\"" package.json | head -1 | sed 's/.*"\(.*\)".*/\1/' | sed 's/^\.\///')
    if [ -f "$script_path" ] && [ -x "$script_path" ]; then
      echo "  ✅ $description"
      ACTIVATED=$((ACTIVATED + 1))
      return 0
    elif [ -f "$script_path" ]; then
      echo "  ⚠️  $description (script non exécutable)"
      echo "     Correction: chmod +x $script_path"
      SKIPPED=$((SKIPPED + 1))
      return 1
    else
      echo "  ✅ $description (script présent)"
      ACTIVATED=$((ACTIVATED + 1))
      return 0
    fi
  else
    echo "  ❌ $description (script manquant)"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# 1. Outils système de base
echo "📦 1. Outils système de base:"
echo ""

check_tool "Git" "git" "brew install git"
check_tool "Node.js" "node" "brew install node"
check_tool "npm" "npm" "Inclus avec Node.js"

echo ""

# 2. Base de données
echo "🗄️  2. Outils base de données:"
echo ""

check_tool "PostgreSQL Client (psql)" "psql" "brew install postgresql" || true
check_tool "pgcli" "pgcli" "pipx install pgcli" || true
check_tool "pg_activity" "pg_activity" "pipx install pg_activity" || true

if [ -n "$DATABASE_URL" ]; then
  echo "  ✅ DATABASE_URL configuré"
  ACTIVATED=$((ACTIVATED + 1))
else
  echo "  ⚠️  DATABASE_URL non configuré (optionnel)"
  SKIPPED=$((SKIPPED + 1))
fi

check_npm_script "db:connect" "Script db:connect"
check_npm_script "db:monitor" "Script db:monitor"
check_npm_script "db:stats" "Script db:stats"

echo ""

# 3. SSH
echo "🔐 3. Outils SSH:"
echo ""

check_tool "SSH" "ssh" "Inclus avec macOS/Linux"
check_tool "mosh" "mosh" "brew install mosh"

# Vérifier sshfs (peut nécessiter macFUSE sur macOS)
if command -v sshfs &> /dev/null; then
  echo "  ✅ sshfs"
  ACTIVATED=$((ACTIVATED + 1))
else
  case "$OS" in
    macos)
      echo "  ⚠️  sshfs (nécessite macFUSE)"
      echo "     Installation: brew install --cask macfuse && brew install sshfs"
      SKIPPED=$((SKIPPED + 1))
      ;;
    linux)
      echo "  ⚠️  sshfs (non installé)"
      echo "     Installation: sudo apt-get install sshfs"
      SKIPPED=$((SKIPPED + 1))
      ;;
  esac
fi

if [ -f "$HOME/.ssh/config" ]; then
  server_count=$(grep -c "^Host " "$HOME/.ssh/config" 2>/dev/null || echo "0")
  server_count=$(echo "$server_count" | tr -d '[:space:]')
  if [ -n "$server_count" ] && [ "$server_count" -gt 0 ] 2>/dev/null; then
    echo "  ✅ SSH config ($server_count serveur(s))"
    ACTIVATED=$((ACTIVATED + 1))
  else
    echo "  ⚠️  SSH config vide"
    SKIPPED=$((SKIPPED + 1))
  fi
else
  echo "  ⚠️  SSH config non trouvé (optionnel)"
  SKIPPED=$((SKIPPED + 1))
fi

check_npm_script "ssh:connect" "Script ssh:connect"
check_npm_script "ssh:setup" "Script ssh:setup"
check_npm_script "ssh:sync" "Script ssh:sync"
check_npm_script "ssh:tunnel" "Script ssh:tunnel"
check_npm_script "ssh:mount" "Script ssh:mount"

echo ""

# 4. GitHub
echo "☁️  4. Outils GitHub:"
echo ""

check_tool "GitHub CLI (gh)" "gh" "brew install gh"

if command -v gh &> /dev/null && gh auth status &> /dev/null 2>/dev/null; then
  echo "  ✅ GitHub CLI authentifié"
  ACTIVATED=$((ACTIVATED + 1))
else
  if command -v gh &> /dev/null; then
    echo "  ⚠️  GitHub CLI non authentifié"
    echo "     Authentification: npm run gh:auth"
    SKIPPED=$((SKIPPED + 1))
  fi
fi

check_tool "act" "act" "brew install act"

check_npm_script "gh:actions" "Script gh:actions"
check_npm_script "gh:deploy" "Script gh:deploy"
check_npm_script "gh:pr" "Script gh:pr"

echo ""

# 5. Docker
echo "🐳 5. Outils Docker:"
echo ""

check_tool "Docker" "docker" "brew install --cask docker"

if docker info &> /dev/null 2>&1; then
  echo "  ✅ Docker en cours d'exécution"
  ACTIVATED=$((ACTIVATED + 1))
else
  if command -v docker &> /dev/null; then
    echo "  ⚠️  Docker installé mais non démarré"
    case "$OS" in
      macos)
        echo "     Démarrage: open -a Docker"
        ;;
      linux)
        echo "     Démarrage: sudo systemctl start docker"
        ;;
    esac
    SKIPPED=$((SKIPPED + 1))
  fi
fi

# Détecter docker-compose
if command -v docker-compose &> /dev/null; then
  echo "  ✅ docker-compose (v1)"
  ACTIVATED=$((ACTIVATED + 1))
elif docker compose version &> /dev/null 2>&1; then
  echo "  ✅ docker compose (v2)"
  ACTIVATED=$((ACTIVATED + 1))
else
  echo "  ❌ Docker Compose non disponible"
  FAILED=$((FAILED + 1))
fi

check_npm_script "docker" "Script docker"
check_npm_script "docker:monitor" "Script docker:monitor"
check_npm_script "docker:backup" "Script docker:backup"
check_npm_script "docker:dev" "Script docker:dev"

echo ""

# 6. Déploiement et monitoring
echo "🚀 6. Outils déploiement et monitoring:"
echo ""

check_npm_script "deploy:full" "Script deploy:full"
check_npm_script "deploy" "Script deploy (alias)"
check_npm_script "monitor" "Script monitor"
check_npm_script "maintenance" "Script maintenance"

echo ""

# 7. Utilitaires
echo "🛠️  7. Utilitaires:"
echo ""

check_npm_script "health" "Script health"

echo ""

# 8. Vérifier les scripts
echo "📝 8. Vérification des scripts:"
echo ""

SCRIPT_DIR="scripts"
SCRIPT_COUNT=0
EXECUTABLE_COUNT=0

if [ -d "$SCRIPT_DIR" ]; then
  for script in "$SCRIPT_DIR"/*.sh; do
    if [ -f "$script" ]; then
      SCRIPT_COUNT=$((SCRIPT_COUNT + 1))
      if [ -x "$script" ]; then
        EXECUTABLE_COUNT=$((EXECUTABLE_COUNT + 1))
      fi
    fi
  done
  
  echo "  📄 Scripts trouvés: $SCRIPT_COUNT"
  echo "  ✅ Scripts exécutables: $EXECUTABLE_COUNT"
  
  if [ $SCRIPT_COUNT -eq $EXECUTABLE_COUNT ]; then
    ACTIVATED=$((ACTIVATED + 1))
  else
    echo "  ⚠️  Certains scripts ne sont pas exécutables"
    echo "     Correction: chmod +x scripts/*.sh"
    SKIPPED=$((SKIPPED + 1))
  fi
else
  echo "  ❌ Répertoire scripts/ non trouvé"
  FAILED=$((FAILED + 1))
fi

echo ""

# 9. Vérifier la documentation
echo "📚 9. Documentation:"
echo ""

DOCS=(
  "docs/database-tools.md"
  "docs/ssh-and-github-tools.md"
  "docs/docker-tools.md"
  "docs/deployment-tools.md"
  "docs/QUICK_REFERENCE.md"
  "docs/TOOLS_INDEX.md"
  "README-TOOLS.md"
)

DOC_COUNT=0
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    DOC_COUNT=$((DOC_COUNT + 1))
  fi
done

echo "  📄 Documentation trouvée: $DOC_COUNT/${#DOCS[@]}"
if [ $DOC_COUNT -eq ${#DOCS[@]} ]; then
  echo "  ✅ Toute la documentation est présente"
  ACTIVATED=$((ACTIVATED + 1))
else
  echo "  ⚠️  Documentation incomplète"
  SKIPPED=$((SKIPPED + 1))
fi

echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résumé de l'activation:"
echo ""

echo "  ✅ Activés/Prêts: $ACTIVATED"
echo "  ⚠️  Optionnels/Non configurés: $SKIPPED"
echo "  ❌ Manquants/Erreurs: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  if [ $SKIPPED -eq 0 ]; then
    echo "🎉 Tous les outils sont activés et prêts!"
  else
    echo "✅ Outils essentiels activés"
    echo "💡 Certains outils optionnels peuvent être installés"
  fi
else
  echo "⚠️  Certains outils nécessitent une attention"
  echo "💡 Consultez les messages ci-dessus pour les détails"
fi

echo ""
echo "💡 Commandes utiles:"
echo "   npm run health          - Vérification de santé"
echo "   npm run ssh:setup check  - Vérifier les outils SSH"
echo "   npm run docker status   - Statut Docker"
echo ""

# Suggestions d'installation
if [ $SKIPPED -gt 0 ] || [ $FAILED -gt 0 ]; then
  echo "📦 Suggestions d'installation:"
  echo ""
  
  if ! command -v pgcli &> /dev/null; then
    echo "   pipx install pgcli"
  fi
  
  if ! command -v gh &> /dev/null; then
    echo "   brew install gh && npm run gh:auth"
  fi
  
  if ! docker info &> /dev/null 2>&1; then
    case "$OS" in
      macos)
        echo "   open -a Docker"
        ;;
      linux)
        echo "   sudo systemctl start docker"
        ;;
    esac
  fi
fi

exit $FAILED

