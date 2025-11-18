#!/bin/bash
set -e

# ============================================================================
# Script de build local et copie sur VPS
# Évite les problèmes de mémoire sur le VPS
# ============================================================================

VPS_HOST="${VPS_HOST:-141.94.31.162}"
VPS_USER="${VPS_USER:-thibault}"
VPS_PORT="${VPS_PORT:-22}"
VPS_PASS="${VPS_PASS:-@Tibo4713234}"
DEPLOY_DIR="${DEPLOY_DIR:-/docker/cjd80}"

echo "=================================================="
echo "🚀 Build Local et Déploiement sur VPS"
echo "=================================================="

# 1. Build local
echo "🏗️  Build local de l'application..."
npm run check && npm run build || {
    echo "❌ ERREUR: Build local échoué"
    exit 1
}
echo "✅ Build local terminé"

# 2. Créer l'archive
echo "📦 Création de l'archive..."
tar -czf /tmp/cjd80-dist.tar.gz dist/ || {
    echo "❌ ERREUR: Impossible de créer l'archive"
    exit 1
}
echo "✅ Archive créée: /tmp/cjd80-dist.tar.gz"

# 3. Copier sur le VPS
echo "📤 Copie sur le VPS..."
sshpass -p "$VPS_PASS" scp -o StrictHostKeyChecking=no -P "$VPS_PORT" \
    /tmp/cjd80-dist.tar.gz \
    Dockerfile.production \
    "$VPS_USER@$VPS_HOST:/tmp/" || {
    echo "❌ ERREUR: Impossible de copier sur le VPS"
    exit 1
}
echo "✅ Fichiers copiés sur le VPS"

# 4. Déployer sur le VPS
echo "🚀 Déploiement sur le VPS..."
sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" \
    "$VPS_USER@$VPS_HOST" << 'ENDSSH'
cd /docker/cjd80

# Arrêter l'application
docker compose down --remove-orphans 2>/dev/null || true

# Extraire les nouveaux fichiers
tar -xzf /tmp/cjd80-dist.tar.gz -C . || {
    echo "❌ ERREUR: Impossible d'extraire l'archive"
    exit 1
}

# Copier Dockerfile.production
cp /tmp/Dockerfile.production . || {
    echo "❌ ERREUR: Impossible de copier Dockerfile.production"
    exit 1
}

# Copier les fichiers nécessaires pour le build
cp package*.json drizzle.config.ts . 2>/dev/null || true
cp -r shared . 2>/dev/null || true

# Build avec Dockerfile.production (qui utilise dist/ existant)
docker build -f Dockerfile.production -t cjd80:latest . || {
    echo "❌ ERREUR: Build runner échoué"
    exit 1
}

# Migrations
docker run --rm --env-file .env --network proxy cjd80:latest \
    sh -c "cd /app && npx drizzle-kit push" 2>&1 | tail -3 || echo "⚠️  Migrations: voir logs"

# Démarrer
export DOCKER_IMAGE=cjd80:latest
docker compose up -d

# Attendre
sleep 15

# Vérifier
if docker compose ps | grep -q "cjd-app.*Up"; then
    echo "✅ Application démarrée"
    docker network connect proxy cjd-app 2>/dev/null || true
    docker compose ps
else
    echo "❌ ERREUR: Le conteneur ne démarre pas"
    docker compose logs --tail=20 cjd-app
    exit 1
fi
ENDSSH

echo ""
echo "✅ Déploiement terminé!"
echo "🔗 URL: https://cjd80.fr"

# Nettoyer
rm -f /tmp/cjd80-dist.tar.gz

exit 0

