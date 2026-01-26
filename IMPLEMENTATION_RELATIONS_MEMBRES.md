# Documentation: Gestion des Relations entre Membres

## Vue d'ensemble

Une page complète de gestion des relations entre membres a été créée à `/srv/workspace/cjd80/app/(protected)/admin/members/relations/page.tsx` (642 lignes).

Cette page permet aux administrateurs de:
- Voir toutes les relations entre membres dans une table
- Filtrer par type de relation et par membre
- Créer de nouvelles relations via une modal
- Supprimer des relations existantes

## Architecture et Composants Utilisés

### 1. Page principale (`page.tsx`)

**Localisation:** `/srv/workspace/cjd80/app/(protected)/admin/members/relations/page.tsx`

**Composants shadcn/ui utilisés:**
- `Card` - Conteneur principal
- `Table`, `TableHeader`, `TableBody`, `TableCell` - Affichage des relations
- `Badge` - Types de relation colorés
- `Button` - Actions
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` - Modal de création
- `AlertDialog` - Confirmation avant suppression
- `Label` - Labels des champs de formulaire
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` - Sélecteurs pour les filtres et la modal
- `Input` - Champs texte (optionnel: description)

**Icons lucide-react utilisées:**
- `Plus` - Bouton "Créer une relation"
- `Trash2` - Bouton supprimer
- `Users`, `UserCheck`, `Briefcase`, `Heart` - (préparés pour les icônes des types)
- `Loader2` - État de chargement

### 2. Intégrations React Query

**Hooks utilisés:**
- `useQuery` - Récupération des listes
- `useMutation` - Créer et supprimer relations
- `useQueryClient` - Invalidation du cache

**Query Keys (dans `/srv/workspace/cjd80/lib/api/client.ts`):**
```typescript
members: {
  relations: {
    all: ['members', 'relations'] as const,
    list: (params?: Record<string, unknown>) => ['members', 'relations', 'list', params] as const,
    detail: (id: string) => ['members', 'relations', 'detail', id] as const,
  },
}
```

## Types de Relations Supportées

| Type | Label | Badge Color |
|------|-------|-------------|
| `sponsor` | Parrain/marraine | Bleu |
| `godparent` | Filleul/filleule | Violet |
| `colleague` | Collègue | Vert |
| `friend` | Ami | Rose |
| `business_partner` | Partenaire d'affaires | Orange |

## Fonctionnalités Implémentées

### 1. Affichage des Relations

```
┌─────────────────────────────────────────────┐
│ Membre 1 | Type de relation | Membre 2 | ... │
├─────────────────────────────────────────────┤
│ Jean Dupont | [Parrain/marraine] | Marie... │
│ ...                                         │
└─────────────────────────────────────────────┘
```

**Colonnes affichées:**
- Membre 1 (nom + email)
- Type de relation (badge coloré avec emoji)
- Membre 2 (nom + email)
- Date création (format fr-FR)
- Actions (Supprimer)

### 2. Filtres

- **Type de relation:** Boutons ✓ Tous, ✓ Parrain/marraine, ✓ Filleul/filleule, ✓ Collègue, ✓ Ami, ✓ Partenaire
- **Membre:** Select dropdown avec tous les membres (tri alphabétique)

### 3. Modal de Création

**Champs requis (*):**
- Membre principal (Select)
- Type de relation (Select)
- Membre lié (Select - excluant le membre principal)

**Champ optionnel:**
- Description (textarea, max 500 caractères)

**Validations:**
- ✓ Tous les champs requis doivent être remplis
- ✓ Un membre ne peut pas être lié à lui-même
- ✓ Messages d'erreur affichés en rouge

### 4. Suppression

- ✓ AlertDialog de confirmation
- ✓ Message détaillé montrant les deux membres concernés
- ✓ Bouton danger en rouge
- ✓ Invalidation du cache après suppression

## Architecture des Requêtes API

### Points d'accès (Endpoints)

La page supporte deux stratégies de récupération des relations:

#### Stratégie 1: Endpoint global (préféré)
```
GET /api/admin/relations
Response: MemberRelation[]
```

#### Stratégie 2: Fallback - Boucle par membre (si endpoint global inexistant)
```
GET /api/admin/members/:email/relations
Response: MemberRelation[]
```

### Mutations

```
POST /api/admin/members/relations
Body: {
  memberEmail: string (email),
  relatedMemberEmail: string (email),
  relationType: 'sponsor' | 'godparent' | 'colleague' | 'friend' | 'business_partner',
  description?: string
}

DELETE /api/admin/member-relations/:id
```

## Interfaces TypeScript

```typescript
interface MemberRelation {
  id: string;
  memberEmail: string;
  relatedMemberEmail: string;
  relationType: 'sponsor' | 'godparent' | 'colleague' | 'friend' | 'business_partner';
  description?: string;
  createdAt: string;
  createdBy?: string;
  member?: Member;      // Enrichi localement
  relatedMember?: Member; // Enrichi localement
}

interface Member {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: string;
}
```

