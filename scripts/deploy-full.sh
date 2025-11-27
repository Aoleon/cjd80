#!/bin/bash

# Script de déploiement complet
# Combine Docker, SSH, GitHub Actions et base de données

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Déploiement complet combinant Docker, SSH, GitHub et base de données.

Commands:
  local                Déploiement local (Docker uniquement)
  remote               Déploiement distant (SSH + Docker)
  github               Déploiement via GitHub Actions
  full                 Déploiement complet (local + remote + github)
  rollback             Rollback vers une version précédente
  status               Statut de tous les environnements

Options:
  -h, --help          Afficher cette aide
  -e, --env ENV       Environnement (production, staging, dev)
  -s, --server SERVER Serveur SSH
  -b, --branch BRANCH Branche à déployer
  -t, --tag TAG       Tag/version spécifique
  --build             Reconstruire les images
  --migrate           Exécuter les migrations DB
  --backup            Créer une sauvegarde avant déploiement
  --dry-run           Simulation sans modifications

Exemples:
  $0 local
  $0 remote -s production
  $0 github -e production
  $0 full -e production -s production
  $0 rollback -e production
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

OS=$(detect_os)

# Vérifier les prérequis
check_prerequisites() {
  local errors=0
  
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    errors=$((errors + 1))
  fi
  
  if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas en cours d'exécution"
    errors=$((errors + 1))
  fi
  
  if [ $errors -gt 0 ]; then
    exit 1
  fi
}

# Déploiement local
deploy_local() {
  local build="${1:-false}"
  local migrate="${2:-false}"
  
  echo "🏠 Déploiement local (Docker)..."
  echo ""
  
  check_prerequisites
  
  # Sauvegarde si demandée
  if [ "$3" = "true" ]; then
    echo "💾 Création d'une sauvegarde..."
    npm run docker:backup backup --all
    echo ""
  fi
  
  # Construire si demandé
  if [ "$build" = "true" ]; then
    echo "🔨 Construction des images..."
    npm run docker build --no-cache
    echo ""
  fi
  
  # Démarrer les conteneurs
  echo "🚀 Démarrage des conteneurs..."
  npm run docker up --build
  echo ""
  
  # Migrations si demandées
  if [ "$migrate" = "true" ]; then
    echo "🔄 Exécution des migrations..."
    npm run docker:dev db-migrate || echo "⚠️  Migrations non disponibles"
    echo ""
  fi
  
  # Vérifier la santé
  echo "🏥 Vérification de la santé..."
  npm run docker health
  echo ""
  
  echo "✅ Déploiement local terminé"
}

# Déploiement distant
deploy_remote() {
  local server="$1"
  local build="${2:-false}"
  local migrate="${3:-false}"
  
  if [ -z "$server" ]; then
    echo "❌ Serveur requis pour le déploiement distant"
    exit 1
  fi
  
  echo "🌐 Déploiement distant sur $server..."
  echo ""
  
  # Synchroniser les fichiers
  echo "📤 Synchronisation des fichiers..."
  npm run ssh:sync push -s "$server"
  echo ""
  
  # Exécuter le déploiement sur le serveur
  echo "🚀 Déploiement sur le serveur..."
  npm run ssh:connect -s "$server" << 'EOF'
cd ~/app || cd /var/www/app || cd /app
npm run docker down
if [ "$BUILD" = "true" ]; then
  npm run docker build --no-cache
fi
npm run docker up --build
if [ "$MIGRATE" = "true" ]; then
  npm run docker:dev db-migrate || true
fi
npm run docker health
EOF
  
  echo ""
  echo "✅ Déploiement distant terminé"
}

# Déploiement GitHub Actions
deploy_github() {
  local env="$1"
  local branch="${2:-main}"
  local tag="${3:-}"
  
  if [ -z "$env" ]; then
    echo "❌ Environnement requis"
    exit 1
  fi
  
  echo "☁️  Déploiement via GitHub Actions..."
  echo "   Environnement: $env"
  echo "   Branche: $branch"
  if [ -n "$tag" ]; then
    echo "   Tag: $tag"
  fi
  echo ""
  
  npm run gh:deploy deploy -e "$env" -b "$branch" ${tag:+-t "$tag"}
  
  echo ""
  echo "✅ Déploiement GitHub Actions déclenché"
  echo "💡 Suivez l'exécution: npm run gh:actions watch"
}

