#!/bin/bash
set -e

# ============================================================================
# Script de nettoyage complet de l'environnement
# Usage: ./scripts/clean-all.sh
# ============================================================================

echo "=================================================="
echo "🧹 Nettoyage de l'environnement"
echo "=================================================="

# 1. Arrêter tous les services Docker
echo ""
echo "🛑 Arrêt des services Docker..."
docker compose -f docker-compose.services.yml down 2>/dev/null || true

# 2. Nettoyer les conteneurs orphelins
echo ""
echo "🗑️  Nettoyage des conteneurs orphelins..."
docker compose -f docker-compose.services.yml down --remove-orphans 2>/dev/null || true

# 3. Nettoyer les volumes (optionnel, commenté par défaut)
# echo ""
# echo "🗑️  Suppression des volumes Docker..."
# docker compose -f docker-compose.services.yml down -v 2>/dev/null || true

# 4. Nettoyer node_modules (optionnel)
read -p "Supprimer node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "🗑️  Suppression de node_modules..."
  rm -rf node_modules
  echo "✅ node_modules supprimé"
fi

# 5. Nettoyer les fichiers de build
echo ""
echo "🗑️  Nettoyage des fichiers de build..."
rm -rf dist
rm -rf client/dist
rm -rf .vite
rm -rf node_modules/.vite
echo "✅ Fichiers de build supprimés"

# 6. Nettoyer les logs
echo ""
echo "🗑️  Nettoyage des logs..."
rm -rf logs/*.log 2>/dev/null || true
echo "✅ Logs nettoyés"

# 7. Nettoyer les caches
echo ""
echo "🗑️  Nettoyage des caches..."
rm -rf .cache 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
echo "✅ Caches nettoyés"

echo ""
echo "✅ Nettoyage terminé!"

