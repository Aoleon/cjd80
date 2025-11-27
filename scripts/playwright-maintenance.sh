#!/bin/bash

# Script de maintenance pour les tests Playwright
# Nettoie, optimise et maintient les tests

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Maintenance des tests Playwright.

Commands:
  clean                Nettoyer les rapports et artefacts
  update               Mettre à jour Playwright et les navigateurs
  install              Installer les navigateurs
  validate             Valider la configuration
  optimize             Optimiser les tests
  migrate              Migrer vers une nouvelle version
  check                Vérifier l'état des tests

Options:
  -h, --help          Afficher cette aide
  --force             Forcer sans confirmation
  --dry-run           Simulation sans modifications

Exemples:
  $0 clean
  $0 update
  $0 install
  $0 validate
EOF
}

# Nettoyer
clean_artifacts() {
  local force="${1:-false}"
  local dry_run="${2:-false}"
  
  echo "🧹 Nettoyage des artefacts Playwright..."
  echo ""
  
  if [ "$dry_run" = true ]; then
    echo "🔍 [DRY-RUN] Simulation du nettoyage"
    echo ""
  fi
  
  local dirs_to_clean=(
    "playwright-report"
    "test-results"
    "playwright/.cache"
    "screenshots"
    "videos"
  )
  
  for dir in "${dirs_to_clean[@]}"; do
    if [ -d "$dir" ]; then
      if [ "$dry_run" = false ]; then
        if [ "$force" = true ]; then
          rm -rf "$dir"
          echo "  ✅ Supprimé: $dir"
        else
          read -p "Supprimer $dir? (y/N): " confirm
          if [[ "$confirm" =~ ^[Yy]$ ]]; then
            rm -rf "$dir"
            echo "  ✅ Supprimé: $dir"
          fi
        fi
      else
        echo "  [DRY-RUN] Supprimerait: $dir"
      fi
    fi
  done
  
  # Nettoyer les fichiers temporaires
  find . -name "*.trace.zip" -type f 2>/dev/null | while read trace_file; do
    if [ "$dry_run" = false ]; then
      if [ "$force" = true ]; then
        rm -f "$trace_file"
        echo "  ✅ Supprimé: $trace_file"
      fi
    else
      echo "  [DRY-RUN] Supprimerait: $trace_file"
    fi
  done
  
  if [ "$dry_run" = false ]; then
    echo ""
    echo "✅ Nettoyage terminé"
  fi
}

# Mettre à jour
update_playwright() {
  local force="${1:-false}"
  
  echo "🔄 Mise à jour de Playwright..."
  echo ""
  
  if [ "$force" = true ]; then
    npm install -D @playwright/test@latest
  else
    npm update @playwright/test
  fi
  
  echo ""
  echo "📦 Mise à jour des navigateurs..."
  npx playwright install --with-deps
  
  echo ""
  echo "✅ Mise à jour terminée"
}

# Installer les navigateurs
install_browsers() {
  echo "📦 Installation des navigateurs Playwright..."
  echo ""
  
  npx playwright install --with-deps
  
  echo ""
  echo "✅ Navigateurs installés"
}

# Valider la configuration
validate_config() {
  echo "✅ Validation de la configuration Playwright..."
  echo ""
  
  # Vérifier que playwright.config.ts existe
  if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    echo "  ✅ Fichier de configuration trouvé"
  else
    echo "  ❌ Fichier de configuration non trouvé"
    echo "     Créer: npx playwright install"
    exit 1
  fi
  
  # Vérifier que les tests existent
  local test_count=$(find tests -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$test_count" -gt 0 ]; then
    echo "  ✅ $test_count fichier(s) de test trouvé(s)"
  else
    echo "  ⚠️  Aucun fichier de test trouvé"
  fi
  
  # Vérifier la version de Playwright
  if npx playwright --version &> /dev/null; then
    local version=$(npx playwright --version)
    echo "  ✅ Playwright installé: $version"
  else
    echo "  ❌ Playwright non installé"
    exit 1
  fi
  
  echo ""
  echo "✅ Configuration valide"
}

# Optimiser les tests
optimize_tests() {
  echo "⚡ Optimisation des tests..."
  echo ""
  
  echo "  💡 Recommandations d'optimisation:"
  echo ""
  echo "  1. Utiliser des sélecteurs stables"
  echo "  2. Éviter les attentes fixes (sleep)"
  echo "  3. Utiliser les fixtures pour la réutilisation"
  echo "  4. Paralléliser les tests avec --workers"
  echo "  5. Utiliser les snapshots pour les comparaisons"
  echo ""
  
  # Analyser les tests pour des optimisations potentielles
  echo "  🔍 Analyse des tests..."
  
  local slow_tests=0
  find tests -name "*.spec.ts" 2>/dev/null | while read test_file; do
    if grep -qE "page\.waitForTimeout|sleep|setTimeout" "$test_file" 2>/dev/null; then
      echo "    ⚠️  $test_file (contient des attentes fixes)"
      slow_tests=$((slow_tests + 1))
    fi
  done
  
  if [ "$slow_tests" -eq 0 ]; then
    echo "    ✅ Aucun test avec attentes fixes détecté"
  fi
}

# Vérifier l'état
check_status() {
  echo "🔍 Vérification de l'état des tests..."
  echo ""
  
  # Vérifier Playwright
  if npx playwright --version &> /dev/null; then
    local version=$(npx playwright --version)
    echo "  ✅ Playwright: $version"
  else
    echo "  ❌ Playwright non installé"
    exit 1
  fi
  
  # Vérifier les navigateurs
  echo ""
  echo "  🌐 Navigateurs installés:"
  npx playwright install --dry-run 2>&1 | grep -E "chromium|firefox|webkit" || echo "    ✅ Tous les navigateurs installés"
  
  # Compter les tests
  local test_files=$(find tests -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | wc -l | tr -d ' ')
  echo ""
  echo "  📁 Fichiers de test: $test_files"
  
  # Vérifier la configuration
  if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
    echo "  ✅ Configuration: Présente"
  else
    echo "  ❌ Configuration: Manquante"
  fi
  
  echo ""
  echo "✅ Vérification terminée"
}

# Main
COMMAND="${1:-check}"
shift || true

FORCE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
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
  clean)
    clean_artifacts "$FORCE" "$DRY_RUN"
    ;;
  update)
    update_playwright "$FORCE"
    ;;
  install)
    install_browsers
    ;;
  validate)
    validate_config
    ;;
  optimize)
    optimize_tests
    ;;
  check)
    check_status
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




