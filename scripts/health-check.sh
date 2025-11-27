#!/bin/bash

# Script de vérification de santé globale
# Vérifie l'état de tous les outils et services

set -e

# Détecter l'OS
detect_os() {
  case "$(uname -s)" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      echo "linux"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

OS=$(detect_os)

echo "🏥 Vérification de santé du système"
echo "🖥️  Environnement: $OS"
echo ""

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

ERRORS=0
WARNINGS=0

# Vérifier les outils de base
echo "📦 Outils installés:"
echo ""

# SSH
if command -v ssh &> /dev/null; then
  echo "  ✅ ssh"
else
  echo "  ❌ ssh"
  ERRORS=$((ERRORS + 1))
fi

# Git
if command -v git &> /dev/null; then
  echo "  ✅ git: $(git --version | head -1)"
else
  echo "  ❌ git"
  ERRORS=$((ERRORS + 1))
fi

# Node.js
if command -v node &> /dev/null; then
  echo "  ✅ node: $(node --version)"
else
  echo "  ❌ node"
  ERRORS=$((ERRORS + 1))
fi

# Outils optionnels
echo ""
echo "🔧 Outils optionnels:"
echo ""

# PostgreSQL tools
if command -v pgcli &> /dev/null; then
  echo "  ✅ pgcli"
else
  echo "  ⚠️  pgcli (optionnel)"
  WARNINGS=$((WARNINGS + 1))
fi

if command -v pg_activity &> /dev/null; then
  echo "  ✅ pg_activity"
else
  echo "  ⚠️  pg_activity (optionnel)"
  WARNINGS=$((WARNINGS + 1))
fi

# SSH tools
if command -v mosh &> /dev/null; then
  echo "  ✅ mosh"
else
  echo "  ⚠️  mosh (optionnel)"
  WARNINGS=$((WARNINGS + 1))
fi

# GitHub CLI
if command -v gh &> /dev/null; then
  if gh auth status &> /dev/null; then
    echo "  ✅ gh (authentifié)"
  else
    echo "  ⚠️  gh (non authentifié)"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ⚠️  gh (optionnel)"
  WARNINGS=$((WARNINGS + 1))
fi

# act
if command -v act &> /dev/null; then
  echo "  ✅ act"
else
  echo "  ⚠️  act (optionnel)"
  WARNINGS=$((WARNINGS + 1))
fi

# Vérifier la configuration
echo ""
echo "⚙️  Configuration:"
echo ""

# .env
if [ -f .env ]; then
  echo "  ✅ .env présent"
  
  # Vérifier les variables importantes
  if grep -q "DATABASE_URL" .env; then
    echo "  ✅ DATABASE_URL défini"
  else
    echo "  ⚠️  DATABASE_URL non défini"
    WARNINGS=$((WARNINGS + 1))
  fi
  
  if grep -q "SSH_HOST" .env; then
    echo "  ✅ SSH_HOST défini"
  else
    echo "  ⚠️  SSH_HOST non défini (optionnel)"
  fi
else
  echo "  ⚠️  .env non trouvé"
  WARNINGS=$((WARNINGS + 1))
fi

# SSH config
if [ -f "$HOME/.ssh/config" ]; then
  server_count=$(grep -c "^Host " "$HOME/.ssh/config" 2>/dev/null || echo "0")
  # Nettoyer la valeur (enlever les espaces)
  server_count=$(echo "$server_count" | tr -d '[:space:]')
  if [ -n "$server_count" ] && [ "$server_count" -gt 0 ] 2>/dev/null; then
    echo "  ✅ SSH config ($server_count serveur(s))"
  else
    echo "  ⚠️  SSH config vide"
  fi
else
  echo "  ⚠️  SSH config non trouvé"
fi

# Clés SSH
if [ -f "$HOME/.ssh/id_ed25519" ] || [ -f "$HOME/.ssh/id_rsa" ]; then
  echo "  ✅ Clés SSH présentes"
else
  echo "  ⚠️  Aucune clé SSH trouvée"
  WARNINGS=$((WARNINGS + 1))
fi

# Vérifier la connexion à la base de données
echo ""
echo "🗄️  Base de données:"
echo ""

if [ -n "$DATABASE_URL" ]; then
  # Tester la connexion (si possible)
  if command -v psql &> /dev/null || command -v pgcli &> /dev/null; then
    echo "  ℹ️  DATABASE_URL configuré"
    echo "  💡 Testez avec: npm run db:connect"
  else
    echo "  ⚠️  DATABASE_URL configuré mais aucun client PostgreSQL"
  fi
else
  echo "  ⚠️  DATABASE_URL non configuré"
  WARNINGS=$((WARNINGS + 1))
fi

# Vérifier Git
echo ""
echo "📂 Git:"
echo ""

if [ -d .git ]; then
  echo "  ✅ Dépôt Git initialisé"
  
  branch=$(git branch --show-current 2>/dev/null || echo "")
  if [ -n "$branch" ]; then
    echo "  ✅ Branche actuelle: $branch"
  fi
  
  # Vérifier si GitHub CLI est configuré
  if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    remote=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$remote" =~ github ]]; then
      echo "  ✅ Remote GitHub configuré"
    fi
  fi
else
  echo "  ⚠️  Pas un dépôt Git"
  WARNINGS=$((WARNINGS + 1))
fi

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résumé:"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "  ✅ Tout est OK!"
elif [ $ERRORS -eq 0 ]; then
  echo "  ✅ Outils essentiels: OK"
  echo "  ⚠️  $WARNINGS avertissement(s) (outils optionnels)"
else
  echo "  ❌ $ERRORS erreur(s) critique(s)"
  echo "  ⚠️  $WARNINGS avertissement(s)"
fi

echo ""
echo "💡 Commandes utiles:"
echo "   npm run ssh:setup check     - Vérifier les outils SSH"
echo "   npm run db:connect          - Tester la connexion DB"
echo "   npm run gh:actions status  - Voir le statut GitHub"

exit $ERRORS

