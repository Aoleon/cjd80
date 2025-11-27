#!/bin/bash

# Script pour gérer GitHub Actions
# Utilise GitHub CLI (gh) et act pour tester localement

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Gère les GitHub Actions du projet.

Commands:
  list              Lister les workflows disponibles
  run WORKFLOW      Exécuter un workflow
  status            Voir le statut des dernières exécutions
  logs RUN_ID       Voir les logs d'une exécution
  test [WORKFLOW]   Tester un workflow localement avec act
  watch             Surveiller les exécutions en cours
  enable WORKFLOW   Activer un workflow
  disable WORKFLOW  Désactiver un workflow

Options:
  -h, --help        Afficher cette aide
  -w, --workflow    Nom du workflow
  -r, --run-id      ID de l'exécution
  -b, --branch      Branche (défaut: main)

Exemples:
  $0 list
  $0 status
  $0 run ci.yml
  $0 test ci.yml
  $0 logs 123456789
  $0 watch
EOF
}

# Vérifier que gh est installé
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

# Lister les workflows
list_workflows() {
  check_gh
  echo "📋 Workflows disponibles:"
  echo ""
  gh workflow list
}

# Voir le statut
show_status() {
  check_gh
  echo "📊 Statut des dernières exécutions:"
  echo ""
  gh run list --limit 10
}

# Exécuter un workflow
run_workflow() {
  local workflow="$1"
  local branch="${2:-main}"
  
  check_gh
  
  if [ -z "$workflow" ]; then
    echo "❌ Nom du workflow requis"
    echo "💡 Utilisez: $0 list pour voir les workflows disponibles"
    exit 1
  fi
  
  echo "🚀 Exécution du workflow: $workflow"
  gh workflow run "$workflow" --ref "$branch"
  echo "✅ Workflow déclenché"
  echo "💡 Suivez l'exécution avec: $0 watch"
}

# Voir les logs
show_logs() {
  local run_id="$1"
  
  check_gh
  
  if [ -z "$run_id" ]; then
    echo "❌ ID d'exécution requis"
    echo "💡 Utilisez: $0 status pour voir les exécutions"
    exit 1
  fi
  
  echo "📋 Logs de l'exécution #$run_id:"
  echo ""
  gh run view "$run_id" --log
}

# Tester un workflow localement
test_workflow() {
  local workflow="$1"
  
  if ! command -v act &> /dev/null; then
    echo "❌ act n'est pas installé"
    echo "📦 Installation: brew install act"
    exit 1
  fi
  
  if [ -z "$workflow" ]; then
    echo "🧪 Test de tous les workflows..."
    act
  else
    echo "🧪 Test du workflow: $workflow"
    act -W ".github/workflows/$workflow"
  fi
}

# Surveiller les exécutions
watch_runs() {
  check_gh
  echo "👀 Surveillance des exécutions en cours..."
  echo "💡 Appuyez sur Ctrl+C pour quitter"
  echo ""
  
  while true; do
    clear
    echo "📊 Exécutions en cours:"
    echo ""
    gh run list --limit 5
    echo ""
    echo "⏱️  Actualisation dans 5 secondes..."
    sleep 5
  done
}

# Activer un workflow
enable_workflow() {
  local workflow="$1"
  
  check_gh
  
  if [ -z "$workflow" ]; then
    echo "❌ Nom du workflow requis"
    exit 1
  fi
  
  echo "✅ Activation du workflow: $workflow"
  gh workflow enable "$workflow"
}

# Désactiver un workflow
disable_workflow() {
  local workflow="$1"
  
  check_gh
  
  if [ -z "$workflow" ]; then
    echo "❌ Nom du workflow requis"
    exit 1
  fi
  
  echo "⏸️  Désactivation du workflow: $workflow"
  gh workflow disable "$workflow"
}

# Main
COMMAND="${1:-status}"
shift || true

case "$COMMAND" in
  list)
    list_workflows
    ;;
  status)
    show_status
    ;;
  run)
    WORKFLOW="$1"
    BRANCH="${2:-main}"
    run_workflow "$WORKFLOW" "$BRANCH"
    ;;
  logs)
    RUN_ID="$1"
    show_logs "$RUN_ID"
    ;;
  test)
    WORKFLOW="$1"
    test_workflow "$WORKFLOW"
    ;;
  watch)
    watch_runs
    ;;
  enable)
    WORKFLOW="$1"
    enable_workflow "$WORKFLOW"
    ;;
  disable)
    WORKFLOW="$1"
    disable_workflow "$WORKFLOW"
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

