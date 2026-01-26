# Tests E2E - US-MEMBERS-001: CRM - Gestion des membres

## User Story
En tant qu'admin, je veux un CRM centralisant les membres pour suivre les engagements.

## URL de test
`https://cjd80.rbw.ovh`

## Endpoints API testés

### 1. Récupération de la liste des membres
```
GET /api/admin/members?page=1&limit=20&status=active&search=dupont&score=high
```
Paramètres:
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20)
- `status`: Filtrer par statut (active, inactive, suspended)
- `search`: Recherche textuelle sur nom/email
- `score`: Filtrer par score d'engagement (high, medium, low)

### 2. Récupération du profil complet d'un membre
```
GET /api/admin/members/:email
```

### 3. Création d'un nouveau membre
```
POST /api/admin/members
Body: {
  email: string,
  firstName: string,
  lastName: string,
  company?: string,
  phone?: string,
  status: string
}
```

### 4. Mise à jour d'un membre
```
PATCH /api/admin/members/:email
Body: {
  firstName?: string,
  lastName?: string,
  phone?: string,
  status?: string
}
```

### 5. Assignation de tags
```
POST /api/admin/members/:email/tags
Body: {
  tags: string[]
}
```

### 6. Création de tâches de suivi
```
POST /api/admin/members/:email/tasks
Body: {
  title: string,
  description?: string,
  dueDate?: date,
  status?: string
}
```

## Tests implémentés

### Test 1: Accéder au dashboard CRM
- Navigue vers `/admin/members`
- Vérifie que la page se charge correctement
- Valide la présence du contenu

### Test 2: Afficher la liste des membres
- Mock l'API de liste des membres
- Vérifie la présence de données (noms, entreprises)
- Détecte les formats de présentation (tables, listes, cartes)

### Test 3: Filtrer par statut
- Teste le filtre de statut (active/inactive/suspended)
- Applique le filtre et valide la requête API
- Vérifie les résultats filtrés

### Test 4: Rechercher par nom
- Teste le champ de recherche textuelle
- Recherche "dupont" et valide les résultats
- Mock API avec paramètre `?search=dupont`

### Test 5: Filtrer par score d'engagement
- Teste le filtre d'engagement (high/medium/low)
- Sélectionne "high" et valide la requête API
- Vérifie les résultats

### Test 6: Voir le profil complet
- Ouvre le profil détaillé d'un membre
- Mock GET `/api/admin/members/:email`
- Vérifie l'affichage de tous les détails
- Inclut tags et tâches

### Test 7: Créer un nouveau membre
- Détecte le bouton "Ajouter un membre"
- Remplit le formulaire (email, nom, prénom, entreprise)
- Mock POST `/api/admin/members`
- Valide la création

### Test 8: Modifier un membre
- Détecte le bouton "Modifier"
- Remplit les champs à mettre à jour
- Mock PATCH `/api/admin/members/:email`
- Valide l'enregistrement

### Test 9: Assigner un tag
- Ouvre le profil du membre
- Détecte le bouton "Ajouter un tag"
- Mock POST `/api/admin/members/:email/tags`
- Ajoute un tag (ex: "VIP")

### Test 10: Créer une tâche de suivi
- Ouvre le profil du membre
- Détecte le formulaire de création de tâche
- Mock POST `/api/admin/members/:email/tasks`
- Crée une tâche de suivi avec titre et description

### Test 11: Pagination
- Teste la navigation entre pages
- Clique sur le bouton "Suivant"
- Mock API page 2
- Vérifie les contrôles de pagination

### Test 12: Validation API
- Vérifie les appels API critiques
- Analyse les statuts de réponse
- Valide que GET /api/admin/members retourne 200

### Test 13: Documentation complète
- Documente le comportement complet du CRM
- Analyse l'état initial de la page
- Détecte tous les éléments UI (boutons, inputs, tables)
- Rapporte les statistiques réseau et console
- Identifie les erreurs JavaScript

## Données de test

### Membre principal
```javascript
{
  email: 'jean.dupont@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  company: 'Entreprise Test',
  phone: '0123456789',
  status: 'active',
  engagementScore: 'high'
}
```

### Compte d'administration
```javascript
{
  email: 'admin@test.local',
  password: 'devmode',
  role: 'super_admin'
}
```

## Hooks et événements

### beforeEach
- Configure l'authentification admin
- Mock localStorage avec token JWT
- Initialise les traceurs de console et réseau
- Reset des états

### afterEach
- Rapporte les statistiques complètes
- Affiche les erreurs réseau (4xx/5xx)
- Affiche les erreurs JavaScript
- Résume le test

## Exécution

### Lancer tous les tests
```bash
cd /srv/workspace/cjd80
npx playwright test tests/e2e/e2e/crm-members.spec.ts
```

### Lancer un test spécifique
```bash
npx playwright test -g "Afficher le profil complet"
```

### Mode debug
```bash
npx playwright test --debug tests/e2e/e2e/crm-members.spec.ts
```

### Générer un rapport HTML
```bash
npx playwright test --reporter=html tests/e2e/e2e/crm-members.spec.ts
```

## Validations

- ✅ TypeScript strict mode (pas d'any)
- ✅ URL https://cjd80.rbw.ovh (pas localhost)
- ✅ Mock API complète avec fixtures
- ✅ Gestion des erreurs réseau et console
- ✅ Cas nominaux et alternatifs
- ✅ Documentation de chaque test
- ✅ Hooks beforeEach/afterEach
- ✅ Capture screenshots possible

## Architecture

Le test utilise:
- **Playwright**: Framework de test E2E
- **Fixtures API**: Mock des endpoints pour tests reproductibles
- **localStorage Mock**: Simulation de l'authentification admin
- **Traçage réseau**: Capture des requêtes/réponses
- **Traçage console**: Capture des erreurs JavaScript
- **Base d'URL centralisée**: https://cjd80.rbw.ovh

## Fichier
- `/srv/workspace/cjd80/tests/e2e/e2e/crm-members.spec.ts`
- 1064 lignes
- 13 tests complets
