#!/bin/bash
set -e

# ============================================================================
# Script pour démarrer l'application en local avec Docker
# Usage: ./scripts/docker-local-start.sh
# ============================================================================

echo "=================================================="
echo "🚀 Démarrage de l'application en local avec Docker"
echo "=================================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "⚠️  Le fichier .env n'existe pas."
    echo "📝 Créez un fichier .env avec au minimum:"
    echo "   DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cjd80"
    echo "   SESSION_SECRET=$(openssl rand -base64 32)"
    echo ""
    read -p "Voulez-vous continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker compose -f docker-compose.local.yml down 2>/dev/null || true

# Démarrer les services
echo "🏗️  Construction et démarrage des services..."
docker compose -f docker-compose.local.yml up --build -d

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente que PostgreSQL soit prêt..."
timeout=30
counter=0
while ! docker compose -f docker-compose.local.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout: PostgreSQL n'est pas prêt après ${timeout}s"
        docker compose -f docker-compose.local.yml logs postgres
        exit 1
    fi
done
echo "✅ PostgreSQL est prêt"

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
docker compose -f docker-compose.local.yml exec -T cjd-app sh -c "cd /app && npx drizzle-kit push" || {
    echo "⚠️  Les migrations ont échoué, mais on continue..."
}

# Attendre que l'application soit prête
echo "⏳ Attente que l'application soit prête..."
timeout=60
counter=0
while ! docker compose -f docker-compose.local.yml exec -T cjd-app wget --spider -q http://localhost:5000/api/health 2>/dev/null; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        echo "⚠️  L'application n'est pas encore prête après ${timeout}s"
        echo "📋 Logs de l'application:"
        docker compose -f docker-compose.local.yml logs --tail=50 cjd-app
        break
    fi
done

echo ""
echo "=================================================="
echo "✅ Application démarrée!"
echo "=================================================="
echo "🌐 Application: http://localhost:5001"
echo "🗄️  PostgreSQL: localhost:5432"
echo "   - User: postgres"
echo "   - Password: postgres"
echo "   - Database: cjd80"
echo ""
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker compose -f docker-compose.local.yml logs -f"
echo "   - Arrêter: docker compose -f docker-compose.local.yml down"
echo "   - Redémarrer: docker compose -f docker-compose.local.yml restart"
echo ""

# Afficher le statut
docker compose -f docker-compose.local.yml ps

