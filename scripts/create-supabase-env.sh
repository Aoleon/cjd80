#!/bin/bash
set -e

# ============================================================================
# Script pour créer le fichier .env pour Supabase Community Edition
# Usage: ./scripts/create-supabase-env.sh
# ============================================================================

echo "=================================================="
echo "🔐 Création fichier .env pour Supabase"
echo "=================================================="

# Répertoire de travail
SUPABASE_DIR="/docker/cjd80/supabase"
ENV_FILE="${SUPABASE_DIR}/.env"

# Créer le répertoire si nécessaire
mkdir -p "$SUPABASE_DIR"

# Générer des mots de passe forts
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
ANON_KEY=$(openssl rand -base64 32 | tr -d '\n')
SERVICE_KEY=$(openssl rand -base64 32 | tr -d '\n')
MINIO_ACCESS_KEY=$(openssl rand -base64 24 | tr -d '\n')
MINIO_SECRET_KEY=$(openssl rand -base64 24 | tr -d '\n')
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

# Lire les variables existantes depuis .env de l'application si disponible
APP_ENV="/docker/cjd80/.env"
if [ -f "$APP_ENV" ]; then
    AZURE_TENANT_ID=$(grep "^AZURE_TENANT_ID=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "")
    AZURE_CLIENT_ID=$(grep "^AZURE_CLIENT_ID=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "")
    AZURE_CLIENT_SECRET=$(grep "^AZURE_CLIENT_SECRET=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "")
    SESSION_SECRET=$(grep "^SESSION_SECRET=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "")
    CORS_ORIGIN=$(grep "^CORS_ORIGIN=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "https://cjd80.fr")
    SITE_URL=$(grep "^SITE_URL=" "$APP_ENV" | cut -d'=' -f2- | tr -d '"' || echo "https://cjd80.fr")
else
    AZURE_TENANT_ID=""
    AZURE_CLIENT_ID=""
    AZURE_CLIENT_SECRET=""
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    CORS_ORIGIN="https://cjd80.fr"
    SITE_URL="https://cjd80.fr"
fi

# Créer le fichier .env
cat > "$ENV_FILE" <<EOF
# ========================================
# BASE DE DONNÉES - SUPABASE POSTGRESQL
# ========================================
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@supabase-db-prod:5432/postgres

# ========================================
# CONFIGURATION DOCKER SUPABASE
# ========================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=postgres

# JWT et clés Supabase
JWT_SECRET=${JWT_SECRET}
ANON_KEY=${ANON_KEY}
SERVICE_KEY=${SERVICE_KEY}

# Supabase Storage (MinIO)
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
S3_REGION=us-east-1
S3_ENDPOINT=http://supabase-storage-prod:9000
S3_BUCKET=supabase-storage
S3_ACCESS_KEY_ID=${MINIO_ACCESS_KEY}
S3_SECRET_ACCESS_KEY=${MINIO_SECRET_KEY}

# ========================================
# ENVIRONNEMENT APPLICATION
# ========================================
NODE_ENV=production
PORT=4000
SITE_URL=${SITE_URL}

# ========================================
# AUTHENTIFICATION MICROSOFT (Conservée)
# ========================================
AZURE_TENANT_ID=${AZURE_TENANT_ID}
AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}

# ========================================
# REDIS PRODUCTION
# ========================================
REDIS_URL=redis://:${REDIS_PASSWORD}@supabase-redis-prod:6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# ========================================
# SÉCURITÉ PRODUCTION
# ========================================
SESSION_SECRET=${SESSION_SECRET}
CORS_ORIGIN=${CORS_ORIGIN}

# ========================================
# SERVICES EXTERNES
# ========================================
ONEDRIVE_SYNC_ENABLED=false
BATIGEST_SIMULATED=true

# ========================================
# MONITORING ET LOGGING
# ========================================
LOG_LEVEL=info
ENABLE_METRICS=true

# ========================================
# BACKUP CONFIGURATION
# ========================================
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=7
EOF

# Sécuriser le fichier .env
chmod 600 "$ENV_FILE"

echo "✅ Fichier .env créé: $ENV_FILE"
echo ""
echo "📋 Résumé de la configuration:"
echo "   - PostgreSQL: postgres / [mot de passe généré]"
echo "   - JWT Secret: [généré]"
echo "   - MinIO Access Key: ${MINIO_ACCESS_KEY:0:10}..."
echo "   - Redis Password: [généré]"
echo ""
echo "⚠️  IMPORTANT: Sauvegardez ces mots de passe en lieu sûr!"
echo "   Le fichier .env est protégé (chmod 600)"



