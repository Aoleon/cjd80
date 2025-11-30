#!/bin/bash
set -e

# ============================================================================
# Script de vérification des dépendances et vulnérabilités
# Usage: ./scripts/check-dependencies.sh
# ============================================================================

echo "=================================================="
echo "🔍 Vérification des Dépendances"
echo "=================================================="

# 1. Audit de sécurité
echo ""
echo "🔒 Audit de sécurité (npm audit)..."
AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{}')
VULNERABILITIES=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")

if [ "$VULNERABILITIES" = "0" ] || [ -z "$VULNERABILITIES" ]; then
  echo "   ✅ Aucune vulnérabilité détectée"
else
  CRITICAL=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
  HIGH=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
  MODERATE=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.moderate // 0' 2>/dev/null || echo "0")
  
  echo "   ⚠️  Vulnérabilités détectées:"
  echo "      - Critique: $CRITICAL"
  echo "      - Haute: $HIGH"
  echo "      - Modérée: $MODERATE"
  echo "      - Total: $VULNERABILITIES"
fi

# 2. Dépendances obsolètes
echo ""
echo "📦 Vérification dépendances obsolètes..."
OUTDATED=$(npm outdated --json 2>/dev/null || echo '{}')
OUTDATED_COUNT=$(echo "$OUTDATED" | jq 'length' 2>/dev/null || echo "0")

if [ "$OUTDATED_COUNT" = "0" ]; then
  echo "   ✅ Toutes les dépendances sont à jour"
else
  echo "   ⚠️  $OUTDATED_COUNT dépendance(s) obsolète(s)"
  echo "   💡 Exécutez 'npm outdated' pour voir les détails"
fi

# 3. Dépendances critiques
echo ""
echo "🎯 Vérification dépendances critiques..."
CRITICAL_DEPS=(
  "@nestjs/core"
  "@nestjs/common"
  "drizzle-orm"
  "express"
  "react"
  "typescript"
)

MISSING=0
for dep in "${CRITICAL_DEPS[@]}"; do
  if grep -q "\"$dep\":" package.json; then
    VERSION=$(grep "\"$dep\":" package.json | head -1 | sed 's/.*"\([^"]*\)".*/\1/' | sed 's/[^0-9.]//g')
    echo "   ✅ $dep: $VERSION"
  else
    echo "   ❌ $dep: Manquante"
    MISSING=$((MISSING + 1))
  fi
done

# 4. Duplications
echo ""
echo "🔄 Vérification duplications..."
if grep -q "\"playwright\":" package.json && grep -q "\"@playwright/test\":" package.json; then
  echo "   ⚠️  Duplication: playwright et @playwright/test"
fi

if grep -q "\"@replit/vite-plugin" package.json; then
  echo "   ⚠️  Plugins Replit détectés (peuvent être supprimés si non utilisés)"
fi

# Résumé
echo ""
echo "=================================================="
echo "📊 Résumé"
echo "=================================================="
echo "   Vulnérabilités: $VULNERABILITIES"
echo "   Dépendances obsolètes: $OUTDATED_COUNT"
echo "   Dépendances manquantes: $MISSING"

if [ "$VULNERABILITIES" = "0" ] && [ "$MISSING" -eq 0 ]; then
  echo ""
  echo "✅ Vérification réussie !"
  exit 0
else
  echo ""
  echo "⚠️  Vérification terminée avec avertissements"
  exit 0
fi

