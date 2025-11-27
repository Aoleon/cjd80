#!/bin/bash
set -e

# ============================================================================
# Script de restauration d'un dump PostgreSQL vers Supabase
# Usage: ./scripts/restore-to-supabase.sh [DUMP_FILE]
# ============================================================================

echo "=================================================="
echo "📥 Restauration Base de Données vers Supabase"
echo "=================================================="

# Répertoires
SUPABASE_DIR="/docker/cjd80/supabase"
ENV_FILE="${SUPABASE_DIR}/.env"
BACKUP_DIR="/docker/cjd80/backups"

# Fichier de dump à restaurer
if [ -z "$1" ]; then
    # Utiliser le dernier backup si aucun fichier spécifié
    DUMP_FILE="${BACKUP_DIR}/supabase-postgres-latest.sql"
    if [ ! -f "$DUMP_FILE" ]; then
        echo "❌ Aucun fichier de dump spécifié et aucun backup récent trouvé"
        echo "   Usage: $0 [DUMP_FILE]"
        exit 1
    fi
    echo "📂 Utilisation du dernier backup: $DUMP_FILE"
else
    DUMP_FILE="$1"
    if [ ! -f "$DUMP_FILE" ]; then
        echo "❌ Fichier de dump non trouvé: $DUMP_FILE"
        exit 1
    fi
fi

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env non trouvé: $ENV_FILE"
    echo "   Créez-le avec: ./scripts/create-supabase-env.sh"
    exit 1
fi

# Charger les variables d'environnement
source "$ENV_FILE"

echo ""
echo "📋 Configuration:"
echo "   Fichier: $DUMP_FILE"
echo "   Taille: $(du -h "$DUMP_FILE" | cut -f1)"
echo "   Host: supabase-db-prod:5432"
echo "   Database: ${POSTGRES_DB:-postgres}"
echo "   User: ${POSTGRES_USER:-postgres}"
echo ""

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification de la connexion PostgreSQL..."
if ! docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "❌ PostgreSQL Supabase n'est pas accessible"
    echo "   Vérifiez que le service est démarré: docker compose -f ${SUPABASE_DIR}/docker-compose.yml ps"
    exit 1
fi
echo "   ✅ PostgreSQL accessible"

# Confirmation
echo ""
echo "⚠️  ATTENTION: Cette opération va écraser les données existantes!"
read -p "   Continuer? (oui/non): " CONFIRM
if [ "$CONFIRM" != "oui" ]; then
    echo "   ❌ Opération annulée"
    exit 0
fi

# Restauration
echo ""
echo "📥 Restauration en cours..."
if docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    < "$DUMP_FILE" > /dev/null 2>&1; then
    echo "   ✅ Restauration terminée"
else
    echo "   ⚠️  Erreurs lors de la restauration (peut être normal si le dump contient des erreurs)"
    echo "   Vérification de l'intégrité..."
fi

# Vérification
echo ""
echo "🔍 Vérification de l'intégrité..."
TABLE_COUNT=$(docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo "   ✅ Tables restaurées: $TABLE_COUNT"
    
    # Afficher quelques statistiques
    docker compose -f "${SUPABASE_DIR}/docker-compose.yml" exec -T supabase-db psql \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC LIMIT 10;" 2>/dev/null || true
else
    echo "   ⚠️  Aucune table trouvée (peut être normal si la base était vide)"
fi

echo ""
echo "✅ Restauration terminée"



