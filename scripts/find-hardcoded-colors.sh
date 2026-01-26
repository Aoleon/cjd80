#!/bin/bash

# Script pour trouver toutes les couleurs hardcodées dans le code
# Cherche: hex colors, rgb/rgba, hsl/hsla, noms de couleurs CSS

echo "=== RECHERCHE DES COULEURS HARDCODÉES ==="
echo ""

# Définir les répertoires à scanner
DIRS="app components lib hooks"

# Exclure certains fichiers
EXCLUDE="node_modules|\.next|dist|theme-generator|branding-core|globals.css|theme-test"

echo "📁 Répertoires scannés: $DIRS"
echo "🚫 Exclusions: $EXCLUDE"
echo ""

echo "=== 1. Couleurs HEX (#xxxxxx) ==="
grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -nE "#[0-9a-fA-F]{3,6}" $DIRS 2>/dev/null | grep -vE "$EXCLUDE" | wc -l
echo ""

echo "=== 2. rgb() / rgba() ==="
grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -nE "rgba?\(" $DIRS 2>/dev/null | grep -vE "$EXCLUDE" | wc -l
echo ""

echo "=== 3. hsl() / hsla() ==="
grep -r --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -nE "hsla?\(" $DIRS 2>/dev/null | grep -vE "$EXCLUDE" | wc -l
echo ""

echo "=== 4. Noms de couleurs CSS (dans style/className) ==="
grep -r --include="*.tsx" --include="*.ts" -nE "(color|background|border).*:.*['\"]?(white|black|red|green|blue|yellow|orange|purple|pink|gray)" $DIRS 2>/dev/null | grep -vE "$EXCLUDE|text-|bg-|border-" | wc -l
echo ""

echo "=== DÉTAILS DES OCCURRENCES ==="
echo ""
echo "--- Couleurs HEX ---"
grep -r --include="*.tsx" --include="*.ts" -nE "#[0-9a-fA-F]{3,6}" $DIRS 2>/dev/null | grep -vE "$EXCLUDE"
