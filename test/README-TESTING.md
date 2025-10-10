# Guide de Test - Système de Nettoyage Automatique

## 📋 Vue d'ensemble

Ce projet utilise un système de nettoyage automatique des données de test pour maintenir une base de données propre et éviter l'accumulation de données de test entre les exécutions de Playwright.

### Fonctionnalités principales

✅ **Nettoyage automatique** : Toutes les données de test sont supprimées après chaque test  
✅ **Patterns reconnaissables** : Les données de test utilisent des patterns identifiables (`@test.com`, `[TEST]`)  
✅ **Helpers de génération** : Fonctions utilitaires pour créer des données de test cohérentes  
✅ **Configuration centralisée** : Une seule configuration pour gérer tous les patterns  

## 🚀 Quick Start

### 1. Importer les fixtures personnalisées

**Important** : Toujours importer `test` et `expect` depuis `../fixtures` au lieu de `@playwright/test` :

```typescript
// ✅ CORRECT
import { test, expect } from '../fixtures';

// ❌ INCORRECT
import { test, expect } from '@playwright/test';
```

### 2. Utiliser les helpers de génération de données

```typescript
import { test, expect } from '../fixtures';
import { generateTestIdea, generateTestEmail } from '../helpers/test-data';

test('should create an idea', async ({ page }) => {
  // Générer des données de test reconnaissables
  const testIdea = generateTestIdea({
    title: 'Mon idée de test',
    description: 'Description de test'
  });
  
  // Créer l'idée via API
  await page.request.post('/api/ideas', {
    data: {
      title: testIdea.title,
      description: testIdea.description,
      proposedBy: testIdea.proposedBy,
      proposedByEmail: testIdea.proposedByEmail,
    }
  });
  
  // Vos assertions ici...
  
  // ✅ Le nettoyage se fait automatiquement après le test !
});
```

### 3. Exécuter les tests

```bash
# Exécuter tous les tests
npx playwright test

# Exécuter un test spécifique
npx playwright test test-cleanup-demo

# Mode debug
npx playwright test --debug

# Voir les logs de nettoyage
npx playwright test --headed
```

## 📦 Helpers de Génération de Données

Le fichier `test/helpers/test-data.ts` fournit des fonctions pour générer des données de test :

### Fonctions de base

```typescript
import {
  generateTestEmail,      // Génère un email @test.com
  generateTestName,       // Génère un nom avec [TEST]
  generateTestTitle,      // Génère un titre avec [TEST]
  generateTestCompany,    // Génère un nom d'entreprise
  generateTestPhone,      // Génère un numéro de téléphone
} from '../helpers/test-data';

// Exemples
const email = generateTestEmail();              // test-abc123@test.com
const name = generateTestName('Jean');          // [TEST] Jean xyz789
const title = generateTestTitle('Idée');        // [TEST] Idée abc456
const company = generateTestCompany();          // Test Company def789
const phone = generateTestPhone();              // +33 6 12 34 56 78
```

### Fonctions composées

```typescript
import {
  generateTestIdea,
  generateTestEvent,
  generateTestVote,
  generateTestInscription,
  generateTestPatron,
  generateTestMember,
} from '../helpers/test-data';

// Idée complète
const idea = generateTestIdea({
  title: 'Améliorer le site',
  description: 'Description personnalisée',
  proposerName: 'Jean Dupont'
});

// Événement
const event = generateTestEvent({
  title: 'Événement de test',
  daysFromNow: 30,
  location: 'Amiens'
});

// Vote
const vote = generateTestVote({
  voterName: 'Marie Martin'
});

// Inscription
const inscription = generateTestInscription({
  name: 'Pierre Durant',
  includePhone: true,
  comments: 'Commentaire optionnel'
});

// Mécène
const patron = generateTestPatron({
  firstName: 'Sophie',
  lastName: 'Bernard',
  company: 'TechCorp',
  role: 'CEO',
  includePhone: true
});

// Membre
const member = generateTestMember({
  firstName: 'Lucas',
  lastName: 'Petit',
  company: 'StartupCo'
});
```

### Générer des tableaux de données

```typescript
import { generateTestArray, generateTestVote } from '../helpers/test-data';

// Créer 5 votes de test
const votes = generateTestArray(generateTestVote, 5);

// Créer 10 idées de test
const ideas = generateTestArray(() => generateTestIdea(), 10);
```

## 🧹 Comment fonctionne le nettoyage ?

### Patterns reconnus

Le système nettoie automatiquement toutes les données qui correspondent à ces patterns :

