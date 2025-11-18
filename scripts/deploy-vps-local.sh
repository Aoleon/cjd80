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
VPS_PASS="${VPS_PASS:-@Tibo4713234}"
DEPLOY_DIR="${DEPLOY_DIR:-/docker/cjd80}"

# Clé SSH (optionnelle, utilise sshpass par défaut)
SSH_KEY="${SSH_KEY:-}"

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
    
    # Utiliser la clé SSH si spécifiée, sinon utiliser sshpass
    if [ -n "$SSH_KEY" ]; then
        ssh $ssh_opts -i "$SSH_KEY" -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$@"
    else
        # Utiliser sshpass avec mot de passe
        if ! command -v sshpass &> /dev/null; then
            print_error "sshpass n'est pas installé"
            print_info "Installation: brew install hudochenkov/sshpass/sshpass (Mac) ou apt-get install sshpass (Linux)"
            exit 1
        fi
        sshpass -p "$VPS_PASS" ssh $ssh_opts -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "$@"
    fi
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
    if ssh_exec "test -d '$DEPLOY_DIR' && echo 'exists'" | grep -q "exists"; then
        print_success "Répertoire de déploiement existe: $DEPLOY_DIR"
    else
        print_warning "Le répertoire $DEPLOY_DIR n'existe pas"
        print_info "Création du répertoire..."
        ssh_exec "mkdir -p $DEPLOY_DIR 2>/dev/null || sudo mkdir -p $DEPLOY_DIR && sudo chown -R $VPS_USER:$VPS_USER $DEPLOY_DIR" || {
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
    if [ -n "$SSH_KEY" ]; then
        echo "  - Clé SSH: $SSH_KEY"
    else
        echo "  - Authentification: sshpass (mot de passe)"
    fi
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
    
    # Demander confirmation (sauf si --yes ou -y est passé)
    if [[ "${1:-}" != "--yes" && "${1:-}" != "-y" ]]; then
        read -p "Continuer le déploiement? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Déploiement annulé"
            exit 0
        fi
    else
        print_info "Mode non-interactif activé, déploiement automatique..."
    fi
    
    print_header "🚀 Lancement du déploiement sur le VPS"
    
    # Mettre à jour le repository sur le VPS
    print_info "Mise à jour du repository Git sur le VPS..."
    GIT_OUTPUT=$(ssh_exec "cd $DEPLOY_DIR && git fetch origin main 2>&1 && git pull origin main 2>&1")
    GIT_EXIT=$?
    if [ $GIT_EXIT -ne 0 ]; then
        print_warning "Problème lors de la mise à jour Git, vérification de l'état..."
        echo "$GIT_OUTPUT"
        # Essayer de forcer la mise à jour
        ssh_exec "cd $DEPLOY_DIR && git reset --hard origin/main 2>&1" || {
            print_error "Impossible de mettre à jour le repository"
            exit 1
        }
    else
        echo "$GIT_OUTPUT"
    fi
    
    # Vérifier que le script existe
    print_info "Vérification du script de déploiement sur le VPS..."
    if ! ssh_exec "test -f '$DEPLOY_DIR/scripts/vps-quick-deploy.sh' && echo 'exists'" | grep -q "exists"; then
        print_warning "Le script vps-quick-deploy.sh n'existe pas encore, il sera créé au prochain git pull"
    fi
    
    # Exécuter le script de build et déploiement sur le VPS
    print_info "Exécution du build et déploiement sur le VPS..."
    echo ""
    
    # Exécuter le script de build et déploiement
    # Utiliser le script de déploiement rapide (sans boucles)
    ssh_exec "cd $DEPLOY_DIR && bash scripts/vps-quick-deploy.sh" || {
        print_error "Échec du déploiement"
        echo ""
        print_info "Pour déboguer, connectez-vous au VPS:"
        echo "  ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
        echo "  cd $DEPLOY_DIR"
        echo "  bash scripts/vps-quick-deploy.sh"
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
        echo "  VPS_PASS            Mot de passe SSH (défaut: @Tibo4713234)"
        echo "  DEPLOY_DIR          Répertoire de déploiement (défaut: /docker/cjd80)"
        echo "  SSH_KEY             Chemin vers la clé SSH (optionnel, utilise sshpass si non défini)"
        echo ""
        echo "Exemple:"
        echo "  VPS_HOST=192.168.1.100 $0"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

