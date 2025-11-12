#!/bin/bash
set -e

# ============================================================================
# Script de déploiement VPS pour CJD Amiens (cjd80.fr)
# Ce script est exécuté sur le VPS par GitHub Actions
# ============================================================================

echo "=================================================="
echo "🚀 Déploiement CJD Amiens - cjd80.fr"
echo "=================================================="

# Variables
DEPLOY_DIR="/docker/cjd80"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
CURRENT_IMAGE=$(docker compose images -q cjd-app 2>/dev/null || echo "none")

cd "$DEPLOY_DIR"

# ============================================================================
# 0. VÉRIFICATIONS PRÉLIMINAIRES
# ============================================================================
echo "🔍 Vérification des fichiers nécessaires..."

# Vérifier que docker-compose.yml existe et n'est pas vide
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERREUR: Le fichier docker-compose.yml est manquant!"
    echo "   Le repository n'a peut-être pas été synchronisé correctement."
    exit 1
fi

if [ ! -s "docker-compose.yml" ]; then
    echo "❌ ERREUR: Le fichier docker-compose.yml est vide!"
    echo "   Le repository n'a peut-être pas été synchronisé correctement."
    exit 1
fi

echo "✅ Fichier docker-compose.yml présent et valide"

# ============================================================================
# 1. BACKUP de l'image actuelle (pour rollback)
# ============================================================================
if [ "$CURRENT_IMAGE" != "none" ] && [ -n "$CURRENT_IMAGE" ]; then
    echo "📦 Sauvegarde de l'image actuelle pour rollback..."
    docker tag "$CURRENT_IMAGE" "ghcr.io/aoleon/cjd80:${BACKUP_TAG}" || true
    echo "✅ Backup créé: ${BACKUP_TAG}"
fi

# ============================================================================
# 2. LOGIN au GitHub Container Registry
# ============================================================================
echo "🔐 Connexion au GitHub Container Registry..."
if [ -f "$HOME/.docker/config.json" ]; then
    echo "✅ Déjà authentifié à GHCR"
else
    echo "⚠️  Configuration Docker manquante - assurez-vous d'être connecté à GHCR"
    echo "    Exécutez: docker login ghcr.io -u USERNAME -p TOKEN"
fi

# ============================================================================
# 3. PULL de la nouvelle image
# ============================================================================
echo "⬇️  Téléchargement de la nouvelle image Docker..."
if [ -n "$DOCKER_IMAGE" ]; then
    echo "   Image: $DOCKER_IMAGE"
    docker pull "$DOCKER_IMAGE"
else
    echo "   Image: ghcr.io/aoleon/cjd80:latest (fallback)"
    docker pull ghcr.io/aoleon/cjd80:latest
    export DOCKER_IMAGE="ghcr.io/aoleon/cjd80:latest"
fi

# ============================================================================
# 4. MIGRATIONS de base de données
# ============================================================================
echo "🗄️  Exécution des migrations de base de données..."

# Vérifier si .env existe
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo "❌ ERREUR: Fichier .env manquant!"
    echo "   Créez le fichier .env à partir de .env.example"
    exit 1
fi

# Exécuter les migrations dans un conteneur temporaire
docker compose run --rm \
    --no-deps \
    --entrypoint "npx drizzle-kit push" \
    cjd-app || {
    echo "⚠️  Warning: Migration failed, continuing anyway (might be up to date)"
}

echo "✅ Migrations terminées"

# ============================================================================
# 5. DÉPLOIEMENT de la nouvelle version
# ============================================================================
echo "🔄 Démarrage de la nouvelle version..."

# Vérifier que le réseau Traefik existe
if ! docker network ls | grep -q "proxy"; then
    echo "⚠️  Le réseau 'proxy' n'existe pas. Création..."
    docker network create proxy || {
        echo "❌ ERREUR: Impossible de créer le réseau 'proxy'"
        echo "   Assurez-vous que Traefik est configuré correctement"
        exit 1
    }
fi

# Arrêter l'ancienne version (sans supprimer les volumes)
docker compose down --remove-orphans

# Démarrer la nouvelle version
docker compose up -d

# Attendre un peu pour que le conteneur démarre
sleep 3

# Vérifier et reconnecter au réseau proxy si nécessaire
if ! docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
    echo "⚠️  Le conteneur n'est pas sur le réseau proxy. Reconnexion..."
    docker network connect proxy cjd-app 2>/dev/null || {
        echo "⚠️  Impossible de connecter au réseau proxy (peut-être déjà connecté)"
    }
fi

echo "⏳ Attente du démarrage de l'application (60s max)..."
sleep 5

# Vérifier que le conteneur est démarré
CONTAINER_STARTED=false
for i in {1..12}; do
    if docker compose ps | grep -q "cjd-app.*Up"; then
        CONTAINER_STARTED=true
        break
    fi
    echo "   Attente du démarrage du conteneur ($i/12)..."
    sleep 5
