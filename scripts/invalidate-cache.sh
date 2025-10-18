#!/bin/bash

# Script pour invalider le cache et forcer le rechargement chez tous les utilisateurs
# À exécuter après chaque commit/push ou avant un déploiement

echo "🔄 Invalidation du cache en cours..."

# 1. Générer un nouveau timestamp de déploiement
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# 2. Mettre à jour le fichier deploy-info.json
echo "{\"deployedAt\": \"$TIMESTAMP\"}" > client/public/deploy-info.json
echo "✅ Timestamp de cache mis à jour: $TIMESTAMP"

# 3. Incrémenter la version du Service Worker
SW_FILE="client/public/sw.js"
if [ -f "$SW_FILE" ]; then
  # Extraire la version actuelle
  CURRENT_VERSION=$(grep "const CACHE_VERSION" "$SW_FILE" | sed -E "s/.*'([0-9]+\.[0-9]+\.[0-9]+)'.*/\1/")
  
  if [ ! -z "$CURRENT_VERSION" ]; then
    # Incrémenter le dernier chiffre de la version (patch)
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
    
    # Remplacer la version dans le fichier
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/const CACHE_VERSION = '${CURRENT_VERSION}'/const CACHE_VERSION = '${NEW_VERSION}'/" "$SW_FILE"
    else
      # Linux
      sed -i "s/const CACHE_VERSION = '${CURRENT_VERSION}'/const CACHE_VERSION = '${NEW_VERSION}'/" "$SW_FILE"
    fi
    echo "✅ Version du Service Worker: $CURRENT_VERSION → $NEW_VERSION"
  fi
fi

echo ""
echo "🎉 Cache invalidé avec succès !"
echo "   Les utilisateurs connectés recevront automatiquement la nouvelle version"
echo "   dans les 5 prochaines minutes (cycle de vérification automatique)"
