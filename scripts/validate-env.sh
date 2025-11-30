#!/bin/bash
set -e

# ============================================================================
# Script de validation des variables d'environnement
# Usage: ./scripts/validate-env.sh
# ============================================================================

echo "=================================================="
echo "🔐 Validation des Variables d'Environnement"
echo "=================================================="

ERRORS=0
WARNINGS=0

# Charger .env si existe
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "✅ Fichier .env chargé"
else
  echo "⚠️  Fichier .env non trouvé (utilisation variables système)"
fi

# Variables critiques (doivent être définies)
CRITICAL_VARS=(
  "DATABASE_URL"
)

# Variables importantes (avertissement si manquantes)
IMPORTANT_VARS=(
  "SESSION_SECRET"
  "AUTHENTIK_BASE_URL"
  "AUTHENTIK_CLIENT_ID"
  "AUTHENTIK_CLIENT_SECRET"
)

# Variables optionnelles (vérification format si définies)
OPTIONAL_VARS=(
  "PORT"
  "NODE_ENV"
  "CORS_ORIGIN"
)

echo ""
echo "🔍 Vérification variables critiques..."
for var in "${CRITICAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "   ❌ $var: Non définie"
    ERRORS=$((ERRORS + 1))
  else
    echo "   ✅ $var: Définie"
    # Vérifier format DATABASE_URL
    if [ "$var" = "DATABASE_URL" ]; then
      if [[ "${!var}" =~ ^postgresql:// ]]; then
        echo "      Format: OK (postgresql://...)"
      else
        echo "      ⚠️  Format: Vérifier (doit commencer par postgresql://)"
        WARNINGS=$((WARNINGS + 1))
      fi
    fi
  fi
done

echo ""
echo "🔍 Vérification variables importantes..."
for var in "${IMPORTANT_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "   ⚠️  $var: Non définie (recommandée)"
    WARNINGS=$((WARNINGS + 1))
  else
    echo "   ✅ $var: Définie"
    # Vérifications spécifiques
    if [ "$var" = "SESSION_SECRET" ]; then
      LENGTH=${#SESSION_SECRET}
      if [ "$LENGTH" -lt 32 ]; then
        echo "      ⚠️  Longueur: $LENGTH caractères (recommandé: 32+)"
        WARNINGS=$((WARNINGS + 1))
      else
        echo "      ✅ Longueur: $LENGTH caractères"
      fi
    fi
  fi
done

echo ""
echo "🔍 Vérification variables optionnelles..."
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "   ℹ️  $var: Non définie (valeur par défaut utilisée)"
  else
    echo "   ✅ $var: ${!var}"
    # Vérifications spécifiques
    if [ "$var" = "PORT" ]; then
      if [[ "${!var}" =~ ^[0-9]+$ ]] && [ "${!var}" -ge 1024 ] && [ "${!var}" -le 65535 ]; then
        echo "      ✅ Port valide"
      else
        echo "      ⚠️  Port invalide (doit être entre 1024 et 65535)"
        WARNINGS=$((WARNINGS + 1))
      fi
    fi
    if [ "$var" = "NODE_ENV" ]; then
      if [[ "${!var}" =~ ^(development|production|test)$ ]]; then
        echo "      ✅ Environnement valide"
      else
        echo "      ⚠️  Environnement: ${!var} (attendu: development, production, test)"
        WARNINGS=$((WARNINGS + 1))
      fi
    fi
  fi
done

# Vérification DATABASE_URL spécifique
echo ""
echo "🔍 Vérification DATABASE_URL..."
if [ -n "$DATABASE_URL" ]; then
  # Vérifier si pointe vers localhost (pour connexion depuis hôte)
  if [[ "$DATABASE_URL" =~ localhost:5433 ]] || [[ "$DATABASE_URL" =~ 127.0.0.1:5433 ]]; then
    echo "   ✅ Utilise localhost:5433 (correct pour connexion depuis hôte)"
  elif [[ "$DATABASE_URL" =~ postgres:5432 ]]; then
    echo "   ⚠️  Utilise postgres:5432 (nom service Docker - OK si dans conteneur)"
    echo "      💡 Pour connexion depuis hôte, utiliser localhost:5433"
    WARNINGS=$((WARNINGS + 1))
  fi
fi

# Résumé
echo ""
echo "=================================================="
echo "📊 Résumé"
echo "=================================================="
echo "   Erreurs: $ERRORS"
echo "   Avertissements: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo ""
    echo "✅ Toutes les variables sont correctement configurées !"
    exit 0
  else
    echo ""
    echo "⚠️  Validation réussie avec $WARNINGS avertissement(s)"
    exit 0
  fi
else
  echo ""
  echo "❌ Validation échouée avec $ERRORS erreur(s)"
  exit 1
fi

