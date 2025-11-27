#!/bin/bash

# Script de monitoring Docker en temps réel
# Affiche les métriques, logs et santé des conteneurs

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Monitore les conteneurs Docker en temps réel.

Commands:
  stats               Statistiques en temps réel (comme top)
  logs                Logs en temps réel de tous les services
  health              Surveillance de la santé
  watch               Vue d'ensemble avec auto-refresh
  events              Événements Docker en temps réel

Options:
  -h, --help          Afficher cette aide
  -f, --file FILE     Fichier docker-compose
  -s, --service NAME  Service spécifique
  --interval SEC      Intervalle de rafraîchissement (défaut: 2)

Exemples:
  $0 stats
  $0 logs --follow
  $0 health
  $0 watch
EOF
}

# Détecter docker-compose
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

# Statistiques en temps réel
show_stats_realtime() {
  local service="${1:-}"
  
  if [ -n "$service" ]; then
    echo "📊 Statistiques de $service (Ctrl+C pour quitter):"
    docker stats "$service"
  else
    echo "📊 Statistiques de tous les conteneurs (Ctrl+C pour quitter):"
    docker stats
  fi
}

# Logs en temps réel
show_logs_realtime() {
  local compose_file="${1:-docker-compose.yml}"
  local service="${2:-}"
  local follow="${3:-true}"
  
  if [ -z "$COMPOSE_CMD" ]; then
    echo "❌ Docker Compose non disponible"
    exit 1
  fi
  
  local cmd="$COMPOSE_CMD -f $compose_file logs"
  
  if [ "$follow" = "true" ]; then
    cmd="$cmd --follow"
  fi
  
  if [ -n "$service" ]; then
    cmd="$cmd $service"
  fi
  
  echo "📋 Logs en temps réel (Ctrl+C pour quitter):"
  eval $cmd
}

# Surveillance de la santé
monitor_health() {
  local compose_file="${1:-docker-compose.yml}"
  local interval="${2:-5}"
  
  if [ -z "$COMPOSE_CMD" ]; then
    echo "❌ Docker Compose non disponible"
    exit 1
  fi
  
  echo "🏥 Surveillance de la santé (rafraîchissement: ${interval}s, Ctrl+C pour quitter)"
  echo ""
  
  while true; do
    clear
    echo "⏱️  $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    local services=$($COMPOSE_CMD -f $compose_file config --services 2>/dev/null || echo "")
    
    if [ -z "$services" ]; then
      # Pas de docker-compose, utiliser docker ps
      docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
      for service in $services; do
        local container_id=$($COMPOSE_CMD -f $compose_file ps -q $service 2>/dev/null || echo "")
        
        if [ -n "$container_id" ]; then
          local status=$(docker inspect --format='{{.State.Status}}' "$container_id" 2>/dev/null || echo "unknown")
          local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "none")
          local uptime=$(docker inspect --format='{{.State.StartedAt}}' "$container_id" 2>/dev/null | xargs -I {} date -u -d {} +%s 2>/dev/null || echo "0")
          local now=$(date +%s)
          local uptime_sec=$((now - uptime))
          local uptime_str=$(printf '%dd %dh %dm' $((uptime_sec/86400)) $((uptime_sec%86400/3600)) $((uptime_sec%3600/60)))
          
          if [ "$status" = "running" ]; then
            if [ "$health" = "healthy" ] || [ "$health" = "none" ]; then
              echo "  ✅ $service: $status ($health) - Uptime: $uptime_str"
            else
              echo "  ❌ $service: $status ($health) - Uptime: $uptime_str"
            fi
          else
            echo "  ⚠️  $service: $status"
          fi
        else
          echo "  ⚠️  $service: non démarré"
        fi
      done
    fi
    
    sleep "$interval"
  done
}

# Vue d'ensemble avec auto-refresh
watch_overview() {
  local compose_file="${1:-docker-compose.yml}"
  local interval="${2:-3}"
  
  echo "👀 Vue d'ensemble (rafraîchissement: ${interval}s, Ctrl+C pour quitter)"
  echo ""
  
  while true; do
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Vue d'ensemble Docker - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Conteneurs
    echo "📦 Conteneurs:"
    if [ -n "$COMPOSE_CMD" ] && [ -f "$compose_file" ]; then
      $COMPOSE_CMD -f $compose_file ps 2>/dev/null || docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
      docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    fi
    
    echo ""
    echo "📊 Statistiques (top 5):"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -6
    
    echo ""
    echo "💾 Utilisation disque:"
    docker system df
    
    sleep "$interval"
  done
}

# Événements Docker
show_events() {
  echo "📡 Événements Docker en temps réel (Ctrl+C pour quitter):"
  echo ""
  docker events --format "table {{.Time}}\t{{.Type}}\t{{.Action}}\t{{.Actor.Attributes.name}}"
}

# Main
COMMAND="${1:-watch}"
shift || true

COMPOSE_FILE="docker-compose.yml"
SERVICE=""
INTERVAL=2
FOLLOW=true

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
    --interval)
      INTERVAL="$2"
      shift 2
      ;;
    --follow)
      FOLLOW=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      shift
      ;;
  esac
done

case "$COMMAND" in
  stats)
    show_stats_realtime "$SERVICE"
    ;;
  logs)
    show_logs_realtime "$COMPOSE_FILE" "$SERVICE" "$FOLLOW"
    ;;
  health)
    monitor_health "$COMPOSE_FILE" "$INTERVAL"
    ;;
  watch)
    watch_overview "$COMPOSE_FILE" "$INTERVAL"
    ;;
  events)
    show_events
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

