# Index Complet des Outils

Index de référence rapide de tous les outils disponibles dans le projet.

## 📋 Vue d'Ensemble

**Total: 21 scripts** organisés en 8 catégories

## 🗄️ Base de Données (3 scripts)

| Commande | Description |
|----------|-------------|
| `npm run db:connect` | Connexion interactive (pgcli) |
| `npm run db:monitor` | Monitoring temps réel (pg_activity) |
| `npm run db:stats` | Statistiques détaillées |

**Documentation:** `docs/database-tools.md`

## 🔐 SSH (5 scripts)

| Commande | Description |
|----------|-------------|
| `npm run ssh:connect` | Connexion SSH interactive |
| `npm run ssh:setup` | Configuration et vérification |
| `npm run ssh:sync` | Synchronisation de fichiers |
| `npm run ssh:tunnel` | Tunnels SSH (port forwarding) |
| `npm run ssh:mount` | Montage système de fichiers |

**Documentation:** `docs/ssh-and-github-tools.md`

## ☁️ GitHub Actions (4 scripts)

| Commande | Description |
|----------|-------------|
| `npm run gh:actions` | Gestion des workflows |
| `npm run gh:deploy` | Déploiement via GitHub Actions |
| `npm run gh:pr` | Gestion des Pull Requests |
| `npm run gh:auth` | Authentification GitHub |

**Documentation:** `docs/ssh-and-github-tools.md`

## 🐳 Docker (4 scripts)

| Commande | Description |
|----------|-------------|
| `npm run docker` | Gestion des conteneurs |
| `npm run docker:monitor` | Monitoring temps réel |
| `npm run docker:backup` | Sauvegarde/restauration |
| `npm run docker:dev` | Commandes développement |

**Documentation:** `docs/docker-tools.md`

## 🚀 Déploiement (1 script)

| Commande | Description |
|----------|-------------|
| `npm run deploy:full` | Déploiement complet (Docker + SSH + GitHub) |

**Documentation:** `docs/deployment-tools.md`

## 📊 Monitoring (1 script)

| Commande | Description |
|----------|-------------|
| `npm run monitor` | Monitoring système global |

**Documentation:** `docs/deployment-tools.md`

## 🔧 Maintenance (1 script)

| Commande | Description |
|----------|-------------|
| `npm run maintenance` | Maintenance automatique |

**Documentation:** `docs/deployment-tools.md`

## 🧪 Tests Playwright (3 scripts)

| Commande | Description |
|----------|-------------|
| `npm run test:playwright` | Gestion des tests (run, ui, debug, etc.) |
| `npm run test:analyze` | Analyse des résultats (stats, failures, flaky) |
| `npm run test:maintenance` | Maintenance (clean, update, validate) |

**Documentation:** `docs/playwright-tools.md`

## 🛠️ Utilitaires (2 scripts)

| Commande | Description |
|----------|-------------|
| `npm run health` | Vérification de santé globale |
| `npm run deploy` | Déploiement rapide (alias) |

**Documentation:** `README-TOOLS.md`

## 🎯 Workflows Recommandés

### Développement Quotidien

```bash
# 1. Vérification
npm run health

# 2. Démarrer l'environnement
npm run docker:dev dev

# 3. Monitoring
npm run docker:monitor watch
```

### Déploiement Production

```bash
# 1. Vérification
npm run maintenance check

# 2. Sauvegarde
npm run maintenance backup

# 3. Déploiement
npm run deploy:full full -e production -s production --build --migrate

# 4. Monitoring
npm run monitor watch
```

### Maintenance Hebdomadaire

```bash
# Maintenance complète
npm run maintenance full
```

## 📚 Documentation Complète

- **Base de données:** `docs/database-tools.md`
- **SSH et GitHub:** `docs/ssh-and-github-tools.md`
- **Docker:** `docs/docker-tools.md`
- **Déploiement:** `docs/deployment-tools.md`
- **Référence rapide:** `docs/QUICK_REFERENCE.md`
- **Guide complet:** `README-TOOLS.md`

## 🔍 Recherche Rapide

### Par Action

**Connexion:**
- `npm run db:connect` - Base de données
- `npm run ssh:connect` - Serveur SSH
- `npm run docker:dev shell` - Conteneur Docker

**Monitoring:**
- `npm run db:monitor` - Base de données
- `npm run docker:monitor watch` - Docker
- `npm run monitor overview` - Système global

**Déploiement:**
- `npm run docker up` - Local
- `npm run deploy:full remote` - Distant
- `npm run deploy:full github` - GitHub Actions

**Sauvegarde:**
- `npm run docker:backup backup` - Volumes Docker
- `npm run maintenance backup` - Système complet

**Nettoyage:**
- `npm run docker clean` - Docker
- `npm run maintenance clean` - Système complet

## 💡 Astuces

### Alias Utiles

Ajoutez dans `~/.zshrc` ou `~/.bashrc`:

```bash
alias dk='npm run docker'
alias dkm='npm run docker:monitor'
alias dkb='npm run docker:backup'
alias dkd='npm run docker:dev'
alias dep='npm run deploy:full'
alias mon='npm run monitor'
alias maint='npm run maintenance'
```

### Scripts Personnalisés

Créez vos propres scripts dans `scripts/` et ajoutez-les à `package.json`:

```json
"scripts": {
  "custom:command": "./scripts/my-script.sh"
}
```

## 🆘 Aide Rapide

Pour l'aide d'un script spécifique:

```bash
npm run docker help
npm run deploy:full help
npm run maintenance help
```

Ou consultez la documentation complète dans `docs/`.

