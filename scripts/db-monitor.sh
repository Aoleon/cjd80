#!/bin/bash

# Script pour monitorer la base de données PostgreSQL en temps réel
# Utilise pg_activity si disponible

# Ajouter ~/.local/bin au PATH si nécessaire
export PATH="$HOME/.local/bin:$PATH"

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Extraire les informations de connexion depuis DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL n'est pas défini"
  exit 1
fi

# Vérifier si pg_activity est installé
if command -v pg_activity &> /dev/null; then
  echo "✅ Lancement de pg_activity (monitoring en temps réel)..."
  echo "💡 Appuyez sur 'q' pour quitter"
  echo ""
  pg_activity "$DATABASE_URL"
else
  echo "❌ pg_activity n'est pas installé"
  echo "📦 Installation: pipx install pg_activity"
  exit 1
fi

