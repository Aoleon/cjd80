# Outils Playwright - Guide Complet

Ce document décrit les outils créés pour améliorer la gestion et l'analyse des tests Playwright.

## 🛠️ Scripts Disponibles

### 1. **playwright-test.sh** - Gestion des Tests

Interface enrichie pour exécuter, déboguer et gérer les tests Playwright.

```bash
# Exécuter tous les tests
npm run test:playwright run

# Exécuter un fichier spécifique
npm run test:playwright run -f tests/e2e/login.spec.ts

# Filtrer par pattern
npm run test:playwright run -g "login"

# Mode UI interactif
npm run test:playwright ui

# Déboguer un test
npm run test:playwright debug -f tests/e2e/login.spec.ts

# Ouvrir le rapport
npm run test:playwright report

# Visualiser une trace
npm run test:playwright trace trace.zip

# Générer du code de test
npm run test:playwright codegen http://localhost:5001

# Prendre des captures d'écran
npm run test:playwright screenshot http://localhost:5001

# Lister tous les tests
npm run test:playwright list

# Surveiller et réexécuter
npm run test:playwright watch
```

**Options avancées:**
```bash
# Mode headed (voir le navigateur)
npm run test:playwright run --headed

# Activer le tracing
npm run test:playwright run --trace

# Activer l'enregistrement vidéo
npm run test:playwright run --video

# Prendre des captures d'écran
npm run test:playwright run --screenshot

# Nombre de tentatives
npm run test:playwright run --retries 3

# Timeout personnalisé
npm run test:playwright run --timeout 60000

# Mettre à jour les snapshots
npm run test:playwright run --update-snapshots
```

### 2. **playwright-analyze.sh** - Analyse des Résultats

Analyse les résultats des tests pour obtenir des statistiques, détecter les problèmes et suivre les tendances.

```bash
# Statistiques des tests
npm run test:analyze stats

# Analyser les échecs
npm run test:analyze failures

# Tendances sur plusieurs exécutions
npm run test:analyze trends --since 2025-01-01

# Détecter les tests instables (flaky)
npm run test:analyze flaky

# Comparer deux exécutions
npm run test:analyze compare report1 report2
```

**Fonctionnalités:**
- Statistiques détaillées (total, réussis, échoués, ignorés)
- Taux de réussite
- Analyse des traces d'échec
- Détection des tests instables
- Comparaison entre exécutions

### 3. **playwright-maintenance.sh** - Maintenance

Nettoie, optimise et maintient les tests Playwright.

```bash
# Nettoyer les rapports et artefacts
npm run test:maintenance clean

# Mettre à jour Playwright et les navigateurs
npm run test:maintenance update

# Installer les navigateurs
npm run test:maintenance install

# Valider la configuration
npm run test:maintenance validate

# Optimiser les tests
npm run test:maintenance optimize

# Vérifier l'état
npm run test:maintenance check
```

**Options:**
```bash
# Forcer sans confirmation
npm run test:maintenance clean --force

# Simulation (dry-run)
npm run test:maintenance clean --dry-run
```

## 📋 Workflows Recommandés

### Développement Quotidien

```bash
# 1. Exécuter les tests en mode UI
npm run test:playwright ui

# 2. Déboguer un test spécifique
npm run test:playwright debug -f tests/e2e/my-test.spec.ts

# 3. Voir les résultats
npm run test:playwright report
```

### CI/CD

```bash
# 1. Exécuter tous les tests
npm run test:playwright run

# 2. Analyser les résultats
npm run test:analyze stats
npm run test:analyze failures

# 3. Nettoyer après exécution
npm run test:maintenance clean
```

### Maintenance Hebdomadaire

```bash
# 1. Vérifier l'état
npm run test:maintenance check

# 2. Mettre à jour
npm run test:maintenance update

# 3. Optimiser
npm run test:maintenance optimize

# 4. Détecter les tests instables
npm run test:analyze flaky
```

## 🎯 Fonctionnalités Avancées

### Mode UI Interactif

L'UI Playwright permet de :
- Voir tous les tests en temps réel
- Exécuter des tests individuellement
- Voir les résultats instantanément
- Déboguer visuellement

```bash
npm run test:playwright ui
```

### Débogage

Le mode debug ouvre le navigateur avec les DevTools pour :
- Voir le code exécuté
- Inspecter les éléments
- Suivre l'exécution pas à pas

```bash
npm run test:playwright debug -f tests/e2e/test.spec.ts
```

### Génération de Code

Génère automatiquement du code de test en interagissant avec le navigateur :

```bash
npm run test:playwright codegen http://localhost:5001
```

### Traces

Les traces permettent de :
- Voir exactement ce qui s'est passé
- Rejouer l'exécution
- Analyser les performances

```bash
# Exécuter avec traces
npm run test:playwright run --trace

# Visualiser une trace
npm run test:playwright trace trace.zip
```

## 📊 Analyse et Reporting

### Statistiques

```bash
npm run test:analyze stats
```

Affiche :
- Nombre total de tests
- Tests réussis/échoués/ignorés
- Taux de réussite
- Nombre de fichiers de test

### Analyse des Échecs

```bash
npm run test:analyze failures
```

Identifie :
- Traces d'échec disponibles
- Captures d'écran d'échec
- Fichiers de trace à visualiser

### Détection des Tests Instables

```bash
npm run test:analyze flaky
```

Détecte :
- Tests avec attentes fixes
- Tests suspects
- Patterns problématiques

## 🔧 Maintenance

### Nettoyage

Supprime :
- Rapports anciens
- Traces
- Captures d'écran
- Vidéos
- Cache

```bash
npm run test:maintenance clean
```

### Mise à Jour

Met à jour :
- Playwright
- Navigateurs
- Dépendances système

```bash
npm run test:maintenance update
```

### Optimisation

Recommandations pour :
- Sélecteurs stables
- Éviter les attentes fixes
- Réutilisation avec fixtures
- Parallélisation
- Snapshots

```bash
npm run test:maintenance optimize
```

## 💡 Astuces

### Alias Utiles

Ajoutez dans `~/.zshrc` ou `~/.bashrc`:

```bash
alias pt='npm run test:playwright'
alias pta='npm run test:analyze'
alias ptm='npm run test:maintenance'
```

### Intégration CI/CD

```yaml
# GitHub Actions example
- name: Run Playwright tests
  run: npm run test:playwright run

- name: Analyze results
  run: npm run test:analyze stats

- name: Upload reports
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Performance

Pour améliorer les performances :
- Utiliser `--workers` pour paralléliser
- Éviter les attentes fixes
- Utiliser des sélecteurs optimisés
- Réduire les timeouts si possible

```bash
npm run test:playwright run --workers 4
```

## 🆘 Dépannage

### Tests qui échouent de manière intermittente

```bash
# Détecter les tests instables
npm run test:analyze flaky

# Exécuter avec retries
npm run test:playwright run --retries 3
```

### Problèmes de sélecteurs

```bash
# Générer du code avec codegen
npm run test:playwright codegen http://localhost:5001
```

### Navigateurs non installés

```bash
npm run test:maintenance install
```

### Configuration invalide

```bash
npm run test:maintenance validate
```

## 📚 Documentation Complète

- **Playwright officiel:** https://playwright.dev
- **Documentation API:** https://playwright.dev/docs/api/class-playwright
- **Best practices:** https://playwright.dev/docs/best-practices




