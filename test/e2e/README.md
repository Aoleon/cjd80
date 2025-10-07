# Tests E2E Playwright - Système de Rapport de Bugs Automatique

## 📋 Vue d'ensemble

Ce système intègre les tests Playwright E2E avec le système de gestion des bugs de l'application. Lorsqu'un test échoue, un rapport de bug est automatiquement créé dans l'onglet "Développement" de l'interface admin et synchronisé avec GitHub.

## 🚀 Utilisation

### Lancer les tests

```bash
# Exécuter tous les tests
npx playwright test

# Exécuter un test spécifique
npx playwright test admin-pagination

# Mode debug
npx playwright test --debug

# Mode UI (interface graphique)
npx playwright test --ui

# Mode headed (voir le navigateur)
npx playwright test --headed
```

### Lancer les tests avec rapport automatique de bugs

```bash
# Script complet qui exécute les tests ET importe les bugs automatiquement
./test/run-tests-and-report.sh

# Avec options Playwright
./test/run-tests-and-report.sh --headed
./test/run-tests-and-report.sh admin-pagination
```

### Importer manuellement les rapports de bugs

Si vous avez des rapports de bugs non importés (fichiers dans `test-results/bug-reports/`) :

```bash
tsx test/import-bug-reports.ts
```

## 🔧 Configuration

### Variables d'environnement (optionnelles)

Pour le script d'import :

```bash
# Email admin pour l'import des bugs
export ADMIN_EMAIL="admin@cjd-amiens.fr"

# Mot de passe admin
export ADMIN_PASSWORD="Admin123!"

# URL de l'API (par défaut: http://localhost:5000)
export API_URL="http://localhost:5000"
```

### Reporter Playwright

Le reporter personnalisé (`test/playwright-reporter.ts`) :
- Détecte automatiquement les tests en échec
- Extrait les informations d'erreur, stack traces et screenshots
- Détermine la priorité du bug automatiquement
- Sauvegarde les rapports dans `test-results/bug-reports/` si l'API n'est pas disponible

### Priorités automatiques

Les priorités sont déterminées automatiquement selon ces règles :

- **Critique** : Tests de pagination, affichage de données essentielles
- **Haute** : Tests de workflow, modales, responsive, timeouts
- **Moyenne** : Autres tests

## 📁 Structure des fichiers

```
test/
├── e2e/                              # Tests Playwright
│   ├── admin-pagination.spec.ts     # Tests pagination (5 tests)
│   ├── admin-workflow.spec.ts       # Tests workflow (8 tests)
│   └── README.md                    # Ce fichier
├── playwright-reporter.ts           # Reporter personnalisé
├── import-bug-reports.ts           # Script d'import des bugs
└── run-tests-and-report.sh         # Script wrapper tout-en-un

test-results/
├── bug-reports/                    # Rapports de bugs générés
│   └── bug-*.json                 # Fichiers JSON des bugs
└── .../                           # Autres résultats Playwright

playwright-report/                  # Rapport HTML Playwright
└── index.html
```

## 🐛 Fonctionnement du système de bugs

### 1. Détection d'échec

Quand un test échoue :
1. Le reporter Playwright capture automatiquement :
   - Nom du test
   - Fichier et ligne
   - Message d'erreur
   - Stack trace
   - Screenshot (si disponible)
   - Durée du test

### 2. Création du rapport

Le rapport de bug contient :
- **Titre** : `[E2E] Nom du test`
- **Description** : Détails complets de l'erreur avec formatage markdown
- **Type** : `bug` (automatique)
- **Priorité** : Déterminée automatiquement
- **Demandeur** : `Playwright E2E Reporter`

### 3. Sauvegarde locale

Si l'API n'est pas disponible, les rapports sont sauvegardés dans :
```
test-results/bug-reports/bug-{timestamp}.json
```

### 4. Import dans l'application

Le script `import-bug-reports.ts` :
1. Se connecte en tant qu'admin
2. Lit tous les fichiers JSON dans `test-results/bug-reports/`
3. Crée les demandes de développement via l'API
4. Supprime les fichiers après import réussi
5. Affiche un résumé

### 5. Synchronisation GitHub

Grâce au système existant, chaque bug importé :
- ✅ Crée automatiquement une issue GitHub
- ✅ Ajoute les labels appropriés (bug, priorité)
- ✅ Génère un lien vers l'issue
- ✅ Peut être synchronisé avec GitHub

## 📊 Accès aux bugs dans l'interface

1. Se connecter en tant qu'admin (super_admin)
2. Aller dans **Développement** (onglet admin)
3. Voir tous les bugs créés automatiquement par Playwright
4. Les bugs ont le préfixe `[E2E]` pour identification facile

## 🔍 Exemple de rapport de bug

```markdown
**Test échoué:** should display all 33 ideas in admin interface
**Fichier:** admin-pagination.spec.ts
**Ligne:** 19

**Message d'erreur:**
```
expect(received).toBe(expected)

Expected: 33
Received: 20
```

**Stack trace:**
```
Error: expect(received).toBe(expected)
    at /workspace/test/e2e/admin-pagination.spec.ts:34:25
```

**Screenshot:** /test-results/screenshot.png

**Durée du test:** 5432ms
**Statut:** failed

---
*Ce bug a été créé automatiquement par le reporter Playwright E2E*
```

## 🎯 Bonnes pratiques

1. **Lancer les tests régulièrement** pour détecter les régressions
2. **Utiliser le script wrapper** pour automatiser l'import des bugs
3. **Vérifier l'onglet Développement** après les tests
4. **Traiter les bugs critiques en priorité**
5. **Fermer les bugs dans GitHub** quand ils sont résolus

## 🛠️ Dépannage

### Les bugs ne s'importent pas ?

Vérifiez :
- ✅ Le serveur est en cours d'exécution (`npm run dev`)
- ✅ Les credentials admin sont corrects
- ✅ Les fichiers JSON existent dans `test-results/bug-reports/`

### Les tests échouent mais aucun rapport n'est créé ?

Vérifiez :
- ✅ Le reporter est bien configuré dans `playwright.config.ts`
- ✅ Le serveur API est accessible
- ✅ Les permissions d'écriture sur `test-results/`

### Comment désactiver le reporter automatique ?

Modifiez `playwright.config.ts` :
```typescript
reporter: [
  ['html'],
  // ['./test/playwright-reporter.ts'] // Commenter cette ligne
],
```

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [API de l'application](../server/routes.ts)
- [Système GitHub Integration](../server/utils/github-integration.ts)
