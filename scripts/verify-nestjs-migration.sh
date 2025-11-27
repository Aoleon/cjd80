#!/bin/bash

# Script de vérification de la migration NestJS
# Vérifie que tous les modules sont correctement configurés

set -e

echo "🔍 Vérification de la migration NestJS..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Vérifier que tous les modules existent
echo "📦 Vérification des modules..."
MODULES=(
  "server/src/app.module.ts"
  "server/src/auth/auth.module.ts"
  "server/src/health/health.module.ts"
  "server/src/ideas/ideas.module.ts"
  "server/src/events/events.module.ts"
  "server/src/admin/admin.module.ts"
  "server/src/members/members.module.ts"
  "server/src/patrons/patrons.module.ts"
  "server/src/loans/loans.module.ts"
  "server/src/financial/financial.module.ts"
  "server/src/tracking/tracking.module.ts"
  "server/src/chatbot/chatbot.module.ts"
  "server/src/setup/setup.module.ts"
  "server/src/branding/branding.module.ts"
  "server/src/config/config.module.ts"
  "server/src/common/database/database.module.ts"
  "server/src/common/storage/storage.module.ts"
  "server/src/integrations/authentik/authentik.module.ts"
  "server/src/integrations/minio/minio.module.ts"
)

for module in "${MODULES[@]}"; do
  if [ -f "$module" ]; then
    echo -e "${GREEN}✅${NC} $module"
  else
    echo -e "${RED}❌${NC} $module - MANQUANT"
    ((ERRORS++))
  fi
done

echo ""

# Vérifier que tous les controllers existent
echo "🎮 Vérification des controllers..."
CONTROLLERS=(
  "server/src/auth/auth.controller.ts"
  "server/src/health/health.controller.ts"
  "server/src/ideas/ideas.controller.ts"
  "server/src/events/events.controller.ts"
  "server/src/admin/admin.controller.ts"
  "server/src/members/members.controller.ts"
  "server/src/patrons/patrons.controller.ts"
  "server/src/loans/loans.controller.ts"
  "server/src/financial/financial.controller.ts"
  "server/src/tracking/tracking.controller.ts"
  "server/src/chatbot/chatbot.controller.ts"
  "server/src/setup/setup.controller.ts"
  "server/src/branding/branding.controller.ts"
)

for controller in "${CONTROLLERS[@]}"; do
  if [ -f "$controller" ]; then
    echo -e "${GREEN}✅${NC} $controller"
  else
    echo -e "${RED}❌${NC} $controller - MANQUANT"
    ((ERRORS++))
  fi
done

echo ""

# Vérifier que tous les services existent
echo "⚙️  Vérification des services..."
SERVICES=(
  "server/src/auth/auth.service.ts"
  "server/src/health/health.service.ts"
  "server/src/ideas/ideas.service.ts"
  "server/src/events/events.service.ts"
  "server/src/admin/admin.service.ts"
  "server/src/members/members.service.ts"
  "server/src/patrons/patrons.service.ts"
  "server/src/loans/loans.service.ts"
  "server/src/financial/financial.service.ts"
  "server/src/tracking/tracking.service.ts"
  "server/src/chatbot/chatbot.service.ts"
  "server/src/setup/setup.service.ts"
  "server/src/branding/branding.service.ts"
)

for service in "${SERVICES[@]}"; do
  if [ -f "$service" ]; then
    echo -e "${GREEN}✅${NC} $service"
  else
    echo -e "${RED}❌${NC} $service - MANQUANT"
    ((ERRORS++))
  fi
done

echo ""

# Vérifier le point d'entrée
echo "🚀 Vérification du point d'entrée..."
if [ -f "server/src/main.ts" ]; then
  echo -e "${GREEN}✅${NC} server/src/main.ts existe"
else
  echo -e "${RED}❌${NC} server/src/main.ts - MANQUANT"
  ((ERRORS++))
fi

echo ""

# Compter les routes
echo "📊 Statistiques..."
CONTROLLER_COUNT=$(find server/src -name "*.controller.ts" | wc -l | tr -d ' ')
SERVICE_COUNT=$(find server/src -name "*.service.ts" | wc -l | tr -d ' ')
MODULE_COUNT=$(find server/src -name "*.module.ts" | wc -l | tr -d ' ')
ROUTE_COUNT=$(grep -r "@Get\|@Post\|@Put\|@Patch\|@Delete" server/src --include="*.controller.ts" | wc -l | tr -d ' ')

echo "  Controllers: $CONTROLLER_COUNT"
echo "  Services: $SERVICE_COUNT"
echo "  Modules: $MODULE_COUNT"
echo "  Routes décorées: $ROUTE_COUNT"

echo ""

# Résumé
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Migration NestJS vérifiée avec succès !${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
  exit 1
fi


