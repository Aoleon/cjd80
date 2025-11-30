#!/bin/bash
set -e

# ============================================================================
# Script de reset complet de l'environnement
# Usage: ./scripts/reset-env.sh
# ============================================================================

echo "=================================================="
echo "🔄 Reset complet de l'environnement"
echo "=================================================="

# Confirmation
read -p "⚠️  Cette opération va supprimer TOUTES les données Docker. Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Opération annulée"
  exit 1
fi

# 1. Arrêter et supprimer tous les services Docker avec volumes
echo ""
echo "🛑 Arrêt et suppression des services Docker..."
docker compose -f docker-compose.services.yml down -v 2>/dev/null || true

# 2. Supprimer les volumes orphelins
echo ""
echo "🗑️  Suppression des volumes orphelins..."
docker volume prune -f 2>/dev/null || true

# 3. Nettoyer node_modules
echo ""
echo "🗑️  Suppression de node_modules..."
rm -rf node_modules

# 4. Nettoyer les fichiers de build
echo ""
echo "🗑️  Nettoyage des fichiers de build..."
rm -rf dist
rm -rf client/dist
rm -rf .vite
rm -rf node_modules/.vite

# 5. Réinstaller les dépendances
echo ""
echo "📦 Réinstallation des dépendances..."
npm install

# 6. Redémarrer les services Docker
echo ""
echo "🚀 Redémarrage des services Docker..."
docker compose -f docker-compose.services.yml up -d postgres redis
sleep 5
docker compose -f docker-compose.services.yml up -d authentik-server authentik-worker minio

# 7. Initialiser la base de données
echo ""
echo "🗄️  Initialisation de la base de données..."
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5433/cjd80}"
npm run db:push

echo ""
echo "✅ Reset terminé!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Vérifier les variables d'environnement dans .env"
echo "   2. Configurer Authentik (http://localhost:9002)"
echo "   3. Démarrer l'application: npm run dev"

