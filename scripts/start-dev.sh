#!/bin/bash
set -e

# ============================================================================
# Script de démarrage complet de l'application en développement
# Usage: ./scripts/start-dev.sh
# ============================================================================

echo "=================================================="
echo "🚀 Démarrage de l'application CJD Amiens"
echo "=================================================="

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker n'est pas en cours d'exécution"
  exit 1
fi

# 1. Démarrer les services Docker
echo ""
echo "📦 Démarrage des services Docker..."
docker compose -f docker-compose.services.yml up -d postgres redis

# Attendre que PostgreSQL et Redis soient healthy
echo "⏳ Attente de la disponibilité des services..."
sleep 5

# Vérifier l'état des services
if ! docker compose -f docker-compose.services.yml ps | grep -q "healthy"; then
  echo "⚠️  Certains services ne sont pas encore healthy, attente supplémentaire..."
  sleep 10
fi

# 2. Démarrer Authentik
echo ""
echo "🔐 Démarrage d'Authentik..."
docker compose -f docker-compose.services.yml up -d authentik-server authentik-worker

# 3. Démarrer MinIO (optionnel)
echo ""
echo "💾 Démarrage de MinIO..."
docker compose -f docker-compose.services.yml up -d minio

# 4. Vérifier l'état final
echo ""
echo "📊 État des services Docker:"
docker compose -f docker-compose.services.yml ps

# 5. Initialiser la base de données
echo ""
echo "🗄️  Initialisation de la base de données..."
# Utiliser localhost:5433 pour la connexion depuis l'hôte
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/cjd80}"
npm run db:push

# 6. Démarrer l'application
echo ""
echo "🎯 Démarrage de l'application..."
echo "   Application disponible sur: http://localhost:5000"
echo "   Authentik disponible sur: http://localhost:9002"
echo ""
echo "   Appuyez sur Ctrl+C pour arrêter l'application"
echo ""

# Utiliser la DATABASE_URL correcte pour le démarrage
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/cjd80}"
npm run dev

