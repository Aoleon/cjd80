#!/bin/bash

# Script pour se connecter à la base de données PostgreSQL
# Utilise pgcli si disponible, sinon psql

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Extraire les informations de connexion depuis DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL n'est pas défini"
  exit 1
fi

# Parser DATABASE_URL (format: postgresql://user:password@host:port/database)
DB_URL="$DATABASE_URL"

# Vérifier si pgcli est installé
if command -v pgcli &> /dev/null; then
  echo "✅ Connexion avec pgcli (client amélioré)..."
  pgcli "$DB_URL"
else
  # Extraire les composants pour psql
  if command -v psql &> /dev/null; then
    echo "✅ Connexion avec psql..."
    # Convertir DATABASE_URL en paramètres psql
    psql "$DB_URL"
  else
    echo "❌ Aucun client PostgreSQL trouvé."
    echo "📦 Installation: pipx install pgcli"
    echo "   ou: brew install postgresql@15"
    exit 1
  fi
fi

