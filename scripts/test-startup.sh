#!/bin/bash
set -e

# ============================================================================
# Script de test du démarrage de l'application
# Usage: ./scripts/test-startup.sh
# ============================================================================

echo "=================================================="
echo "🧪 Test de Démarrage de l'Application"
echo "=================================================="

TIMEOUT=60
PORT=${PORT:-5001}
BASE_URL="http://localhost:$PORT"

# Fonction pour attendre qu'un service soit disponible
wait_for_service() {
  local url=$1
  local timeout=$2
  local elapsed=0
  
  echo "   ⏳ Attente de $url..."
  while [ $elapsed -lt $timeout ]; do
    if curl -s -f "$url" > /dev/null 2>&1; then
      echo "   ✅ Service disponible"
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo -n "."
  done
  echo ""
  echo "   ❌ Timeout après ${timeout}s"
  return 1
}

# 1. Vérifier les services Docker
echo ""
echo "📦 Vérification services Docker..."
if docker compose -f docker-compose.services.yml ps | grep -q "healthy\|running"; then
  echo "   ✅ Services Docker: OK"
else
  echo "   ❌ Services Docker: Non démarrés"
  echo "   💡 Exécutez: docker compose -f docker-compose.services.yml up -d"
  exit 1
fi

# 2. Démarrer l'application en arrière-plan
echo ""
echo "🚀 Démarrage de l'application..."
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/cjd80}"
export PORT=$PORT

# Démarrer en arrière-plan et capturer le PID
npm run dev > /tmp/app-startup.log 2>&1 &
APP_PID=$!

# Attendre un peu pour le démarrage
sleep 5

# Vérifier que le processus est toujours actif
if ! kill -0 $APP_PID 2>/dev/null; then
  echo "   ❌ L'application n'a pas démarré"
  echo "   📋 Logs:"
  tail -50 /tmp/app-startup.log
  exit 1
fi

echo "   ✅ Processus démarré (PID: $APP_PID)"

# 3. Tester l'endpoint health
echo ""
echo "🏥 Test endpoint /api/health..."
if wait_for_service "$BASE_URL/api/health" $TIMEOUT; then
  HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
  echo "   📄 Réponse: $HEALTH_RESPONSE"
else
  echo "   ❌ Endpoint /api/health non disponible"
  kill $APP_PID 2>/dev/null || true
  exit 1
fi

# 4. Tester l'endpoint health/db
echo ""
echo "🗄️  Test endpoint /api/health/db..."
if wait_for_service "$BASE_URL/api/health/db" $TIMEOUT; then
  DB_HEALTH=$(curl -s "$BASE_URL/api/health/db")
  echo "   ✅ Base de données: Accessible"
  echo "   📄 Réponse: $DB_HEALTH"
else
  echo "   ⚠️  Endpoint /api/health/db non disponible"
fi

# 5. Tester l'endpoint version
echo ""
echo "📌 Test endpoint /api/version..."
if curl -s -f "$BASE_URL/api/version" > /dev/null 2>&1; then
  VERSION=$(curl -s "$BASE_URL/api/version")
  echo "   ✅ Version: $VERSION"
else
  echo "   ⚠️  Endpoint /api/version non disponible"
fi

# 6. Vérifier les logs pour erreurs
echo ""
echo "📋 Vérification des logs..."
ERROR_COUNT=$(tail -100 /tmp/app-startup.log | grep -i "error\|failed\|exception" | grep -v "DEBUG" | wc -l | tr -d ' ')
if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "   ⚠️  $ERROR_COUNT erreur(s) détectée(s) dans les logs"
  echo "   📄 Dernières erreurs:"
  tail -100 /tmp/app-startup.log | grep -i "error\|failed\|exception" | grep -v "DEBUG" | tail -5
else
  echo "   ✅ Aucune erreur critique dans les logs"
fi

# 7. Arrêter l'application
echo ""
echo "🛑 Arrêt de l'application..."
kill $APP_PID 2>/dev/null || true
sleep 2

# Vérifier que le processus est arrêté
if kill -0 $APP_PID 2>/dev/null; then
  echo "   ⚠️  Forcer l'arrêt..."
  kill -9 $APP_PID 2>/dev/null || true
else
  echo "   ✅ Application arrêtée proprement"
fi

# Résumé
echo ""
echo "=================================================="
echo "📊 Résumé du Test"
echo "=================================================="
echo "   ✅ Services Docker: OK"
echo "   ✅ Application démarrée: OK"
echo "   ✅ Endpoint /api/health: OK"
if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "   ✅ Logs: Aucune erreur critique"
  echo ""
  echo "🎉 Test de démarrage réussi !"
  exit 0
else
  echo "   ⚠️  Logs: $ERROR_COUNT erreur(s) détectée(s)"
  echo ""
  echo "⚠️  Test réussi avec avertissements"
  exit 0
fi

