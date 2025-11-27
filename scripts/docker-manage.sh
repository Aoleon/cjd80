#!/bin/bash

# Script pour gérer les conteneurs Docker
# Remplace les commandes docker-compose basiques par une interface plus riche

set -e

# Détecter l'OS
detect_os() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      echo "linux"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

OS=$(detect_os)

# Détecter docker-compose ou docker compose
detect_compose() {
  if command -v docker-compose &> /dev/null; then
    echo "docker-compose"
  elif docker compose version &> /dev/null; then
    echo "docker compose"
  else
    echo ""
  fi
}

COMPOSE_CMD=$(detect_compose)

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Gère les conteneurs Docker avec une interface améliorée.

Commands:
  up                  Démarrer les conteneurs
  down                Arrêter les conteneurs
  restart             Redémarrer les conteneurs
  logs                Voir les logs
  ps                  Lister les conteneurs
  exec SERVICE        Exécuter une commande dans un service
  shell SERVICE       Ouvrir un shell dans un service
  build               Construire les images
  pull                Télécharger les images
  status              Voir le statut détaillé
  health              Vérifier la santé des conteneurs
  clean               Nettoyer les ressources inutilisées
  stats               Statistiques d'utilisation
  top                 Voir les processus en cours

Options:
  -h, --help          Afficher cette aide
  -f, --file FILE     Fichier docker-compose (défaut: docker-compose.yml)
  -s, --service NAME  Service spécifique
  -d, --detach        Démarrer en arrière-plan
  --build             Reconstruire les images
  --force             Forcer l'arrêt/redémarrage
  --follow            Suivre les logs en temps réel
  --tail LINES        Nombre de lignes de logs (défaut: 100)

Exemples:
  $0 up
  $0 up --build
  $0 logs --follow
  $0 exec app bash
  $0 shell db
  $0 status
  $0 clean
EOF
}

# Vérifier que Docker est installé
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    case "$OS" in
      macos)
        echo "📦 Installation: brew install --cask docker"
        ;;
      linux)
        echo "📦 Installation: https://docs.docker.com/get-docker/"
        ;;
    esac
    exit 1
  fi
  
  if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas en cours d'exécution"
    echo "💡 Démarrez Docker Desktop (macOS) ou le service Docker (Linux)"
    exit 1
  fi
  
  if [ -z "$COMPOSE_CMD" ]; then
    echo "❌ Docker Compose n'est pas disponible"
    exit 1
  fi
}

# Trouver le fichier docker-compose
find_compose_file() {
  local file="${1:-docker-compose.yml}"
  
  if [ -f "$file" ]; then
    echo "$file"
  elif [ -f "docker-compose.yaml" ]; then
    echo "docker-compose.yaml"
  elif [ -f ".docker/docker-compose.yml" ]; then
    echo ".docker/docker-compose.yml"
  else
    echo ""
  fi
}

# Démarrer les conteneurs
start_containers() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local build="${2:-false}"
  local detach="${3:-true}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  local cmd="$COMPOSE_CMD -f $compose_file up"
  
  if [ "$build" = "true" ]; then
    cmd="$cmd --build"
  fi
  
  if [ "$detach" = "true" ]; then
    cmd="$cmd -d"
  fi
  
  echo "🚀 Démarrage des conteneurs..."
  echo "   Fichier: $compose_file"
  echo ""
  
  eval $cmd
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Conteneurs démarrés"
    echo "💡 Voir les logs: $0 logs"
    echo "💡 Voir le statut: $0 status"
  fi
}

# Arrêter les conteneurs
stop_containers() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local force="${2:-false}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  local cmd="$COMPOSE_CMD -f $compose_file down"
  
  if [ "$force" = "true" ]; then
    cmd="$cmd --remove-orphans"
  fi
  
  echo "🛑 Arrêt des conteneurs..."
  eval $cmd
  
  if [ $? -eq 0 ]; then
    echo "✅ Conteneurs arrêtés"
  fi
}

# Redémarrer les conteneurs
restart_containers() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local service="${2:-}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  echo "🔄 Redémarrage des conteneurs..."
  
  if [ -n "$service" ]; then
    $COMPOSE_CMD -f $compose_file restart "$service"
  else
    $COMPOSE_CMD -f $compose_file restart
  fi
  
  if [ $? -eq 0 ]; then
    echo "✅ Conteneurs redémarrés"
  fi
}

# Voir les logs
show_logs() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local service="${2:-}"
  local follow="${3:-false}"
  local tail_lines="${4:-100}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  local cmd="$COMPOSE_CMD -f $compose_file logs"
  
  if [ "$follow" = "true" ]; then
    cmd="$cmd --follow"
  fi
  
  cmd="$cmd --tail=$tail_lines"
  
  if [ -n "$service" ]; then
    cmd="$cmd $service"
  fi
  
  eval $cmd
}

# Lister les conteneurs
list_containers() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  echo "📋 Conteneurs:"
  echo ""
  $COMPOSE_CMD -f $compose_file ps
}

# Exécuter une commande
exec_command() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local service="$2"
  local command="${3:-bash}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  if [ -z "$service" ]; then
    echo "❌ Service requis"
    exit 1
  fi
  
  echo "🔧 Exécution de '$command' dans $service..."
  $COMPOSE_CMD -f $compose_file exec "$service" $command
}

# Ouvrir un shell
open_shell() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local service="$2"
  
  if [ -z "$service" ]; then
    echo "❌ Service requis"
    exit 1
  fi
  
  # Détecter le shell disponible
  local shell="sh"
  if $COMPOSE_CMD -f $compose_file exec "$service" which bash &> /dev/null; then
    shell="bash"
  elif $COMPOSE_CMD -f $compose_file exec "$service" which zsh &> /dev/null; then
    shell="zsh"
  fi
  
  echo "🐚 Ouverture d'un shell ($shell) dans $service..."
  exec_command "$compose_file" "$service" "$shell"
}

