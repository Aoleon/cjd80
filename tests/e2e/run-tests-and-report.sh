#!/bin/bash

# Script pour exécuter les tests Playwright et importer automatiquement les bugs
# Usage: ./test/run-tests-and-report.sh [options playwright]

echo "🎭 Exécution des tests Playwright E2E..."
echo ""

# Exécuter les tests Playwright
npx playwright test "$@"
TEST_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Si des tests ont échoué, importer les rapports de bugs
if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "⚠️  Des tests ont échoué - Importation des rapports de bugs..."
    echo ""
    
    # Vérifier si le dossier de rapports existe
    if [ -d "test-results/bug-reports" ]; then
        BUG_COUNT=$(ls -1 test-results/bug-reports/*.json 2>/dev/null | wc -l)
        
        if [ $BUG_COUNT -gt 0 ]; then
            echo "📦 $BUG_COUNT rapport(s) de bug à importer"
            echo ""
            
            # Importer les bugs
            tsx test/import-bug-reports.ts
        else
            echo "ℹ️  Aucun rapport de bug généré (les tests peuvent avoir échoué sans générer de rapports)"
        fi
    else
        echo "ℹ️  Aucun rapport de bug à importer"
    fi
else
    echo "✅ Tous les tests sont passés - Aucun bug à rapporter"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Rapport HTML disponible dans: playwright-report/index.html"
echo "🌐 Ouvrir avec: npx playwright show-report"
echo ""

exit $TEST_EXIT_CODE
