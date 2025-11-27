#!/bin/bash

# Script pour analyser les résultats des tests Playwright
# Statistiques, tendances, et recommandations

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Analyse les résultats des tests Playwright.

Commands:
  stats                Statistiques des tests
  failures             Analyser les échecs
  trends               Tendances sur plusieurs exécutions
  coverage             Couverture de code
  performance          Analyse de performance
  flaky                Détecter les tests instables
  compare              Comparer deux exécutions

Options:
  -h, --help          Afficher cette aide
  -r, --report DIR    Répertoire du rapport (défaut: playwright-report)
  -j, --json FILE     Fichier JSON des résultats
  --since DATE        Analyser depuis une date
  --format FORMAT      Format de sortie (text, json, html)

Exemples:
  $0 stats
  $0 failures
  $0 trends --since 2025-01-01
  $0 flaky
EOF
}

# Statistiques des tests
show_stats() {
  local report_dir="${1:-playwright-report}"
  local format="${2:-text}"
  
  if [ ! -d "$report_dir" ]; then
    echo "❌ Rapport non trouvé: $report_dir"
    echo "💡 Exécutez d'abord: npm run test:playwright run"
    exit 1
  fi
  
  echo "📊 Statistiques des tests Playwright"
  echo ""
  
  # Compter les tests
  local total_tests=0
  local passed_tests=0
  local failed_tests=0
  local skipped_tests=0
  
  # Analyser le rapport HTML si disponible
  if [ -f "$report_dir/index.html" ]; then
    echo "📄 Rapport HTML disponible: $report_dir/index.html"
    echo "💡 Ouvrir: npx playwright show-report"
  fi
  
  # Chercher les fichiers de résultats JSON
  local results_file=$(find "$report_dir" -name "*.json" | head -1)
  
  if [ -n "$results_file" ] && [ -f "$results_file" ]; then
    echo "📋 Analyse du fichier de résultats: $results_file"
    echo ""
    
    # Utiliser jq si disponible pour parser le JSON
    if command -v jq &> /dev/null; then
      total_tests=$(jq '.stats.total' "$results_file" 2>/dev/null || echo "0")
      passed_tests=$(jq '.stats.passed' "$results_file" 2>/dev/null || echo "0")
      failed_tests=$(jq '.stats.failed' "$results_file" 2>/dev/null || echo "0")
      skipped_tests=$(jq '.stats.skipped' "$results_file" 2>/dev/null || echo "0")
      
      echo "  Total: $total_tests"
      echo "  ✅ Réussis: $passed_tests"
      echo "  ❌ Échoués: $failed_tests"
      echo "  ⏭️  Ignorés: $skipped_tests"
      echo ""
      
      if [ "$total_tests" -gt 0 ]; then
        local success_rate=$((passed_tests * 100 / total_tests))
        echo "  📈 Taux de réussite: $success_rate%"
      fi
    else
      echo "  ℹ️  jq non installé, analyse basique"
      echo "  💡 Installation: brew install jq"
    fi
  else
    echo "  ⚠️  Fichier de résultats JSON non trouvé"
    echo "  💡 Exécutez les tests avec: npm run test:playwright run"
  fi
  
  # Analyser les fichiers de test
  echo ""
  echo "📁 Fichiers de test:"
  local test_files=$(find tests -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | wc -l | tr -d ' ')
  echo "  Nombre de fichiers: $test_files"
  
  local total_test_cases=0
  find tests -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | while read test_file; do
    local cases=$(grep -cE "^\s*(test|it)\(" "$test_file" 2>/dev/null || echo "0")
    total_test_cases=$((total_test_cases + cases))
  done
  
  echo "  Nombre de cas de test: $total_test_cases"
}

# Analyser les échecs
analyze_failures() {
  local report_dir="${1:-playwright-report}"
  
  if [ ! -d "$report_dir" ]; then
    echo "❌ Rapport non trouvé"
    exit 1
  fi
  
  echo "🔍 Analyse des échecs"
  echo ""
  
  # Chercher les traces d'échec
  local failure_traces=$(find "$report_dir" -name "*.zip" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$failure_traces" -gt 0 ]; then
    echo "  📦 Traces d'échec trouvées: $failure_traces"
    echo ""
    echo "  Fichiers de trace:"
    find "$report_dir" -name "*.zip" 2>/dev/null | while read trace_file; do
      echo "    - $trace_file"
      echo "      Visualiser: npx playwright show-trace $trace_file"
    done
  else
    echo "  ✅ Aucune trace d'échec trouvée"
  fi
  
  # Chercher les captures d'écran d'échec
  local failure_screenshots=$(find "$report_dir" -name "*failed*.png" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$failure_screenshots" -gt 0 ]; then
    echo ""
    echo "  📸 Captures d'écran d'échec: $failure_screenshots"
  fi
}

# Tendances
show_trends() {
  local since_date="${1:-}"
  
  echo "📈 Tendances des tests"
  echo ""
  
  if [ -n "$since_date" ]; then
    echo "  Période: depuis $since_date"
  else
    echo "  Période: toutes les exécutions"
  fi
  
  echo ""
  echo "  💡 Pour des tendances détaillées, utilisez un outil de CI/CD"
  echo "     ou un système de tracking des résultats de tests"
}

# Détecter les tests instables
detect_flaky() {
  echo "🔍 Détection des tests instables (flaky)"
  echo ""
  
  echo "  💡 Les tests instables sont ceux qui échouent de manière intermittente"
  echo ""
  echo "  Méthodes de détection:"
  echo "    1. Exécuter plusieurs fois: npm run test:playwright run --retries 3"
  echo "    2. Analyser les logs d'exécution"
  echo "    3. Utiliser les rapports de tendances"
  echo ""
  echo "  Tests suspects (à vérifier manuellement):"
  find tests -name "*.spec.ts" 2>/dev/null | while read test_file; do
    # Chercher des patterns suspects
    if grep -qE "(wait|sleep|timeout|retry)" "$test_file" 2>/dev/null; then
      echo "    ⚠️  $test_file (contient des attentes/temporisations)"
    fi
  done
}

# Comparer deux exécutions
compare_runs() {
  local report1="$1"
  local report2="$2"
  
  if [ -z "$report1" ] || [ -z "$report2" ]; then
    echo "❌ Deux rapports requis"
    echo "💡 Utilisez: $0 compare <rapport1> <rapport2>"
    exit 1
  fi
  
  echo "📊 Comparaison de deux exécutions"
  echo ""
  echo "  Rapport 1: $report1"
  echo "  Rapport 2: $report2"
  echo ""
  echo "  💡 Comparaison détaillée à implémenter"
}

# Main
COMMAND="${1:-stats}"
shift || true

REPORT_DIR="playwright-report"
JSON_FILE=""
SINCE_DATE=""
FORMAT="text"

while [[ $# -gt 0 ]]; do
  case $1 in
    -r|--report)
      REPORT_DIR="$2"
      shift 2
      ;;
    -j|--json)
      JSON_FILE="$2"
      shift 2
      ;;
    --since)
      SINCE_DATE="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
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
  stats)
    show_stats "$REPORT_DIR" "$FORMAT"
    ;;
  failures)
    analyze_failures "$REPORT_DIR"
    ;;
  trends)
    show_trends "$SINCE_DATE"
    ;;
  flaky)
    detect_flaky
    ;;
  compare)
    compare_runs "$1" "$2"
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




