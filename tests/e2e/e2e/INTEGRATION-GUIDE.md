# Guide d'Intégration - Tests E2E ↔ Système de Bugs Admin

## 🎯 Vue d'ensemble

Ce guide explique comment le système de tests E2E Playwright s'intègre automatiquement avec l'onglet **Développement** de l'interface admin pour créer des rapports de bugs synchronisés avec GitHub.

## 🔄 Workflow Complet

```
┌─────────────────┐
│  Tests E2E      │
│  Playwright     │
└────────┬────────┘
         │ (échec détecté)
         ↓
┌─────────────────────────────────┐
│  Reporter Personnalisé          │
│  test/playwright-reporter.ts    │
│                                 │
│  • Capture erreur + stack       │
│  • Capture screenshot           │
│  • Détermine priorité auto      │
│  • Sauvegarde JSON local        │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Script d'Import                │
│  test/import-bug-reports.ts     │
│                                 │
│  • Connexion admin              │
│  • Lecture fichiers JSON        │
│  • POST /api/admin/dev-requests │
│  • Suppression fichiers après   │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Interface Admin                │
│  Onglet "Développement"         │
│                                 │
│  • Affichage bug avec [E2E]     │
│  • Détails erreur formatés      │
│  • Lien vers screenshot         │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  GitHub Issues                  │
│  server/utils/github-int...     │
│                                 │
│  • Issue auto-créée             │
│  • Labels: bug + priorité       │
│  • Description formatée         │
└─────────────────────────────────┘
```

## 📦 Installation & Configuration

### 1. Prérequis installés

✅ Playwright v1.56.0  
✅ @playwright/test  
✅ Navigateur Chromium  
✅ Reporter personnalisé  
✅ Script d'import  

### 2. Variables d'environnement (optionnel)

Pour le script d'import, vous pouvez configurer :

```bash
# .env ou export dans le shell
export ADMIN_EMAIL="admin@cjd-amiens.fr"
export ADMIN_PASSWORD="Admin123!"
export API_URL="http://localhost:5000"
```

Par défaut, le script utilise les valeurs ci-dessus.

## 🚀 Utilisation Quotidienne

### Option 1 : Workflow Automatique (Recommandé)

```bash
# Exécute les tests ET importe automatiquement les bugs
./test/run-tests-and-report.sh

# Avec options Playwright spécifiques
./test/run-tests-and-report.sh --headed
./test/run-tests-and-report.sh admin-pagination
./test/run-tests-and-report.sh --debug
```

Le script :
1. ✅ Lance tous les tests
2. 📊 Détecte les échecs
3. 💾 Génère les rapports JSON
4. 🔐 Se connecte en admin
5. 📤 Importe dans l'interface
6. 🗑️ Nettoie les fichiers importés
7. 📈 Affiche un résumé

### Option 2 : Workflow Manuel

```bash
# Étape 1 : Lancer les tests
npx playwright test

# Étape 2 : Importer les bugs (si des tests ont échoué)
tsx test/import-bug-reports.ts
```

### Option 3 : Tests Spécifiques

```bash
# Un seul fichier de test
npx playwright test admin-pagination

# Un test spécifique par nom
npx playwright test --grep "should display all 33 ideas"

# Mode debug (pas à pas)
npx playwright test --debug

# Mode UI (interface graphique)
npx playwright test --ui

# Mode headed (navigateur visible)
npx playwright test --headed
```

## 📊 Accès aux Bugs dans l'Interface

### 1. Se connecter en admin

- Email : `admin@cjd-amiens.fr`
- Mot de passe : `Admin123!`
- Ou utilisez `thibault@youcom.io` (super_admin)

### 2. Naviguer vers l'onglet Développement

Interface Admin → **Développement** (uniquement pour super_admin)

### 3. Identifier les bugs E2E

Les bugs créés automatiquement par Playwright ont :
- ✅ Titre préfixé par `[E2E]`
- ✅ Demandeur : "Playwright E2E Reporter"
- ✅ Type : Bug
- ✅ Priorité : Critique / Haute / Moyenne (automatique)

### 4. Voir les détails

Chaque bug contient :
- Nom du test échoué
- Fichier et numéro de ligne
- Message d'erreur complet
- Stack trace
- Chemin vers le screenshot (si disponible)
- Durée du test
- Statut de l'échec (failed / timedOut)

### 5. Synchronisation GitHub

