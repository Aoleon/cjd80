#!/bin/bash
set -e

# ============================================================================
# Script de déploiement intelligent VPS - CJD Amiens (cjd80.fr)
# Ne rebuild que si nécessaire, utilise le cache Docker efficacement
# ============================================================================

echo "=================================================="
echo "🚀 Déploiement Intelligent CJD Amiens - cjd80.fr"
echo "=================================================="

# Variables
DEPLOY_DIR="/docker/cjd80"
IMAGE_NAME="cjd80"
IMAGE_TAG="latest"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
KEEP_BACKUPS=5

cd "$DEPLOY_DIR"

# ============================================================================
# 0. VÉRIFICATIONS PRÉLIMINAIRES
# ============================================================================
echo "🔍 Vérification des fichiers nécessaires..."

if [ ! -f "docker-compose.yml" ] || [ ! -s "docker-compose.yml" ]; then
    echo "❌ ERREUR: Le fichier docker-compose.yml est manquant ou vide!"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ ERREUR: Le fichier Dockerfile est manquant!"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ ERREUR: Le fichier .env est manquant!"
    exit 1
fi

echo "✅ Fichiers nécessaires présents"

# ============================================================================
# 1. MISE À JOUR DU REPOSITORY
# ============================================================================
echo ""
echo "🔄 Mise à jour du repository Git..."

if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repository Git..."
    git init
    git remote add origin https://github.com/Aoleon/cjd80.git || true
fi

# Sauvegarder le commit actuel pour comparaison
OLD_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")

# Récupérer les dernières modifications
git fetch origin main || {
    echo "⚠️  Impossible de fetch origin/main"
    exit 1
}

# Mettre à jour vers origin/main
git pull --ff-only origin main || {
    echo "⚠️  Fast-forward impossible, tentative de merge..."
    git pull origin main || {
        echo "❌ ERREUR: Impossible de mettre à jour le repository"
        exit 1
    }
}

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "✅ Repository mis à jour (commit: $CURRENT_COMMIT)"

# ============================================================================
# 2. DÉTECTION DES CHANGEMENTS
# ============================================================================
echo ""
echo "🔍 Analyse des changements..."

# Déterminer quels fichiers ont changé
if [ -n "$OLD_COMMIT" ] && [ "$OLD_COMMIT" != "$(git rev-parse HEAD)" ]; then
    CHANGED_FILES=$(git diff --name-only "$OLD_COMMIT" HEAD 2>/dev/null || echo "")
    echo "   Fichiers modifiés depuis le dernier déploiement:"
    echo "$CHANGED_FILES" | head -10 | sed 's/^/     - /'
    if [ $(echo "$CHANGED_FILES" | wc -l) -gt 10 ]; then
        echo "     ... et $(($(echo "$CHANGED_FILES" | wc -l) - 10)) autres"
    fi
else
    CHANGED_FILES=""
    echo "   Aucun changement détecté (même commit)"
fi

# Déterminer si un rebuild est nécessaire
NEED_REBUILD=true
REBUILD_REASON=""

# Vérifier si seuls des fichiers de config ont changé (pas besoin de rebuild)
if [ -n "$CHANGED_FILES" ]; then
    # Si seuls .env, docker-compose.yml, ou scripts ont changé, pas besoin de rebuild
    ONLY_CONFIG=$(echo "$CHANGED_FILES" | grep -vE "^\.(env|git)" | grep -vE "^(docker-compose\.yml|scripts/|docs/|README)" || echo "")
    
    if [ -z "$ONLY_CONFIG" ]; then
        NEED_REBUILD=false
        REBUILD_REASON="Seuls des fichiers de configuration ont changé"
    else
        # Vérifier si seuls des fichiers frontend ont changé (rebuild plus rapide)
        ONLY_FRONTEND=$(echo "$CHANGED_FILES" | grep -vE "^(server/|shared/|Dockerfile|package\.json|tsconfig)" || echo "")
        if [ -z "$ONLY_FRONTEND" ] && [ -n "$(echo "$CHANGED_FILES" | grep -E "^client/")" ]; then
            REBUILD_REASON="Changements frontend uniquement (rebuild optimisé)"
        else
            REBUILD_REASON="Changements détectés nécessitant un rebuild complet"
        fi
    fi
