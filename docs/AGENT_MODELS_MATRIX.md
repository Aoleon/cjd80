# Matrice des Modèles IA par Rôle

Cette matrice décrit les modèles IA disponibles pour chaque rôle du système de
sub-agents ainsi que leurs cas d'usage. Elle permet au coordinateur de déléguer
rapidement les tâches au meilleur modèle tout en gardant un plan de repli pour
les scénarios à forte complexité ou à forte contrainte de coût.

| Rôle        | Modèle principal | Modèles spécialisés | Modèles fallback | Cas d'usage clés |
|-------------|-----------------|---------------------|------------------|------------------|
| Architect   | `codex-5.1`     | `gpt-5` (revues critiques), `o3-mini-high` (analyse rapide) | `claude-sonnet-4` | Supervision globale, revues d'architecture, migration et dette /
| Developer   | `gpt-5`         | `codex-5.1` (refactoring massif), `o3-mini` (implémentations rapides) | `claude-sonnet-4` | Implémentation, refactoring, corrections bugs |
| Tester      | `claude-sonnet-4` | `gpt-5` (tests E2E complexes), `o3-mini` (génération tests unitaires) | `gpt-4.1-mini` | Génération/exécution de tests, debug |
| Analyst     | `gpt-5`         | `o3-mini-high` (profiling), `codex-5.1` (analyse code smell) | `claude-sonnet-4` | Analyse de performances, RCA, optimisations |
| Coordinator | `claude-sonnet-4` | `gpt-5` (orchestration maxi run), `o3-mini` (coordination légère) | `gpt-4.1-mini` | Planification, handover, suivi autonomie |

**Guidelines :**

1. **Sélection dynamique** : chaque rôle choisit automatiquement son modèle en
   fonction de la complexité (`complexityScore`), du budget temps et des erreurs
   précédentes. 
2. **Escalade** : en cas d'échec ou de blocage, l'agent remonte d'abord vers
   un modèle spécialisé avant de solliciter un fallback.
3. **Optimisation coût/perf** : `Coordinator` et `Developer` peuvent basculer
   vers des modèles plus économiques (`o3-mini`, `gpt-4.1-mini`) lorsqu'ils
   exécutent des tâches répétitives ou bien balisées.
4. **Traçabilité** : chaque changement de modèle est enregistré dans
   `AGENT_COORDINATION_STATE.json` pour alimenter l'analyse continue.

Références :
- `docs/AGENT_ROLES_CONFIG.json` (configuration détaillée)
- `docs/AUTONOMOUS_RUN_PROTOCOL.md` (séquençage complet des runs)
