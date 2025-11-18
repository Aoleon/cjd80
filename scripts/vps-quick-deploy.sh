#!/bin/bash
set -e

# ============================================================================
# Script de déploiement rapide VPS - CJD Amiens (cjd80.fr)
# Version simplifiée et directe, sans boucles infinies
# ============================================================================

DEPLOY_DIR="/docker/cjd80"
IMAGE_NAME="cjd80"
IMAGE_TAG="latest"

cd "$DEPLOY_DIR"

echo "=================================================="
echo "🚀 Déploiement Rapide CJD Amiens"
echo "=================================================="

# 1. Mise à jour Git
echo "🔄 Mise à jour Git..."
git fetch origin main 2>/dev/null || true
git pull origin main || git reset --hard origin/main
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "✅ Commit: $CURRENT_COMMIT"

# 2. Backup image actuelle
echo "📦 Backup image actuelle..."
CURRENT_IMAGE=$(docker compose images -q cjd-app 2>/dev/null || echo "")
if [ -n "$CURRENT_IMAGE" ] && [ "$CURRENT_IMAGE" != "none" ]; then
    BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
    docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:$BACKUP_TAG" 2>/dev/null || true
    # Nettoyer les anciens backups (garder les 3 derniers)
    docker images "$IMAGE_NAME" --format "{{.Tag}}" | grep "^backup-" | sort -r | tail -n +4 | xargs -r -I {} docker rmi "$IMAGE_NAME:{}" 2>/dev/null || true
fi

# 3. Arrêt de l'application
echo "🛑 Arrêt de l'application..."
docker compose down --remove-orphans 2>/dev/null || true

# 4. Build de l'image (avec timeout pour éviter les boucles)
echo "🏗️  Build de l'image Docker..."
echo "   (Cela peut prendre 2-5 minutes, soyez patient...)"
timeout 1800 docker build -t "$IMAGE_NAME:$IMAGE_TAG" . || {
    echo "❌ ERREUR: Build échoué ou timeout (30 minutes)"
    exit 1
}
echo "✅ Build terminé"

# 5. Migrations
echo "🗄️  Migrations..."
docker run --rm \
    --env-file "$DEPLOY_DIR/.env" \
    --network proxy \
    "$IMAGE_NAME:$IMAGE_TAG" \
    sh -c "cd /app && npx drizzle-kit push" 2>&1 | tail -3 || echo "⚠️  Migrations: voir logs ci-dessus"

# 6. Démarrage
echo "🚀 Démarrage de l'application..."
export DOCKER_IMAGE="$IMAGE_NAME:$IMAGE_TAG"
docker compose up -d

# 7. Vérification rapide (pas de boucle)
echo "⏳ Attente démarrage (15s)..."
sleep 15

if docker compose ps | grep -q "cjd-app.*Up"; then
    echo "✅ Application démarrée"
    
    # Vérification santé (une seule tentative)
    if docker compose exec -T cjd-app wget --spider -q http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check OK"
    else
        echo "⚠️  Health check en attente (normal au démarrage)"
    fi
    
    # Reconnecter au réseau proxy
    docker network connect proxy cjd-app 2>/dev/null || true
    
    echo ""
    echo "=================================================="
    echo "✅ Déploiement terminé!"
    echo "=================================================="
    echo "📦 Image: $IMAGE_NAME:$IMAGE_TAG"
    echo "📝 Commit: $CURRENT_COMMIT"
    echo "🔗 URL: https://cjd80.fr"
    echo ""
    docker compose ps
else
    echo "❌ ERREUR: Le conteneur ne démarre pas"
    docker compose logs --tail=20 cjd-app
    exit 1
fi

exit 0

