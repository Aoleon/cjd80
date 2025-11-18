#!/bin/bash
set -e

# ============================================================================
# Script de déploiement local vers VPS - CJD Amiens (cjd80.fr)
# Ce script se connecte en SSH au VPS et exécute le build et déploiement
# ============================================================================

# Configuration SSH
VPS_HOST="${VPS_HOST:-141.94.31.162}"
VPS_USER="${VPS_USER:-thibault}"
VPS_PORT="${VPS_PORT:-22}"
DEPLOY_DIR="${DEPLOY_DIR:-/docker/cjd80}"

# Clé SSH (utilise la clé par défaut ou celle spécifiée)
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

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

# Fonction pour exécuter des commandes SSH
ssh_exec() {
    local ssh_opts="-o StrictHostKeyChecking=no -o ConnectTimeout=10"
    
    # Utiliser la clé SSH si spécifiée
    if [ -n "$SSH_KEY" ] && [ "$SSH_KEY" != "~/.ssh/id_rsa" ]; then
        ssh_opts="$ssh_opts -i $SSH_KEY"
    fi
    
    ssh $ssh_opts -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$@"
}

# ============================================================================
# VÉRIFICATIONS PRÉLIMINAIRES
# ============================================================================

check_ssh_connection() {
    print_header "🔍 Vérification de la connexion SSH"
    
    print_info "Test de connexion au VPS..."
    if ssh_exec "echo 'Connexion SSH réussie'" > /dev/null 2>&1; then
        print_success "Connexion SSH établie"
        return 0
    else
        print_error "Impossible de se connecter au VPS"
        print_info "Vérifiez:"
        echo "  - Que la clé SSH est configurée: $SSH_KEY"
        echo "  - Que le VPS est accessible: $VPS_USER@$VPS_HOST:$VPS_PORT"
        echo "  - Test manuel: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
        exit 1
    fi
}

check_vps_prerequisites() {
    print_header "🔍 Vérification des prérequis sur le VPS"
    
    print_info "Vérification de Docker..."
    if ssh_exec "command -v docker > /dev/null 2>&1"; then
        DOCKER_VERSION=$(ssh_exec "docker --version")
        print_success "Docker installé: $DOCKER_VERSION"
    else
        print_error "Docker n'est pas installé sur le VPS"
        exit 1
    fi
    
    print_info "Vérification de Docker Compose..."
    if ssh_exec "command -v docker > /dev/null 2>&1 && docker compose version > /dev/null 2>&1"; then
        COMPOSE_VERSION=$(ssh_exec "docker compose version")
        print_success "Docker Compose installé: $COMPOSE_VERSION"
    else
        print_error "Docker Compose n'est pas installé sur le VPS"
        exit 1
    fi
    
    print_info "Vérification du répertoire de déploiement..."
    if ssh_exec "[ -d '$DEPLOY_DIR' ]"; then
        print_success "Répertoire de déploiement existe: $DEPLOY_DIR"
    else
        print_warning "Le répertoire $DEPLOY_DIR n'existe pas"
        print_info "Création du répertoire..."
        ssh_exec "sudo mkdir -p $DEPLOY_DIR && sudo chown -R $VPS_USER:$VPS_USER $DEPLOY_DIR" || {
            print_error "Impossible de créer le répertoire"
            exit 1
        }
    fi
    
    print_info "Vérification de Git sur le VPS..."
    if ssh_exec "command -v git > /dev/null 2>&1"; then
        print_success "Git installé"
    else
        print_error "Git n'est pas installé sur le VPS"
        exit 1
    fi
}

# ============================================================================
# SCRIPT PRINCIPAL
# ============================================================================

main() {
    print_header "🚀 Déploiement Local vers VPS - CJD Amiens"
    
    print_info "Configuration:"
    echo "  - VPS: $VPS_USER@$VPS_HOST:$VPS_PORT"
    echo "  - Répertoire: $DEPLOY_DIR"
    echo "  - Clé SSH: $SSH_KEY"
    echo ""
    
    # Vérifications
    check_ssh_connection
    check_vps_prerequisites
    
    # Récupérer le commit actuel pour information
    CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    
    print_info "Version à déployer:"
    echo "  - Commit: $CURRENT_COMMIT"
    echo "  - Branche: $CURRENT_BRANCH"
    echo ""
    
    # Demander confirmation
    read -p "Continuer le déploiement? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Déploiement annulé"
        exit 0
    fi
    
    print_header "🚀 Lancement du déploiement sur le VPS"
    
    # Transférer le script de build et déploiement si nécessaire
    print_info "Vérification du script de déploiement sur le VPS..."
    
    # Exécuter le script de build et déploiement sur le VPS
    print_info "Exécution du build et déploiement sur le VPS..."
    echo ""
    
    # Exécuter le script de build et déploiement
    ssh_exec "cd $DEPLOY_DIR && bash scripts/vps-build-and-deploy.sh" || {
        print_error "Échec du déploiement"
        echo ""
        print_info "Pour déboguer, connectez-vous au VPS:"
        echo "  ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
        echo "  cd $DEPLOY_DIR"
        echo "  bash scripts/vps-build-and-deploy.sh"
        exit 1
    }
    
    print_header "✅ Déploiement terminé avec succès"
    print_success "L'application est maintenant déployée sur https://cjd80.fr"
    print_info "Health check: https://cjd80.fr/api/health"
}

# Gestion des arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Afficher cette aide"
        echo ""
        echo "Variables d'environnement:"
        echo "  VPS_HOST            Adresse du VPS (défaut: 141.94.31.162)"
        echo "  VPS_USER            Utilisateur SSH (défaut: thibault)"
        echo "  VPS_PORT            Port SSH (défaut: 22)"
        echo "  DEPLOY_DIR          Répertoire de déploiement (défaut: /docker/cjd80)"
        echo "  SSH_KEY             Chemin vers la clé SSH (défaut: ~/.ssh/id_rsa)"
        echo ""
        echo "Exemple:"
        echo "  VPS_HOST=192.168.1.100 $0"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

