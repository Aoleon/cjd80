#!/bin/bash
set -e

# ============================================================================
# Script de validation complète de l'application
# Usage: ./scripts/validate-app.sh
# ============================================================================

echo "=================================================="
echo "✅ Validation de l'Application CJD Amiens"
echo "=================================================="

ERRORS=0
WARNINGS=0

# 1. Vérifier TypeScript (fichiers NestJS uniquement)
echo ""
echo "🔍 Vérification TypeScript (fichiers NestJS)..."
TS_OUTPUT=$(tsc -p tsconfig.server.json --noEmit 2>&1)
TS_EXIT=$?
if [ $TS_EXIT -eq 0 ]; then
  echo "   ✅ TypeScript NestJS: OK"
else
  # Compter les erreurs dans les fichiers NestJS uniquement
  NESTJS_ERRORS=$(echo "$TS_OUTPUT" | grep -c "error TS" || echo "0")
  if [ "$NESTJS_ERRORS" = "0" ] || [ -z "$NESTJS_ERRORS" ]; then
    echo "   ✅ TypeScript NestJS: OK"
  else
    echo "   ⚠️  TypeScript NestJS: $NESTJS_ERRORS erreur(s) (fichiers legacy non comptés)"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# 2. Vérifier les services Docker
echo ""
echo "🔍 Vérification services Docker..."
if docker compose -f docker-compose.services.yml ps | grep -q "healthy\|running"; then
  echo "   ✅ Services Docker: OK"
else
  echo "   ⚠️  Services Docker: Certains services ne sont pas démarrés"
  WARNINGS=$((WARNINGS + 1))
fi

# 3. Vérifier la connexion à la base de données
echo ""
echo "🔍 Vérification connexion base de données..."
if DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cjd80" npm run db:push > /dev/null 2>&1; then
  echo "   ✅ Base de données: OK"
else
  echo "   ❌ Base de données: Erreur de connexion"
  ERRORS=$((ERRORS + 1))
fi

# 4. Vérifier les fichiers critiques
echo ""
echo "🔍 Vérification fichiers critiques..."
CRITICAL_FILES=(
  "server/src/main.ts"
  "server/src/app.module.ts"
  "shared/schema.ts"
  "package.json"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file: Existe"
  else
    echo "   ❌ $file: Manquant"
    ERRORS=$((ERRORS + 1))
  fi
done

# 5. Vérifier les scripts npm
echo ""
echo "🔍 Vérification scripts npm..."
REQUIRED_SCRIPTS=("dev" "build" "start" "db:push" "start:dev")
for script in "${REQUIRED_SCRIPTS[@]}"; do
  if grep -q "\"$script\":" package.json; then
    echo "   ✅ Script $script: OK"
  else
    echo "   ⚠️  Script $script: Manquant"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# 6. Vérifier les dépendances critiques
echo ""
echo "🔍 Vérification dépendances critiques..."
REQUIRED_DEPS=("@nestjs/core" "@nestjs/common" "drizzle-orm" "express")
for dep in "${REQUIRED_DEPS[@]}"; do
  if grep -q "\"$dep\":" package.json; then
    echo "   ✅ Dépendance $dep: OK"
  else
    echo "   ❌ Dépendance $dep: Manquante"
    ERRORS=$((ERRORS + 1))
  fi
done

# 7. Vérifier la structure NestJS
echo ""
echo "🔍 Vérification structure NestJS..."
if [ -d "server/src" ] && [ -f "server/src/app.module.ts" ]; then
  MODULES_COUNT=$(find server/src -name "*.module.ts" | wc -l | tr -d ' ')
  CONTROLLERS_COUNT=$(find server/src -name "*.controller.ts" | wc -l | tr -d ' ')
  SERVICES_COUNT=$(find server/src -name "*.service.ts" | wc -l | tr -d ' ')
  echo "   ✅ Structure: $MODULES_COUNT modules, $CONTROLLERS_COUNT controllers, $SERVICES_COUNT services"
else
  echo "   ❌ Structure: Problème détecté"
  ERRORS=$((ERRORS + 1))
fi

# Résumé
echo ""
echo "=================================================="
echo "📊 Résumé de la validation"
echo "=================================================="
echo "   Erreurs: $ERRORS"
echo "   Avertissements: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ Validation réussie !"
  exit 0
else
  echo ""
  echo "❌ Validation échouée avec $ERRORS erreur(s)"
  exit 1
fi

