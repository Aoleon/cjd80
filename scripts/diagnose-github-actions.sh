#!/bin/bash
set -e

# ============================================================================
# Script de diagnostic des échecs GitHub Actions
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
# DIAGNOSTICS
# ============================================================================

check_github_secrets() {
    print_header "🔐 Vérification des Secrets GitHub"
    
    print_info "Les secrets suivants doivent être configurés dans GitHub:"
    echo ""
    echo "  - VPS_SSH_KEY      : Clé SSH privée pour se connecter au VPS"
    echo "  - VPS_HOST         : Adresse IP du serveur (141.94.31.162)"
    echo "  - VPS_PORT         : Port SSH (22)"
    echo "  - VPS_USER         : Utilisateur SSH (thibault)"
    echo ""
    print_warning "Vérifiez ces secrets dans: Settings > Secrets and variables > Actions"
}

check_vps_ghcr_auth() {
    print_header "🐳 Vérification Authentification GHCR sur VPS"
    
    AUTH_CHECK=$(ssh_exec "cat ~/.docker/config.json 2>/dev/null | grep -q 'ghcr.io' && echo 'OK' || echo 'MISSING'")
    
    if [ "$AUTH_CHECK" = "OK" ]; then
        print_success "Authentification GHCR configurée"
        ssh_exec "cat ~/.docker/config.json | grep -A 2 'ghcr.io' || echo 'Config trouvée'"
    else
        print_error "Authentification GHCR manquante"
        print_info "Pour corriger, exécutez sur le serveur:"
        echo ""
        echo "  docker login ghcr.io -u USERNAME -p TOKEN"
        echo ""
        print_info "Ou créez un token GitHub avec permissions 'read:packages' et 'write:packages'"
    fi
}

check_docker_compose_file() {
    print_header "📄 Vérification docker-compose.yml"
    
    FILE_EXISTS=$(ssh_exec "cd $DEPLOY_DIR && test -f docker-compose.yml && echo 'OK' || echo 'MISSING'")
    
    if [ "$FILE_EXISTS" = "OK" ]; then
        print_success "docker-compose.yml présent"
        FILE_SIZE=$(ssh_exec "cd $DEPLOY_DIR && wc -l < docker-compose.yml")
        print_info "Taille: $FILE_SIZE lignes"
        
        # Vérifier qu'il n'est pas vide
        if [ "$FILE_SIZE" -lt 10 ]; then
            print_error "docker-compose.yml semble vide ou corrompu"
        fi
    else
        print_error "docker-compose.yml manquant"
    fi
}

check_env_file() {
    print_header "⚙️  Vérification fichier .env"
    
    ENV_EXISTS=$(ssh_exec "cd $DEPLOY_DIR && test -f .env && echo 'OK' || echo 'MISSING'")
    
    if [ "$ENV_EXISTS" = "OK" ]; then
        print_success "Fichier .env présent"
        
        # Vérifier les variables critiques
        DATABASE_URL=$(ssh_exec "cd $DEPLOY_DIR && grep -E '^DATABASE_URL=' .env | cut -d'=' -f2- || echo ''")
        if [ -n "$DATABASE_URL" ]; then
            print_success "DATABASE_URL configuré"
        else
            print_error "DATABASE_URL manquant dans .env"
        fi
        
        SESSION_SECRET=$(ssh_exec "cd $DEPLOY_DIR && grep -E '^SESSION_SECRET=' .env | cut -d'=' -f2- || echo ''")
        if [ -n "$SESSION_SECRET" ]; then
            print_success "SESSION_SECRET configuré"
        else
            print_error "SESSION_SECRET manquant dans .env"
        fi
    else
        print_error "Fichier .env manquant"
        print_info "Créez-le à partir de .env.example"
    fi
}

check_repository_sync() {
    print_header "🔄 Vérification Synchronisation Repository"
    
    SERVER_COMMIT=$(ssh_exec "cd $DEPLOY_DIR && git rev-parse HEAD 2>/dev/null || echo 'unknown'")
    REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null || echo 'unknown')
    
    print_info "Commit serveur: ${SERVER_COMMIT:0:7}"
    print_info "Commit origin/main: ${REMOTE_COMMIT:0:7}"
    
    if [ "$SERVER_COMMIT" = "$REMOTE_COMMIT" ]; then
        print_success "Repository synchronisé"
    else
        print_warning "Repository non synchronisé"
        print_info "Mettez à jour avec: git reset --hard origin/main"
    fi
}

