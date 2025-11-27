#!/bin/bash

# Script pour créer des tunnels SSH (port forwarding)
# Utile pour accéder à des services sur les serveurs Linux depuis macOS

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

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

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Crée et gère des tunnels SSH pour accéder aux services distants.

Commands:
  create              Créer un tunnel SSH
  list                Lister les tunnels actifs
  kill                Tuer un tunnel
  kill-all            Tuer tous les tunnels

Options:
  -h, --help          Afficher cette aide
  -s, --server        Nom du serveur
  -L, --local PORT    Port local (défaut: même que distant)
  -R, --remote PORT   Port distant
  -H, --remote-host   Host distant (défaut: localhost)
  -u, --user USER     Nom d'utilisateur
  -p, --port PORT     Port SSH (défaut: 22)
  -b, --background    Exécuter en arrière-plan
  -N, --no-exec       Ne pas exécuter de commande distante

Exemples:
  $0 create -s production -L 3000 -R 3000
  $0 create -s production -L 5432 -R 5432 -H localhost
  $0 list
  $0 kill 3000
  $0 kill-all

Tunnels courants:
  - Application web:     -L 3000 -R 3000
  - Base de données:    -L 5432 -R 5432
  - Redis:              -L 6379 -R 6379
  - Elasticsearch:      -L 9200 -R 9200
EOF
}

# Créer un tunnel
create_tunnel() {
  local server="${SSH_HOST:-}"
  local user="${SSH_USER:-$USER}"
  local ssh_port="${SSH_PORT:-22}"
  local local_port=""
  local remote_port=""
  local remote_host="localhost"
  local background=false
  local no_exec=false
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -s|--server)
        server="$2"
        shift 2
        ;;
      -L|--local)
        local_port="$2"
        shift 2
        ;;
      -R|--remote)
        remote_port="$2"
        shift 2
        ;;
      -H|--remote-host)
        remote_host="$2"
        shift 2
        ;;
      -u|--user)
        user="$2"
        shift 2
        ;;
      -p|--port)
        ssh_port="$2"
        shift 2
        ;;
      -b|--background)
        background=true
        shift
        ;;
      -N|--no-exec)
        no_exec=true
        shift
        ;;
      *)
        shift
        ;;
    esac
  done
  
  if [ -z "$server" ]; then
    echo "❌ Serveur non spécifié"
    exit 1
  fi
  
  if [ -z "$remote_port" ]; then
    echo "❌ Port distant requis (-R PORT)"
    exit 1
  fi
  
  if [ -z "$local_port" ]; then
    local_port="$remote_port"
  fi
  
  # Vérifier si le port local est déjà utilisé
  if lsof -Pi :$local_port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Le port local $local_port est déjà utilisé"
    read -p "Continuer quand même? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
  
  local ssh_opts="-L $local_port:$remote_host:$remote_port"
  ssh_opts="$ssh_opts -p $ssh_port"
  ssh_opts="$ssh_opts -o ServerAliveInterval=60"
  ssh_opts="$ssh_opts -o ServerAliveCountMax=3"
  
  if [ "$no_exec" = true ]; then
    ssh_opts="$ssh_opts -N"
  fi
  
  echo "🔗 Création du tunnel SSH..."
  echo "   Serveur: $user@$server:$ssh_port"
  echo "   Local: localhost:$local_port"
  echo "   Distant: $remote_host:$remote_port"
  echo "   OS: $OS → Linux (serveur)"
  
  if [ "$background" = true ]; then
    echo "   Mode: arrière-plan"
    ssh $ssh_opts -f "$user@$server" sleep 3600
    echo "✅ Tunnel créé en arrière-plan"
    echo "💡 Pour le tuer: $0 kill $local_port"
  else
    echo "   Mode: interactif (Ctrl+C pour arrêter)"
    echo ""
    ssh $ssh_opts "$user@$server"
  fi
}

# Lister les tunnels
list_tunnels() {
  echo "📋 Tunnels SSH actifs:"
  echo ""
  
  # Chercher les processus SSH avec port forwarding
  local tunnels=$(ps aux | grep "ssh.*-L" | grep -v grep || true)
  
  if [ -z "$tunnels" ]; then
    echo "  Aucun tunnel actif"
  else
    echo "$tunnels" | while read line; do
      # Extraire les informations du tunnel
      local pid=$(echo "$line" | awk '{print $2}')
      local ports=$(echo "$line" | grep -oE '-L [0-9]+:[^:]+:[0-9]+' || echo "")
      
      if [ -n "$ports" ]; then
        echo "  PID $pid: $ports"
      fi
    done
  fi
  
  echo ""
  echo "📊 Ports en écoute localement:"
  case "$OS" in
    macos)
      lsof -iTCP -sTCP:LISTEN -n -P | grep LISTEN | awk '{print "  Port "$9" (PID "$2")"}' | head -10
      ;;
    linux)
      ss -tlnp | grep LISTEN | awk '{print "  Port "$4" (PID "$6")"}' | head -10
      ;;
  esac
}

# Tuer un tunnel
kill_tunnel() {
  local port="$1"
  
  if [ -z "$port" ]; then
    echo "❌ Port requis"
    exit 1
  fi
  
  # Trouver le processus utilisant le port
  case "$OS" in
    macos)
      local pid=$(lsof -ti:$port)
      ;;
    linux)
      local pid=$(fuser $port/tcp 2>/dev/null | awk '{print $1}' || echo "")
      ;;
  esac
  
  if [ -z "$pid" ]; then
    echo "⚠️  Aucun tunnel trouvé sur le port $port"
    exit 1
  fi
  
  echo "🛑 Arrêt du tunnel sur le port $port (PID: $pid)..."
  kill $pid
  
  if [ $? -eq 0 ]; then
    echo "✅ Tunnel arrêté"
  else
    echo "❌ Échec de l'arrêt"
    exit 1
  fi
}

# Tuer tous les tunnels
kill_all_tunnels() {
  echo "🛑 Arrêt de tous les tunnels SSH..."
  
  # Trouver tous les processus SSH avec port forwarding
  local pids=$(ps aux | grep "ssh.*-L" | grep -v grep | awk '{print $2}' || echo "")
  
  if [ -z "$pids" ]; then
    echo "  Aucun tunnel à arrêter"
    return
  fi
  
  echo "$pids" | while read pid; do
    if [ -n "$pid" ]; then
      echo "  Arrêt du PID $pid..."
      kill $pid 2>/dev/null || true
    fi
  done
  
  echo "✅ Tous les tunnels ont été arrêtés"
}

# Main
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  create)
    create_tunnel "$@"
    ;;
  list)
    list_tunnels
    ;;
  kill)
    PORT="$1"
    kill_tunnel "$PORT"
    ;;
  kill-all)
    kill_all_tunnels
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

