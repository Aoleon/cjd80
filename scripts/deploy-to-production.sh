#!/bin/bash
set -e

# Configuration
PRODUCTION_HOST="141.94.31.162"
PRODUCTION_USER="debian"
PRODUCTION_DIR="/opt/cjd80"
DEV_HOST="146.59.230.253"
DEV_DIR="/opt/workspace/cjd80"

# Couleurs
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m"

echo -e "${GREEN}=== Script de déploiement CJD80 ===${NC}\n"

# Vérifier les arguments
ACTION=${1:-"full"}

case $ACTION in
  "build")
    echo -e "${YELLOW}[1/3] Build local...${NC}"
    npm run check
    npm run build
    echo -e "${GREEN}✓ Build terminé${NC}"
    ;;
    
  "push")
    echo -e "${YELLOW}[2/3] Push vers Gitea...${NC}"
    git add -A
    git commit -m "Deploy: $(date +%Y%m%d-%H%M%S)" || echo "Rien à committer"
    git push gitea main || git push origin main
    echo -e "${GREEN}✓ Push terminé${NC}"
    ;;
    
  "deploy")
    echo -e "${YELLOW}[3/3] Déploiement sur production...${NC}"
    ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} << REMOTECMD
      cd ${PRODUCTION_DIR}
      docker compose pull
      docker compose up -d --remove-orphans
      sleep 15
      if curl -sf http://localhost:5000/api/health > /dev/null; then
        echo "✓ Application saine"
        docker image prune -f
      else
        echo "✗ Health check échoué"
        exit 1
      fi
REMOTECMD
    echo -e "${GREEN}✓ Déploiement terminé${NC}"
    ;;
    
  "full")
    echo -e "${YELLOW}=== Déploiement complet ===${NC}\n"
    
    echo -e "${YELLOW}[1/4] Vérification du code...${NC}"
    npm run check
    echo -e "${GREEN}✓ Types OK${NC}\n"
    
    echo -e "${YELLOW}[2/4] Build...${NC}"
    npm run build
    echo -e "${GREEN}✓ Build OK${NC}\n"
    
    echo -e "${YELLOW}[3/4] Push Git...${NC}"
    git add -A
    git commit -m "Deploy: $(date +%Y%m%d-%H%M%S)" || echo "Rien à committer"
    git push gitea main 2>/dev/null || git push origin main
    echo -e "${GREEN}✓ Push OK${NC}\n"
    
    echo -e "${YELLOW}[4/4] Déploiement production...${NC}"
    ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} "cd ${PRODUCTION_DIR} && docker compose pull && docker compose up -d --remove-orphans"
    
    echo -e "\n${YELLOW}Attente du health check...${NC}"
    sleep 20
    
    if ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} "curl -sf http://localhost:5000/api/health" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ Déploiement réussi !${NC}"
      ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} "docker image prune -f" > /dev/null
    else
      echo -e "${RED}✗ Health check échoué${NC}"
      echo -e "${YELLOW}Vérifiez les logs : ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} docker compose logs -f${NC}"
      exit 1
    fi
    ;;
    
  "status")
    echo -e "${YELLOW}=== Statut production ===${NC}"
    ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} "cd ${PRODUCTION_DIR} && docker compose ps"
    ;;
    
  "logs")
    echo -e "${YELLOW}=== Logs production ===${NC}"
    ssh ${PRODUCTION_USER}@${PRODUCTION_HOST} "cd ${PRODUCTION_DIR} && docker compose logs -f --tail=100"
    ;;
    
  "migrate")
    echo -e "${YELLOW}=== Migration des admins (envoi emails reset) ===${NC}"
    npx tsx scripts/send-password-reset-all.ts
    ;;
    
  *)
    echo "Usage: $0 [build|push|deploy|full|status|logs|migrate]"
    echo ""
    echo "  build   - Build local uniquement"
    echo "  push    - Push vers Git uniquement"  
    echo "  deploy  - Déploiement sur production uniquement"
    echo "  full    - Build + Push + Deploy (par défaut)"
    echo "  status  - Afficher le statut des conteneurs"
    echo "  logs    - Afficher les logs en temps réel"
    echo "  migrate - Envoyer les emails de reset aux admins"
    exit 1
    ;;
esac

echo -e "\n${GREEN}=== Terminé ===${NC}"
