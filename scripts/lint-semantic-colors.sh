#!/bin/bash
# Script de vérification des couleurs sémantiques
# Détecte les couleurs Tailwind hardcodées dans les fichiers TSX/TS

set -e

echo "🎨 Vérification des couleurs sémantiques dans le projet CJD80"
echo "=============================================================="
echo ""

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur d'erreurs
ERRORS=0

# Patterns à détecter
PATTERNS=(
  "bg-green-[0-9]"
  "text-green-[0-9]"
  "border-green-[0-9]"
  "bg-red-[0-9]"
  "text-red-[0-9]"
  "border-red-[0-9]"
  "bg-blue-[0-9]"
  "text-blue-[0-9]"
  "border-blue-[0-9]"
  "bg-yellow-[0-9]"
  "text-yellow-[0-9]"
  "border-yellow-[0-9]"
  "bg-orange-[0-9]"
  "text-orange-[0-9]"
)

# Suggestions de remplacement
declare -A REPLACEMENTS=(
  ["bg-green-"]="bg-success ou bg-cjd-green"
  ["text-green-"]="text-success ou text-success-dark"
  ["border-green-"]="border-success"
  ["bg-red-"]="bg-error ou bg-destructive"
  ["text-red-"]="text-error ou text-error-dark"
  ["border-red-"]="border-error ou border-destructive"
  ["bg-blue-"]="bg-info ou bg-accent"
  ["text-blue-"]="text-info ou text-info-dark"
  ["border-blue-"]="border-info"
  ["bg-yellow-"]="bg-warning"
  ["text-yellow-"]="text-warning ou text-warning-dark"
  ["border-yellow-"]="border-warning"
  ["bg-orange-"]="bg-warning"
  ["text-orange-"]="text-warning"
)

echo "📁 Recherche dans: app/ components/ lib/ hooks/"
echo ""

for pattern in "${PATTERNS[@]}"; do
  # Extraire le préfixe pour les suggestions
  prefix="${pattern%-[0-9]}"

  # Chercher les occurrences
  results=$(grep -rn "$pattern" app/ components/ lib/ hooks/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules || true)

  if [ -n "$results" ]; then
    echo -e "${RED}❌ Trouvé: $pattern${NC}"
    echo -e "${YELLOW}   Suggestion: ${REPLACEMENTS[$prefix]}${NC}"
    echo "$results" | head -5
    echo ""
    ERRORS=$((ERRORS + 1))
  fi
done

# Résultat final
echo "=============================================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Aucune couleur hardcodée trouvée!${NC}"
  echo -e "${GREEN}   Le projet utilise correctement les couleurs sémantiques.${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS type(s) de couleurs hardcodées détecté(s)${NC}"
  echo ""
  echo "💡 Guide des couleurs sémantiques:"
  echo "   - Success (vert): bg-success, text-success, bg-success-dark"
  echo "   - Error (rouge): bg-error, text-error, bg-error-dark"
  echo "   - Warning (jaune/orange): bg-warning, text-warning"
  echo "   - Info (bleu): bg-info, text-info, bg-info-dark"
  echo "   - CJD brand: bg-cjd-green, bg-cjd-green-dark"
  echo ""
  echo "📖 Documentation: .claude-stack.md section 'Semantic Colors'"
  exit 1
fi
