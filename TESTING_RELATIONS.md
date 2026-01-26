# Guide de Test - Page Gestion Relations Membres

## Accès à la Page

### URL de Production/Staging
```
https://cjd80.rbw.ovh/admin/members/relations
```

### URL de Développement Local
```
http://localhost:3000/admin/members/relations
```

> **Important:** Voir les instructions du CLAUDE.md - utiliser `.rbw.ovh` pour tester la stack complète (Traefik, HTTPS, CORS)

## Prérequis

1. **Authentification Admin** - Être connecté en tant qu'administrateur
2. **Permissions** - Avoir la permission `admin.view` et `admin.edit`
3. **Données** - Au moins 2 membres dans la base de données

## Scénarios de Test

### Test 1: Affichage Initial
```
Étapes:
1. Naviguer vers /admin/members/relations
2. Observer la page

Résultats attendus:
✓ Spinner de chargement puis disparition
✓ Table vide ou avec relations existantes
✓ Filtres de type de relation visibles (boutons)
✓ Select filtre membre visible
✓ Bouton "Créer une relation" en haut à droite
✓ Aucun message d'erreur
```

### Test 2: Filtrage par Type
```
Étapes:
1. Cliquer sur "Parrain/marraine" (sponsor)
2. Vérifier la table
3. Cliquer sur "Tous"
4. Vérifier le reset

Résultats attendus:
✓ Table filtrée sur le type sélectionné
✓ Bouton actif visuellement distinct
✓ Nombre de résultats mis à jour
✓ "Tous" réinitialise le filtre
```

### Test 3: Filtrage par Membre
```
Étapes:
1. Ouvrir le select "Membre"
2. Sélectionner un membre
3. Vérifier la table
4. Sélectionner "Tous les membres"
5. Vérifier le reset

Résultats attendus:
✓ Liste alphabétique des membres
✓ Table filtrée sur les relations de ce membre
✓ "Tous les membres" réinitialise le filtre
```

### Test 4: Filtrage Combiné
```
Étapes:
1. Sélectionner Type = "Collègue"
2. Sélectionner Membre = "Jean Dupont"
3. Vérifier la table

Résultats attendus:
✓ Seules les relations "Collègue" de Jean Dupont affichées
✓ Nombre de résultats correct
```

### Test 5: Créer une Relation
```
Étapes:
1. Cliquer "Créer une relation"
2. Observer la modal
3. Remplir les champs:
   - Membre principal: "Alice Martin"
   - Type: "Ami"
   - Membre lié: "Bob Leclerc"
   - Description: "Amis depuis longtemps"
4. Cliquer "Créer la relation"
5. Vérifier le toast
6. Vérifier la table mise à jour

Résultats attendus:
✓ Modal s'ouvre avec titre/description
✓ Selects contiennent les bonnes options
✓ Toast "Relation créée" s'affiche (vert)
✓ Table se réactualise avec la nouvelle relation
✓ Nouvelle ligne visible dans la table
```

### Test 6: Validation Formulaire
```
Étapes:
1. Cliquer "Créer une relation"
2. Cliquer "Créer la relation" sans remplir
3. Observer les erreurs
4. Tenter de créer relation A -> A
5. Observer l'erreur

Résultats attendus:
✓ Messages d'erreur en rouge sur les champs obligatoires
✓ Bouton "Créer" désactivé si données invalides
✓ Message: "Un membre ne peut pas être lié à lui-même"
✓ Les erreurs disparaissent lors de la modification du champ
```

### Test 7: États de Chargement
```
Étapes:
1. Créer une relation avec réseau lent (DevTools throttle)
2. Observer le bouton pendant le traitement

Résultats attendus:
✓ Spinner dans le bouton "Créer la relation"
✓ Bouton désactivé pendant traitement
✓ Texte "Création..." visible
✓ Bouton réactivé après succès/erreur
```

### Test 8: Suppression Relation
```
Étapes:
1. Trouver une relation dans la table
2. Cliquer l'icône Trash2 (rouge)
3. Observer l'AlertDialog
4. Lire le message de confirmation
5. Cliquer "Supprimer"
6. Vérifier le toast
7. Vérifier la table mise à jour

Résultats attendus:
✓ AlertDialog s'ouvre avec message détaillé
✓ Noms des deux membres affichés
✓ Bouton danger en rouge
✓ Toast "Relation supprimée" (vert)
✓ Relation disparaît de la table
✓ Bouton "Annuler" ferme sans supprimer
```

### Test 9: Erreur Backend
```
Étapes:
1. (Simuler une erreur backend si possible)
2. Tenter une action (créer/supprimer)
3. Observer le toast d'erreur

Résultats attendus:
✓ Toast d'erreur en rouge
✓ Message d'erreur du serveur affiché
✓ Table non modifiée (rollback)
```

