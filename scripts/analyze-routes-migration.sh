#!/bin/bash
set -e

# ============================================================================
# Script d'analyse de la migration NestJS
# Usage: ./scripts/analyze-routes-migration.sh
# ============================================================================

echo "=================================================="
echo "📊 Analyse de la Migration NestJS"
echo "=================================================="

# Compter les routes dans routes.ts
echo ""
echo "📈 Routes dans server/routes.ts:"
ROUTES_COUNT=$(grep -c "router\.\(get\|post\|put\|patch\|delete\)" server/routes.ts 2>/dev/null || echo "0")
echo "   Total: $ROUTES_COUNT routes"

# Compter les routes NestJS
echo ""
echo "📈 Routes NestJS (controllers):"
NESTJS_ROUTES=$(grep -r "@\(Get\|Post\|Put\|Patch\|Delete\)" server/src --include="*.controller.ts" | wc -l | tr -d ' ')
echo "   Total: $NESTJS_ROUTES routes décorées"

# Calculer le pourcentage
if [ "$ROUTES_COUNT" -gt 0 ]; then
  TOTAL=$((ROUTES_COUNT + NESTJS_ROUTES))
  PERCENTAGE=$((NESTJS_ROUTES * 100 / TOTAL))
  echo ""
  echo "📊 Progression:"
  echo "   Routes migrées: $NESTJS_ROUTES / $TOTAL ($PERCENTAGE%)"
fi

# Lister les routes non migrées (exemples)
echo ""
echo "🔍 Exemples de routes dans server/routes.ts (premières 10):"
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes.ts | head -10 | while read line; do
  echo "   $line"
done

# Vérifier les imports de routes.ts
echo ""
echo "🔗 Fichiers qui importent server/routes.ts:"
grep -r "from.*routes\|import.*routes" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".git" | head -10 || echo "   Aucun import trouvé"

# Vérifier les imports de server/index.ts
echo ""
echo "🔗 Fichiers qui importent server/index.ts:"
grep -r "server/index\|server/index\.ts" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v ".git" | head -10 || echo "   Aucun import trouvé"

# Compter les modules NestJS
echo ""
echo "📦 Modules NestJS créés:"
MODULES_COUNT=$(find server/src -name "*.module.ts" -type f | wc -l | tr -d ' ')
echo "   Total: $MODULES_COUNT modules"

# Compter les controllers
echo ""
echo "🎮 Controllers NestJS créés:"
CONTROLLERS_COUNT=$(find server/src -name "*.controller.ts" -type f | wc -l | tr -d ' ')
echo "   Total: $CONTROLLERS_COUNT controllers"

# Compter les services
echo ""
echo "⚙️  Services NestJS créés:"
SERVICES_COUNT=$(find server/src -name "*.service.ts" -type f | wc -l | tr -d ' ')
echo "   Total: $SERVICES_COUNT services"

echo ""
echo "✅ Analyse terminée!"