done

if [ "$CONTAINER_STARTED" = false ]; then
    echo "❌ ERREUR: Le conteneur n'a pas démarré"
    docker compose ps
    docker compose logs --tail=50 cjd-app
    exit 1
fi

echo "✅ Conteneur démarré"

# ============================================================================
# 6. HEALTH CHECK
# ============================================================================
HEALTH_CHECK_MAX_ATTEMPTS=30
HEALTH_CHECK_ATTEMPT=0
HEALTH_CHECK_PASSED=false

echo "🔍 Vérification de la santé de l'application..."

while [ $HEALTH_CHECK_ATTEMPT -lt $HEALTH_CHECK_MAX_ATTEMPTS ]; do
    HEALTH_CHECK_ATTEMPT=$((HEALTH_CHECK_ATTEMPT + 1))
    
    # Vérifier que le conteneur est toujours en cours d'exécution
    if ! docker compose ps | grep -q "cjd-app.*Up"; then
        echo "❌ Le conteneur s'est arrêté!"
        docker compose ps
        docker compose logs --tail=50 cjd-app
        HEALTH_CHECK_PASSED=false
        break
    fi
    
    # Vérifier le health check Docker natif
    CONTAINER_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' cjd-app 2>/dev/null || echo "none")
    if [ "$CONTAINER_HEALTH" = "healthy" ]; then
        echo "✅ Health check Docker: healthy"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    # Vérifier le health check via wget dans le conteneur
    if docker compose exec -T cjd-app wget --spider -q http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check réussi via wget!"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    # Vérifier via curl depuis le VPS (si le port est exposé localement)
    if curl -f -s -o /dev/null http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check réussi via curl!"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    echo "   Tentative $HEALTH_CHECK_ATTEMPT/$HEALTH_CHECK_MAX_ATTEMPTS (Health: $CONTAINER_HEALTH)..."
    sleep 2
done

# ============================================================================
# 7. VÉRIFICATION TRAEFIK
# ============================================================================
if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo ""
    echo "🔍 Vérification de la connexion Traefik..."
    
    # Vérifier que le conteneur est sur le réseau proxy
    if docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
        echo "✅ Conteneur connecté au réseau Traefik"
    else
        echo "⚠️  Le conteneur n'est pas visible sur le réseau Traefik"
        echo "   Vérification des réseaux..."
        docker network inspect proxy 2>/dev/null || echo "   Réseau proxy non trouvé"
        docker network inspect cjd-network 2>/dev/null || echo "   Réseau cjd-network non trouvé"
    fi
    
    # Vérifier les labels Traefik
    TRAEFIK_ENABLED=$(docker inspect cjd-app 2>/dev/null | grep -o '"traefik.enable":"true"' || echo "")
    if [ -n "$TRAEFIK_ENABLED" ]; then
        echo "✅ Labels Traefik configurés"
    else
        echo "⚠️  Labels Traefik non trouvés"
    fi
fi

# ============================================================================
# 8. ROLLBACK si nécessaire
# ============================================================================
if [ "$HEALTH_CHECK_PASSED" = false ]; then
    echo ""
    echo "❌ ERREUR: Le health check a échoué!"
    echo "📋 Logs de l'application:"
    docker compose logs --tail=50 cjd-app
    echo ""
    echo "📊 Statut du conteneur:"
    docker compose ps
    echo ""
    echo "🌐 Réseaux Docker:"
    docker network ls
    echo ""
    echo "🔍 Inspection du conteneur:"
    docker inspect cjd-app 2>/dev/null | grep -A 10 "Health" || echo "   Pas d'information de santé disponible"
    
    if [ "$CURRENT_IMAGE" != "none" ] && [ -n "$CURRENT_IMAGE" ]; then
        echo ""
        echo "🔄 ROLLBACK vers la version précédente..."
        
        # Restaurer l'ancienne version
        export DOCKER_IMAGE="ghcr.io/aoleon/cjd80:${BACKUP_TAG}"
        docker compose down
        docker compose up -d
        
        echo "✅ Rollback effectué vers ${BACKUP_TAG}"
        echo "⚠️  Le déploiement a échoué et a été annulé"
        exit 1
    else
        echo "⚠️  Pas de version précédente pour rollback"
        exit 1
    fi
fi

# ============================================================================
# 9. SUCCÈS - Nettoyage
# ============================================================================
echo ""
echo "=================================================="
echo "✅ Déploiement réussi!"
echo "=================================================="
echo "📦 Image: $DOCKER_IMAGE"
echo "🔗 URL: https://cjd80.fr"
echo "💚 Health check: https://cjd80.fr/api/health"
echo ""

# Afficher le statut
docker compose ps

echo ""
echo "📊 Statistiques du conteneur:"
docker stats --no-stream cjd-app

exit 0
