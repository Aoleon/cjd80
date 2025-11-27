#!/bin/bash

# Script de déploiement rapide
# Combine synchronisation SSH et déploiement GitHub Actions

set -e

# Charger les variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [OPTIONS]

Déploiement rapide: synchronise les fichiers et déclenche le déploiement.

Options:
  -h, --help          Afficher cette aide
  -e, --env ENV       Environnement (production, staging)
  -s, --server SERVER Serveur SSH (optionnel, pour sync directe)
  -b, --branch BRANCH Branche à déployer (défaut: main)
  --skip-sync         Ne pas synchroniser via SSH
  --skip-deploy       Ne pas déclencher le déploiement GitHub
  --dry-run           Simulation sans modifications

Exemples:
  $0 -e production
  $0 -e staging -b develop
  $0 -e production --skip-sync
  $0 -e production --dry-run
EOF
}

ENV="production"
BRANCH="main"
SERVER=""
SKIP_SYNC=false
SKIP_DEPLOY=false
DRY_RUN=false

# Parser les arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -e|--env)
      ENV="$2"
      shift 2
      ;;
    -s|--server)
      SERVER="$2"
      shift 2
      ;;
    -b|--branch)
      BRANCH="$2"
      shift 2
      ;;
    --skip-sync)
      SKIP_SYNC=true
      shift
      ;;
    --skip-deploy)
      SKIP_DEPLOY=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

echo "🚀 Déploiement rapide vers $ENV"
echo "   Branche: $BRANCH"
if [ "$DRY_RUN" = true ]; then
  echo "   Mode: simulation (dry-run)"
fi
echo ""

# Étape 1: Synchronisation SSH (si serveur spécifié)
if [ "$SKIP_SYNC" = false ] && [ -n "$SERVER" ]; then
  echo "📤 Étape 1: Synchronisation des fichiers..."
  if [ "$DRY_RUN" = true ]; then
    ./scripts/ssh-sync.sh push -s "$SERVER" --dry-run
  else
    ./scripts/ssh-sync.sh push -s "$SERVER"
  fi
  echo ""
fi

# Étape 2: Commit et push (si nécessaire)
if [ "$SKIP_DEPLOY" = false ]; then
  if git diff --quiet && git diff --cached --quiet; then
    echo "✅ Aucun changement à commiter"
  else
    echo "📝 Étape 2: Commit des changements..."
    if [ "$DRY_RUN" = false ]; then
      read -p "Message de commit: " commit_msg
      if [ -n "$commit_msg" ]; then
        git add -A
        git commit -m "$commit_msg"
        git push origin "$BRANCH"
        echo "✅ Changements poussés"
      fi
    else
      echo "   [DRY-RUN] Changements à commiter détectés"
    fi
    echo ""
  fi
fi

# Étape 3: Déploiement GitHub Actions
if [ "$SKIP_DEPLOY" = false ]; then
  echo "🚀 Étape 3: Déclenchement du déploiement..."
  if [ "$DRY_RUN" = true ]; then
    echo "   [DRY-RUN] Déploiement serait déclenché"
  else
    ./scripts/github-deploy.sh deploy -e "$ENV" -b "$BRANCH"
  fi
  echo ""
fi

echo "✅ Déploiement terminé"
echo "💡 Suivez le déploiement: npm run gh:actions watch"