Si configuré, chaque bug :
- Crée automatiquement une GitHub Issue
- Ajoute les labels appropriés
- Génère un lien cliquable vers l'issue

## 🔧 Configuration Avancée

### Modifier les priorités automatiques

Éditez `test/playwright-reporter.ts` :

```typescript
private determinePriority(test: TestCase, result: TestResult) {
  const testName = test.title.toLowerCase();
  
  // Vos règles personnalisées
  if (testName.includes('critical')) return 'critical';
  if (testName.includes('payment')) return 'high';
  
  return 'medium';
}
```

### Désactiver le reporter automatique

Dans `playwright.config.ts` :

```typescript
reporter: [
  ['html'],
  // ['./test/playwright-reporter.ts'] // Commentez cette ligne
],
```

### Changer le format des rapports

Éditez `test/playwright-reporter.ts`, méthode `createBugReport()` :

```typescript
const description = `
Votre format personnalisé...
`;
```

## 🐛 Résolution de Problèmes

### Les bugs ne s'importent pas

**Problème** : Le script d'import échoue

**Solutions** :
1. Vérifier que le serveur est en cours : `npm run dev`
2. Vérifier les credentials dans les variables d'environnement
3. Vérifier les fichiers JSON : `ls test-results/bug-reports/`
4. Lancer manuellement : `tsx test/import-bug-reports.ts`

### Les tests échouent sans créer de rapports

**Problème** : Pas de fichiers dans `test-results/bug-reports/`

**Solutions** :
1. Vérifier que le reporter est activé dans `playwright.config.ts`
2. Vérifier les permissions d'écriture sur `test-results/`
3. Regarder les erreurs dans la console Playwright
4. Vérifier que le serveur API est accessible

### Erreur "Authentication required"

**Normal** : Le reporter essaie d'abord de poster directement à l'API, mais sans authentification ça échoue. Il fait ensuite un fallback vers fichier local, qui sera importé par le script.

**Pas d'action requise** : C'est le comportement attendu.

### Erreur "require is not defined"

**Obsolète** : Cette erreur a été corrigée dans la dernière version du reporter.

Si elle persiste :
1. Vérifier que vous utilisez la dernière version de `test/playwright-reporter.ts`
2. Vérifier que Node.js supporte les imports CommonJS

## 📁 Structure des Fichiers

```
test/
├── e2e/
│   ├── admin-pagination.spec.ts      # 5 tests de pagination
│   ├── admin-workflow.spec.ts        # 8 tests de workflow
│   ├── test-bug-reporter.spec.ts     # Test de démonstration (skip)
│   ├── README.md                     # Documentation des tests
│   └── INTEGRATION-GUIDE.md          # Ce fichier
│
├── playwright-reporter.ts            # Reporter personnalisé
├── import-bug-reports.ts            # Script d'import automatique
└── run-tests-and-report.sh          # Script wrapper tout-en-un

test-results/
└── bug-reports/
    └── bug-*.json                   # Rapports générés (temporaires)

playwright-report/
└── index.html                       # Rapport HTML Playwright
```

## 🎨 Exemple de Bug Créé

### Dans l'interface admin :

**Titre** : `[E2E] should display all 33 ideas in admin interface`

**Description** :
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

**Screenshot:** /test-results/.../screenshot.png

**Durée du test:** 5432ms
**Statut:** failed

---
*Ce bug a été créé automatiquement par le reporter Playwright E2E*
```

**Type** : Bug  
**Priorité** : Critique (pagination = données essentielles)  
**Demandeur** : Playwright E2E Reporter

### Dans GitHub Issues :

🔗 **Issue #123** : `[E2E] should display all 33 ideas in admin interface`

Labels : `bug`, `priority-critical`

Contenu : Identique à la description ci-dessus

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev)
- [Custom Reporters](https://playwright.dev/docs/test-reporters)
- [API Routes](../../server/routes.ts)
- [GitHub Integration](../../server/utils/github-integration.ts)
- [Development Requests Schema](../../shared/schema.ts)

## 🤝 Support

Pour toute question ou problème :

1. Vérifier ce guide d'abord
2. Consulter `test/e2e/README.md` pour la doc générale
3. Regarder les logs : `npx playwright show-report`
4. Créer un bug manuellement dans l'interface admin si besoin

---

**Créé le** : Octobre 2025  
**Dernière mise à jour** : Octobre 2025