### Test 10: Affichage Table
```
Étapes:
1. Observer une relation dans la table

Résultats attendus:
✓ Colonne 1: Nom + email du membre 1
✓ Colonne 2: Badge coloré avec type (ex: [Ami])
✓ Colonne 3: Nom + email du membre 2
✓ Colonne 4: Date en format "26 jan. 2026"
✓ Colonne 5: Bouton Supprimer (Trash2)
```

### Test 11: Badge Couleurs
```
Étapes:
1. Observer chaque type de relation dans la table

Résultats attendus:
✓ sponsor: Fond bleu (bg-blue-50)
✓ godparent: Fond violet (bg-purple-50)
✓ colleague: Fond vert (bg-green-50)
✓ friend: Fond rose (bg-pink-50)
✓ business_partner: Fond orange (bg-orange-50)
✓ Emoji pertinent avant le label
```

### Test 12: Responsive Design
```
Étapes:
1. Redimensionner la fenêtre (Desktop → Mobile)
2. Observer les éléments

Résultats attendus:
✓ Table scrollable horizontalement sur mobile
✓ Filtre "Membre" prend la largeur disponible
✓ Boutons accessibles
✓ Modal centrée et visible
```

## Checklist de Régression

Avant de déployer en production, vérifier:

- [ ] Aucun `console.log` en production
- [ ] Aucune erreur TypeScript (`tsc --noEmit`)
- [ ] Performances acceptables (< 200ms pour list)
- [ ] Tests e2e passent (si existants)
- [ ] Lien de navigation ajouté au menu admin
- [ ] Permissions correctement configurées
- [ ] Endpoints backend implémentés
- [ ] Schemas Zod à jour
- [ ] Base de données avec relations de test
- [ ] RGPD/audit logs considérés

## Performance

### Benchmarks Attendus
```
GET /api/admin/members:        < 200ms
GET /api/admin/relations:      < 300ms (dépend du nombre)
POST /api/admin/members/relations: < 500ms
DELETE /api/admin/member-relations/:id: < 300ms
```

### Optimisations Déjà Implémentées
- ✓ useMemo pour filtrage
- ✓ React Query caching
- ✓ Invalidation intelligente
- ✓ Lazy loading (suspense possible en futur)

## Dépannage

### Problème: Page vide
```
Solutions:
1. Vérifier les permissions: admin.view
2. Vérifier le token JWT
3. Vérifier les logs backend
4. Vérifier que GET /api/admin/members fonctionne
```

### Problème: Erreur lors de la création
```
Solutions:
1. Vérifier le statut HTTP (400 vs 500)
2. Vérifier les emails dans le formulaire
3. Vérifier le schéma Zod
4. Consulter les logs backend
```

### Problème: Table toujours vide après création
```
Solutions:
1. Vérifier la réponse du POST
2. Vérifier que queryClient.invalidateQueries fonctionne
3. Forcer un refresh manuel (F5)
4. Vérifier la base de données directement
```

### Problème: Filtres ne fonctionnent pas
```
Solutions:
1. Vérifier les valeurs de state (React DevTools)
2. Vérifier la logique de filtrage (useMemo)
3. Vérifier que les données enrichies contiennent les noms
```

## Logs à Observer

```typescript
// Frontend (Console DevTools)
// Lors d'une requête réussie
[Query] GET /api/admin/relations: 200 (142ms)

// Lors d'une erreur
[Error] GET /api/admin/relations: 500 - Server error

// Backend (Logs Application)
[AdminService] getAllRelations() called
[Drizzle] SELECT * FROM member_relations
[AdminService] Found 5 relations
```

## Screenshots Attendus

### État Initial
```
┌─────────────────────────────────────────┐
│ 🔍 Gestion des Relations                │
│ Gérez les relations entre les membres  │
│                      [+ Créer relation] │
├─────────────────────────────────────────┤
│ Relations entre membres                 │
│ 0 relation(s) trouvée(s)               │
├─────────────────────────────────────────┤
│ [Tous][Parrain][Filleul]... | [Select] │
├─────────────────────────────────────────┤
│ Aucune relation trouvée. Créez-en une  │
└─────────────────────────────────────────┘
```

### Après Création
```
┌──────────────────────────────────────────────┐
│ Membre 1        │Type│      Membre 2    │... │
├──────────────────────────────────────────────┤
│ Jean Dupont     │    │ Marie Dubois     │    │
│ jean@...        │[Ami] marie@...        │ 🗑️ │
│ 26 jan. 2026    │    │                  │    │
└──────────────────────────────────────────────┘
```

## Commandes Utiles

```bash
# Type check
cd /srv/workspace/cjd80
npx tsc --noEmit

# Test spécifique (si existant)
npm test -- relations

# Build
npm run build

# Dev
npm run dev
```

## Documentation Requise

- ✅ IMPLEMENTATION_RELATIONS_MEMBRES.md
- ✅ RELATIONS_CHECKLIST.md
- ✅ TESTING_RELATIONS.md (ce fichier)

---

**Status:** Page complète et testable
**Dernière mise à jour:** 2026-01-26
