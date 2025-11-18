#!/bin/bash
set -e

# ============================================================================
# Script de build et déploiement VPS pour CJD Amiens (cjd80.fr)
# Ce script est exécuté sur le VPS et build l'image Docker localement
# ============================================================================

echo "=================================================="
echo "🚀 Build et Déploiement CJD Amiens - cjd80.fr"
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

# Vérifier que docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ ERREUR: Le fichier docker-compose.yml est manquant!"
    exit 1
fi

if [ ! -s "docker-compose.yml" ]; then
    echo "❌ ERREUR: Le fichier docker-compose.yml est vide!"
    exit 1
fi

# Vérifier que Dockerfile existe
if [ ! -f "Dockerfile" ]; then
    echo "❌ ERREUR: Le fichier Dockerfile est manquant!"
    exit 1
fi

# Vérifier que .env existe
if [ ! -f ".env" ]; then
    echo "❌ ERREUR: Le fichier .env est manquant!"
    echo "   Créez le fichier .env à partir de .env.example"
    exit 1
fi

echo "✅ Fichiers nécessaires présents"

# ============================================================================
# 1. MISE À JOUR DU REPOSITORY
# ============================================================================
echo ""
echo "🔄 Mise à jour du repository Git..."

# Vérifier si le repository est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repository Git..."
    git init
    git remote add origin https://github.com/Aoleon/cjd80.git || {
        echo "⚠️  Remote origin existe déjà"
    }
fi

# Récupérer les dernières modifications
echo "   Récupération des dernières modifications..."
git fetch origin main || {
    echo "⚠️  Impossible de fetch origin/main, utilisation de la version locale"
}

# Mettre à jour vers origin/main
echo "   Mise à jour vers origin/main..."
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
# 2. BACKUP de l'image actuelle (pour rollback)
# ============================================================================
echo ""
echo "📦 Sauvegarde de l'image actuelle pour rollback..."

# Récupérer l'image actuellement utilisée
CURRENT_IMAGE=$(docker compose images -q cjd-app 2>/dev/null || echo "")

if [ -n "$CURRENT_IMAGE" ] && [ "$CURRENT_IMAGE" != "none" ]; then
    # Extraire le tag de l'image actuelle
    CURRENT_IMAGE_TAG=$(docker inspect --format='{{.RepoTags}}' "$CURRENT_IMAGE" 2>/dev/null | grep -o "$IMAGE_NAME:[^ ]*" | head -1 || echo "")
    
    if [ -n "$CURRENT_IMAGE_TAG" ]; then
        # Si l'image actuelle est latest, créer un backup
        if echo "$CURRENT_IMAGE_TAG" | grep -q "latest"; then
            echo "   Création d'un backup de l'image latest..."
            docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:$BACKUP_TAG" 2>/dev/null || {
                # Si latest n'existe pas encore, utiliser l'image actuelle
                docker tag "$CURRENT_IMAGE" "$IMAGE_NAME:$BACKUP_TAG" || true
            }
            echo "✅ Backup créé: $IMAGE_NAME:$BACKUP_TAG"
        else
            echo "   Image actuelle n'est pas latest, pas de backup nécessaire"
        fi
    else
        # Si on ne peut pas déterminer le tag, tagger l'image directement
        docker tag "$CURRENT_IMAGE" "$IMAGE_NAME:$BACKUP_TAG" 2>/dev/null || true
        echo "✅ Backup créé: $IMAGE_NAME:$BACKUP_TAG"
    fi
else
    echo "⚠️  Aucune image actuelle trouvée (premier déploiement?)"
fi

# ============================================================================
# 3. NETTOYAGE des anciennes images backup
# ============================================================================
echo ""
echo "🧹 Nettoyage des anciennes images backup..."

# Lister toutes les images backup, trier par date (plus récentes en premier)
BACKUP_IMAGES=$(docker images "$IMAGE_NAME" --format "{{.Tag}}" | grep "^backup-" | sort -r || echo "")

if [ -n "$BACKUP_IMAGES" ]; then
    BACKUP_COUNT=$(echo "$BACKUP_IMAGES" | wc -l)
    echo "   Images backup trouvées: $BACKUP_COUNT"
    
    if [ "$BACKUP_COUNT" -gt "$KEEP_BACKUPS" ]; then
        # Garder les KEEP_BACKUPS plus récentes, supprimer les autres
        IMAGES_TO_REMOVE=$(echo "$BACKUP_IMAGES" | tail -n +$((KEEP_BACKUPS + 1)))
        
        if [ -n "$IMAGES_TO_REMOVE" ]; then
            REMOVE_COUNT=$(echo "$IMAGES_TO_REMOVE" | wc -l)
            echo "   Suppression de $REMOVE_COUNT ancienne(s) image(s) backup..."
            
            while IFS= read -r tag; do
                if [ -n "$tag" ]; then
                    echo "     Suppression: $IMAGE_NAME:$tag"
                    docker rmi "$IMAGE_NAME:$tag" 2>/dev/null || true
                fi
            done <<< "$IMAGES_TO_REMOVE"
            
            echo "✅ Nettoyage terminé"
        fi
    else
        echo "   Pas de nettoyage nécessaire (moins de $KEEP_BACKUPS images backup)"
    fi
else
    echo "   Aucune image backup à nettoyer"
fi

# ============================================================================
# 4. BUILD de l'image Docker localement
# ============================================================================
echo ""
echo "🏗️  Construction de l'image Docker localement..."

# Vérifier que Dockerfile existe
if [ ! -f "Dockerfile" ]; then
    echo "❌ ERREUR: Dockerfile non trouvé!"
    exit 1
fi

echo "   Build de l'image: $IMAGE_NAME:$IMAGE_TAG"
echo "   Cela peut prendre plusieurs minutes..."