## État Actuel et Points d'Amélioration

### ✅ Implémenté

1. **Page complète** avec table, filtres et actions
2. **Modal de création** avec validation
3. **Suppression** avec confirmation
4. **Filtres dynamiques** par type et par membre
5. **Query Keys** ajoutées à `queryKeys.members.relations`
6. **TypeScript strict** - Pas de `any`, pas de `as any`, tous les types définis
7. **UX complète** avec toasts de feedback
8. **Enrichissement des données** - Noms des membres affichés à côté des emails
9. **Styling** avec couleurs distinctes par type de relation

### ⚠️ À Implémenter Côté Backend

Pour que la page fonctionne, il faut implémenter les endpoints suivants dans le contrôleur admin (`/srv/workspace/cjd80/server/src/admin/admin.controller.ts`):

#### 1. GET /api/admin/relations
```typescript
@Get('relations')
@Permissions('admin.view')
@ApiOperation({ summary: 'Obtenir toutes les relations' })
@ApiResponse({ status: 200, description: 'Liste de toutes les relations' })
async getAllRelations() {
  return await this.adminService.getAllRelations();
}
```

#### 2. GET /api/admin/members/:email/relations
```typescript
@Get('members/:email/relations')
@Permissions('admin.view')
@ApiOperation({ summary: 'Obtenir les relations d\'un membre' })
@ApiParam({ name: 'email', description: 'Email du membre' })
@ApiResponse({ status: 200, description: 'Relations du membre' })
async getMemberRelations(@Param('email') email: string) {
  return await this.adminService.getMemberRelations(decodeURIComponent(email));
}
```

#### 3. POST /api/admin/members/relations
```typescript
@Post('members/relations')
@Permissions('admin.edit')
@UsePipes(new ZodValidationPipe(insertMemberRelationSchema))
@ApiOperation({ summary: 'Créer une relation' })
@ApiBody({ schema: { type: 'object', properties: { ... } } })
@ApiResponse({ status: 201, description: 'Relation créée' })
async createMemberRelation(
  @Body() data: InsertMemberRelation,
  @User() user: JwtUser
) {
  return await this.adminService.createMemberRelation(data, user.email);
}
```

#### 4. DELETE /api/admin/member-relations/:id
```typescript
@Delete('member-relations/:id')
@Permissions('admin.edit')
@ApiOperation({ summary: 'Supprimer une relation' })
@ApiParam({ name: 'id', description: 'ID de la relation' })
@ApiResponse({ status: 200, description: 'Relation supprimée' })
async deleteMemberRelation(@Param('id') id: string) {
  return await this.adminService.deleteMemberRelation(id);
}
```

### ⚠️ Considérations Schéma

Le schéma Zod actuel dans `/srv/workspace/cjd80/shared/schema.ts` définit:
```typescript
relationType: z.enum(['sponsor', 'team', 'custom'])
```

Mais la page utilise les types demandés:
```typescript
'sponsor' | 'godparent' | 'colleague' | 'friend' | 'business_partner'
```

**À faire:** Soit mettre à jour le schéma, soit adapter la page aux types existants. Actuellement, la page est écrite selon la spécification.

## Code Locations

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `/srv/workspace/cjd80/app/(protected)/admin/members/relations/page.tsx` | Page principal | 642 |
| `/srv/workspace/cjd80/lib/api/client.ts` | QueryKeys ajoutées | +5 lignes |

## Vérifications Effectuées

✅ TypeScript strict: `npx tsc --noEmit` - 0 erreurs
✅ Toutes les icônes importées depuis lucide-react
✅ Composants shadcn/ui disponibles
✅ Query keys correctement typées
✅ Pas de `any`, `as any`, `@ts-ignore`
✅ Gestion d'erreurs complète avec try-catch
✅ Validations de formulaire

## Navigation

La page est accessible via:
```
/admin/members/relations
```

Depuis le menu principal, le lien peut être ajouté dans la nav à côté des autres sections membres (tags, tasks, etc.)

## Dépendances Requises

Toutes les dépendances sont déjà présentes:
- `@tanstack/react-query` ✓
- `shadcn/ui` (Card, Table, Badge, etc.) ✓
- `lucide-react` ✓
- `next.js` (client component avec 'use client') ✓

## Prochaines Étapes

1. Implémenter les endpoints backend listés ci-dessus
2. Adapter le schéma Zod si nécessaire
3. Tester la page complète via `.rbw.ovh`
4. Ajouter un lien de navigation dans le menu admin
5. Optionnel: Ajouter une colonne "Créé par" dans la table
6. Optionnel: Ajouter la possibilité d'éditer une relation
