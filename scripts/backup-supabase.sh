#!/bin/bash
set -e

# ============================================================================
# Script de backup automatique PostgreSQL Supabase
# Usage: ./scripts/backup-supabase.sh
# ============================================================================

echo "=================================================="
echo "📦 Backup PostgreSQL Supabase"
echo "=================================================="

# Configuration
SUPABASE_DIR="/docker/cjd80/supabase"
ENV_FILE="${SUPABASE_DIR}/.env"
BACKUP_DIR="/docker/cjd80/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/supabase-postgres-${TIMESTAMP}.sql"

# Créer le répertoire de backup si nécessaire
mkdir -p "$BACKUP_DIR"

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env non trouvé: $ENV_FILE"
    exit 1
fi

# Charger les variables d'environnement
source "$ENV_FILE"

# Vérifier que PostgreSQL est accessible
if ! docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "❌ PostgreSQL Supabase n'est pas accessible"
    echo "   Vérifiez que le service est démarré: docker compose -f ${SUPABASE_DIR}/docker-compose.yml ps"
    exit 1
fi

echo "📥 Création du backup..."
echo "   Fichier: $BACKUP_FILE"

# Créer le backup
if docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    > "$BACKUP_FILE" 2>/dev/null; then
    echo "✅ Backup créé: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Créer un lien symbolique vers le dernier backup
    LATEST_BACKUP="${BACKUP_DIR}/supabase-postgres-latest.sql"
    ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_BACKUP"
    echo "✅ Lien symbolique créé: $LATEST_BACKUP"
    
    # Nettoyer les anciens backups (garder les 7 derniers jours)
    BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
    echo "🧹 Nettoyage des backups de plus de ${BACKUP_RETENTION_DAYS} jours..."
    find "$BACKUP_DIR" -name "supabase-postgres-*.sql" -type f -mtime +${BACKUP_RETENTION_DAYS} -delete
    echo "✅ Nettoyage terminé"
else
    echo "❌ Erreur lors de la création du backup"
    exit 1
fi

echo ""
echo "✅ Backup terminé avec succès"