check_docker_images() {
    print_header "📦 Vérification Images Docker"
    
    LATEST_COMMIT=$(git rev-parse --short HEAD)
    LATEST_IMAGE="ghcr.io/aoleon/cjd80:main-${LATEST_COMMIT}"
    
    print_info "Image attendue: $LATEST_IMAGE"
    
    # Vérifier si l'image existe localement
    IMAGE_EXISTS=$(ssh_exec "docker images $LATEST_IMAGE --format '{{.Repository}}:{{.Tag}}' 2>/dev/null || echo ''")
    
    if [ -n "$IMAGE_EXISTS" ]; then
        print_success "Image présente localement"
    else
        print_warning "Image non présente localement"
        
        # Essayer de pull
        print_info "Tentative de pull..."
        PULL_RESULT=$(ssh_exec "docker pull $LATEST_IMAGE 2>&1" || echo "FAILED")
        
        if echo "$PULL_RESULT" | grep -q "Downloaded\|Image is up to date"; then
            print_success "Image disponible dans GHCR"
        else
            print_error "Image non disponible dans GHCR"
            echo "$PULL_RESULT" | head -5
            print_info "Le workflow GitHub Actions doit build et push l'image"
        fi
    fi
}

check_network_config() {
    print_header "🌐 Vérification Configuration Réseau"
    
    PROXY_NETWORK=$(ssh_exec "docker network ls | grep -q 'proxy' && echo 'OK' || echo 'MISSING'")
    
    if [ "$PROXY_NETWORK" = "OK" ]; then
        print_success "Réseau 'proxy' existe"
    else
        print_error "Réseau 'proxy' manquant"
        print_info "Créez-le avec: docker network create proxy"
    fi
}

check_script_permissions() {
    print_header "🔧 Vérification Permissions Scripts"
    
    VPS_DEPLOY=$(ssh_exec "cd $DEPLOY_DIR && test -x scripts/vps-deploy.sh && echo 'OK' || echo 'NOT_EXECUTABLE'")
    
    if [ "$VPS_DEPLOY" = "OK" ]; then
        print_success "scripts/vps-deploy.sh est exécutable"
    else
        print_error "scripts/vps-deploy.sh n'est pas exécutable"
        print_info "Corrigez avec: chmod +x scripts/vps-deploy.sh"
    fi
}

check_workflow_syntax() {
    print_header "📋 Vérification Syntaxe Workflow"
    
    if [ -f ".github/workflows/deploy.yml" ]; then
        print_success "Fichier workflow présent"
        
        # Vérifications basiques
        if grep -q "build-and-push:" .github/workflows/deploy.yml; then
            print_success "Job build-and-push défini"
        else
            print_error "Job build-and-push manquant"
        fi
        
        if grep -q "deploy:" .github/workflows/deploy.yml; then
            print_success "Job deploy défini"
        else
            print_error "Job deploy manquant"
        fi
        
        # Vérifier les secrets référencés
        SECRETS=$(grep -o '\${{ secrets\.[^}]* }}' .github/workflows/deploy.yml | sort -u)
        print_info "Secrets référencés dans le workflow:"
        echo "$SECRETS" | sed 's/\${{ secrets\./  - /' | sed 's/ }}//'
    else
        print_error "Fichier workflow manquant"
    fi
}

check_package_lock() {
    print_header "📦 Vérification package-lock.json"
    
    if [ -f "package-lock.json" ]; then
        print_success "package-lock.json présent"
        
        # Vérifier la synchronisation
        print_info "Vérification de la synchronisation..."
        if npm ci --dry-run > /dev/null 2>&1; then
            print_success "package-lock.json synchronisé avec package.json"
        else
            print_error "package-lock.json non synchronisé"
            print_info "Régénérez avec: npm install"
        fi
    else
        print_error "package-lock.json manquant"
    fi
}

# ============================================================================
# SCRIPT PRINCIPAL
# ============================================================================

main() {
    print_header "🔍 Diagnostic GitHub Actions - CJD80"
    
    echo ""
    print_info "Ce script vérifie les causes courantes d'échec du workflow GitHub Actions"
    echo ""
    
    check_github_secrets
    echo ""
    
    check_vps_ghcr_auth
    echo ""
    
    check_docker_compose_file
    echo ""
    
    check_env_file
    echo ""
    
    check_repository_sync
    echo ""
    
    check_docker_images
    echo ""
    
    check_network_config
    echo ""
    
    check_script_permissions
    echo ""
    
    check_workflow_syntax
    echo ""
    
    check_package_lock
    echo ""
    
    print_header "📋 Résumé des Problèmes"
    
    print_info "Pour voir les logs du workflow GitHub Actions:"
    echo "  https://github.com/Aoleon/cjd80/actions"
    echo ""
    
    print_info "Problèmes courants et solutions:"
    echo ""
    echo "1. ❌ Authentification GHCR manquante"
    echo "   Solution: docker login ghcr.io -u USERNAME -p TOKEN"
    echo ""
    echo "2. ❌ Secrets GitHub non configurés"
    echo "   Solution: Configurer dans Settings > Secrets and variables > Actions"
    echo ""
    echo "3. ❌ package-lock.json non synchronisé"
    echo "   Solution: npm install && git commit package-lock.json"
    echo ""
    echo "4. ❌ Fichier .env manquant sur le VPS"
    echo "   Solution: Créer .env à partir de .env.example"
    echo ""
    echo "5. ❌ Réseau Docker 'proxy' manquant"
    echo "   Solution: docker network create proxy"
}

main "$@"
