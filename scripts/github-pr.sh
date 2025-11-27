#!/bin/bash

# Script pour gérer les Pull Requests GitHub
# Simplifie la création, review et merge de PRs

set -e

# Fonction d'aide
show_help() {
  cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Gère les Pull Requests GitHub.

Commands:
  create              Créer une nouvelle PR
  list                Lister les PRs
  view PR_NUMBER      Voir une PR
  review PR_NUMBER    Ouvrir une PR pour review
  merge PR_NUMBER     Merger une PR
  close PR_NUMBER     Fermer une PR
  checkout PR_NUMBER  Checkout une PR localement

Options:
  -h, --help          Afficher cette aide
  -t, --title TITLE   Titre de la PR
  -b, --body BODY     Description de la PR
  -B, --base BRANCH   Branche de base (défaut: main)
  -H, --head BRANCH   Branche source (défaut: branche actuelle)
  -l, --label LABEL   Ajouter un label
  -r, --reviewer USER Ajouter un reviewer
  -s, --state STATE   Filtrer par état (open, closed, all)

Exemples:
  $0 create -t "Feature: Nouvelle fonctionnalité"
  $0 list
  $0 view 123
  $0 review 123
  $0 merge 123
  $0 checkout 123
EOF
}

# Vérifier que gh est installé et authentifié
check_gh() {
  if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé"
    exit 1
  fi
  
  if ! gh auth status &> /dev/null; then
    echo "⚠️  GitHub CLI n'est pas authentifié"
    exit 1
  fi
}

# Créer une PR
create_pr() {
  check_gh
  
  local title=""
  local body=""
  local base="main"
  local head=""
  local labels=()
  local reviewers=()
  
  # Parser les arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -t|--title)
        title="$2"
        shift 2
        ;;
      -b|--body)
        body="$2"
        shift 2
        ;;
      -B|--base)
        base="$2"
        shift 2
        ;;
      -H|--head)
        head="$2"
        shift 2
        ;;
      -l|--label)
        labels+=("$2")
        shift 2
        ;;
      -r|--reviewer)
        reviewers+=("$2")
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
  
  # Déterminer la branche source
  if [ -z "$head" ]; then
    head=$(git branch --show-current)
  fi
  
  if [ -z "$title" ]; then
    # Utiliser le dernier commit message comme titre
    title=$(git log -1 --pretty=%B | head -1)
  fi
  
  echo "📝 Création de la Pull Request..."
  echo "   De: $head"
  echo "   Vers: $base"
  echo "   Titre: $title"
  echo ""
  
  local pr_args="--base $base --head $head"
  
  if [ -n "$title" ]; then
    pr_args="$pr_args --title \"$title\""
  fi
  
  if [ -n "$body" ]; then
    pr_args="$pr_args --body \"$body\""
  fi
  
  for label in "${labels[@]}"; do
    pr_args="$pr_args --label \"$label\""
  done
  
  for reviewer in "${reviewers[@]}"; do
    pr_args="$pr_args --reviewer \"$reviewer\""
  done
  
  # Créer la PR
  gh pr create $pr_args
  
  if [ $? -eq 0 ]; then
    echo "✅ Pull Request créée"
  fi
}

# Lister les PRs
list_prs() {
  check_gh
  
  local state="${1:-open}"
  
  echo "📋 Pull Requests ($state):"
  echo ""
  
  gh pr list --state "$state" --limit 20
}

# Voir une PR
view_pr() {
  check_gh
  
  local pr_number="$1"
  
  if [ -z "$pr_number" ]; then
    echo "❌ Numéro de PR requis"
    exit 1
  fi
  
  gh pr view "$pr_number"
}

# Review une PR
review_pr() {
  check_gh
  
  local pr_number="$1"
  
  if [ -z "$pr_number" ]; then
    echo "❌ Numéro de PR requis"
    exit 1
  fi
  
  echo "👀 Ouverture de la PR #$pr_number pour review..."
  gh pr view "$pr_number" --web
}

# Merger une PR
merge_pr() {
  check_gh
  
  local pr_number="$1"
  local method="${2:-merge}" # merge, squash, rebase
  
  if [ -z "$pr_number" ]; then
    echo "❌ Numéro de PR requis"
    exit 1
  fi
  
  echo "🔀 Merge de la PR #$pr_number..."
  echo "   Méthode: $method"
  echo ""
  
  read -p "Confirmer le merge? (y/N): " confirm
  
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    gh pr merge "$pr_number" --$method --delete-branch
    
    if [ $? -eq 0 ]; then
      echo "✅ PR mergée avec succès"
    fi
  else
    echo "❌ Merge annulé"
  fi
}

# Fermer une PR
close_pr() {
  check_gh
  
  local pr_number="$1"
  
  if [ -z "$pr_number" ]; then
    echo "❌ Numéro de PR requis"
    exit 1
  fi
  
  echo "❌ Fermeture de la PR #$pr_number..."
  
  read -p "Confirmer? (y/N): " confirm
  
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    gh pr close "$pr_number"
    
    if [ $? -eq 0 ]; then
      echo "✅ PR fermée"
    fi
  else
    echo "❌ Fermeture annulée"
  fi
}

# Checkout une PR
checkout_pr() {
  check_gh
  
  local pr_number="$1"
  
  if [ -z "$pr_number" ]; then
    echo "❌ Numéro de PR requis"
    exit 1
  fi
  
  echo "📥 Checkout de la PR #$pr_number..."
  
  gh pr checkout "$pr_number"
  
  if [ $? -eq 0 ]; then
    echo "✅ PR checkoutée"
  fi
}

# Main
COMMAND="${1:-help}"
shift || true

case "$COMMAND" in
  create)
    create_pr "$@"
    ;;
  list)
    STATE="${1:-open}"
    list_prs "$STATE"
    ;;
  view)
    PR_NUMBER="$1"
    view_pr "$PR_NUMBER"
    ;;
  review)
    PR_NUMBER="$1"
    review_pr "$PR_NUMBER"
    ;;
  merge)
    PR_NUMBER="$1"
    METHOD="${2:-merge}"
    merge_pr "$PR_NUMBER" "$METHOD"
    ;;
  close)
    PR_NUMBER="$1"
    close_pr "$PR_NUMBER"
    ;;
  checkout)
    PR_NUMBER="$1"
    checkout_pr "$PR_NUMBER"
    ;;
  -h|--help|help)
    show_help
    ;;
  *)
    echo "❌ Commande inconnue: $COMMAND"
    show_help
    exit 1
    ;;
esac

