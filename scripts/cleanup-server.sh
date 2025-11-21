#!/bin/bash
# Script de nettoyage du serveur pour libérer de l'espace disque
# Usage: ./cleanup-server.sh

set -e

echo "🧹 Début du nettoyage du serveur..."

# 1. Vérifier l'espace disque avant nettoyage
echo ""
echo "📊 Espace disque avant nettoyage:"
df -h / | tail -1

# 2. Nettoyer les images Docker non utilisées
echo ""
echo "🐳 Nettoyage des images Docker non utilisées..."
docker image prune -a -f --filter "until=168h" || true  # Images non utilisées depuis 7 jours

# 3. Nettoyer les conteneurs arrêtés
echo ""
echo "📦 Nettoyage des conteneurs arrêtés..."
docker container prune -f || true

# 4. Nettoyer les volumes non utilisés
echo ""
echo "💾 Nettoyage des volumes non utilisés..."
docker volume prune -f || true

# 5. Nettoyer les réseaux non utilisés
echo ""
echo "🌐 Nettoyage des réseaux non utilisés..."
docker network prune -f || true

# 6. Nettoyer le système Docker (tout ce qui n'est pas utilisé)
echo ""
echo "🧼 Nettoyage complet du système Docker..."
docker system prune -a -f --volumes --filter "until=168h" || true

# 7. Nettoyer les anciennes images de l'application (garder les 3 dernières)
echo ""
echo "🗑️  Nettoyage des anciennes images de l'application..."
if [ -d "/docker/cjd80" ]; then
  cd /docker/cjd80
  
  # Garder les 3 dernières images (latest + 2 dernières versions)
  docker images ghcr.io/aoleon/cjd80 --format "{{.Tag}}" | grep -v "latest" | sort -V | head -n -2 | while read tag; do
    echo "  Suppression de l'image: ghcr.io/aoleon/cjd80:$tag"
    docker rmi "ghcr.io/aoleon/cjd80:$tag" || true
  done
fi

# 8. Nettoyer les logs Docker
echo ""
echo "📝 Nettoyage des logs Docker..."
if [ -d "/var/lib/docker/containers" ]; then
  find /var/lib/docker/containers -name "*.log" -type f -size +100M -delete || true
fi

# 9. Nettoyer les logs système
echo ""
echo "📋 Nettoyage des logs système..."
journalctl --vacuum-time=7d || true  # Garder seulement 7 jours de logs

# 10. Nettoyer les fichiers temporaires
echo ""
echo "🗂️  Nettoyage des fichiers temporaires..."
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

# 11. Nettoyer les packages APT (si Debian/Ubuntu)
if command -v apt-get &> /dev/null; then
  echo ""
  echo "📦 Nettoyage des packages APT..."
  apt-get clean || true
  apt-get autoremove -y || true
fi

# 12. Vérifier l'espace disque après nettoyage
echo ""
echo "📊 Espace disque après nettoyage:"
df -h / | tail -1

# 13. Afficher l'espace libéré par Docker
echo ""
echo "🐳 Espace utilisé par Docker:"
docker system df

echo ""
echo "✅ Nettoyage terminé!"

