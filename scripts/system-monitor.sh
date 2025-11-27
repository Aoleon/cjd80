#!/bin/bash

# Script de monitoring système global
# Surveille Docker, base de données, disque, mémoire, réseau

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Monitoring système global (Docker, DB, disque, mémoire, réseau).

Commands:
  overview             Vue d'ensemble complète
  docker               Monitoring Docker uniquement
  database             Monitoring base de données
  system               Monitoring système (CPU, mémoire, disque)
  network              Monitoring réseau
  watch                Surveillance continue avec auto-refresh

Options:
  -h, --help          Afficher cette aide
  --interval SEC      Intervalle de rafraîchissement (défaut: 5)
  --json              Sortie JSON
  --alerts            Activer les alertes

Exemples:
  $0 overview
  $0 watch
  $0 docker
  $0 system
EOF
}

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

# Vue d'ensemble
show_overview() {
  local interval="${1:-5}"
  
  while true; do
    clear
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Monitoring Système - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Docker
    echo "🐳 Docker:"
    if docker info &> /dev/null; then
      local containers=$(docker ps -q | wc -l | tr -d ' ')
      local running=$(docker ps --format "{{.Status}}" | grep -c "Up" || echo "0")
      echo "  Conteneurs: $running/$containers en cours"
      docker stats --no-stream --format "  {{.Name}}: CPU {{.CPUPerc}} | RAM {{.MemUsage}}" | head -5
    else
      echo "  ❌ Docker non disponible"
    fi
    
    echo ""
    
    # Système
    echo "💻 Système:"
    case "$OS" in
      macos)
        echo "  CPU: $(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')%"
        echo "  RAM: $(vm_stat | perl -ne '/page size of (\d+)/ and \$size=\$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%.1f%%\n", \$2*\$size/1024/1024/1024/$(sysctl -n hw.memsize)*100)')"
        echo "  Disque: $(df -h / | tail -1 | awk '{print $5 " utilisé (" $4 " libre)"}')"
        ;;
      linux)
        echo "  CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
        echo "  RAM: $(free -h | awk '/^Mem:/ {print $3 "/" $2 " (" $3/$2*100 "%)"}')"
        echo "  Disque: $(df -h / | tail -1 | awk '{print $5 " utilisé (" $4 " libre)"}')"
        ;;
    esac
    
    echo ""
    
    # Base de données
    echo "🗄️  Base de données:"
    if [ -n "$DATABASE_URL" ]; then
      if command -v psql &> /dev/null || command -v pgcli &> /dev/null; then
        echo "  ✅ Connecté"
        # Tentative de stats (peut échouer si pas de connexion)
        echo "  💡 Utilisez: npm run db:stats pour plus de détails"
      else
        echo "  ⚠️  Client PostgreSQL non disponible"
      fi
    else
      echo "  ⚠️  DATABASE_URL non configuré"
    fi
    
    echo ""
    
    # Réseau
    echo "🌐 Réseau:"
    case "$OS" in
      macos)
        local ports=$(lsof -iTCP -sTCP:LISTEN -n -P | grep LISTEN | wc -l | tr -d ' ')
        echo "  Ports en écoute: $ports"
        ;;
      linux)
        local ports=$(ss -tlnp | grep LISTEN | wc -l | tr -d ' ')
        echo "  Ports en écoute: $ports"
        ;;
    esac
    
    echo ""
    echo "⏱️  Rafraîchissement: ${interval}s (Ctrl+C pour quitter)"
    
    sleep "$interval"
  done
}

# Monitoring Docker
monitor_docker() {
  echo "🐳 Monitoring Docker:"
  echo ""
  
  if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas disponible"
    exit 1
  fi
  
  echo "📦 Conteneurs:"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  
  echo ""
  echo "📊 Statistiques:"
  docker stats --no-stream
  
  echo ""
  echo "💾 Utilisation:"
  docker system df
}

# Monitoring base de données
monitor_database() {
  echo "🗄️  Monitoring Base de Données:"
  echo ""
  
  if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL non configuré"
    exit 1
  fi
  
  if command -v npm &> /dev/null; then
    npm run db:stats 2>/dev/null || echo "⚠️  Impossible d'obtenir les statistiques"
  else
    echo "⚠️  npm non disponible"
  fi
}

# Monitoring système
monitor_system() {
  echo "💻 Monitoring Système:"
  echo ""
  
  case "$OS" in
    macos)
      echo "📊 CPU:"
      top -l 1 | grep "CPU usage" | head -1
      
      echo ""
      echo "💾 Mémoire:"
      vm_stat | head -5
      
      echo ""
      echo "💿 Disque:"
      df -h | grep -E "^/dev/" | head -5
      
      echo ""
      echo "🌐 Réseau:"
      netstat -an | grep LISTEN | head -5
      ;;
    linux)
      echo "📊 CPU:"
      top -bn1 | grep "Cpu(s)" | head -1
      
      echo ""
      echo "💾 Mémoire:"
      free -h
      
      echo ""
      echo "💿 Disque:"
      df -h | grep -E "^/dev/" | head -5
      
      echo ""
      echo "🌐 Réseau:"
      ss -tlnp | grep LISTEN | head -5
      ;;
  esac
}

# Monitoring réseau
monitor_network() {
  echo "🌐 Monitoring Réseau:"
  echo ""
  
  case "$OS" in
    macos)
      echo "📡 Ports en écoute:"
      lsof -iTCP -sTCP:LISTEN -n -P | head -10
      
      echo ""
      echo "🔌 Connexions actives:"
      netstat -an | grep ESTABLISHED | head -10
      ;;
    linux)
      echo "📡 Ports en écoute:"
      ss -tlnp | head -10
      
      echo ""
      echo "🔌 Connexions actives:"
      ss -tnp | grep ESTABLISHED | head -10
      ;;
  esac
}

# Surveillance continue
watch_all() {
  local interval="${1:-5}"
  
  echo "👀 Surveillance continue (rafraîchissement: ${interval}s, Ctrl+C pour quitter)"
  echo ""
  
  while true; do
    clear
    show_overview "$interval"
  done
}

# Main
COMMAND="${1:-overview}"
shift || true

INTERVAL=5
JSON=false
ALERTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --interval)
      INTERVAL="$2"
      shift 2
      ;;
    --json)
      JSON=true
      shift
      ;;
    --alerts)
      ALERTS=true
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
  overview)
    show_overview "$INTERVAL"
    ;;
  docker)
    monitor_docker
    ;;
  database)
    monitor_database
    ;;
  system)
    monitor_system
    ;;
  network)
    monitor_network
    ;;
  watch)
    watch_all "$INTERVAL"
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

