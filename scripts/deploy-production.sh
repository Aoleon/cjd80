#!/bin/bash
set -euo pipefail

# ===================================
# Script de déploiement robuste pour production
# ===================================

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
ENV_FILE="${PROJECT_ROOT}/.env"
BACKUP_DIR="${PROJECT_ROOT}/backups"
LOG_FILE="${PROJECT_ROOT}/logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Créer le dossier de logs si nécessaire
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Fonction de log
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "${BLUE}$@${NC}"
}

log_success() {
    log "SUCCESS" "${GREEN}✅ $@${NC}"
}

log_warning() {
    log "WARNING" "${YELLOW}⚠️  $@${NC}"
}

log_error() {
    log "ERROR" "${RED}❌ $@${NC}"
}

# Fonction d'erreur avec cleanup
error_exit() {
    log_error "$1"
    log_error "Déploiement échoué. Vérifiez les logs: $LOG_FILE"
    exit 1
}

# Trap pour capturer les erreurs
trap 'error_exit "Une erreur est survenue à la ligne $LINENO"' ERR

# ===================================
# 1. PRE-FLIGHT CHECKS
# ===================================
log_info "==========================================
log_info "🚀 DÉMARRAGE DU DÉPLOIEMENT PRODUCTION"
log_info "=========================================="

log_info "📋 Étape 1/10: Pre-flight checks..."

# Vérifier que nous sommes sur le VPS de production
if [[ ! -f "/etc/production-marker" ]] && [[ "${FORCE_DEPLOY:-}" != "true" ]]; then
    log_warning "Ce script doit être exécuté sur le VPS de production"
    log_warning "Pour forcer le déploiement, utilisez: FORCE_DEPLOY=true $0"
    exit 1
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    error_exit "Docker n'est pas installé"
fi

if ! docker ps &> /dev/null; then
    error_exit "Docker n'est pas accessible (permissions ou daemon arrêté)"
fi

# Vérifier docker compose
if ! command -v docker compose &> /dev/null; then
    error_exit "docker compose n'est pas installé"
fi

# Vérifier le fichier .env
if [[ ! -f "$ENV_FILE" ]]; then
    error_exit "Fichier .env manquant. Créez-le depuis .env.example"
fi

# Vérifier les variables critiques
required_vars=("DATABASE_URL" "SESSION_SECRET" "AUTHENTIK_CLIENT_ID" "AUTHENTIK_CLIENT_SECRET")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
        error_exit "Variable $var manquante dans .env"
    fi
    
    # Vérifier que la variable n'a pas de valeur par défaut
    if grep -q "^${var}=.*change.*" "$ENV_FILE" || grep -q "^${var}=.*example.*" "$ENV_FILE"; then
        error_exit "Variable $var a une valeur par défaut non sécurisée"
    fi
done

log_success "Pre-flight checks réussis"

# ===================================
# 2. BACKUP DE LA BASE DE DONNÉES
# ===================================
log_info "📦 Étape 2/10: Backup de la base de données..."

if docker ps | grep -q "postgres"; then
    BACKUP_FILE="${BACKUP_DIR}/db-backup-$(date +%Y%m%d-%H%M%S).sql"
    
    if docker exec postgres pg_dumpall -U postgres > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
        gzip "$BACKUP_FILE"
        log_success "Backup créé: ${BACKUP_FILE}.gz"
    else
        log_warning "Backup échoué, mais on continue le déploiement"
    fi
else
    log_warning "Container PostgreSQL non trouvé, backup ignoré"
fi

# Nettoyer les vieux backups (garder les 10 derniers)
ls -t "${BACKUP_DIR}"/db-backup-*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
log_info "Anciens backups nettoyés (gardé les 10 derniers)"

# ===================================
# 3. PULL DE L'IMAGE DOCKER
# ===================================
log_info "📥 Étape 3/10: Pull de la nouvelle image..."

# Déterminer l'image à utiliser
DOCKER_IMAGE="${DOCKER_IMAGE:-cjd80:latest}"
log_info "Image Docker: $DOCKER_IMAGE"

# Si l'image est locale, on la build
if [[ "$DOCKER_IMAGE" == *"latest"* ]] || [[ ! "$DOCKER_IMAGE" =~ : ]]; then
    log_info "Build de l'image locale..."
    docker build -f Dockerfile.optimized -t "$DOCKER_IMAGE" \
        --build-arg GIT_TAG="$(git describe --tags --always 2>/dev/null || echo 'unknown')" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg GIT_COMMIT="$(git rev-parse HEAD 2>/dev/null || echo 'unknown')" \
        . >> "$LOG_FILE" 2>&1
    log_success "Image buildée avec succès"