# Déploiement complet
deploy_full() {
  local env="$1"
  local server="$2"
  local build="${3:-false}"
  local migrate="${4:-false}"
  local backup="${5:-false}"
  local branch="${6:-main}"
  
  echo "🚀 DÉPLOIEMENT COMPLET"
  echo "   Environnement: ${env:-local}"
  echo "   Serveur: ${server:-local}"
  echo ""
  
  # Étape 1: Local
  if [ -z "$server" ] || [ "$server" = "local" ]; then
    deploy_local "$build" "$migrate" "$backup"
    echo ""
  fi
  
  # Étape 2: Remote
  if [ -n "$server" ] && [ "$server" != "local" ]; then
    deploy_remote "$server" "$build" "$migrate"
    echo ""
  fi
  
  # Étape 3: GitHub Actions
  if [ -n "$env" ] && [ "$env" != "local" ]; then
    deploy_github "$env" "$branch"
    echo ""
  fi
  
  echo "✅ Déploiement complet terminé"
}

# Rollback
rollback_deployment() {
  local env="$1"
  local server="${2:-}"
  
  echo "⏪ Rollback de l'environnement: $env"
  echo ""
  
  if [ -n "$server" ] && [ "$server" != "local" ]; then
    echo "🌐 Rollback distant sur $server..."
    npm run ssh:connect -s "$server" << 'EOF'
cd ~/app || cd /var/www/app || cd /app
npm run docker:backup list
EOF
    echo ""
    read -p "Date de la sauvegarde à restaurer (YYYY-MM-DD): " date
    read -p "Nom du volume: " volume
    
    npm run ssh:connect -s "$server" << EOF
cd ~/app || cd /var/www/app || cd /app
npm run docker:backup restore -v "$volume" -d "$date"
npm run docker restart
EOF
  else
    echo "🏠 Rollback local..."
    npm run docker:backup list
    echo ""
    read -p "Date de la sauvegarde à restaurer (YYYY-MM-DD): " date
    read -p "Nom du volume: " volume
    
    npm run docker:backup restore -v "$volume" -d "$date"
    npm run docker restart
  fi
  
  echo ""
  echo "✅ Rollback terminé"
}

# Statut
show_status() {
  echo "📊 Statut de tous les environnements"
  echo ""
  
  # Local
  echo "🏠 Local:"
  if docker info &> /dev/null; then
    npm run docker status 2>/dev/null || echo "  ⚠️  Conteneurs non démarrés"
  else
    echo "  ❌ Docker non disponible"
  fi
  
  echo ""
  
  # GitHub Actions
  if command -v gh &> /dev/null && gh auth status &> /dev/null 2>/dev/null; then
    echo "☁️  GitHub Actions:"
    npm run gh:actions status 2>/dev/null || echo "  ⚠️  Aucun workflow en cours"
  fi
  
  echo ""
  echo "💡 Pour plus de détails:"
  echo "   Local: npm run docker status"
  echo "   GitHub: npm run gh:actions status"
}

# Main
COMMAND="${1:-help}"
shift || true

ENV=""
SERVER=""
BRANCH="main"
TAG=""
BUILD=false
MIGRATE=false
BACKUP=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--env)
      ENV="$2"
      shift 2
      ;;
    -s|--server)
      SERVER="$2"
      shift 2
      ;;
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    --build)
      BUILD=true
      shift
      ;;
    --migrate)
      MIGRATE=true
      shift
      ;;
    --backup)
      BACKUP=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

case "$COMMAND" in
  local)
    if [ "$DRY_RUN" = true ]; then
      echo "🔍 [DRY-RUN] Déploiement local simulé"
    else
      deploy_local "$BUILD" "$MIGRATE" "$BACKUP"
    fi
    ;;
  remote)
    if [ "$DRY_RUN" = true ]; then
      echo "🔍 [DRY-RUN] Déploiement distant simulé sur $SERVER"
    else
      deploy_remote "$SERVER" "$BUILD" "$MIGRATE"
    fi
    ;;
  github)
    if [ "$DRY_RUN" = true ]; then
      echo "🔍 [DRY-RUN] Déploiement GitHub Actions simulé pour $ENV"
    else
      deploy_github "$ENV" "$BRANCH" "$TAG"
    fi
    ;;
  full)
    if [ "$DRY_RUN" = true ]; then
      echo "🔍 [DRY-RUN] Déploiement complet simulé"
    else
      deploy_full "$ENV" "$SERVER" "$BUILD" "$MIGRATE" "$BACKUP" "$BRANCH"
    fi
    ;;
  rollback)
    rollback_deployment "$ENV" "$SERVER"
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

