#!/bin/bash

# Script pour gérer les tests Playwright
# Interface enrichie pour exécuter, déboguer et analyser les tests

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Gère les tests Playwright avec une interface enrichie.

Commands:
  run                 Exécuter les tests
  ui                  Ouvrir l'UI Playwright
  debug               Déboguer un test spécifique
  report              Ouvrir le dernier rapport
  trace               Visualiser une trace
  codegen             Générer du code de test
  screenshot          Prendre des captures d'écran
  list                Lister tous les tests
  watch               Surveiller et réexécuter les tests

Options:
  -h, --help          Afficher cette aide
  -f, --file FILE     Fichier de test spécifique
  -g, --grep PATTERN  Filtrer par pattern
  -p, --project NAME  Projet spécifique
  -w, --workers NUM   Nombre de workers (défaut: auto)
  --headed            Exécuter en mode headed
  --debug             Mode debug
  --ui                Mode UI interactif
  --trace             Activer le tracing
  --video             Activer l'enregistrement vidéo
  --screenshot        Prendre des captures d'écran
  --retries NUM       Nombre de tentatives (défaut: 0)
  --timeout NUM       Timeout en ms (défaut: 30000)
  --update-snapshots  Mettre à jour les snapshots

Exemples:
  $0 run
  $0 run -f tests/e2e/login.spec.ts
  $0 run -g "login"
  $0 ui
  $0 debug -f tests/e2e/login.spec.ts
  $0 report
  $0 codegen http://localhost:5001
EOF
}

# Vérifier que Playwright est installé
check_playwright() {
  if ! command -v npx &> /dev/null; then
    echo "❌ npx n'est pas disponible"
    exit 1
  fi
  
  if ! npx playwright --version &> /dev/null; then
    echo "❌ Playwright n'est pas installé"
    echo "📦 Installation: npm install -D @playwright/test && npx playwright install"
    exit 1
  fi
}

# Exécuter les tests
run_tests() {
  check_playwright
  
  local file="${1:-}"
  local grep_pattern="${2:-}"
  local project="${3:-}"
  local workers="${4:-}"
  local headed="${5:-false}"
  local debug="${6:-false}"
  local ui="${7:-false}"
  local trace="${8:-false}"
  local video="${9:-false}"
  local screenshot="${10:-false}"
  local retries="${11:-0}"
  local timeout="${12:-30000}"
  local update_snapshots="${13:-false}"
  
  local cmd="npx playwright test"
  
  if [ -n "$file" ]; then
    cmd="$cmd $file"
  fi
  
  if [ -n "$grep_pattern" ]; then
    cmd="$cmd --grep \"$grep_pattern\""
  fi
  
  if [ -n "$project" ]; then
    cmd="$cmd --project \"$project\""
  fi
  
  if [ -n "$workers" ]; then
    cmd="$cmd --workers $workers"
  fi
  
  if [ "$headed" = "true" ]; then
    cmd="$cmd --headed"
  fi
  
  if [ "$debug" = "true" ]; then
    cmd="$cmd --debug"
  fi
  
  if [ "$ui" = "true" ]; then
    cmd="$cmd --ui"
  fi
  
  if [ "$trace" = "true" ]; then
    cmd="$cmd --trace on"
  fi
  
  if [ "$video" = "true" ]; then
    cmd="$cmd --video on"
  fi
  
  if [ "$screenshot" = "true" ]; then
    cmd="$cmd --screenshot on"
  fi
  
  if [ "$retries" -gt 0 ]; then
    cmd="$cmd --retries $retries"
  fi
  
  if [ -n "$timeout" ]; then
    cmd="$cmd --timeout $timeout"
  fi
  
  if [ "$update_snapshots" = "true" ]; then
    cmd="$cmd --update-snapshots"
  fi
  
  echo "🧪 Exécution des tests Playwright..."
  echo "   Commande: $cmd"
  echo ""
  
  eval $cmd
}

# Ouvrir l'UI Playwright
open_ui() {
  check_playwright
  
  echo "🎨 Ouverture de l'UI Playwright..."
  npx playwright test --ui
}

# Déboguer un test
debug_test() {
  check_playwright
  
  local file="$1"
  
  if [ -z "$file" ]; then
    echo "❌ Fichier de test requis"
    echo "💡 Utilisez: $0 debug -f tests/e2e/test.spec.ts"
    exit 1
  fi
  
  if [ ! -f "$file" ]; then
    echo "❌ Fichier non trouvé: $file"
    exit 1
  fi
  
  echo "🐛 Débogage du test: $file"
  echo "💡 Le navigateur s'ouvrira en mode debug"
  echo ""
  
  npx playwright test "$file" --debug
}

