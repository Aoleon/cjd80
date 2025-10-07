#!/bin/bash

# Script de déploiement avec purge du cache
# Ce script est exécuté automatiquement lors du déploiement Replit

echo "🧹 Nettoyage du cache avant déploiement..."

# 1. Invalider le cache client (force le rechargement chez les utilisateurs)
if [ -f "invalidate-cache.sh" ]; then
  bash invalidate-cache.sh
else
  echo "⚠️  Script invalidate-cache.sh non trouvé"
fi

# 2. Nettoyer le dossier de build existant
if [ -d "dist" ]; then
  echo "  → Suppression du dossier dist..."
  rm -rf dist
fi

# 3. Nettoyer le cache de Vite
if [ -d "node_modules/.vite" ]; then
  echo "  → Suppression du cache Vite..."
  rm -rf node_modules/.vite
fi

# 4. Nettoyer le cache du navigateur (service workers)
if [ -d "dist/public" ]; then
  echo "  → Nettoyage des service workers..."
  find dist/public -name "*.js" -type f -exec rm {} \;
  find dist/public -name "*.css" -type f -exec rm {} \;
fi

echo "✅ Cache nettoyé avec succès"

# Construire l'application
echo "🏗️ Construction de l'application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build terminé avec succès"
  
  # Ajouter un timestamp de déploiement
  echo "{\"deployedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > dist/public/deploy-info.json
  echo "📅 Timestamp de déploiement ajouté"
  
  # Afficher la taille du build
  echo "📊 Taille du build:"
  du -sh dist/public
  
  echo "🚀 Déploiement prêt !"
else
  echo "❌ Erreur lors du build"
  exit 1
fi