else
    REBUILD_REASON="Premier déploiement ou commit identique (rebuild pour sécurité)"
fi

# ============================================================================
# 3. BACKUP de l'image actuelle (pour rollback)
# ============================================================================
if [ "$NEED_REBUILD" = true ]; then
    echo ""
    echo "📦 Sauvegarde de l'image actuelle pour rollback..."
    
    CURRENT_IMAGE=$(docker compose images -q cjd-app 2>/dev/null || echo "")
    
    if [ -n "$CURRENT_IMAGE" ] && [ "$CURRENT_IMAGE" != "none" ]; then
        CURRENT_IMAGE_TAG=$(docker inspect --format='{{.RepoTags}}' "$CURRENT_IMAGE" 2>/dev/null | grep -o "$IMAGE_NAME:[^ ]*" | head -1 || echo "")
        
        if [ -n "$CURRENT_IMAGE_TAG" ] && echo "$CURRENT_IMAGE_TAG" | grep -q "latest"; then
            docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:$BACKUP_TAG" 2>/dev/null || {
                docker tag "$CURRENT_IMAGE" "$IMAGE_NAME:$BACKUP_TAG" || true
            }
            echo "✅ Backup créé: $IMAGE_NAME:$BACKUP_TAG"
        fi
    fi
    
    # Nettoyage des anciennes images backup
    echo "🧹 Nettoyage des anciennes images backup..."
    BACKUP_IMAGES=$(docker images "$IMAGE_NAME" --format "{{.Tag}}" | grep "^backup-" | sort -r || echo "")
    if [ -n "$BACKUP_IMAGES" ]; then
        BACKUP_COUNT=$(echo "$BACKUP_IMAGES" | wc -l)
        if [ "$BACKUP_COUNT" -gt "$KEEP_BACKUPS" ]; then
            IMAGES_TO_REMOVE=$(echo "$BACKUP_IMAGES" | tail -n +$((KEEP_BACKUPS + 1)))
            while IFS= read -r tag; do
                [ -n "$tag" ] && docker rmi "$IMAGE_NAME:$tag" 2>/dev/null || true
            done <<< "$IMAGES_TO_REMOVE"
        fi
    fi
fi

