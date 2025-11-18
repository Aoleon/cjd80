#!/bin/bash
set -e

# ============================================================================
# Script de restauration d'un dump PostgreSQL vers Nhost
# Usage: ./scripts/restore-to-nhost.sh [DUMP_FILE]
# ============================================================================

echo "=================================================="
echo "📥 Restauration Base de Données vers Nhost"
echo "=================================================="

# Variables
DUMP_FILE="${1:-/docker/cjd80/backups/neon-dump-latest.sql}"
NHOST_DIR="/docker/cjd80/nhost"
ENV_FILE="${NHOST_DIR}/.env"

# Vérifier que le fichier de dump existe
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ ERREUR: Fichier de dump non trouvé: $DUMP_FILE"
    echo "   Utilisez: $0 [chemin_vers_dump.sql]"
    exit 1
fi

# Charger les variables d'environnement depuis .env
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

echo "🔍 Informations de restauration:"
echo "   Dump file: $DUMP_FILE"
echo "   Database: $POSTGRES_DB"
echo "   User: $POSTGRES_USER"
echo "   Host: nhost-postgres-prod:5432"
echo ""

# Vérifier que PostgreSQL est accessible
echo "🔍 Vérification connexion PostgreSQL..."
if ! docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "❌ ERREUR: PostgreSQL n'est pas accessible"
    echo "   Vérifiez que le service est démarré: docker compose -f ${NHOST_DIR}/docker-compose.yml ps"
    exit 1
fi

echo "✅ PostgreSQL est accessible"
echo ""

# Taille du dump
DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "📊 Taille du dump: $DUMP_SIZE"
echo ""

# Exporter le mot de passe pour psql
export PGPASSWORD="$POSTGRES_PASSWORD"

# Restaurer le dump
echo "📥 Début de la restauration..."
echo "   Cela peut prendre plusieurs minutes selon la taille de la base..."
echo ""

# Utiliser psql pour restaurer le dump SQL
docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres psql \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    < "$DUMP_FILE"

RESTORE_EXIT_CODE=$?

if [ $RESTORE_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Restauration terminée avec succès!"
    echo ""
    
    # Vérifier l'intégrité des données
    echo "🔍 Vérification de l'intégrité des données..."
    
    # Compter les tables
    TABLE_COUNT=$(docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres psql \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    echo "   Nombre de tables: $TABLE_COUNT"
    
    # Lister quelques tables pour vérification
    echo ""
    echo "📋 Exemples de tables restaurées:"
    docker compose -f "${NHOST_DIR}/docker-compose.yml" exec -T postgres psql \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 10;" 2>/dev/null || echo "   (Impossible de lister les tables)"
    
    echo ""
    echo "✅ Restauration complète et vérifiée!"
    exit 0
else
    echo ""
    echo "❌ ERREUR: La restauration a échoué (code: $RESTORE_EXIT_CODE)"
    echo "   Vérifiez les logs pour plus de détails"
    exit 1
fi

