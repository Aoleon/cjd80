#!/bin/bash

# Script pour sauvegarder et restaurer les données Docker
# Gère les volumes, bases de données et configurations

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Sauvegarde et restaure les données Docker.

Commands:
  backup              Créer une sauvegarde
  restore             Restaurer une sauvegarde
  list                Lister les sauvegardes
  export VOLUME       Exporter un volume
  import VOLUME FILE  Importer un volume

Options:
  -h, --help          Afficher cette aide
  -f, --file FILE     Fichier docker-compose
  -v, --volume NAME   Nom du volume
  -o, --output DIR    Répertoire de sortie (défaut: ./backups)
  -d, --date DATE     Date de la sauvegarde à restaurer
  --all               Tous les volumes

Exemples:
  $0 backup
  $0 backup --all
  $0 backup -v postgres_data
  $0 restore -d 2025-01-20
  $0 list
EOF
}

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de sauvegarde
ensure_backup_dir() {
  mkdir -p "$BACKUP_DIR"
}

# Sauvegarder un volume
backup_volume() {
  local volume="$1"
  local output_file="$BACKUP_DIR/${volume}_${TIMESTAMP}.tar.gz"
  
  echo "💾 Sauvegarde du volume: $volume"
  echo "   Destination: $output_file"
  
  # Créer un conteneur temporaire pour accéder au volume
  local temp_container="backup_${volume}_${TIMESTAMP}"
  
  docker run --rm \
    -v "$volume":/data:ro \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine tar czf "/backup/${volume}_${TIMESTAMP}.tar.gz" -C /data .
  
  if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée: $output_file"
    ls -lh "$output_file"
  else
    echo "❌ Échec de la sauvegarde"
    exit 1
  fi
}

# Sauvegarder tous les volumes
backup_all() {
  local compose_file="${1:-docker-compose.yml}"
  
  echo "💾 Sauvegarde de tous les volumes..."
  echo ""
  
  # Détecter docker-compose
  local compose_cmd=""
  if command -v docker-compose &> /dev/null; then
    compose_cmd="docker-compose"
  elif docker compose version &> /dev/null; then
    compose_cmd="docker compose"
  fi
  
  if [ -n "$compose_cmd" ] && [ -f "$compose_file" ]; then
    # Récupérer les volumes depuis docker-compose
    local volumes=$($compose_cmd -f $compose_file config --volumes 2>/dev/null || echo "")
    
    if [ -n "$volumes" ]; then
      for volume in $volumes; do
        # Chercher le volume réel (peut être préfixé avec le nom du projet)
        local real_volume=$(docker volume ls --format "{{.Name}}" | grep -E "(^${volume}$|_${volume}$)" | head -1)
        
        if [ -n "$real_volume" ]; then
          backup_volume "$real_volume"
          echo ""
        fi
      done
    fi
  else
    # Sauvegarder tous les volumes Docker
    local volumes=$(docker volume ls --format "{{.Name}}")
    
    for volume in $volumes; do
      backup_volume "$volume"
      echo ""
    done
  fi
  
  echo "✅ Toutes les sauvegardes terminées"
}

# Restaurer un volume
restore_volume() {
  local volume="$1"
  local backup_file="$2"
  
  if [ ! -f "$backup_file" ]; then
    echo "❌ Fichier de sauvegarde non trouvé: $backup_file"
    exit 1
  fi
  
  echo "📥 Restauration du volume: $volume"
  echo "   Source: $backup_file"
  echo ""
  read -p "⚠️  Cela va écraser les données actuelles. Continuer? (y/N): " confirm
  
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Restauration annulée"
    exit 0
  fi
  
  # Arrêter les conteneurs utilisant ce volume
  echo "🛑 Arrêt des conteneurs utilisant ce volume..."
  docker ps --filter volume="$volume" --format "{{.ID}}" | xargs -r docker stop
  
  # Supprimer le volume existant
  docker volume rm "$volume" 2>/dev/null || true
  
  # Créer un nouveau volume
  docker volume create "$volume"
  
  # Restaurer les données
  docker run --rm \
    -v "$volume":/data \
    -v "$(pwd)/$backup_file":/backup/backup.tar.gz:ro \
    alpine sh -c "cd /data && tar xzf /backup/backup.tar.gz"
  
  if [ $? -eq 0 ]; then
    echo "✅ Volume restauré"
  else
    echo "❌ Échec de la restauration"
    exit 1
  fi
}

