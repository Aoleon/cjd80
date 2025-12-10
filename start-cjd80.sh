#!/bin/bash
# Script de démarrage rapide pour CJD80

set -e

echo "🚀 Démarrage de CJD80..."

cd "$(dirname "$0")"

# Vérifier si le conteneur existe
if docker ps -a --format '{{.Names}}' | grep -q "^cjd80-app$"; then
    echo "📦 Conteneur existant trouvé"

    # Vérifier s'il est déjà en cours d'exécution
    if docker ps --format '{{.Names}}' | grep -q "^cjd80-app$"; then
        echo "✅ CJD80 est déjà en cours d'exécution"
        docker ps | grep cjd80-app
    else
        echo "▶️  Démarrage du conteneur existant..."
        docker compose -f docker-compose.dev.yml start
    fi
else
    echo "🔨 Création et démarrage du conteneur..."
    docker compose -f docker-compose.dev.yml up -d
fi

echo ""
echo "⏳ Attente du démarrage (health check)..."
sleep 5

# Attendre que le conteneur soit healthy
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if docker inspect cjd80-app --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy"; then
        echo "✅ Conteneur en bonne santé!"
        break
    fi
    echo "⏳ En attente... ($WAITED/$MAX_WAIT secondes)"
    sleep 2
    WAITED=$((WAITED + 2))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CJD80 est démarré!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Application: https://work.robinswood.io/cjd80"
echo "🔌 API:         https://work.robinswood.io/cjd80/api"
echo "📊 Logs:        docker logs cjd80-app -f"
echo "🛑 Arrêter:     docker compose -f docker-compose.dev.yml down"
echo ""
echo "⚠️  Note: L'accès est protégé par OAuth2 (Google @youcom.io)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Afficher les dernières lignes de logs
echo ""
echo "📝 Derniers logs:"
docker logs cjd80-app --tail 10