# Construire les images
build_images() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local no_cache="${2:-false}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  local cmd="$COMPOSE_CMD -f $compose_file build"
  
  if [ "$no_cache" = "true" ]; then
    cmd="$cmd --no-cache"
  fi
  
  echo "🔨 Construction des images..."
  eval $cmd
}

# Télécharger les images
pull_images() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  echo "📥 Téléchargement des images..."
  $COMPOSE_CMD -f $compose_file pull
}

# Statut détaillé
show_status() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  echo "📊 Statut des conteneurs:"
  echo ""
  $COMPOSE_CMD -f $compose_file ps
  
  echo ""
  echo "📋 Services configurés:"
  $COMPOSE_CMD -f $compose_file config --services
  
  echo ""
  echo "🌐 Ports exposés:"
  $COMPOSE_CMD -f $compose_file ps | grep -E "0.0.0.0|:::" || echo "  Aucun port exposé"
}

# Vérifier la santé
check_health() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  echo "🏥 Vérification de la santé des conteneurs:"
  echo ""
  
  local services=$($COMPOSE_CMD -f $compose_file config --services)
  local healthy=0
  local unhealthy=0
  
  for service in $services; do
    local status=$($COMPOSE_CMD -f $compose_file ps -q $service | xargs docker inspect --format='{{.State.Status}}' 2>/dev/null || echo "unknown")
    local health=$($COMPOSE_CMD -f $compose_file ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
    
    if [ "$status" = "running" ]; then
      if [ "$health" = "healthy" ] || [ "$health" = "none" ]; then
        echo "  ✅ $service: $status ($health)"
        healthy=$((healthy + 1))
      else
        echo "  ❌ $service: $status ($health)"
        unhealthy=$((unhealthy + 1))
      fi
    else
      echo "  ⚠️  $service: $status"
      unhealthy=$((unhealthy + 1))
    fi
  done
  
  echo ""
  echo "📊 Résumé: $healthy sain(s), $unhealthy problème(s)"
}

# Nettoyer
clean_resources() {
  check_docker
  
  echo "🧹 Nettoyage des ressources Docker..."
  echo ""
  
  echo "📦 Conteneurs arrêtés:"
  docker container prune -f
  
  echo ""
  echo "🖼️  Images inutilisées:"
  docker image prune -f
  
  echo ""
  echo "🌐 Réseaux inutilisés:"
  docker network prune -f
  
  echo ""
  echo "💾 Volumes inutilisés:"
  read -p "Supprimer les volumes inutilisés? (y/N): " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    docker volume prune -f
  fi
  
  echo ""
  echo "✅ Nettoyage terminé"
}

# Statistiques
show_stats() {
  check_docker
  
  echo "📊 Statistiques d'utilisation:"
  echo ""
  
  docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Voir les processus
show_top() {
  check_docker
  
  local compose_file=$(find_compose_file "$1")
  local service="${2:-}"
  
  if [ -z "$compose_file" ]; then
    echo "❌ Fichier docker-compose.yml non trouvé"
    exit 1
  fi
  
  if [ -n "$service" ]; then
    echo "📋 Processus dans $service:"
    $COMPOSE_CMD -f $compose_file top "$service"
  else
    echo "📋 Processus dans tous les services:"
    $COMPOSE_CMD -f $compose_file top
  fi
}

# Main
COMMAND="${1:-help}"
shift || true

COMPOSE_FILE=""
SERVICE=""
BUILD=false
DETACH=true
FORCE=false
FOLLOW=false
TAIL=100
NO_CACHE=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      COMPOSE_FILE="$2"
      shift 2
      ;;
    -s|--service)
      SERVICE="$2"
      shift 2
      ;;
    --build)
      BUILD=true
      shift
      ;;
    -d|--detach)
      DETACH=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --follow)
      FOLLOW=true
      shift
      ;;
    --tail)
      TAIL="$2"
      shift 2
      ;;
    --no-cache)
      NO_CACHE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

case "$COMMAND" in
  up|start)
    start_containers "$COMPOSE_FILE" "$BUILD" "$DETACH"
    ;;
  down|stop)
    stop_containers "$COMPOSE_FILE" "$FORCE"
    ;;
  restart)
    restart_containers "$COMPOSE_FILE" "$SERVICE"
    ;;
  logs)
    show_logs "$COMPOSE_FILE" "$SERVICE" "$FOLLOW" "$TAIL"
    ;;
  ps|list)
    list_containers "$COMPOSE_FILE"
    ;;
  exec)
    exec_command "$COMPOSE_FILE" "$SERVICE" "${*:-bash}"
    ;;
  shell)
    open_shell "$COMPOSE_FILE" "$SERVICE"
    ;;
  build)
    build_images "$COMPOSE_FILE" "$NO_CACHE"
    ;;
  pull)
    pull_images "$COMPOSE_FILE"
    ;;
  status)
    show_status "$COMPOSE_FILE"
    ;;
  health)
    check_health "$COMPOSE_FILE"
    ;;
  clean)
    clean_resources
    ;;
  stats)
    show_stats
    ;;
  top)
    show_top "$COMPOSE_FILE" "$SERVICE"
    ;;
  -h|--help|help)
    show_help
    ;;
  *)
    echo "❌ Commande inconnue: $COMMAND"
    show_help
    exit 1
    ;;
esac

