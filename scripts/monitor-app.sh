#!/bin/bash
set -e

# ============================================================================
# Script de monitoring continu de l'application
# Usage: ./scripts/monitor-app.sh [interval_seconds]
# ============================================================================

INTERVAL=${1:-30}
PORT=${PORT:-5000}
BASE_URL="http://localhost:$PORT"

echo "=================================================="
echo "📊 Monitoring de l'Application"
echo "=================================================="
echo "   URL: $BASE_URL"
echo "   Intervalle: ${INTERVAL}s"
echo "   Appuyez sur Ctrl+C pour arrêter"
echo "=================================================="
echo ""

# Fonction pour tester un endpoint
test_endpoint() {
  local endpoint=$1
  local name=$2
  
  local start_time=$(date +%s%N)
  local response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" 2>/dev/null || echo -e "\n000")
  local end_time=$(date +%s%N)
  local duration=$(( (end_time - start_time) / 1000000 ))
  local http_code=$(echo "$response" | tail -1)
  local body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "   ✅ $name: OK (${duration}ms)"
    return 0
  else
    echo "   ❌ $name: Erreur HTTP $http_code (${duration}ms)"
    return 1
  fi
}

# Fonction pour obtenir les stats
get_stats() {
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo ""
  echo "🕐 $timestamp"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  local errors=0
  
  # Test health
  if ! test_endpoint "/api/health" "Health"; then
    errors=$((errors + 1))
  fi
  
  # Test health/db
  if ! test_endpoint "/api/health/db" "Health DB"; then
    errors=$((errors + 1))
  fi
  
  # Test version
  if ! test_endpoint "/api/version" "Version"; then
    errors=$((errors + 1))
  fi
  
  # Vérifier les services Docker
  local docker_services=$(docker compose -f docker-compose.services.yml ps --format json 2>/dev/null | jq -r '.[] | select(.State == "running" or .Health == "healthy") | .Name' | wc -l | tr -d ' ')
  echo "   📦 Services Docker: $docker_services/5"
  
  # Vérifier l'utilisation mémoire (si disponible)
  if command -v ps > /dev/null 2>&1; then
    local node_process=$(ps aux | grep -E "tsx.*main|node.*main" | grep -v grep | head -1)
    if [ -n "$node_process" ]; then
      local memory=$(echo "$node_process" | awk '{print $6}')
      local memory_mb=$((memory / 1024))
      echo "   💾 Mémoire: ${memory_mb}MB"
    fi
  fi
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if [ $errors -eq 0 ]; then
    echo "   ✅ Tous les tests passent"
  else
    echo "   ⚠️  $errors erreur(s) détectée(s)"
  fi
}

# Boucle de monitoring
while true; do
  get_stats
  sleep $INTERVAL
done

