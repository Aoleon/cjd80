# Architecture API - CJD80

## Vue d'Ensemble

CJD80 utilise une architecture API hybride combinant REST (NestJS) et tRPC pour des cas d'usage complémentaires. Chaque approche a sa propre source de vérité et ses propres mécanismes de génération de types.

## Principe Fondamental : Une Seule Source de Vérité

**Règle d'Or Robinswood** : Éviter les doublons de validation/documentation en définissant une source unique par type d'API.

---

## 1. Backend REST API (NestJS + OpenAPI)

### 🎯 Source de Vérité pour Contrats Externes

**Pile Technologique :**
- **Validation** : `class-validator` + `class-transformer` (DTOs)
- **Documentation** : OpenAPI généré automatiquement via `@nestjs/swagger`
- **Client** : Généré depuis le spec OpenAPI
- **Format** : JSON, support CORS

### Usage Principal

- API publique externe
- Intégrations tierces
- Webhooks entrants/sortants
- Health checks et monitoring
- Authentication OAuth2/JWT

### Endpoints Principaux

```
GET  /api/health          # Health check
GET  /api/docs            # Swagger UI
GET  /api/docs-json       # OpenAPI Spec JSON
POST /api/auth/login      # Authentication
POST /api/auth/oauth2     # OAuth2 flow
```

### Exemple de DTO

```typescript
// apps/backend/src/modules/ideas/dto/create-idea.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIdeaDto {
  @ApiProperty({ description: 'Titre de l\'idée', example: 'Nouvelle initiative' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description détaillée', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['SUBMITTED', 'REVIEW', 'APPROVED'], default: 'SUBMITTED' })
  @IsEnum(['SUBMITTED', 'REVIEW', 'APPROVED'])
  @IsOptional()
  status?: string;
}
```

### Génération Automatique

1. **OpenAPI Spec** : Généré automatiquement depuis les décorateurs `@ApiProperty()`
2. **Swagger UI** : Interface interactive sur `/api/docs`
3. **Validation** : Automatique via `ValidationPipe` globale
4. **Types Client** : Générés via `openapi-generator` ou `swagger-typescript-api`

### Avantages

✅ Contrats stables et versionnés (v1, v2)
✅ Documentation interactive (Swagger UI)
✅ Compatible avec tous les clients HTTP
✅ Standard OpenAPI 3.0 reconnu
✅ Testable via Postman/Insomnia

### ⚠️ Ce qu'il ne faut PAS faire

❌ Maintenir une documentation OpenAPI séparée manuellement
❌ Dupliquer les DTOs en Zod pour la même API
❌ Créer des clients manuellement (utiliser le générateur)

---

## 2. tRPC API (Type-Safe Automatique)

### 🎯 PAS d'OpenAPI - Types TypeScript Natifs

**Pile Technologique :**
- **Validation** : Zod schemas (partagés frontend/backend)
- **Types** : Inférés automatiquement par TypeScript
- **Client** : Généré par tRPC automatiquement
- **Format** : JSON sur HTTP, WebSocket pour subscriptions
- **Transport** : HTTP POST uniquement

### Principe Clé

**tRPC n'a PAS besoin d'OpenAPI** car les types sont générés automatiquement de bout en bout. Créer de la documentation OpenAPI pour tRPC est un **doublon inutile**.

### Usage Principal

- Communication frontend/backend interne
- Formulaires et CRUD rapides
- Real-time avec subscriptions
- Type-safety end-to-end sans configuration
- Pas d'intégration externe

### Routers Principaux

```typescript
// Routers disponibles
- ideas         # Gestion des idées
- events        # Événements
- loans         # Prêts et ressources
- members       # Membres JCE
- patrons       # Mécènes
- financial     # Finances
- tracking      # Suivi activités
- admin         # Administration
- auth          # Authentification
```

### Exemple de Router

