#!/bin/bash
set -e

# ============================================================================
# Script pour corriger la variable HASURA_GRAPHQL_DATABASE_URL dans docker-compose.yml
# ============================================================================

NHOST_DIR="/docker/cjd80/nhost"
ENV_FILE="${NHOST_DIR}/.env"
COMPOSE_FILE="${NHOST_DIR}/docker-compose.yml"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ ERREUR: Fichier .env non trouvé: $ENV_FILE"
    exit 1
fi

# Charger les variables d'environnement
source "$ENV_FILE"

# Construire l'URL de connexion Hasura
HASURA_DB_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@nhost-postgres-prod:5432/${POSTGRES_DB:-nhost}"

# Remplacer dans docker-compose.yml
sed -i "s|HASURA_GRAPHQL_DATABASE_URL:.*|HASURA_GRAPHQL_DATABASE_URL: ${HASURA_DB_URL}|g" "$COMPOSE_FILE"

# Corriger aussi DATABASE_URL pour auth et storage
sed -i "s|DATABASE_URL: postgres://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@nhost-postgres-prod:5432/\${POSTGRES_DB:-nhost}|DATABASE_URL: ${HASURA_DB_URL}|g" "$COMPOSE_FILE"

echo "✅ Configuration Hasura corrigée"
echo "   HASURA_GRAPHQL_DATABASE_URL: postgres://${POSTGRES_USER}:***@nhost-postgres-prod:5432/${POSTGRES_DB:-nhost}"

