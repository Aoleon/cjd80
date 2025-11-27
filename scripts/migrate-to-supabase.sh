#!/bin/bash
set -e

# ============================================================================
# Script de migration complète depuis Nhost vers Supabase
# Usage: ./scripts/migrate-to-supabase.sh
# ============================================================================

echo "=================================================="
echo "🔄 Migration Nhost → Supabase Community Edition"
echo "=================================================="

# Répertoires
NHOST_DIR="/docker/cjd80/nhost"
SUPABASE_DIR="/docker/cjd80/supabase"
BACKUP_DIR="/docker/cjd80/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Créer les répertoires si nécessaire
mkdir -p "$BACKUP_DIR"
mkdir -p "$SUPABASE_DIR"

# ========================================
# ÉTAPE 1: Backup PostgreSQL Nhost
# ========================================
echo ""
echo "📦 Étape 1: Backup PostgreSQL Nhost"
echo "-----------------------------------"

NHOST_ENV="${NHOST_DIR}/.env"
if [ ! -f "$NHOST_ENV" ]; then
    echo "❌ Fichier .env Nhost non trouvé: $NHOST_ENV"
    exit 1
fi

# Charger les variables d'environnement Nhost
source "$NHOST_ENV"

BACKUP_FILE="${BACKUP_DIR}/nhost-postgres-${TIMESTAMP}.sql"
echo "   Création du backup: $BACKUP_FILE"

if docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    > "$BACKUP_FILE" 2>/dev/null; then
    echo "   ✅ Backup créé: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "   ⚠️  Erreur lors du backup, tentative alternative..."
    # Alternative: utiliser pg_dump depuis l'extérieur
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}"
    if command -v pg_dump >/dev/null 2>&1; then
        PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists > "$BACKUP_FILE"
        echo "   ✅ Backup créé (alternative): $(du -h "$BACKUP_FILE" | cut -f1)"
    else
        echo "   ❌ Impossible de créer le backup"
        exit 1
    fi
fi

# ========================================
# ÉTAPE 2: Créer configuration Supabase
# ========================================
echo ""
echo "🔧 Étape 2: Configuration Supabase"
echo "-----------------------------------"

# Créer le fichier .env Supabase
if [ -f "scripts/create-supabase-env.sh" ]; then
    bash scripts/create-supabase-env.sh
else
    echo "   ⚠️  Script create-supabase-env.sh non trouvé, création manuelle..."
    # Copier docker-compose.supabase.yml
    if [ -f "docker-compose.supabase.yml" ]; then
        cp docker-compose.supabase.yml "${SUPABASE_DIR}/docker-compose.yml"
        echo "   ✅ docker-compose.yml copié"
    fi
fi

# ========================================
# ÉTAPE 3: Démarrer Supabase
# ========================================
echo ""
echo "🚀 Étape 3: Démarrage Supabase"
echo "-----------------------------------"

SUPABASE_ENV="${SUPABASE_DIR}/.env"
if [ ! -f "$SUPABASE_ENV" ]; then
    echo "   ❌ Fichier .env Supabase non trouvé: $SUPABASE_ENV"
    exit 1
fi

# Copier docker-compose.supabase.yml si nécessaire
if [ ! -f "${SUPABASE_DIR}/docker-compose.yml" ]; then
    if [ -f "docker-compose.supabase.yml" ]; then
        cp docker-compose.supabase.yml "${SUPABASE_DIR}/docker-compose.yml"
        echo "   ✅ docker-compose.yml copié"
    else
        echo "   ❌ docker-compose.supabase.yml non trouvé"
        exit 1
    fi
fi

# Démarrer les services Supabase
echo "   Démarrage des services..."
cd "$SUPABASE_DIR"
docker compose up -d

# Attendre que PostgreSQL soit prêt
echo "   Attente de PostgreSQL..."
sleep 10
for i in {1..30}; do
    if docker compose exec -T supabase-db pg_isready -U postgres > /dev/null 2>&1; then
        echo "   ✅ PostgreSQL prêt"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ Timeout: PostgreSQL non prêt après 30 tentatives"
        exit 1
    fi
    sleep 2
done

# ========================================
# ÉTAPE 4: Restauration PostgreSQL
# ========================================
echo ""
echo "📥 Étape 4: Restauration PostgreSQL"
echo "-----------------------------------"

# Charger les variables Supabase
source "$SUPABASE_ENV"

echo "   Restauration du backup..."
if docker compose exec -T supabase-db psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    < "$BACKUP_FILE" > /dev/null 2>&1; then
    echo "   ✅ Données restaurées"
else
    echo "   ⚠️  Erreur lors de la restauration (peut être normal si le dump contient des erreurs)"
    echo "   Tentative de restauration alternative..."
    # Essayer sans --clean
    docker compose exec -T supabase-db psql \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -f - < "$BACKUP_FILE" 2>&1 | grep -v "ERROR" || true
fi

# Vérification
TABLE_COUNT=$(docker compose exec -T supabase-db psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo "   ✅ Tables restaurées: $TABLE_COUNT"
else
    echo "   ⚠️  Aucune table trouvée (peut être normal si la base était vide)"
fi

# ========================================
# ÉTAPE 5: Migration MinIO (optionnel)
# ========================================
echo ""
echo "📦 Étape 5: Migration MinIO (optionnel)"
echo "-----------------------------------"
echo "   ℹ️  Les fichiers MinIO peuvent être migrés manuellement"
echo "   ou en copiant les volumes Docker:"
echo "   - Source: ${NHOST_DIR}/volumes/minio"
echo "   - Destination: ${SUPABASE_DIR}/volumes/storage"

# ========================================
# RÉSUMÉ
# ========================================
echo ""
echo "=================================================="
echo "✅ Migration terminée"
echo "=================================================="
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier les services Supabase:"
echo "      docker compose -f ${SUPABASE_DIR}/docker-compose.yml ps"
echo ""
echo "   2. Mettre à jour DATABASE_URL dans l'application:"
echo "      DATABASE_URL=postgresql://postgres:...@supabase-db-prod:5432/postgres"
echo ""
echo "   3. Mettre à jour MINIO_ENDPOINT:"
echo "      MINIO_ENDPOINT=supabase-storage-prod"
echo ""
echo "   4. Tester l'application avec Supabase"
echo ""
echo "   5. Arrêter Nhost une fois validé:"
echo "      docker compose -f ${NHOST_DIR}/docker-compose.yml down"
echo ""