```typescript
// apps/backend/src/trpc/routers/ideas.router.ts
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

// Schema Zod partagé (source unique)
const createIdeaSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  status: z.enum(['SUBMITTED', 'REVIEW', 'APPROVED']).default('SUBMITTED'),
});

export const ideasRouter = router({
  create: protectedProcedure
    .input(createIdeaSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.idea.create({ data: input });
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.idea.findMany();
    }),
});

// Types automatiquement inférés :
// - createIdeaSchema → z.infer<typeof createIdeaSchema>
// - Pas besoin de définir d'interface supplémentaire
```

### Utilisation Frontend

```typescript
// apps/frontend/src/hooks/useIdeas.ts
import { trpc } from '@/lib/trpc';

export function useCreateIdea() {
  const utils = trpc.useContext();

  return trpc.ideas.create.useMutation({
    onSuccess: () => {
      utils.ideas.list.invalidate();
    },
  });
}

// TypeScript sait automatiquement que create.mutate() attend :
// { title: string; description?: string; status?: 'SUBMITTED' | 'REVIEW' | 'APPROVED' }
```

### Génération Automatique

1. **Types TypeScript** : Inférés automatiquement depuis Zod
2. **Hooks React** : `useMutation`, `useQuery` typés automatiquement
3. **Validation** : Automatique côté backend via Zod
4. **Erreurs** : Typées et propagées automatiquement

### Avantages

✅ Type-safety end-to-end sans configuration
✅ Pas de génération de code manuelle
✅ Pas de doublon validation/types
✅ Refactoring sûr (renommage détecté)
✅ Erreurs de type à la compilation
✅ Performance optimale (requêtes batched)

### ⚠️ Ce qu'il ne faut PAS faire

❌ Créer de la documentation OpenAPI pour tRPC (doublon inutile)
❌ Générer des types manuellement (ils sont automatiques)
❌ Redéfinir les schémas Zod côté frontend (utiliser les types inférés)
❌ Utiliser tRPC pour des intégrations externes (préférer REST)

---

## 3. Frontend (Next.js)

### 🎯 Zod UNIQUEMENT pour Validations Locales

Le frontend ne doit **jamais** redéfinir les contrats API. Les types viennent de tRPC ou du client généré OpenAPI.

### Usage Correct de Zod Frontend

#### ✅ Validations Formulaires (UX)

```typescript
// apps/frontend/src/components/IdeaForm.tsx
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation UX avec contraintes supplémentaires
const ideaFormSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
});

// Utilisation avec react-hook-form
const form = useForm({
  resolver: zodResolver(ideaFormSchema),
});
```

**Pourquoi c'est correct** : Les contraintes de longueur min/max sont purement UX. Le backend valide le contrat (champs requis, types).

#### ✅ Parsing Données Externes

```typescript
// Webhook externe, CSV import, etc.
const externalDataSchema = z.object({
  eventDate: z.string().transform(str => new Date(str)),
  amount: z.string().transform(str => parseFloat(str)),
});

const parsed = externalDataSchema.parse(unknownData);
```

#### ✅ Runtime Guards

```typescript
// Vérifier données "unknown" à runtime
const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
});

const result = apiResponseSchema.safeParse(response);
if (!result.success) {
  console.error('Invalid response', result.error);
}
```

### ❌ Usages Incorrects de Zod Frontend

#### ❌ Redéfinir le Contrat API

```typescript
// MAUVAIS : Doublon du contrat tRPC
const createIdeaDtoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['SUBMITTED', 'REVIEW', 'APPROVED']),
});

// Le backend a déjà ce schéma !
// Utiliser les types inférés de tRPC à la place
```

#### ❌ Duplication DTOs Backend

```typescript
// MAUVAIS : Redéfinir les DTOs NestJS
const createIdeaDto = z.object({
  title: z.string(),
  // ...
});

// Utiliser le client généré depuis OpenAPI à la place !
```

### Types Frontend Corrects

```typescript
// Types depuis tRPC (automatiques)
import { type RouterOutputs } from '@/lib/trpc';

type Idea = RouterOutputs['ideas']['list'][number];
type CreateIdeaInput = Parameters<typeof trpc.ideas.create.mutate>[0];

// Types depuis client OpenAPI (générés)
import type { CreateIdeaDto, IdeaResponseDto } from '@/generated/api';
```

