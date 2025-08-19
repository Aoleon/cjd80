# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Project Context

**Purpose**: Application web interne pour le Centre des Jeunes Dirigeants (CJD) d'Amiens permettant le partage d'idées collaboratives, le vote sur les propositions, et la gestion d'événements.

**Target Users**: Membres internes du CJD Amiens (dirigeants d'entreprise, entrepreneurs)

**Key Features**:
- Système collaboratif de partage d'idées ("Boîte à Kiffs")
- Vote et évaluation des propositions
- Gestion d'événements avec inscriptions via HelloAsso
- Interface d'administration pour la modération

**Technical Context**: Migration depuis un outil existant (cjd80.fr/Firestore) vers une architecture moderne avec interface responsive et performances optimisées.

## Communication Preferences

**Style**: Utilisez un langage simple et quotidien, évitez le jargon technique complexe.

**Format des Réponses**:
- Expliquez d'abord ce que vous allez faire et pourquoi
- Décomposez les tâches complexes en étapes claires
- Utilisez des listes à puces (✓) pour montrer les progrès
- Demandez des clarifications si les exigences ne sont pas claires
- Fournissez des explications brèves pour les décisions techniques

**Reporting**: Utilisez `mark_completed_and_get_feedback` après chaque fonctionnalité majeure complète pour obtenir des retours utilisateur.

## Coding Guidelines

### TypeScript Standards
- **Always use TypeScript** pour tous les nouveaux fichiers JavaScript
- **Type Safety**: Définir explicitement les types pour tous les paramètres de fonction et valeurs de retour
- **Interfaces**: Utiliser des interfaces pour les objets complexes, pas des types inline

```typescript
// ✓ Bon exemple
interface IdeaWithVotes extends Omit<Idea, "voteCount"> {
  voteCount: number;
}

async function createIdea(idea: InsertIdea): Promise<Idea> {
  // implementation
}

// ✗ Éviter
function createIdea(idea: any): any {
  // implementation
}
```

### React Component Patterns
- **Functional Components**: Toujours utiliser des composants fonctionnels avec hooks
- **Custom Hooks**: Créer des hooks personnalisés pour la logique réutilisable
- **State Management**: React Query pour l'état serveur, useState pour l'état local

```typescript
// ✓ Pattern préféré pour les composants
export default function IdeasSection() {
  const { data: ideas, isLoading } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-4">
      {ideas?.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
    </div>
  );
}
```

### Database Patterns
- **Drizzle ORM**: Utiliser exclusivement Drizzle pour les opérations DB
- **Type Safety**: Définir des schémas avec validation Zod
- **Transactions**: Grouper les opérations liées dans des transactions

```typescript
// ✓ Pattern d'API route avec validation
app.post("/api/ideas", async (req, res, next) => {
  try {
    const validatedData = insertIdeaSchema.parse(req.body);
    const idea = await storage.createIdea(validatedData);
    res.status(201).json(idea);
  } catch (error) {
    next(error);
  }
});
```

### Styling Guidelines
- **Tailwind CSS**: Utiliser exclusivement Tailwind pour le styling
- **Design System**: shadcn/ui components comme base, personnaliser si nécessaire
- **Color Scheme**: Couleur principale CJD `#00a844` définie comme `cjd-green`
- **Typography**: Police Lato pour toute l'application

```css
/* ✓ Pattern CSS pour les couleurs personnalisées */
:root {
  --cjd-green: #00a844;
}

.text-cjd-green { color: var(--cjd-green); }
.bg-cjd-green { background-color: var(--cjd-green); }
```

```tsx
// ✓ Pattern de composant avec styling Tailwind
<Button className="bg-cjd-green hover:bg-green-600 text-white">
  <Vote className="w-4 h-4 mr-2" />
  Voter
</Button>
```

### Error Handling Patterns
- **API Errors**: Toujours utiliser try/catch avec middleware de gestion d'erreur
- **Form Validation**: React Hook Form + Zod resolver pour validation côté client
- **Toast Notifications**: useToast hook pour les retours utilisateur

```typescript
// ✓ Pattern de gestion d'erreur API
const mutation = useMutation({
  mutationFn: async (data) => {
    const res = await apiRequest("POST", "/api/ideas", data);
    return await res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    toast({ title: "Succès!", description: "Idée créée" });
  },
  onError: (error) => {
    toast({ 
      title: "Erreur", 
      description: error.message,
      variant: "destructive" 
    });
  },
});
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Passport.js authentication
- **Database**: PostgreSQL (Neon) + Drizzle ORM avec connection pooling optimisé
- **State Management**: TanStack Query pour serveur, React hooks pour local
- **Routing**: Wouter (lightweight client-side routing)

### Database Schema (Migration Firestore → PostgreSQL)
```sql
-- Structure principale conforme aux spécifications Firestore originales
admins: email (PK), password, added_by, created_at
ideas: id, title, description, proposed_by, proposed_by_email, status, deadline, created_at, updated_at, updated_by
votes: id, idea_id, voter_name, voter_email, created_at  
events: id, title, description, date, hello_asso_link, created_at, updated_at, updated_by
inscriptions: id, event_id, name, email, created_at
```

### API Structure
- **RESTful endpoints**: `/api/ideas`, `/api/votes`, `/api/events`, `/api/inscriptions`
- **Authentication**: Session-based avec Passport.js (email comme username)
- **Protection**: Routes admin protégées, accès public pour fonctionnalités principales
- **Validation**: Zod schemas pour toutes les entrées API

### Performance Optimizations
- **Database**: Pool de connexions optimisé (max: 20, idle: 30s)
- **Frontend**: TanStack Query avec mise en cache et invalidation automatique
- **Monitoring**: Surveillance temps réel des performances DB avec interface admin

## Development Workflow

### File Organization
```
├── client/src/
│   ├── components/          # Composants React réutilisables
│   │   ├── ui/             # shadcn/ui components
│   │   ├── ideas-section.tsx
│   │   ├── admin-section.tsx
│   │   └── admin-db-monitor.tsx
│   ├── hooks/              # Custom hooks (use-auth.tsx, use-toast.ts)
│   ├── lib/                # Utilitaires (queryClient.ts, utils.ts)
│   └── pages/              # Pages principales
├── server/
│   ├── middleware/         # Middleware personnalisés (db-monitoring.ts)
│   ├── utils/              # Utilitaires serveur (db-health.ts)
│   ├── routes.ts           # Routes API principales
│   ├── auth.ts             # Configuration authentication
│   ├── storage.ts          # Interface base de données
│   └── db.ts               # Configuration pool PostgreSQL
└── shared/
    └── schema.ts           # Schémas Drizzle partagés
```

### Authentication Model
- **Public Access**: Consultation/vote idées, proposition idées, inscription événements
- **Admin Access**: email/password avec session PostgreSQL, audit trail complet
- **Security**: Hashing scrypt, timeouts session, protection CSRF

### Database Operations
- **NEVER** utiliser des opérations destructrices (DELETE, UPDATE) sans demande explicite
- **ALWAYS** utiliser des transactions pour les opérations liées
- **PREFER** l'interface storage définie plutôt que des requêtes directes

### Testing Strategy
- Tester d'abord avec `mark_completed_and_get_feedback` avant validation finale
- Utiliser l'onglet "Monitoring DB" pour vérifier les performances
- Vérifier les logs de connexion pool pour détecter les goulots d'étranglement

## Recent Changes & Status

### ✅ Completed Features
- **Database Migration**: Migration complète Firestore → PostgreSQL avec préservation de la structure
- **Authentication System**: Système d'auth admin avec email comme clé primaire
- **Connection Pooling**: Optimisation avancée du pool PostgreSQL (max: 20, monitoring temps réel)
- **Admin Interface**: Interface complète avec gestion idées/événements + onglet monitoring DB
- **Performance Monitoring**: Détection requêtes lentes, stats pool en temps réel
- **UI/UX**: Design CJD avec couleur #00a844, police Lato, interface responsive

### 🎯 Current Status
- **Functional**: Application pleinement opérationnelle avec toutes les fonctionnalités principales
- **Performance**: Temps de réponse optimisés (2655ms → 199ms après optimisations)
- **Admin Account**: `admin@cjd-amiens.fr` configuré pour tests
- **Monitoring**: Interface temps réel disponible dans l'onglet admin "Monitoring DB"

### 🔄 Development Guidelines
- **Database Changes**: Utiliser `execute_sql_tool` pour modifications schema
- **Performance Issues**: Consulter l'onglet monitoring pour diagnostics
- **New Features**: Suivre les patterns établis dans `/client/src/components/`
- **API Changes**: Maintenir compatibilité avec validation Zod existante

### 🚀 Deployment Ready
- Application prête pour déploiement avec `suggest_deploy` une fois validée par l'utilisateur
- Monitoring de santé DB intégré pour environnement de production
- Gestion gracieuse des connexions et cleanup automatique des sessions

## External Dependencies
**Core Stack**: React 18, TypeScript, Vite, Express.js, PostgreSQL (Neon), Drizzle ORM
**UI/UX**: Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
**State/Auth**: TanStack Query, Passport.js, React Hook Form, Zod validation
**Performance**: Connection pooling optimisé, monitoring temps réel, health checks automatiques