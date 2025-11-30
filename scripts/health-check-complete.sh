#!/bin/bash
set -e

# ============================================================================
# Script de health check complet
# Usage: ./scripts/health-check-complete.sh
# ============================================================================

PORT=${PORT:-5000}
BASE_URL="http://localhost:$PORT"

echo "=================================================="
echo "🏥 Health Check Complet"
echo "=================================================="

ERRORS=0
WARNINGS=0

# 1. Vérifier que l'application répond
echo ""
echo "🔍 Vérification application..."
if curl -s -f "$BASE_URL/api/health" > /dev/null 2>&1; then
  echo "   ✅ Application: Accessible"
else
  echo "   ❌ Application: Non accessible"
  ERRORS=$((ERRORS + 1))
fi

# 2. Health check général
echo ""
echo "🔍 Health check général..."
HEALTH=$(curl -s "$BASE_URL/api/health" 2>/dev/null || echo "{}")
if echo "$HEALTH" | grep -q "status.*healthy\|ok" 2>/dev/null; then
  echo "   ✅ Health: OK"
else
  echo "   ⚠️  Health: Vérifier la réponse"
  echo "   📄 Réponse: $HEALTH"
  WARNINGS=$((WARNINGS + 1))
fi

# 3. Health check base de données
echo ""
echo "🔍 Health check base de données..."
DB_HEALTH=$(curl -s "$BASE_URL/api/health/db" 2>/dev/null || echo "{}")
if echo "$DB_HEALTH" | grep -q "connected.*true\|status.*healthy" 2>/dev/null; then
  echo "   ✅ Base de données: Connectée"
else
  echo "   ❌ Base de données: Problème de connexion"
  echo "   📄 Réponse: $DB_HEALTH"
  ERRORS=$((ERRORS + 1))
fi

# 4. Health check détaillé
echo ""
echo "🔍 Health check détaillé..."
DETAILED=$(curl -s "$BASE_URL/api/health/detailed" 2>/dev/null || echo "{}")
if echo "$DETAILED" | grep -q "status.*healthy" 2>/dev/null; then
  echo "   ✅ Health détaillé: OK"
  # Extraire les informations importantes
  if command -v jq > /dev/null 2>&1; then
    DB_RESPONSE=$(echo "$DETAILED" | jq -r '.database.responseTime // "N/A"' 2>/dev/null || echo "N/A")
    MEMORY=$(echo "$DETAILED" | jq -r '.memory.heapUsed // "N/A"' 2>/dev/null || echo "N/A")
    echo "      Temps réponse DB: $DB_RESPONSE"
    echo "      Mémoire utilisée: $MEMORY"
  fi
else
  echo "   ⚠️  Health détaillé: Vérifier"
  WARNINGS=$((WARNINGS + 1))
fi

# 5. Vérifier les services Docker
echo ""
echo "🔍 Vérification services Docker..."
DOCKER_SERVICES=$(docker compose -f docker-compose.services.yml ps --format json 2>/dev/null | jq -r '.[] | select(.State == "running" or .Health == "healthy") | .Name' 2>/dev/null || echo "")
SERVICE_COUNT=$(echo "$DOCKER_SERVICES" | grep -c . || echo "0")

if [ "$SERVICE_COUNT" -ge 4 ]; then
  echo "   ✅ Services Docker: $SERVICE_COUNT/5 démarrés"
else
  echo "   ⚠️  Services Docker: $SERVICE_COUNT/5 démarrés"
  WARNINGS=$((WARNINGS + 1))
fi

# 6. Vérifier la version
echo ""
echo "🔍 Vérification version..."
VERSION=$(curl -s "$BASE_URL/api/version" 2>/dev/null || echo "{}")
if [ -n "$VERSION" ] && [ "$VERSION" != "{}" ]; then
  echo "   ✅ Version: $VERSION"
else
  echo "   ⚠️  Version: Non disponible"
  WARNINGS=$((WARNINGS + 1))
fi

# Résumé
echo ""
echo "=================================================="
echo "📊 Résumé"
echo "=================================================="
echo "   Erreurs: $ERRORS"
echo "   Avertissements: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo ""
    echo "✅ Tous les health checks passent !"
    exit 0
  else
    echo ""
    echo "⚠️  Health checks réussis avec $WARNINGS avertissement(s)"
    exit 0
  fi
else
  echo ""
  echo "❌ Health checks échoués avec $ERRORS erreur(s)"
  exit 1
fi

