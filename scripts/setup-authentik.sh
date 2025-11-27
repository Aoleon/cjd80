#!/bin/bash

# Script d'automatisation pour configurer Authentik
# Ce script tente de télécharger l'image Authentik et de démarrer les services

set -e

echo "🚀 Configuration d'Authentik pour CJD80"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

info "Vérification de l'état des services..."

# Vérifier que PostgreSQL et Redis sont démarrés
if ! docker ps --format "{{.Names}}" | grep -q "cjd-postgres"; then
    warn "PostgreSQL n'est pas démarré. Démarrage..."
    docker compose -f docker-compose.services.yml up -d postgres
    sleep 5
fi

if ! docker ps --format "{{.Names}}" | grep -q "cjd-redis"; then
    warn "Redis n'est pas démarré. Démarrage..."
    docker compose -f docker-compose.services.yml up -d redis
    sleep 3
fi

success "Services de base démarrés"

# Vérifier si l'image Authentik existe déjà
info "Vérification de l'image Authentik..."
if docker images | grep -q "authentik.*2024.10.1"; then
    success "Image Authentik trouvée localement"
else
    warn "Image Authentik non trouvée. Tentative de téléchargement..."
    
    # Essayer différentes sources
    IMAGE_SOURCES=(
        "ghcr.io/goauthentik/authentik:2024.10.1"
        "beryju/authentik:2024.10.1"
        "authentik/server:2024.10.1"
    )
    
    IMAGE_DOWNLOADED=false
    
    for IMAGE in "${IMAGE_SOURCES[@]}"; do
        info "Essai avec: $IMAGE"
        if docker pull "$IMAGE" 2>/dev/null; then
            success "Image téléchargée depuis: $IMAGE"
            
            # Si ce n'est pas l'image officielle, la tagger
            if [[ "$IMAGE" != "ghcr.io/goauthentik/authentik:2024.10.1" ]]; then
                info "Tagging de l'image..."
                docker tag "$IMAGE" "ghcr.io/goauthentik/authentik:2024.10.1"
            fi
            
            IMAGE_DOWNLOADED=true
            break
        else
            warn "Échec du téléchargement depuis: $IMAGE"
        fi
    done
    
    if [ "$IMAGE_DOWNLOADED" = false ]; then
        error "Impossible de télécharger l'image Authentik depuis aucune source"
        echo ""
        echo "Solutions possibles:"
        echo "1. S'authentifier avec GitHub:"
        echo "   echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin"
        echo "   docker pull ghcr.io/goauthentik/authentik:2024.10.1"
        echo ""
        echo "2. Voir docs/deployment/AUTHENTIK_IMAGE_FIX.md pour plus de solutions"
        exit 1
    fi
fi

# Vérifier que la base de données authentik existe
info "Vérification de la base de données authentik..."
if docker exec cjd-postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -qw authentik; then
    success "Base de données authentik existe"
else
    warn "Création de la base de données authentik..."
    docker exec -it cjd-postgres psql -U postgres -c "CREATE DATABASE authentik;" || true
    success "Base de données authentik créée"
fi

# Démarrer les services Authentik
info "Démarrage des services Authentik..."
if docker compose -f docker-compose.services.yml up -d authentik-server authentik-worker; then
    success "Services Authentik démarrés"
    
    echo ""
    info "Attente du démarrage complet (30 secondes)..."
    sleep 30
    
    # Vérifier les logs
    info "Vérification des logs..."
    if docker compose -f docker-compose.services.yml logs authentik-server | grep -q "Listening on"; then
        success "Authentik Server est démarré"
    else
        warn "Authentik Server peut encore être en cours de démarrage"
        echo "Vérifiez les logs avec: docker compose -f docker-compose.services.yml logs -f authentik-server"
    fi
    
    echo ""
    success "🎉 Configuration terminée!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Accéder à l'interface Authentik: http://localhost:9002"
    echo "2. Récupérer les identifiants admin:"
    echo "   docker compose -f docker-compose.services.yml logs authentik-server | grep -i 'password\\|admin'"
    echo "3. Configurer l'application OAuth2/OIDC (voir docs/deployment/AUTHENTIK_QUICKSTART.md)"
    echo "4. Remplir les variables d'environnement avec les valeurs d'Authentik"
    
else
    error "Échec du démarrage des services Authentik"
    echo "Vérifiez les logs avec: docker compose -f docker-compose.services.yml logs"
    exit 1
fi