---

## 4. Comparaison des Approches

| Critère | REST API (NestJS) | tRPC API |
|---------|-------------------|----------|
| **Documentation** | OpenAPI généré | Types TypeScript natifs |
| **Validation** | class-validator | Zod |
| **Client** | Généré (openapi-generator) | Automatique (hooks React) |
| **Type-Safety** | Via génération | Natif end-to-end |
| **Usage Externe** | ✅ Oui | ❌ Non |
| **Usage Interne** | ⚠️ Possible | ✅ Recommandé |
| **Versionning** | ✅ v1, v2 | ⚠️ Breaking changes uniquement |
| **Testabilité** | Postman/Insomnia | Tests TypeScript |
| **Performance** | Standard | Batching automatique |
| **Courbe d'apprentissage** | Standard REST | Nécessite tRPC |

---

## 5. Workflow de Développement

### Ajouter un Endpoint REST

1. Créer DTO avec `class-validator` + `@ApiProperty()`
2. Créer controller avec décorateurs Swagger
3. Tester dans Swagger UI (`/api/docs`)
4. Générer client TypeScript si besoin
5. Documenter dans `API_COMPLETE_DOCUMENTATION.md`

### Ajouter une Procédure tRPC

1. Créer schema Zod dans le router
2. Définir procedure (query/mutation/subscription)
3. Utiliser directement dans le frontend via hooks
4. Les types sont automatiquement disponibles
5. Pas de documentation OpenAPI nécessaire

### Validation Formulaire Frontend

1. Créer schema Zod avec contraintes UX (min/max longueur)
2. Utiliser avec `react-hook-form` + `zodResolver`
3. Ne PAS redéfinir le contrat API
4. Utiliser les types inférés de tRPC ou client généré

---

## 6. Règles Anti-Doublon

### ✅ Bonnes Pratiques

1. **Une seule source de validation par API**
   - REST → `class-validator`
   - tRPC → `Zod`

2. **Pas de documentation manuelle**
   - REST → OpenAPI généré automatiquement
   - tRPC → Types TypeScript natifs

3. **Frontend utilise les types générés**
   - tRPC → Types inférés automatiquement
   - REST → Client généré depuis OpenAPI

4. **Zod frontend = UX uniquement**
   - Contraintes longueur min/max
   - Messages d'erreur localisés
   - Transformations UI

### ❌ Anti-Patterns

1. ❌ Créer OpenAPI pour tRPC (doublon inutile)
2. ❌ Maintenir class-validator + Zod pour même API
3. ❌ Redéfinir DTOs backend dans le frontend
4. ❌ Documentation OpenAPI manuelle (doit être généré)
5. ❌ Types manuels quand ils peuvent être inférés

---

## 7. Ressources

### Documentation Projet

- `API_README.md` - Guide de démarrage rapide
- `API_COMPLETE_DOCUMENTATION.md` - Référence complète
- `API_QUICK_START.md` - Exemples pratiques
- `docs/VALIDATION_BEST_PRACTICES.md` - Bonnes pratiques validation

### Documentation Externe

- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
- [tRPC Documentation](https://trpc.io/docs)
- [Zod Documentation](https://zod.dev)
- [OpenAPI Specification](https://swagger.io/specification/)

### Outils

- Swagger UI : `http://localhost:3001/api/docs`
- Postman Collection : `docs/CJD80_API.postman_collection.json`
- tRPC Playground : Via hooks React directement

---

## Conclusion

L'architecture API de CJD80 évite les doublons en séparant clairement :

1. **REST (NestJS)** : Contrats externes, OpenAPI généré, `class-validator`
2. **tRPC** : Communication interne, types TypeScript natifs, Zod
3. **Frontend** : Zod pour UX uniquement, types depuis tRPC/OpenAPI

**Règle d'Or** : Ne jamais créer de documentation OpenAPI pour tRPC - les types sont déjà générés automatiquement.
