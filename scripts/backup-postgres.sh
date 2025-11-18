#!/bin/bash
set -e

# ============================================================================
# Script de backup automatique PostgreSQL Nhost
# Usage: ./scripts/backup-postgres.sh
# ============================================================================

echo "=================================================="
echo "📦 Backup PostgreSQL Nhost"
echo "=================================================="

# Variables
NHOST_DIR="/docker/cjd80/nhost"
ENV_FILE="${NHOST_DIR}/.env"
BACKUP_DIR="/docker/cjd80/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/nhost-postgres-${TIMESTAMP}.sql"

# Charger les variables d'environnement
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERREUR: Fichier .env non trouvé: $ENV_FILE"
    exit 1
fi

source "$ENV_FILE"

# Vérifier que les variables nécessaires sont définies
if [ -z "$POSTGRES_USER" ] || [ -z "$POSTGRES_PASSWORD" ] || [ -z "$POSTGRES_DB" ]; then
    echo "❌ ERREUR: Variables PostgreSQL manquantes dans .env"
    exit 1
fi

# Créer le répertoire de backup si nécessaire
mkdir -p "$BACKUP_DIR"

# Exporter le mot de passe pour pg_dump
export PGPASSWORD="$POSTGRES_PASSWORD"

# Exécuter le backup
echo "📥 Début du backup..."
echo "   Database: $POSTGRES_DB"
echo "   Fichier: $BACKUP_FILE"
echo ""

docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    > "$BACKUP_FILE"

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "✅ Backup réussi!"
    echo "   Fichier: $BACKUP_FILE"
    echo "   Taille: $BACKUP_SIZE"
    echo ""
    
    # Créer un lien symbolique vers le dernier backup
    LATEST_BACKUP="${BACKUP_DIR}/nhost-postgres-latest.sql"
    ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_BACKUP"
    echo "🔗 Lien symbolique créé: $LATEST_BACKUP"
    echo ""
    
    # Nettoyer les anciens backups (garder les 7 derniers jours)
    if [ -n "$BACKUP_RETENTION_DAYS" ]; then
        find "$BACKUP_DIR" -name "nhost-postgres-*.sql" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete
        echo "🧹 Nettoyage: backups de plus de ${BACKUP_RETENTION_DAYS} jours supprimés"
    fi
    
    echo "✅ Backup terminé avec succès!"
    exit 0
else
    echo ""
    echo "❌ ERREUR: Le backup a échoué"
    exit 1
fi