# ============================================================================
# 4. BUILD (seulement si nécessaire)
# ============================================================================
if [ "$NEED_REBUILD" = true ]; then
    echo ""
    echo "🏗️  Construction de l'image Docker..."
    echo "   Raison: $REBUILD_REASON"
    echo "   Cela peut prendre plusieurs minutes..."
    
    # Build avec cache Docker optimisé
    docker build \
        --tag "$IMAGE_NAME:$IMAGE_TAG" \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        . || {
        echo "❌ ERREUR: Échec du build Docker"
        exit 1
    }
    
    echo "✅ Image buildée avec succès: $IMAGE_NAME:$IMAGE_TAG"
    IMAGE_SIZE=$(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")
    echo "   Taille de l'image: $IMAGE_SIZE"
else
    echo ""
    echo "⏭️  Pas de rebuild nécessaire: $REBUILD_REASON"
    echo "   Utilisation de l'image existante: $IMAGE_NAME:$IMAGE_TAG"
fi

# ============================================================================
# 5. MIGRATIONS de base de données
# ============================================================================
echo ""
echo "🗄️  Exécution des migrations de base de données..."

docker run --rm \
    --env-file "$DEPLOY_DIR/.env" \
    --network proxy \
    --user root \
    "$IMAGE_NAME:$IMAGE_TAG" \
    sh -c "cd /app && npx drizzle-kit push" || {
    echo "⚠️  Warning: Migration failed, continuing anyway"
}

echo "✅ Migrations terminées"

# ============================================================================
# 6. DÉPLOIEMENT
# ============================================================================
echo ""
echo "🔄 Déploiement de la nouvelle version..."

# Vérifier le réseau Traefik
if ! docker network ls | grep -q "proxy"; then
    echo "⚠️  Le réseau 'proxy' n'existe pas. Création..."
    docker network create proxy || {
        echo "❌ ERREUR: Impossible de créer le réseau 'proxy'"
        exit 1
    }
fi

# Arrêter l'ancienne version
echo "   Arrêt de l'ancienne version..."
docker compose down --remove-orphans

# Exporter l'image tag pour docker-compose
export DOCKER_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# Démarrer la nouvelle version
echo "   Démarrage de la nouvelle version..."
docker compose up -d

sleep 3

# Reconnecter au réseau proxy si nécessaire
if ! docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
    docker network connect proxy cjd-app 2>/dev/null || true
fi

# ============================================================================
# 7. HEALTH CHECK
# ============================================================================
echo ""
echo "⏳ Attente du démarrage de l'application (60s max)..."

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
    docker compose logs --tail=50 cjd-app
    exit 1
fi

echo "✅ Conteneur démarré"

# Health check
HEALTH_CHECK_MAX_ATTEMPTS=30
HEALTH_CHECK_ATTEMPT=0
HEALTH_CHECK_PASSED=false

echo ""
echo "🔍 Vérification de la santé de l'application..."

while [ $HEALTH_CHECK_ATTEMPT -lt $HEALTH_CHECK_MAX_ATTEMPTS ]; do
    HEALTH_CHECK_ATTEMPT=$((HEALTH_CHECK_ATTEMPT + 1))
    
    if ! docker compose ps | grep -q "cjd-app.*Up"; then
        echo "❌ Le conteneur s'est arrêté!"
        docker compose logs --tail=50 cjd-app
        HEALTH_CHECK_PASSED=false
        break
    fi
    
    CONTAINER_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' cjd-app 2>/dev/null || echo "none")
    if [ "$CONTAINER_HEALTH" = "healthy" ]; then
        echo "✅ Health check Docker: healthy"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    if docker compose exec -T cjd-app wget --spider -q http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check réussi!"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    if curl -f -s -o /dev/null http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check réussi!"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    echo "   Tentative $HEALTH_CHECK_ATTEMPT/$HEALTH_CHECK_MAX_ATTEMPTS (Health: $CONTAINER_HEALTH)..."
    sleep 2
done

# ============================================================================
# 8. ROLLBACK si nécessaire
# ============================================================================
if [ "$HEALTH_CHECK_PASSED" = false ]; then
    echo ""
    echo "❌ ERREUR: Le health check a échoué!"
    docker compose logs --tail=50 cjd-app
    
    # Rollback
    if [ -n "$BACKUP_TAG" ] && docker images "$IMAGE_NAME:$BACKUP_TAG" --format "{{.Tag}}" | grep -q "$BACKUP_TAG"; then
        echo ""
        echo "🔄 ROLLBACK vers la version précédente..."
        docker tag "$IMAGE_NAME:$BACKUP_TAG" "$IMAGE_NAME:$IMAGE_TAG"
        export DOCKER_IMAGE="$IMAGE_NAME:$IMAGE_TAG"
        docker compose down
        docker compose up -d
        echo "✅ Rollback effectué"
        exit 1
    else
        echo "⚠️  Pas de version précédente pour rollback"
        exit 1
    fi
fi

# ============================================================================
# 9. SUCCÈS
# ============================================================================
echo ""
echo "=================================================="
echo "✅ Déploiement réussi!"
echo "=================================================="
echo "📦 Image: $IMAGE_NAME:$IMAGE_TAG"
echo "📝 Commit: $CURRENT_COMMIT"
echo "🔄 Rebuild: $([ "$NEED_REBUILD" = true ] && echo "Oui" || echo "Non (cache utilisé)")"
echo "🔗 URL: https://cjd80.fr"
echo "💚 Health check: https://cjd80.fr/api/health"
echo ""

docker compose ps

echo ""
echo "📊 Statistiques du conteneur:"
docker stats --no-stream cjd-app

exit 0

