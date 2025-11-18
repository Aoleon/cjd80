#!/bin/bash
set -e

# ============================================================================
# Script de monitoring continu du workflow GitHub Actions
# Vérifie périodiquement jusqu'à ce que l'image soit disponible et déployée
# ============================================================================

# Configuration SSH
VPS_HOST="141.94.31.162"
VPS_USER="thibault"
VPS_PORT="22"
VPS_PASS="@Tibo4713234"
DEPLOY_DIR="/docker/cjd80"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================================${NC}"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

ssh_exec() {
    sshpass -p "$VPS_PASS" ssh -o StrictHostKeyChecking=no -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$@"
}

# ============================================================================
# FONCTIONS
# ============================================================================

check_image_available() {
    local COMMIT=$1
    local IMAGE="ghcr.io/aoleon/cjd80:main-${COMMIT}"
    
    print_info "Vérification de l'image: $IMAGE"
    
    PULL_RESULT=$(ssh_exec "docker pull $IMAGE 2>&1" || echo "FAILED")
    
    if echo "$PULL_RESULT" | grep -q "Downloaded\|Image is up to date\|Pulling from"; then
        print_success "Image disponible dans GHCR!"
        return 0
    else
        print_warning "Image pas encore disponible"
        return 1
    fi
}

deploy_image() {
    local COMMIT=$1
    local IMAGE="ghcr.io/aoleon/cjd80:main-${COMMIT}"
    
    print_header "🚀 Déploiement de l'image $IMAGE"
    
    ssh_exec "cd $DEPLOY_DIR && export DOCKER_IMAGE='$IMAGE' && bash scripts/vps-deploy.sh" || {
        print_error "Échec du déploiement"
        return 1
    }
    
    print_success "Déploiement terminé"
    return 0
}

verify_deployment() {
    print_header "✅ Vérification du déploiement"
    
    sleep 15
    
    HEALTH=$(ssh_exec "cd $DEPLOY_DIR && docker compose exec -T cjd-app wget -q -O- http://localhost:5000/api/health 2>/dev/null || echo 'FAILED'")
    
    if echo "$HEALTH" | grep -q "healthy"; then
        print_success "Déploiement réussi! Application en bonne santé"
        echo "$HEALTH" | jq . 2>/dev/null || echo "$HEALTH"
        return 0
    else
        print_error "Health check échoué"
        ssh_exec "cd $DEPLOY_DIR && docker compose logs --tail=50 cjd-app"
        return 1
    fi
}

# ============================================================================
# SCRIPT PRINCIPAL
# ============================================================================

main() {
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass n'est pas installé"
        exit 1
    fi
    
    print_header "🔍 Monitoring Workflow GitHub Actions"
    
    LATEST_COMMIT=$(git rev-parse --short HEAD)
    print_info "Dernier commit: $LATEST_COMMIT"
    print_info "Image attendue: ghcr.io/aoleon/cjd80:main-${LATEST_COMMIT}"
    echo ""
    
    MAX_ATTEMPTS=20
    ATTEMPT=0
    IMAGE_AVAILABLE=false
    
    print_info "Surveillance du workflow (max ${MAX_ATTEMPTS} tentatives, ~${MAX_ATTEMPTS} minutes)..."
    echo ""
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        ATTEMPT=$((ATTEMPT + 1))
        
        print_info "Tentative $ATTEMPT/$MAX_ATTEMPTS..."
        
        if check_image_available "$LATEST_COMMIT"; then
            IMAGE_AVAILABLE=true
            break
        fi
        
        if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
            print_info "Attente de 60 secondes avant la prochaine vérification..."
            sleep 60
        fi
    done
    
    if [ "$IMAGE_AVAILABLE" = true ]; then
        print_success "Image disponible! Déploiement en cours..."
        echo ""
        
        if deploy_image "$LATEST_COMMIT"; then
            if verify_deployment; then
                print_header "🎉 SUCCÈS COMPLET!"
                print_success "L'image a été buildée, déployée et vérifiée avec succès"
                print_info "URL: https://cjd80.fr"
                print_info "Health check: https://cjd80.fr/api/health"
                return 0
            else
                print_error "Le déploiement a réussi mais la vérification a échoué"
                return 1
            fi
        else
            print_error "Échec du déploiement"
            return 1
        fi
    else
        print_error "L'image n'est pas disponible après ${MAX_ATTEMPTS} tentatives"
        print_warning "Le workflow GitHub Actions a peut-être échoué"
        print_info "Vérifiez les logs: https://github.com/Aoleon/cjd80/actions"
        return 1
    fi
}

main "$@"
