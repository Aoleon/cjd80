#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGETS_ARG=""

for arg in "$@"; do
  case "$arg" in
    --targets=*)
      TARGETS_ARG="$arg"
      ;;
  esac
done

cd "$REPO_ROOT"

echo "🌱 [cron] Harmonisation des .env partagés..."
npx tsx scripts/ensure-shared-env.ts ${TARGETS_ARG:+$TARGETS_ARG}

echo "🔐 [cron] Agrégation des connexions SSH..."
npx tsx scripts/aggregate-ssh-connections.ts ${TARGETS_ARG:+$TARGETS_ARG}

echo "🔁 [cron] Synchronisation de la configuration centrale..."
npx tsx scripts/sync-central-cursor-config.ts ${TARGETS_ARG:+$TARGETS_ARG}

echo "🧪 [cron] Audit des projets..."
npx tsx scripts/audit-autonomous-config.ts ${TARGETS_ARG:+$TARGETS_ARG} --fix --json

echo "📈 [cron] Mise à jour des métriques..."
npx tsx scripts/update-agent-metrics.ts

echo "🧠 [cron] Boucle de feedback"
npx tsx scripts/agent-feedback-loop.ts

echo "✅ Routine autonome terminée"
