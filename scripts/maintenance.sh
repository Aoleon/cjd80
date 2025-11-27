#!/bin/bash

# Script de maintenance automatique
# Nettoie, optimise et maintient le système

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Maintenance automatique du système.

Commands:
  clean                Nettoyage complet
  optimize             Optimisation du système
  backup               Sauvegarde automatique
  update               Mise à jour des dépendances
  check                Vérification de santé
  full                 Maintenance complète

Options:
  -h, --help          Afficher cette aide
  --force             Forcer sans confirmation
  --dry-run           Simulation sans modifications

Exemples:
  $0 clean
  $0 optimize
  $0 full
  $0 backup
EOF
}

# Nettoyage
clean_system() {
  local force="${1:-false}"
  local dry_run="${2:-false}"
  
  echo "🧹 Nettoyage du système..."
  echo ""
  
  if [ "$dry_run" = true ]; then
    echo "🔍 [DRY-RUN] Simulation du nettoyage"
    echo ""
  fi
  
  # Docker
  if docker info &> /dev/null; then
    echo "🐳 Nettoyage Docker..."
    if [ "$dry_run" = false ]; then
      if [ "$force" = true ]; then
        npm run docker clean
      else
        read -p "Nettoyer Docker? (y/N): " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
          npm run docker clean
        fi
      fi
    else
      echo "  [DRY-RUN] docker clean"
    fi
    echo ""
  fi
  
  # Node modules
  echo "📦 Nettoyage node_modules..."
  if [ "$dry_run" = false ]; then
    if [ "$force" = true ] || [ -d "node_modules" ]; then
      read -p "Supprimer node_modules et réinstaller? (y/N): " confirm
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        rm -rf node_modules package-lock.json
        npm install
      fi
    fi
  else
    echo "  [DRY-RUN] Suppression node_modules"
  fi
  echo ""
  
  # Logs
  echo "📋 Nettoyage des logs..."
  if [ "$dry_run" = false ]; then
    if [ -d "logs" ]; then
      find logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
      echo "  ✅ Logs anciens supprimés"
    fi
  else
    echo "  [DRY-RUN] Suppression logs > 7 jours"
  fi
  echo ""
  
  # Cache
  echo "🗑️  Nettoyage du cache..."
  if [ "$dry_run" = false ]; then
    npm cache clean --force 2>/dev/null || true
    echo "  ✅ Cache npm nettoyé"
  else
    echo "  [DRY-RUN] npm cache clean"
  fi
  echo ""
  
  if [ "$dry_run" = false ]; then
    echo "✅ Nettoyage terminé"
  fi
}

# Optimisation
optimize_system() {
  local force="${1:-false}"
  local dry_run="${2:-false}"
  
  echo "⚡ Optimisation du système..."
  echo ""
  
  if [ "$dry_run" = true ]; then
    echo "🔍 [DRY-RUN] Simulation de l'optimisation"
    echo ""
  fi
  
  # Docker
  if docker info &> /dev/null; then
    echo "🐳 Optimisation Docker..."
    if [ "$dry_run" = false ]; then
      docker system prune -f
      echo "  ✅ Docker optimisé"
    else
      echo "  [DRY-RUN] docker system prune"
    fi
    echo ""
  fi
  
  # Base de données
  if [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Optimisation base de données..."
    if [ "$dry_run" = false ]; then
      echo "  💡 Utilisez: npm run db:stats pour voir les recommandations"
      # Ici on pourrait ajouter VACUUM, ANALYZE, etc.
    else
      echo "  [DRY-RUN] Optimisation DB"
    fi
    echo ""
  fi
  
  # Build
  echo "🔨 Optimisation des builds..."
  if [ "$dry_run" = false ]; then
    if [ -d "dist" ]; then
      echo "  ✅ Dossier dist présent"
    fi
  else
    echo "  [DRY-RUN] Vérification builds"
  fi
  echo ""
  
  if [ "$dry_run" = false ]; then
    echo "✅ Optimisation terminée"
  fi
}

# Sauvegarde
backup_system() {
  local force="${1:-false}"
  
  echo "💾 Sauvegarde automatique..."
  echo ""
  
  # Docker volumes
  if docker info &> /dev/null; then
    echo "🐳 Sauvegarde des volumes Docker..."
    npm run docker:backup backup --all
    echo ""
  fi
  
  # Base de données
  if [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Sauvegarde de la base de données..."
    echo "  💡 Utilisez: npm run db:connect pour pg_dump manuel"
    echo ""
  fi
  
  echo "✅ Sauvegarde terminée"
}

# Mise à jour
update_dependencies() {
  local force="${1:-false}"
  local dry_run="${2:-false}"
  
  echo "🔄 Mise à jour des dépendances..."
  echo ""
  
  if [ "$dry_run" = true ]; then
    echo "🔍 [DRY-RUN] Simulation de la mise à jour"
    echo ""
    npm outdated || true
    return
  fi
  
  # Vérifier les mises à jour
  echo "📋 Vérification des mises à jour disponibles..."
  npm outdated || echo "  ✅ Toutes les dépendances sont à jour"
  echo ""
  
  if [ "$force" = true ]; then
    read -p "Mettre à jour toutes les dépendances? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      npm update
      echo "✅ Dépendances mises à jour"
    fi
  else
    echo "💡 Utilisez: npm update pour mettre à jour"
  fi
}

# Vérification
check_system() {
  echo "🔍 Vérification de santé du système..."
  echo ""
  
  # Utiliser le script health-check existant
  npm run health
}

# Maintenance complète
full_maintenance() {
  local force="${1:-false}"
  local dry_run="${2:-false}"
  
  echo "🔧 MAINTENANCE COMPLÈTE"
  echo ""
  
  # 1. Vérification
  echo "1️⃣ Vérification de santé..."
  check_system
  echo ""
  
  # 2. Sauvegarde
  echo "2️⃣ Sauvegarde..."
  backup_system "$force"
  echo ""
  
  # 3. Nettoyage
  echo "3️⃣ Nettoyage..."
  clean_system "$force" "$dry_run"
  echo ""
  
  # 4. Optimisation
  echo "4️⃣ Optimisation..."
  optimize_system "$force" "$dry_run"
  echo ""
  
  # 5. Mise à jour (optionnel)
  if [ "$force" = true ]; then
    echo "5️⃣ Mise à jour..."
    update_dependencies "$force" "$dry_run"
    echo ""
  fi
  
  echo "✅ Maintenance complète terminée"
}

# Main
COMMAND="${1:-help}"
shift || true

FORCE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
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
  clean)
    clean_system "$FORCE" "$DRY_RUN"
    ;;
  optimize)
    optimize_system "$FORCE" "$DRY_RUN"
    ;;
  backup)
    backup_system "$FORCE"
    ;;
  update)
    update_dependencies "$FORCE" "$DRY_RUN"
    ;;
  check)
    check_system
    ;;
  full)
    full_maintenance "$FORCE" "$DRY_RUN"
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

