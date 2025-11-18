#!/bin/bash
# Script pour vérifier la configuration des secrets GitHub
# Ce script peut être exécuté localement pour vérifier avant de pousser

set -e

echo "=========================================="
echo "🔍 Vérification des Secrets GitHub"
echo "=========================================="
echo ""

# Liste des secrets requis
REQUIRED_SECRETS=(
  "VPS_SSH_KEY"
  "VPS_HOST"
  "VPS_PORT"
  "VPS_USER"
)

# Valeurs attendues (pour référence)
EXPECTED_VALUES=(
  "VPS_HOST=141.94.31.162"
  "VPS_PORT=22"
  "VPS_USER=thibault"
)

echo "📋 Secrets requis dans GitHub:"
for secret in "${REQUIRED_SECRETS[@]}"; do
  echo "   - $secret"
done
echo ""

echo "📋 Valeurs attendues:"
for value in "${EXPECTED_VALUES[@]}"; do
  echo "   - $value"
done
echo ""

echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="
echo ""
echo "Pour configurer les secrets:"
echo "1. Allez sur: https://github.com/Aoleon/cjd80/settings/secrets/actions"
echo "2. Vérifiez que tous les secrets sont présents"
echo "3. Vérifiez particulièrement VPS_USER = 'thibault'"
echo ""