else
    # Sinon on la pull depuis un registry
    if docker pull "$DOCKER_IMAGE" >> "$LOG_FILE" 2>&1; then
        log_success "Image pullée avec succès"
    else
        error_exit "Impossible de puller l'image $DOCKER_IMAGE"
    fi
fi

# ===================================
# 4. HEALTH CHECK DE L'APPLICATION ACTUELLE
# ===================================
log_info "🏥 Étape 4/10: Health check de l'application actuelle..."

if docker ps | grep -q "cjd-app"; then
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        log_success "Application actuelle est healthy"
        CURRENT_HEALTHY=true
    else
        log_warning "Application actuelle n'est pas healthy"
        CURRENT_HEALTHY=false
    fi
else
    log_info "Aucune application en cours d'exécution"
    CURRENT_HEALTHY=false
fi

# ===================================
# 5. ARRÊT GRACIEUX DE L'ANCIENNE VERSION
# ===================================
log_info "🛑 Étape 5/10: Arrêt gracieux de l'ancienne version..."

if docker ps | grep -q "cjd-app"; then
    log_info "Envoi du signal SIGTERM au container..."
    docker compose -f "$COMPOSE_FILE" stop -t 30 >> "$LOG_FILE" 2>&1
    log_success "Container arrêté gracieusement"
else
    log_info "Aucun container à arrêter"
fi

# ===================================
# 6. DÉMARRAGE DE LA NOUVELLE VERSION
# ===================================
log_info "🚀 Étape 6/10: Démarrage de la nouvelle version..."

export DOCKER_IMAGE
docker compose -f "$COMPOSE_FILE" up -d >> "$LOG_FILE" 2>&1
log_success "Container démarré"

# ===================================
# 7. ATTENDRE QUE L'APPLICATION SOIT READY
# ===================================
log_info "⏳ Étape 7/10: Attente de la disponibilité de l'application..."

MAX_WAIT=120  # 2 minutes
WAIT_INTERVAL=5
ELAPSED=0

while [[ $ELAPSED -lt $MAX_WAIT ]]; do
    if curl -sf http://localhost:5000/api/health/ready > /dev/null 2>&1; then
        log_success "Application ready après ${ELAPSED}s"
        break
    fi
    
    log_info "En attente... (${ELAPSED}s/${MAX_WAIT}s)"
    sleep $WAIT_INTERVAL
    ELAPSED=$((ELAPSED + WAIT_INTERVAL))
done

if [[ $ELAPSED -ge $MAX_WAIT ]]; then
    error_exit "L'application n'est pas devenue ready après ${MAX_WAIT}s"
fi

# ===================================
# 8. SMOKE TESTS
# ===================================
log_info "🧪 Étape 8/10: Smoke tests..."

# Test 1: Health check
if ! curl -sf http://localhost:5000/api/health > /dev/null; then
    error_exit "Health check a échoué"
fi
log_success "Health check OK"

# Test 2: Version endpoint
VERSION=$(curl -sf http://localhost:5000/api/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
log_success "Version déployée: $VERSION"

# Test 3: Database connectivity
if curl -sf http://localhost:5000/api/health/db > /dev/null; then
    log_success "Database connectivity OK"
else
    log_warning "Database connectivity check a échoué"
fi

# ===================================
# 9. NETTOYAGE
# ===================================
log_info "🧹 Étape 9/10: Nettoyage des anciennes images..."

# Supprimer les images danglingdocker image prune -f >> "$LOG_FILE" 2>&1
log_success "Images dangling supprimées"

# ===================================
# 10. LOGS ET MONITORING
# ===================================
log_info "📊 Étape 10/10: Vérification des logs..."

log_info "Dernières lignes des logs:"
docker compose -f "$COMPOSE_FILE" logs --tail=20 cjd-app

# ===================================
# SUCCÈS
# ===================================
log_success "=========================================="
log_success "✅ DÉPLOIEMENT RÉUSSI"
log_success "=========================================="
log_info "Version déployée: $VERSION"
log_info "Image Docker: $DOCKER_IMAGE"
log_info "Logs complets: $LOG_FILE"
log_info ""
log_info "Commandes utiles:"
log_info "  - Voir les logs: docker compose -f $COMPOSE_FILE logs -f cjd-app"
log_info "  - Status: docker compose -f $COMPOSE_FILE ps"
log_info "  - Health check: curl http://localhost:5000/api/health"
log_info "  - Rollback: docker compose -f $COMPOSE_FILE down && <restaurer backup>"
log_info ""
log_success "Application accessible sur http://localhost:5000"
