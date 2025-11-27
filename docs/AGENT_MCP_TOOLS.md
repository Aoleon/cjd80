# Matrice MCP – Rôles & outils

Ce document liste les serveurs MCP disponibles et indique quels rôles doivent
les utiliser, avec les commandes typiques.

| Rôle | Serveurs/Outils MCP | Cas d’usage principaux |
| --- | --- | --- |
| Architecte | `mcp-ssh-server`, `mcp-github-server`, `cursor-chat-history(-custom)`, `mcp-minio-server`, `mcp-authentik-server`, `mcp-listmonk-server` | Vérifier déploiements, orchestrer SSO et notifications |
| Développeur | `mcp-devtools-server`, `mcp-docker-server`, `mcp-postgres-server`, `mcp-drizzle-server`, `mcp-minio-server`, `mcp-graphql-server`, `mcp-redis-server`, `mcp-authentik-server`, `mcp-listmonk-server` | Implémentation, migrations, stockage d’artefacts, APIs GraphQL/Redis, provisioning Authentik, campagnes Listmonk |
| Testeur | `mcp-playwright-server`, `mcp-devtools-server`, `mcp-minio-server`, `mcp-graphql-server`, `mcp-authentik-server`, `mcp-listmonk-server`, `mcp-gotify-server` | Tests E2E, vérification flows Authentik, scénarios de notifications email + push |
| Analyste | `mcp-postgres-server`, `mcp-docker-server`, `cursor-chat-history(-custom)`, `mcp-minio-server`, `mcp-graphql-server`, `mcp-redis-server`, `mcp-authentik-server`, `mcp-listmonk-server`, `mcp-gotify-server` | RCA, audit SSO, analyse campagnes/emails/push |
| Coordinateur | `mcp-github-server`, `mcp-ssh-server`, `cursor-chat-history(-custom)`, `mcp-minio-server`, `mcp-graphql-server`, `mcp-redis-server`, `mcp-authentik-server`, `mcp-listmonk-server`, `mcp-gotify-server` | Déploiements, SSO/providers Authentik, notifications Listmonk/Gotify |

## Commandes de référence

### Docker / Devtools (Développeur)
```json
{
  "tool": "docker_compose",
  "projectDir": "/Users/thibault/Dev/paperbridge",
  "composeFiles": ["docker-compose.yml", "docker-compose.local.yml"],
  "composeCommand": "up -d api db",
  "envFile": ".env.local"
}
```

```json
{
  "tool": "python_run",
  "projectPath": "/Users/thibault/Dev/pns-gen",
  "scriptPath": "scripts/check_local_v_env.py",
  "venvPath": ".venv"
}
```

### Tests (Testeur)
```json
{
  "tool": "playwright_run_tests",
  "projectPath": "/Users/thibault/Dev/JLM App/jlm-app",
  "configFile": "playwright.config.ts",
  "project": "journeys",
  "reporter": "html",
  "retries": 2
}
```

### GitHub / SSH (Architecte & Coordinateur)
```json
{
  "tool": "github_trigger_workflow",
  "owner": "saxium-dev",
  "repo": "paperbridge",
  "workflowId": "deploy.yml",
  "ref": "main"
}
```

```json
{
  "tool": "ssh_execute",
  "connectionId": "prod-ssh",
  "command": "docker ps --filter name=paperbridge"
}
```

### Historique Cursor (tous rôles pour rétro)
```json
{
  "tool": "analyze_improvement_patterns",
  "projectPath": "/Users/thibault/Dev/JLM App/jlm-app",
  "analysisType": "patterns",
  "limit": 100,
  "recentDays": 30
}
```

### Stockage d'artefacts (MinIO)
```json
{
  "tool": "minio_put_object",
  "bucketName": "deploy-artifacts",
  "objectName": "builds/app.tar.gz",
  "contentBase64": "<...>",
  "contentType": "application/gzip"
}
```

```json
{
  "tool": "minio_presigned_url",
  "bucketName": "deploy-artifacts",
  "objectName": "builds/app.tar.gz",
  "expirySeconds": 3600
}
```

### Backend GraphQL (si utilisé)
```json
{
  "tool": "graphql_query",
  "query": "query ($limit:Int!){ projects(limit:$limit){ id name status } }",
  "variables": { "limit": 10 }
}
```

```json
{
  "tool": "graphql_mutation",
  "mutation": "mutation ($id: uuid!){ archive_project(id:$id){ id } }",
  "variables": { "id": "..." }
}
```

### Redis (cache, queue)

```json
{
  "tool": "redis_command",
  "command": "LRANGE",
  "args": ["deploy_queue", "0", "10"]
}
```

### Authentik (SSO)

```json
{
  "tool": "authentik_list_objects",
  "resource": "/api/v3/providers/oauth2/",
  "query": { "ordering": "name" }
}
```

```json
{
  "tool": "authentik_create_object",
  "resource": "/api/v3/providers/oauth2/",
  "payload": {
    "name": "cursor-app",
    "client_type": "confidential",
    "client_id": "cursor-app",
    "client_secret": "<generated>"
  }
}
```

### Listmonk (emails / notifications)

```json
{
  "tool": "listmonk_create_campaign",
  "payload": {
    "name": "Release Notes",
    "subject": "[Release] v0.9",
    "body": "<h1>Changelog</h1>...",
    "lists": [1],
    "type": "regular"
  }
}
```

### Gotify (notifications internes)

```json
{
  "tool": "gotify_send_message",
  "title": "[Build] Déployé",
  "message": "La release 0.9 est disponible sur staging",
  "priority": 5
}
```

```json
{
  "tool": "gotify_list_messages",
  "limit": 50
}
```

## Bonnes pratiques
 
- Toujours authentifier GitHub (`github_authenticate`) avant de relancer un
  workflow ou d’en lire les logs.
- Utiliser `cursor-chat-history-custom` pour synchroniser régulièrement les
  conversations (déjà intégré dans `scripts/autonomous-run.ts` via `sync_conversations`).
- Passer par `mcp-devtools-server` plutôt que des commandes shell directes
  pour garder la traçabilité (formatters, lint, tests unitaires).
- Exploiter `mcp-minio-server` pour stocker/report les artefacts (rapports
  Playwright, dumps, backups) plutôt que de les laisser sur la machine locale.
- Utiliser `mcp-graphql-server` pour les APIs GraphQL (si utilisé), `mcp-redis-server` pour les files caches, `mcp-authentik-server` pour le SSO, `mcp-listmonk-server` pour les emails et `mcp-gotify-server` pour les notifications internes.
- Documenter les appels MCP significatifs dans `AGENT_EVENTS.json` via les
  scripts (`autonomous-run`, `manage-agent-tasks`, etc.).
- **Stack locale obligatoire via Docker** : Redis, Authentik, MinIO, Listmonk, Gotify, Traefik/Nginx et la stack monitoring tournent dans `docker-compose`. Avant d'utiliser les MCP ci-dessus, démarrer/rafraîchir via `mcp-docker-server` :
  ```json
  {
    "tool": "docker_compose",
    "projectDir": "/Users/thibault/Dev/langgraph-agents",
    "composeFiles": ["docker-compose.yml"],
    "composeCommand": "up -d redis authentik minio listmonk gotify traefik prometheus grafana loki"
  }
  ```
  Utilisez `docker_compose_logs` et `docker_compose_ps` pour vérifier l'état des services.
```json
{
  "tool": "listmonk_trigger_transactional",
  "payload": {
    "subscriber_email": "user@example.com",
    "content_type": "text/html",
    "subject": "Votre build est prêt",
    "body": "<p>Bonjour, ...</p>"
  }
}
```