# Ouvrir le rapport
open_report() {
  check_playwright
  
  local report_dir="playwright-report"
  
  if [ ! -d "$report_dir" ]; then
    echo "❌ Aucun rapport trouvé"
    echo "💡 Exécutez d'abord: $0 run"
    exit 1
  fi
  
  echo "📊 Ouverture du rapport..."
  npx playwright show-report
}

# Visualiser une trace
view_trace() {
  check_playwright
  
  local trace_file="$1"
  
  if [ -z "$trace_file" ]; then
    echo "❌ Fichier de trace requis"
    echo "💡 Utilisez: $0 trace <fichier-trace.zip>"
    exit 1
  fi
  
  if [ ! -f "$trace_file" ]; then
    echo "❌ Fichier de trace non trouvé: $trace_file"
    exit 1
  fi
  
  echo "🔍 Visualisation de la trace: $trace_file"
  npx playwright show-trace "$trace_file"
}

# Générer du code de test
generate_code() {
  check_playwright
  
  local url="${1:-http://localhost:5001}"
  
  echo "📝 Génération de code de test pour: $url"
  echo "💡 Interagissez avec le navigateur pour générer le code"
  echo ""
  
  npx playwright codegen "$url"
}

# Prendre des captures d'écran
take_screenshots() {
  check_playwright
  
  local url="${1:-http://localhost:5001}"
  local output_dir="${2:-screenshots}"
  
  echo "📸 Prise de captures d'écran de: $url"
  echo "   Destination: $output_dir"
  echo ""
  
  mkdir -p "$output_dir"
  
  npx playwright screenshot "$url" --full-page --output "$output_dir/screenshot-$(date +%Y%m%d-%H%M%S).png"
  
  echo "✅ Capture d'écran sauvegardée dans $output_dir"
}

# Lister tous les tests
list_tests() {
  check_playwright
  
  echo "📋 Liste des tests disponibles:"
  echo ""
  
  find tests -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | while read test_file; do
    echo "  📄 $test_file"
    # Extraire les noms de tests
    grep -E "^\s*(test|it)\(" "$test_file" 2>/dev/null | sed 's/.*test(\([^,]*\).*/\1/' | sed "s/'//g" | sed 's/"//g' | while read test_name; do
      echo "     - $test_name"
    done
  done
}

# Surveiller et réexécuter
watch_tests() {
  check_playwright
  
  local file="${1:-}"
  
  echo "👀 Surveillance des tests (Ctrl+C pour arrêter)..."
  echo ""
  
  if [ -n "$file" ]; then
    echo "   Fichier: $file"
  else
    echo "   Tous les tests"
  fi
  
  echo ""
  
  # Utiliser chokidar ou un équivalent pour surveiller les changements
  if command -v chokidar &> /dev/null; then
    chokidar "tests/**/*.spec.ts" -c "npx playwright test ${file:-}"
  else
    echo "⚠️  chokidar non installé, utilisation du mode manuel"
    echo "💡 Installation: npm install -g chokidar-cli"
    echo ""
    echo "Mode manuel: exécutez les tests manuellement après chaque modification"
  fi
}

# Main
COMMAND="${1:-help}"
shift || true

FILE=""
GREP=""
PROJECT=""
WORKERS=""
HEADED=false
DEBUG=false
UI=false
TRACE=false
VIDEO=false
SCREENSHOT=false
RETRIES=0
TIMEOUT=30000
UPDATE_SNAPSHOTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      FILE="$2"
      shift 2
      ;;
    -g|--grep)
      GREP="$2"
      shift 2
      ;;
    -p|--project)
      PROJECT="$2"
      shift 2
      ;;
    -w|--workers)
      WORKERS="$2"
      shift 2
      ;;
    --headed)
      HEADED=true
      shift
      ;;
    --debug)
      DEBUG=true
      shift
      ;;
    --ui)
      UI=true
      shift
      ;;
    --trace)
      TRACE=true
      shift
      ;;
    --video)
      VIDEO=true
      shift
      ;;
    --screenshot)
      SCREENSHOT=true
      shift
      ;;
    --retries)
      RETRIES="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --update-snapshots)
      UPDATE_SNAPSHOTS=true
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
  run)
    run_tests "$FILE" "$GREP" "$PROJECT" "$WORKERS" "$HEADED" "$DEBUG" "$UI" "$TRACE" "$VIDEO" "$SCREENSHOT" "$RETRIES" "$TIMEOUT" "$UPDATE_SNAPSHOTS"
    ;;
  ui)
    open_ui
    ;;
  debug)
    debug_test "$FILE"
    ;;
  report)
    open_report
    ;;
  trace)
    view_trace "$FILE"
    ;;
  codegen)
    generate_code "${FILE:-http://localhost:5001}"
    ;;
  screenshot)
    take_screenshots "${FILE:-http://localhost:5001}"
    ;;
  list)
    list_tests
    ;;
  watch)
    watch_tests "$FILE"
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




