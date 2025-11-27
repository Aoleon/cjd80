# Protocole d'exécution autonome – Cursor + Sub-Agents

Ce protocole décrit comment l'agent Cursor principal (Architecte / Coordinateur)
orchestre des runs end-to-end en autonomie complète : analyse, design,
développement, tests et déploiement.

## 1. Préparation (Coordinator + Architect)
1. **Scan du contexte** (`activeContext.md`, `projectbrief.md`, historique MCP).
2. **Activation sub-agents** selon la matrice de rôles (`sub-agents-roles.md`).
3. **Sélection des modèles** via `AGENT_MODELS_MATRIX.md`.
4. **Initialisation** `AGENT_COORDINATION_STATE.json` (phase `discover`).

## 2. Phase Discover → Architect
- Analyse métier + architecture globale.
- Définition du backlog de todos atomic via `todo_write`.
- Vérification des dépendances, SLA (`slaHours`) et risques (chaque tâche du backlog liste désormais les `dependencies` bloquantes).
- Mise à jour `AGENT_TASKS_QUEUE.json` avec priorités.

## 3. Phase Plan → Coordinator
- Séquençage des rôles (workflow standard ou spécialisé).
- Validation que toutes les dépendances des tâches candidates sont `completed` avant de les confier à un sub-agent.
- Activation éventuelle de sous-flux parallèles (ex: tests en avance).
- Publication plan dans `AGENT_COORDINATION_STATE.json`.

## 4. Phase Build → Developer
- Implémentation autonome (réutilisation de patterns, detection code similaire).
- Appels automatiques aux MCP (Docker, Postgres, GitHub, etc.).
- Vérifications lint/tests unitaires ciblés.
- Mise à jour du statut de la tâche dans la queue.

## 5. Phase Test → Tester
- Génération/ajustement de suites (Pytest, Vitest, Playwright).
- Exécution complète via `scripts/playwright-runner.ts` (configurable via `config/playwright.matrix.json`).
- Analyse des traces/artefacts et log des échecs.
- Validation gate : impossible de passer à Deploy sans tests verts.
- `scripts/autonomous-run.ts --action phase --phase test` déclenche
  automatiquement le runner avancé qui applique les presets du projet
  (désactivable via `--skip-tests`).
  (désactivable via `--skip-tests`).

## 6. Phase Analyze → Analyst
- RCA si échec, optimisations (perf, dette technique, sécurité).
- Boucle corrective automatique (retour Developer si nécessaire).
- Documentation des apprentissages (`docs/` + `AGENT_EVENTS.json`).

## 7. Phase Deploy → Coordinator
- Pré-check Docker/GitHub Actions.
- Déploiement orchestré via MCP SSH/GitHub/docker compose.
- Vérification post-deploy (healthcheck, logs, migrations).
- Mise à jour finale `AGENT_COORDINATION_STATE.json` (`status: completed`).

## 8. Phase Retro → Architect + Coordinator
- Analyse des metrics temps/qualité (MCP chat history, `cursor-conversations`).
- Identification d'améliorations (détection patterns via `analyze_improvement_patterns` + `scripts/agent-feedback-loop.ts` qui alimente `docs/AGENT_AUTOMATED_FEEDBACK.md`).
- Ajout d'actions dans backlog/dette technique.

## Utilitaire CLI

- Démarrer un run autonome :
  ```bash
  npx tsx scripts/autonomous-run.ts --action start --task "Feature X" --project /Users/thibault/Dev/game-plug --history-sync --history-limit=100
  ```
  *(si `--task` est omis, l’agent prend automatiquement la première tâche `pending` de `AGENT_TASKS_QUEUE.json`).*
  ```bash
  # pour viser une tâche existante
  npx tsx scripts/autonomous-run.ts --action start --task-id task-123
  ```
- Changer de phase :
  ```bash
  npx tsx scripts/autonomous-run.ts --action phase --phase build
  ```
- Clore le run :
  ```bash
  npx tsx scripts/autonomous-run.ts --action complete --no-update-metrics=false
  ```
- Exécuter uniquement la collecte métriques :
  ```bash
  npx tsx scripts/update-agent-metrics.ts
  ```
- Ignorer temporairement l'exécution Playwright lors de la phase `test` :
  ```bash
  npx tsx scripts/autonomous-run.ts --action phase --phase test --skip-tests
  ```
- Générer le rapport d'insights :
  ```bash
  npx tsx scripts/generate-agent-insights.ts
  ```
- Gérer la file des tâches :
  ```bash
  # Ajout
  npx tsx scripts/manage-agent-tasks.ts --action add --title "Hotfix API" --role developer --priority high --project /Users/thibault/Dev/langgraph-agents
  # Liste
  npx tsx scripts/manage-agent-tasks.ts --action list
  # Clôture
  npx tsx scripts/manage-agent-tasks.ts --action complete --id task-123 --notes "Tests verts"
  ```

## Synchronisation multi-projet

Utiliser le script de réplication pour diffuser la configuration centrale :

```bash
npx tsx scripts/sync-central-cursor-config.ts
# ou avec une liste personnalisée
CURSOR_CONFIG_TARGETS="/path/projetA,/path/projetB" npx tsx scripts/sync-central-cursor-config.ts
```

## Audit configuration

Vérifier et réparer les écarts de configuration :

```bash
npx tsx scripts/audit-autonomous-config.ts --targets=/path/projetA,/path/projetB --fix
```

## Règles d'autonomie
- **Aucun arrêt prématuré** : la boucle continue jusqu'à `todos == 0` et
  validations de chaque gate (Plan → Build → Test → Deploy → Retro).
- **Communication structurée** : chaque handoff inclut contexte + résultats +
  décisions dans `AGENT_EVENTS.json`.
- **Escalade** : en cas de blocage, l'agent change de modèle (voir matrice) et
  relance le rôle concerné avant de solliciter l'Architecte.
- **Historisation** : chaque run loggue son identifier (`sessionId`) et les
  phases traversées pour alimenter l'amélioration continue.

Références :
- `.cursor/rules/sub-agents-orchestration.md`
- `.cursor/rules/autonomous-workflows.md`
- `docs/AGENT_ROLES_CONFIG.json`
- `docs/AGENT_MODELS_MATRIX.md`
- `docs/AGENT_COORDINATION_STATE.json`