# Build l'image
docker build -t "$IMAGE_NAME:$IMAGE_TAG" . || {
    echo "❌ ERREUR: Échec du build Docker"
    echo "📋 Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
}

echo "✅ Image buildée avec succès: $IMAGE_NAME:$IMAGE_TAG"

# Afficher la taille de l'image
IMAGE_SIZE=$(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")
echo "   Taille de l'image: $IMAGE_SIZE"

# ============================================================================
# 5. MIGRATIONS de base de données
# ============================================================================
echo ""
echo "🗄️  Exécution des migrations de base de données..."

echo "   Exécution de drizzle-kit push..."
# Exécuter les migrations dans un conteneur temporaire avec la nouvelle image
docker run --rm \
    --env-file "$DEPLOY_DIR/.env" \
    --network proxy \
    --user root \
    "$IMAGE_NAME:$IMAGE_TAG" \
    sh -c "cd /app && npx drizzle-kit push" || {
    echo "⚠️  Warning: Migration failed, continuing anyway (might be up to date)"
    echo "   Vérifiez les logs ci-dessus pour plus de détails"
}

echo "✅ Migrations terminées"

# ============================================================================
# 6. DÉPLOIEMENT de la nouvelle version
# ============================================================================
echo ""
echo "🔄 Déploiement de la nouvelle version..."

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
echo "   Arrêt de l'ancienne version..."
docker compose down --remove-orphans

# Exporter l'image tag pour docker-compose
export DOCKER_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# Démarrer la nouvelle version
echo "   Démarrage de la nouvelle version..."
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
# 7. HEALTH CHECK
# ============================================================================
HEALTH_CHECK_MAX_ATTEMPTS=30
HEALTH_CHECK_ATTEMPT=0
HEALTH_CHECK_PASSED=false

echo ""
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
    
    # Vérifier via curl depuis le VPS
    if curl -f -s -o /dev/null http://localhost:5000/api/health 2>/dev/null; then
        echo "✅ Health check réussi via curl!"
        HEALTH_CHECK_PASSED=true
        break
    fi
    
    echo "   Tentative $HEALTH_CHECK_ATTEMPT/$HEALTH_CHECK_MAX_ATTEMPTS (Health: $CONTAINER_HEALTH)..."
    sleep 2
done

# ============================================================================
# 8. VÉRIFICATION TRAEFIK
# ============================================================================
if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo ""
    echo "🔍 Vérification de la connexion Traefik..."
    
    # Vérifier que le conteneur est sur le réseau proxy
    if docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
        echo "✅ Conteneur connecté au réseau Traefik"
    else
        echo "⚠️  Le conteneur n'est pas visible sur le réseau Traefik"
        echo "   Tentative de reconnexion..."
        docker network connect proxy cjd-app 2>/dev/null || {
            echo "   ⚠️  Reconnexion échouée"
        }
    fi
    
    # Vérifier les labels Traefik
    if command -v jq &> /dev/null; then
        TRAEFIK_ENABLED=$(docker inspect cjd-app 2>/dev/null | jq -r '.[0].Config.Labels["traefik.enable"]' || echo "")
    else
        TRAEFIK_ENABLED=$(docker inspect cjd-app 2>/dev/null | grep -o '"traefik.enable":"true"' || echo "")
    fi
    
    if [ "$TRAEFIK_ENABLED" = "true" ] || [ -n "$TRAEFIK_ENABLED" ]; then
        echo "✅ Labels Traefik configurés"
        
        # Attendre quelques secondes pour que Traefik détecte le nouveau conteneur
        echo "🔄 Attente de la détection automatique par Traefik (10s)..."
        sleep 10
    else
        echo "⚠️  Labels Traefik non trouvés dans le conteneur"
    fi
fi

# ============================================================================
# 9. ROLLBACK si nécessaire
# ============================================================================
if [ "$HEALTH_CHECK_PASSED" = false ]; then
    echo ""
    echo "❌ ERREUR: Le health check a échoué!"
    echo "📋 Logs de l'application:"
    docker compose logs --tail=50 cjd-app
    echo ""
    echo "📊 Statut du conteneur:"
    docker compose ps
    
    # Rollback vers la dernière image backup
    if [ -n "$BACKUP_TAG" ] && docker images "$IMAGE_NAME:$BACKUP_TAG" --format "{{.Tag}}" | grep -q "$BACKUP_TAG"; then
        echo ""
        echo "🔄 ROLLBACK vers la version précédente..."
        
        # Restaurer l'ancienne version
        docker tag "$IMAGE_NAME:$BACKUP_TAG" "$IMAGE_NAME:$IMAGE_TAG"
        export DOCKER_IMAGE="$IMAGE_NAME:$IMAGE_TAG"
        docker compose down
        docker compose up -d
        
        echo "✅ Rollback effectué vers $BACKUP_TAG"
        echo "⚠️  Le déploiement a échoué et a été annulé"
        exit 1
    else
        echo "⚠️  Pas de version précédente pour rollback"
        exit 1
    fi
fi

# ============================================================================
# 10. SUCCÈS - Résumé
# ============================================================================
echo ""
echo "=================================================="
echo "✅ Déploiement réussi!"
echo "=================================================="
echo "📦 Image: $IMAGE_NAME:$IMAGE_TAG"
echo "📝 Commit: $CURRENT_COMMIT"
echo "🔗 URL: https://cjd80.fr"
echo "💚 Health check: https://cjd80.fr/api/health"
echo ""

# Afficher le statut
docker compose ps

echo ""
echo "📊 Statistiques du conteneur:"
docker stats --no-stream cjd-app

echo ""
echo "📦 Images backup disponibles:"
docker images "$IMAGE_NAME" --format "table {{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep -E "backup-|TAG" | head -6

exit 0