| Pattern | Exemple | Tables affectées |
|---------|---------|-----------------|
| Email `@test.com` | `test-abc@test.com` | Toutes avec email |
| Email `@playwright.test` | `user@playwright.test` | Toutes avec email |
| Préfixe `[TEST]` | `[TEST] Mon idée` | ideas, events, etc. |
| Préfixe `[playwright-test]` | `[playwright-test] Item` | Toutes avec titre/nom |
| Company "Test Company" | `Test Company XYZ` | patrons, members |

### Tables nettoyées

Le nettoyage s'applique à toutes les tables principales :

- ✅ `ideas` (idées)
- ✅ `votes` (votes)
- ✅ `events` (événements)
- ✅ `inscriptions` (inscriptions)
- ✅ `patrons` (mécènes)
- ✅ `members` (membres)
- ✅ `subscriptions` (abonnements)
- ✅ `activities` (activités)

### Quand le nettoyage s'exécute ?

Le nettoyage se fait **automatiquement après chaque test** grâce à la fixture `autoCleanup` :

```typescript
// Dans test/fixtures.ts
const test = base.extend<{ autoCleanup: void }>({
  autoCleanup: [async ({}, use) => {
    await use();
    // ⬇️ Le nettoyage s'exécute ici après chaque test
    await cleanupTestData();
  }, { auto: true }]
});
```

## 📝 Exemples d'Utilisation

### Exemple 1 : Test d'une idée

```typescript
import { test, expect } from '../fixtures';
import { generateTestIdea } from '../helpers/test-data';

test.describe('Ideas', () => {
  test('should create and display an idea', async ({ page }) => {
    const testIdea = generateTestIdea();
    
    // Créer via API
    const response = await page.request.post('/api/ideas', {
      data: {
        title: testIdea.title,
        description: testIdea.description,
        proposedBy: testIdea.proposedBy,
        proposedByEmail: testIdea.proposedByEmail,
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    // Vérifier que l'idée existe
    await page.goto('/');
    await expect(page.locator(`text=${testIdea.title}`)).toBeVisible();
    
    // ✅ Nettoyage automatique après ce test
  });
});
```

### Exemple 2 : Test avec plusieurs entités

```typescript
import { test, expect } from '../fixtures';
import { generateTestIdea, generateTestVote } from '../helpers/test-data';

test('should create idea and vote', async ({ page }) => {
  // Créer une idée
  const testIdea = generateTestIdea();
  const ideaResponse = await page.request.post('/api/ideas', {
    data: {
      title: testIdea.title,
      description: testIdea.description,
      proposedBy: testIdea.proposedBy,
      proposedByEmail: testIdea.proposedByEmail,
    }
  });
  const idea = await ideaResponse.json();
  
  // Créer un vote
  const testVote = generateTestVote();
  await page.request.post('/api/votes', {
    data: {
      ideaId: idea.id,
      voterName: testVote.voterName,
      voterEmail: testVote.voterEmail,
    }
  });
  
  // Vérifier
  const getResponse = await page.request.get(`/api/ideas/${idea.id}`);
  const updatedIdea = await getResponse.json();
  expect(updatedIdea.voteCount).toBe(1);
  
  // ✅ L'idée ET le vote seront nettoyés automatiquement
});
```

### Exemple 3 : Test UI avec formulaire

```typescript
import { test, expect } from '../fixtures';
import { generateTestEmail, generateTestTitle } from '../helpers/test-data';

test('should submit idea form', async ({ page }) => {
  await page.goto('/');
  
  // Utiliser les helpers pour remplir le formulaire
  const title = generateTestTitle('Mon idée');
  const email = generateTestEmail('proposeur');
  
  await page.fill('[data-testid="input-idea-title"]', title);
  await page.fill('[data-testid="input-proposer-email"]', email);
  await page.click('[data-testid="button-submit-idea"]');
  
  // Vérifier la soumission
  await expect(page.locator(`text=${title}`)).toBeVisible();
  
  // ✅ L'idée sera nettoyée automatiquement
});
```

## 🔧 Configuration

### Ajouter de nouveaux patterns

Pour ajouter de nouveaux patterns de nettoyage, modifier `test/helpers/cleanup.ts` :

```typescript
// Ajouter un nouveau pattern
const TEST_EMAIL_PATTERNS = [
  '@test.com',
  '@playwright.test',
  '@mynewtestdomain.com',  // ⬅️ Nouveau pattern
];

const TEST_PREFIX_PATTERNS = [
  '[TEST]',
  '[playwright-test]',
  '[DEMO]',  // ⬅️ Nouveau pattern
];
```

### Ajouter une nouvelle table à nettoyer

