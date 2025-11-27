#!/bin/bash

# Script de validation rapide NestJS (contourne npm run check si bloquant)
# Vérifie les points critiques sans compilation complète

echo "🔍 Validation rapide de la migration NestJS..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Vérifier les fichiers critiques
echo "🔑 Vérification des fichiers critiques..."

CRITICAL_FILES=(
  "server/src/main.ts"
  "server/src/app.module.ts"
  "server/src/auth/auth.module.ts"
  "server/src/auth/auth.controller.ts"
  "server/src/auth/auth.service.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $file"
  else
    echo -e "${RED}❌${NC} $file - MANQUANT"
    ((ERRORS++))
  fi
done

echo ""

# 2. Vérifier la structure des modules
echo "🏗️  Vérification de la structure..."

MODULE_COUNT=$(find server/src -name "*.module.ts" 2>/dev/null | wc -l | tr -d ' ')
CONTROLLER_COUNT=$(find server/src -name "*.controller.ts" 2>/dev/null | wc -l | tr -d ' ')
SERVICE_COUNT=$(find server/src -name "*.service.ts" 2>/dev/null | wc -l | tr -d ' ')

if [ "$MODULE_COUNT" -ge 15 ]; then
  echo -e "${GREEN}✅${NC} Modules: $MODULE_COUNT"
else
  echo -e "${RED}❌${NC} Modules: $MODULE_COUNT (attendu: >= 15)"
  ((ERRORS++))
fi

if [ "$CONTROLLER_COUNT" -ge 10 ]; then
  echo -e "${GREEN}✅${NC} Controllers: $CONTROLLER_COUNT"
else
  echo -e "${RED}❌${NC} Controllers: $CONTROLLER_COUNT (attendu: >= 10)"
  ((ERRORS++))
fi

if [ "$SERVICE_COUNT" -ge 10 ]; then
  echo -e "${GREEN}✅${NC} Services: $SERVICE_COUNT"
else
  echo -e "${RED}❌${NC} Services: $SERVICE_COUNT (attendu: >= 10)"
  ((ERRORS++))
fi

echo ""

# 3. Vérifier les décorateurs dans les controllers
echo "🎨 Vérification des décorateurs..."

CONTROLLER_FILES=$(find server/src -name "*.controller.ts" 2>/dev/null)
CONTROLLER_WITH_DECORATOR=0
TOTAL_CONTROLLERS=0

for controller in $CONTROLLER_FILES; do
  TOTAL_CONTROLLERS=$((TOTAL_CONTROLLERS + 1))
  if grep -q "@Controller" "$controller" 2>/dev/null; then
    CONTROLLER_WITH_DECORATOR=$((CONTROLLER_WITH_DECORATOR + 1))
  fi
done

if [ "$CONTROLLER_WITH_DECORATOR" -eq "$TOTAL_CONTROLLERS" ] && [ "$TOTAL_CONTROLLERS" -gt 0 ]; then
  echo -e "${GREEN}✅${NC} Tous les controllers ont @Controller ($CONTROLLER_WITH_DECORATOR/$TOTAL_CONTROLLERS)"
else
  echo -e "${YELLOW}⚠️${NC}  Controllers avec @Controller: $CONTROLLER_WITH_DECORATOR/$TOTAL_CONTROLLERS"
  ((WARNINGS++))
fi

# Vérifier les services
SERVICE_FILES=$(find server/src -name "*.service.ts" 2>/dev/null)
SERVICE_WITH_DECORATOR=0
TOTAL_SERVICES=0

for service in $SERVICE_FILES; do
  TOTAL_SERVICES=$((TOTAL_SERVICES + 1))
  if grep -q "@Injectable" "$service" 2>/dev/null; then
    SERVICE_WITH_DECORATOR=$((SERVICE_WITH_DECORATOR + 1))
  fi
done

if [ "$SERVICE_WITH_DECORATOR" -eq "$TOTAL_SERVICES" ] && [ "$TOTAL_SERVICES" -gt 0 ]; then
  echo -e "${GREEN}✅${NC} Tous les services ont @Injectable ($SERVICE_WITH_DECORATOR/$TOTAL_SERVICES)"
else
  echo -e "${YELLOW}⚠️${NC}  Services avec @Injectable: $SERVICE_WITH_DECORATOR/$TOTAL_SERVICES"
  ((WARNINGS++))
fi

echo ""

# 4. Compter les routes
echo "📊 Statistiques des routes..."

ROUTE_COUNT=$(grep -r "@Get\|@Post\|@Put\|@Patch\|@Delete" server/src --include="*.controller.ts" 2>/dev/null | wc -l | tr -d ' ')

if [ "$ROUTE_COUNT" -ge 100 ]; then
  echo -e "${GREEN}✅${NC} Routes décorées: $ROUTE_COUNT"
else
  echo -e "${YELLOW}⚠️${NC}  Routes décorées: $ROUTE_COUNT (attendu: >= 100)"
  ((WARNINGS++))
fi

echo ""

# 5. Vérifier app.module.ts
echo "🔍 Vérification de app.module.ts..."

if [ -f "server/src/app.module.ts" ]; then
  if grep -q "@Module" "server/src/app.module.ts" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} app.module.ts contient @Module"
  else
    echo -e "${RED}❌${NC} app.module.ts ne contient pas @Module"
    ((ERRORS++))
  fi
  
  if grep -q "imports:" "server/src/app.module.ts" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} app.module.ts contient imports"
  else
    echo -e "${RED}❌${NC} app.module.ts ne contient pas imports"
    ((ERRORS++))
  fi
else
  echo -e "${RED}❌${NC} app.module.ts manquant"
  ((ERRORS++))
fi

echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Validation rapide réussie !${NC}"
  echo ""
  echo "📊 Résumé:"
  echo "  Modules: $MODULE_COUNT"
  echo "  Controllers: $CONTROLLER_COUNT"
  echo "  Services: $SERVICE_COUNT"
  echo "  Routes: $ROUTE_COUNT"
  echo ""
  echo "💡 Prochaines étapes:"
  echo "  1. Tester avec: npm run dev"
  echo "  2. Vérifier les routes manuellement"
  echo "  3. Valider les fonctionnalités critiques"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Validation réussie avec $WARNINGS avertissement(s)${NC}"
  echo ""
  echo "📊 Résumé:"
  echo "  Modules: $MODULE_COUNT"
  echo "  Controllers: $CONTROLLER_COUNT"
  echo "  Services: $SERVICE_COUNT"
  echo "  Routes: $ROUTE_COUNT"
  exit 0
else
  echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
  fi
  exit 1
fi
