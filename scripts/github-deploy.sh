#!/bin/bash

# Script pour déployer via GitHub Actions
# Gère le déploiement automatique depuis GitHub

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Déploie l'application via GitHub Actions.

Commands:
  deploy              Déclencher un déploiement
  rollback            Revenir à une version précédente
  status              Voir le statut du déploiement
  logs                Voir les logs du dernier déploiement
  list-environments   Lister les environnements disponibles

Options:
  -h, --help          Afficher cette aide
  -e, --env ENV       Environnement (production, staging, dev)
  -b, --branch BRANCH Branche à déployer (défaut: main)
  -t, --tag TAG       Tag/version à déployer
  -w, --workflow FILE Fichier workflow (défaut: deploy.yml)

Exemples:
  $0 deploy -e production
  $0 deploy -e staging -b develop
  $0 rollback -e production
  $0 status -e production
  $0 logs -e production
EOF
}

# Vérifier que gh est installé et authentifié
check_gh() {
  if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé"
    echo "📦 Installation: brew install gh"
    exit 1
  fi
  
  if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub CLI n'est pas authentifié"
    echo "🔐 Authentification: gh auth login"
    exit 1
  fi
}

# Déployer
deploy() {
  check_gh
  
  local env="${1:-production}"
  local branch="${2:-main}"
  local tag="${3:-}"
  local workflow="${4:-.github/workflows/deploy.yml}"
  
  echo "🚀 Déploiement vers $env..."
  echo "   Branche: $branch"
  if [ -n "$tag" ]; then
    echo "   Tag: $tag"
  fi
  echo ""
  
  # Construire les inputs pour le workflow
  local inputs="environment=$env"
  if [ -n "$tag" ]; then
    inputs="$inputs,tag=$tag"
  fi
  
  # Déclencher le workflow
  if [ -f "$workflow" ]; then
    gh workflow run "$(basename $workflow)" \
      --ref "$branch" \
      -f "environment=$env" \
      ${tag:+-f "tag=$tag"}
  else
    # Chercher un workflow de déploiement
    local deploy_workflow=$(gh workflow list | grep -i deploy | head -1 | awk '{print $1}')
    if [ -z "$deploy_workflow" ]; then
      echo "❌ Aucun workflow de déploiement trouvé"
      exit 1
    fi
    
    gh workflow run "$deploy_workflow" \
      --ref "$branch" \
      -f "environment=$env" \
      ${tag:+-f "tag=$tag"}
  fi
  
  echo "✅ Déploiement déclenché"
  echo "💡 Suivez l'exécution avec: $0 status -e $env"
}

# Rollback
rollback() {
  check_gh
  
  local env="${1:-production}"
  
  echo "⏪ Rollback de $env..."
  echo ""
  
  # Lister les déploiements récents
  echo "📋 Derniers déploiements:"
  gh run list --workflow=deploy.yml --limit 10 | head -5
  echo ""
  
  read -p "ID du déploiement à restaurer: " run_id
  
  if [ -z "$run_id" ]; then
    echo "❌ ID requis"
    exit 1
  fi
  
  # Récupérer le commit du déploiement
  local commit=$(gh run view "$run_id" --json headSha -q .headSha)
  
  if [ -z "$commit" ]; then
    echo "❌ Impossible de récupérer le commit"
    exit 1
  fi
  
  echo "🔄 Rollback vers le commit: $commit"
  read -p "Confirmer? (y/N): " confirm
  
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    deploy "$env" "$commit" "" ".github/workflows/deploy.yml"
  else
    echo "❌ Rollback annulé"
  fi
}

# Statut
show_status() {
  check_gh
  
  local env="${1:-production}"
  
  echo "📊 Statut du déploiement ($env):"
  echo ""
  
  gh run list --workflow=deploy.yml --limit 5 | head -5
}

# Logs
show_logs() {
  check_gh
  
  local env="${1:-production}"
  
  # Récupérer le dernier run pour cet environnement
  local run_id=$(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')
  
  if [ -z "$run_id" ]; then
    echo "❌ Aucun déploiement trouvé"
    exit 1
  fi
  
  echo "📋 Logs du déploiement #$run_id ($env):"
  echo ""
  
  gh run view "$run_id" --log
}

# Lister les environnements
list_environments() {
  check_gh
  
  echo "🌍 Environnements disponibles:"
  echo ""
  
  # Récupérer les environnements depuis les workflows
  gh workflow list | grep -i deploy || echo "  Aucun workflow de déploiement trouvé"
  
  echo ""
  echo "💡 Environnements courants:"
  echo "  - production"
  echo "  - staging"
  echo "  - development"
}

# Main
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  deploy)
    ENV="production"
    BRANCH="main"
    TAG=""
    WORKFLOW=".github/workflows/deploy.yml"
    
    while [[ $# -gt 0 ]]; do
      case $1 in
        -e|--env)
          ENV="$2"
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
        -w|--workflow)
          WORKFLOW="$2"
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done
    
    deploy "$ENV" "$BRANCH" "$TAG" "$WORKFLOW"
    ;;
  rollback)
    ENV="production"
    
    while [[ $# -gt 0 ]]; do
      case $1 in
        -e|--env)
          ENV="$2"
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done
    
    rollback "$ENV"
    ;;
  status)
    ENV="production"
    
    while [[ $# -gt 0 ]]; do
      case $1 in
        -e|--env)
          ENV="$2"
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done
    
    show_status "$ENV"
    ;;
  logs)
    ENV="production"
    
    while [[ $# -gt 0 ]]; do
      case $1 in
        -e|--env)
          ENV="$2"
          shift 2
          ;;
        *)
          shift
          ;;
      esac
    done
    
    show_logs "$ENV"
    ;;
  list-environments)
    list_environments
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