```typescript
// Dans test/helpers/cleanup.ts
export async function cleanupTestData() {
  // ... code existant ...
  
  // Ajouter une nouvelle table
  const myNewTableDeleted = await db
    .delete(myNewTable)
    .where(
      or(
        like(myNewTable.email, '%@test.com'),
        like(myNewTable.title, '[TEST]%')
      )
    );
  
  totalDeleted += myNewTableDeleted.length;
}
```

## 🐛 Troubleshooting

### Les données ne sont pas nettoyées

**Problème** : Les données de test restent dans la base après les tests.

**Solutions** :
1. Vérifier que vous importez depuis `../fixtures` et non `@playwright/test`
2. Vérifier que vos données utilisent les patterns reconnus (`@test.com`, `[TEST]`)
3. Vérifier les logs de console pour les erreurs de nettoyage

### Patterns non reconnus

**Problème** : Vos données de test ne correspondent pas aux patterns.

**Solutions** :
1. Utiliser les helpers de génération (`generateTestEmail`, etc.)
2. Ajouter de nouveaux patterns dans `test/helpers/cleanup.ts`
3. Vérifier que les emails se terminent par `@test.com` ou `@playwright.test`

### Erreurs de base de données

**Problème** : Erreurs lors du nettoyage (contraintes de clés étrangères, etc.).

**Solutions** :
1. Vérifier l'ordre de suppression dans `cleanup.ts` (enfants avant parents)
2. Utiliser des transactions si nécessaire
3. Ajouter des logs pour identifier la table problématique

### ⚠️ Rate Limiting de l'API

**Problème** : Les tests échouent avec des erreurs 429 ou des créations qui ne fonctionnent pas.

**Cause** : L'API limite les créations à **20 par tranche de 15 minutes** pour prévenir les abus.

**Solutions** :
1. **Attendre 15 minutes** entre les exécutions massives de tests
2. **Réduire le nombre de créations** dans vos tests (utiliser 2-3 items au lieu de 5-10)
3. **Ajouter des délais** entre les créations :
   ```typescript
   // Attendre 500ms entre chaque création
   await page.waitForTimeout(500);
   ```
4. **Exécuter moins de tests** à la fois :
   ```bash
   # Au lieu de tous les tests
   npx playwright test test/e2e/test-cleanup-demo.spec.ts
   
   # Exécuter un seul test
   npx playwright test -g "should create and auto-cleanup test idea"
   ```

**Note** : Le système de nettoyage fonctionne parfaitement. Les échecs de tests sont uniquement dus au rate limiting, pas au système de nettoyage.

## 📚 Ressources

- **Tests de démonstration** : `test/e2e/test-cleanup-demo.spec.ts`
- **Utilitaire de nettoyage** : `test/helpers/cleanup.ts`
- **Fixtures personnalisées** : `test/fixtures.ts`
- **Helpers de données** : `test/helpers/test-data.ts`
- **Configuration Playwright** : `playwright.config.ts`

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

- Toujours importer depuis `../fixtures`
- Utiliser les helpers de génération de données
- Créer des données de test reconnaissables
- Vérifier que le nettoyage fonctionne (consulter les logs)
- Ajouter de nouveaux helpers si besoin

### ❌ À ÉVITER

- Importer depuis `@playwright/test` directement
- Créer des données sans patterns reconnaissables
- Utiliser des emails réels dans les tests
- Laisser des données manuellement sans nettoyage
- Nettoyer manuellement avec `afterEach` (c'est automatique)

## 🔍 Vérifier le Nettoyage

Pour vérifier que le nettoyage fonctionne correctement :

1. **Exécuter le test de démonstration** :
   ```bash
   npx playwright test test-cleanup-demo
   ```

2. **Vérifier les logs** :
   ```
   [Cleanup] 🧹 Début du nettoyage des données de test...
   [Cleanup] 📊 Ideas: 3 enregistrement(s) supprimé(s)
   [Cleanup] 📊 Votes: 2 enregistrement(s) supprimé(s)
   [Cleanup] ✅ Nettoyage terminé : 5 enregistrement(s) au total
   ```

3. **Vérifier la base de données** :
   ```sql
   -- Aucune donnée de test ne devrait rester
   SELECT * FROM ideas WHERE title LIKE '[TEST]%';
   SELECT * FROM votes WHERE voter_email LIKE '%@test.com';
   ```

## 🚀 Prochaines Étapes

Pour améliorer le système de test :

1. Ajouter plus de helpers pour d'autres entités
2. Créer des scénarios de test complexes
3. Ajouter des fixtures pour l'authentification
4. Implémenter des snapshots pour les tests visuels
5. Automatiser les tests dans la CI/CD

---

**Questions ou problèmes ?** Consultez les tests de démonstration ou ouvrez une issue sur le repo.