# Lister les sauvegardes
list_backups() {
  ensure_backup_dir
  
  echo "📋 Sauvegardes disponibles:"
  echo ""
  
  if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | awk '{print "  "$9" ("$5") - "$6" "$7" "$8}'
    
    echo ""
    echo "📊 Statistiques:"
    local count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
    echo "   Nombre: $count"
    echo "   Taille totale: $total_size"
  else
    echo "  Aucune sauvegarde trouvée"
  fi
}

# Exporter un volume
export_volume() {
  local volume="$1"
  local output_file="${2:-${volume}_${TIMESTAMP}.tar}"
  
  ensure_backup_dir
  output_file="$BACKUP_DIR/$output_file"
  
  echo "📤 Export du volume: $volume"
  echo "   Destination: $output_file"
  
  docker run --rm \
    -v "$volume":/data:ro \
    -v "$(pwd)/$BACKUP_DIR":/backup \
    alpine tar cf "/backup/$(basename $output_file)" -C /data .
  
  if [ $? -eq 0 ]; then
    echo "✅ Export terminé: $output_file"
  fi
}

# Importer un volume
import_volume() {
  local volume="$1"
  local input_file="$2"
  
  if [ ! -f "$input_file" ]; then
    echo "❌ Fichier non trouvé: $input_file"
    exit 1
  fi
  
  echo "📥 Import dans le volume: $volume"
  echo "   Source: $input_file"
  
  # Créer le volume s'il n'existe pas
  docker volume create "$volume" 2>/dev/null || true
  
  # Importer les données
  docker run --rm \
    -v "$volume":/data \
    -v "$(pwd)/$input_file":/backup/import.tar:ro \
    alpine sh -c "cd /data && tar xf /backup/import.tar"
  
  if [ $? -eq 0 ]; then
    echo "✅ Import terminé"
  fi
}

# Main
COMMAND="${1:-help}"
shift || true

COMPOSE_FILE="docker-compose.yml"
VOLUME=""
OUTPUT_DIR="./backups"
DATE=""
ALL=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--file)
      COMPOSE_FILE="$2"
      shift 2
      ;;
    -v|--volume)
      VOLUME="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_DIR="$2"
      BACKUP_DIR="$OUTPUT_DIR"
      shift 2
      ;;
    -d|--date)
      DATE="$2"
      shift 2
      ;;
    --all)
      ALL=true
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

ensure_backup_dir

case "$COMMAND" in
  backup)
    if [ "$ALL" = true ]; then
      backup_all "$COMPOSE_FILE"
    elif [ -n "$VOLUME" ]; then
      backup_volume "$VOLUME"
    else
      echo "❌ Spécifiez --all ou -v VOLUME"
      exit 1
    fi
    ;;
  restore)
    if [ -z "$VOLUME" ] || [ -z "$DATE" ]; then
      echo "❌ Volume et date requis"
      echo "💡 Utilisez: $0 restore -v VOLUME -d DATE"
      echo "💡 Ou: $0 list pour voir les sauvegardes"
      exit 1
    fi
    
    # Trouver le fichier de sauvegarde
    local backup_file=$(ls -t "$BACKUP_DIR/${VOLUME}_${DATE}"*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$backup_file" ]; then
      echo "❌ Sauvegarde non trouvée pour $VOLUME à la date $DATE"
      echo "💡 Utilisez: $0 list pour voir les sauvegardes disponibles"
      exit 1
    fi
    
    restore_volume "$VOLUME" "$backup_file"
    ;;
  list)
    list_backups
    ;;
  export)
    if [ -z "$VOLUME" ]; then
      echo "❌ Volume requis"
      exit 1
    fi
    export_volume "$VOLUME" "$@"
    ;;
  import)
    if [ -z "$VOLUME" ] || [ -z "$1" ]; then
      echo "❌ Volume et fichier requis"
      exit 1
    fi
    import_volume "$VOLUME" "$1"
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

