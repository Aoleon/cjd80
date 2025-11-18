#!/bin/bash
set -e

# ============================================================================
# Script pour corriger les noms de services dans docker-compose.yml Nhost
# ============================================================================

NHOST_DIR="/docker/cjd80/nhost"
COMPOSE_FILE="${NHOST_DIR}/docker-compose.yml"

echo "🔧 Correction des noms de services dans docker-compose.yml..."

# Corriger les références de service postgres -> nhost-postgres-prod
sed -i 's/@postgres:/@nhost-postgres-prod:/g' "$COMPOSE_FILE"
sed -i 's/postgres:5432/nhost-postgres-prod:5432/g' "$COMPOSE_FILE"
sed -i 's/HASURA_GRAPHQL_DATABASE_URL: postgres:\/\/\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:/HASURA_GRAPHQL_DATABASE_URL: postgres:\/\/\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@nhost-postgres-prod:/g' "$COMPOSE_FILE"
sed -i 's/DATABASE_URL: postgres:\/\/\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@postgres:/DATABASE_URL: postgres:\/\/\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@nhost-postgres-prod:/g' "$COMPOSE_FILE"
sed -i 's/PGHOST: postgres/PGHOST: nhost-postgres-prod/g' "$COMPOSE_FILE"
sed -i 's/depends_on:.*postgres:/depends_on:\n      nhost-postgres-prod:/g' "$COMPOSE_FILE"

# Corriger les noms de conteneurs MinIO et Redis dans les références
sed -i 's/nhost-minio:/nhost-minio-prod:/g' "$COMPOSE_FILE"
sed -i 's/nhost-redis:/nhost-redis-prod:/g' "$COMPOSE_FILE"
sed -i 's/http:\/\/minio:/http:\/\/nhost-minio-prod:/g' "$COMPOSE_FILE"
sed -i 's/http:\/\/hasura:/http:\/\/nhost-hasura-prod:/g' "$COMPOSE_FILE"

echo "✅ Corrections appliquées"

