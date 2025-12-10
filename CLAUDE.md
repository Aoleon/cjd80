# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CJD Amiens "Boîte à Kiffs" - Modern internal web application for collaborative idea management, event organization with HelloAsso integration, and comprehensive administration interface.

**Tech Stack:**
- **Backend:** NestJS 11 (migrated from Express.js) + TypeScript + Drizzle ORM
- **Frontend:** React 18 + TypeScript + Vite + TanStack Query + Wouter routing
- **Database:** PostgreSQL (Neon) with connection pooling
- **Auth:** Authentik (OAuth2/OIDC) via Docker Compose
- **Storage:** MinIO (S3-compatible)
- **UI:** Tailwind CSS + shadcn/ui with semantic color system
- **PWA:** Service workers, offline queue, push notifications

**Key Features:**
- Collaborative idea management with voting system
- Event management with HelloAsso integration
- CRM for members and sponsors
- Customizable branding system (17 configurable colors)
- Progressive Web App with native-like features
- OAuth2/OIDC authentication via Authentik

## Important Architecture Patterns

### NestJS Migration Status

The backend has been **migrated from Express.js to NestJS** (January 2025). Key points:

- **11 modules** organized by feature (auth, ideas, events, admin, members, patrons, loans, financial, tracking, chatbot, branding)
- **Dependency injection** throughout - use constructor-based DI
- **Main entry:** `server/src/main.ts` bootstraps the NestJS app
- **App module:** `server/src/app.module.ts` imports all feature modules
- **Controllers** handle HTTP requests, **Services** contain business logic
- **Guards** for authentication (`AuthGuard`) and permissions (`PermissionGuard`)
- **Interceptors** for logging and DB monitoring (global)
- **Filters** for exception handling (global `HttpExceptionFilter`)

**Module Structure Pattern:**
```
server/src/{feature}/
├── {feature}.module.ts       # Feature module
├── {feature}.controller.ts   # HTTP endpoints
└── {feature}.service.ts      # Business logic
```

### Authentik Integration

Authentication is handled by **Authentik** (external IdP) via OAuth2/OIDC:

- **Strategy:** `server/src/auth/strategies/authentik.strategy.ts` using Passport OAuth2
- **Config:** Environment variables (`AUTHENTIK_CLIENT_ID`, `AUTHENTIK_CLIENT_SECRET`, etc.)
- **User sync:** Automatic synchronization of users from Authentik to local `admins` table
- **Group mapping:** Authentik groups → application roles (super_admin, ideas_manager, etc.)
- **Session-based:** Express sessions stored in database (connect-pg-simple)
- **Docker services:** PostgreSQL, Redis, Authentik server/worker in `docker-compose.services.yml`

**Critical Files:**
- `server/src/auth/auth.module.ts` - Passport configuration
- `server/src/auth/user-sync.service.ts` - User synchronization logic
- `server/src/integrations/authentik/authentik.service.ts` - Authentik API client

### Database Architecture

**Drizzle ORM** with PostgreSQL:
- **Schema:** `shared/schema.ts` - Single source of truth for DB schema + Zod validation
- **Tables:** admins, ideas, votes, events, inscriptions, members, patrons, loan_items, budgets, expenses, tracking_items
- **Connection:** `server/src/common/database/database.providers.ts` provides injectable `DB` token
- **Migrations:** Run `npm run db:push` to sync schema changes

**Key Patterns:**
- Use Drizzle query builders, not raw SQL
- Validation schemas derived from table schemas via `createInsertSchema()`
- Indexes on frequently queried columns (status, email, dates)
- Cascade deletes for referential integrity

### Shared Types and Validation

The `shared/` directory contains types used by **both frontend and backend**:
- `shared/schema.ts` - Drizzle tables, Zod schemas, TypeScript types
- `shared/errors.ts` - Custom error types

**Pattern:** When adding a new feature:
1. Define table in `shared/schema.ts`
2. Export insert/select schemas (Zod)
3. Run `npm run db:push` to apply changes
4. Use types in both backend (controllers/services) and frontend (components/hooks)

### Frontend State Management

**TanStack Query** for server state:
- **Hooks pattern:** `client/src/hooks/use-*.ts` - Custom hooks for data fetching
- **Queries:** `useQuery` for GET operations (auto-cached, auto-revalidated)
- **Mutations:** `useMutation` for POST/PUT/DELETE with optimistic updates
- **Query invalidation:** Mutations automatically invalidate related queries

**Example Pattern:**
```typescript
// Hook: client/src/hooks/use-ideas.ts
export function useIdeas() {
  return useQuery({
    queryKey: ["/api/ideas"],
    queryFn: async () => {
      const res = await fetch("/api/ideas");
      return res.json();
    }
  });
}

// Component usage:
const { data: ideas, isLoading } = useIdeas();
```

### Branding System

**Centralized configuration** for multi-tenant-ready customization:
- **Core config:** `client/src/config/branding-core.ts` - All text, colors, logos (JS object)
- **Generation script:** `npm run generate:config` creates `index.html` and `manifest.json`
- **Admin interface:** `/admin/branding` route allows SUPER_ADMIN to modify branding
- **Semantic colors:** 17 configurable colors (success, warning, error, info families) in `client/src/index.css`
- **Helper functions:** `client/src/lib/branding.ts` for accessing branding values

**Pattern:** Use semantic color classes (`bg-success`, `text-error`) instead of hardcoded Tailwind colors.

## Common Development Commands

### Development

```bash
# Start full dev environment (Docker services + DB migration + dev servers)
npm run start:dev

# Start frontend only (Vite dev server on :5173)
npm run dev:client

# Start backend only (NestJS on :5000)
npm run dev

# Type checking
npm run check
```

### Database

```bash
# Push schema changes to database
npm run db:push

# Connect to database (psql)
npm run db:connect

# Monitor database connections
npm run db:monitor

# View DB statistics
npm run db:stats
```

### Docker Services

```bash
# Start services (PostgreSQL, Redis, Authentik)
docker compose -f docker-compose.services.yml up -d postgres redis authentik-server authentik-worker

# Stop services
docker compose -f docker-compose.services.yml down

# View logs
docker compose -f docker-compose.services.yml logs -f authentik-server
```

### Authentik Setup

```bash
# Automated Authentik configuration
./scripts/setup-authentik.sh

# Reset entire environment (WARNING: deletes all data)
npm run reset:env

# Clean all caches
npm run clean:all
```

### Building and Deployment

```bash
# Build for production (compiles backend + frontend)
npm run build

# Start production server
npm start

# Validate application health
npm run validate

# Generate branding config files
npm run generate:config
```

### Testing and Validation

```bash
# Playwright E2E tests
npm run test:playwright

# Analyze test results
npm run test:analyze

# Check dependencies
npm run check:deps

# Validate environment variables
npm run validate:env

# Complete health check
npm run health:check
```

### GitHub Operations

```bash
# Authenticate with GitHub CLI
npm run gh:auth

# Create PR
npm run gh:pr

# Deploy via GitHub Actions
npm run gh:deploy

# View GitHub Actions status
npm run gh:actions
```

### SSH and Remote Operations

```bash
# Setup SSH access to remote server
npm run ssh:setup

# Connect to remote server
npm run ssh:connect

# Mount remote filesystem locally
npm run ssh:mount

# Sync files to remote server
npm run ssh:sync
```

## Critical Development Patterns

### Creating a New NestJS Module

1. **Generate with NestJS CLI:**
   ```bash
   npx nest generate module features/my-feature --no-spec
   npx nest generate controller features/my-feature --no-spec
   npx nest generate service features/my-feature --no-spec
   ```

2. **Define schema in `shared/schema.ts`:**
   ```typescript
   export const myFeatures = pgTable("my_features", {
     id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
     title: text("title").notNull(),
     createdAt: timestamp("created_at").defaultNow().notNull()
   });

   export const insertMyFeatureSchema = createInsertSchema(myFeatures);
   ```

3. **Create service with DB injection:**
   ```typescript
   @Injectable()
   export class MyFeatureService {
     constructor(@Inject('DB') private db: Database) {}

     async findAll() {
       return this.db.query.myFeatures.findMany();
     }
   }
   ```

4. **Create controller with guards:**
   ```typescript
   @Controller('api/my-features')
   export class MyFeatureController {
     constructor(private myFeatureService: MyFeatureService) {}

     @Get()
     @UseGuards(AuthGuard)  // Require authentication
     async findAll() {
       return this.myFeatureService.findAll();
     }
   }
   ```

5. **Import module in `app.module.ts`**

### Adding a Database Table

1. **Define in `shared/schema.ts`** with Drizzle schema
2. **Add indexes** for frequently queried columns
3. **Create Zod validation schemas** using `createInsertSchema()`
4. **Run `npm run db:push`** to apply changes
5. **Update TypeScript types** (auto-inferred from schema)

### Authentication and Authorization

**Pattern for protected routes:**
```typescript
@Controller('api/admin/features')
@UseGuards(AuthGuard)  // Session-based auth
export class AdminFeatureController {
  @Get()
  @Permissions('super_admin', 'ideas_manager')  // Role-based permissions
  @UseGuards(PermissionGuard)
  async findAll() { ... }
}
```

**Getting current user:**
```typescript
@Get('profile')
@UseGuards(AuthGuard)
async getProfile(@User() user: Admin) {  // Use @User() decorator
  return user;
}
```

### Frontend Component Patterns

**Standard component structure:**
```typescript
export function MyComponent() {
  // 1. State hooks
  const [localState, setLocalState] = useState();

  // 2. Data fetching hooks (TanStack Query)
  const { data, isLoading } = useQuery(...);

  // 3. Mutation hooks
  const mutation = useMutation({
    mutationFn: async (data) => { ... },
    onSuccess: () => queryClient.invalidateQueries(["/api/resource"])
  });

  // 4. Event handlers
  const handleSubmit = () => mutation.mutate(data);

  // 5. Early returns for loading/error states
  if (isLoading) return <Spinner />;

  // 6. Render
  return <div>...</div>;
}
```

### Error Handling

**Backend (NestJS):**
- Throw standard HTTP exceptions: `throw new BadRequestException('message')`
- Use global exception filter (`HttpExceptionFilter`) for consistent error responses
- Log errors with structured logging: `logger.error('message', { context: { ... } })`

**Frontend:**
- Use TanStack Query's `isError` state
- Display user-friendly error messages from `error.message`
- Use toast notifications for transient errors
- ErrorBoundary component catches React errors

### PWA Service Worker

**Offline queue pattern:**
- Actions saved to IndexedDB when offline
- Auto-sync every hour or when online returns
- Banner shows offline status
- Located in `client/public/sw.js` and `client/public/sw-register.js`

## Project-Specific Conventions

### File Naming

- **Backend:** `kebab-case.ts` for files, `PascalCase` for classes
- **Frontend:** `PascalCase.tsx` for components, `kebab-case.tsx` for pages
- **Shared:** `kebab-case.ts` for schemas and utilities

### Import Aliases

- `@/` → `client/src/` (frontend code)
- `@shared/` → `shared/` (shared types/schemas)

### Semantic Colors

**Use semantic classes instead of hardcoded colors:**
- Success: `bg-success`, `text-success`, `border-success`
- Warning: `bg-warning`, `text-warning`, `border-warning`
- Error: `bg-error`, `text-error`, `border-error`
- Info: `bg-info`, `text-info`, `border-info`

**Each has dark/light variants:**
- Dark: `bg-success-dark`, `text-success-dark`
- Light: `bg-success-light`, `text-success-light`

### Status Constants

Always use constants from `shared/schema.ts`:
- **Ideas:** `IDEA_STATUS.PENDING`, `IDEA_STATUS.APPROVED`, etc.
- **Events:** `EVENT_STATUS.DRAFT`, `EVENT_STATUS.PUBLISHED`, etc.
- **Loans:** `LOAN_STATUS.AVAILABLE`, `LOAN_STATUS.BORROWED`, etc.
- **Admins:** `ADMIN_ROLES.SUPER_ADMIN`, `ADMIN_STATUS.ACTIVE`, etc.

## Environment Variables

**Required for development:**
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/database

# Session
SESSION_SECRET=generate-strong-secret-key

# Authentik OAuth2
AUTHENTIK_BASE_URL=http://localhost:9002
AUTHENTIK_CLIENT_ID=your-client-id
AUTHENTIK_CLIENT_SECRET=your-client-secret
AUTHENTIK_ISSUER=http://localhost:9002/application/o/cjd80/
AUTHENTIK_REDIRECT_URI=http://localhost:5000/api/auth/authentik/callback
AUTHENTIK_TOKEN=your-authentik-api-token

# MinIO (optional)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

**Setup:**
1. Copy `.env.example` to `.env`
2. Start Docker services: `docker compose -f docker-compose.services.yml up -d`
3. Configure Authentik via web UI at http://localhost:9002
4. Fill in Authentik variables from UI
5. Run `npm run start:dev`

## Testing

**Playwright E2E tests:**
- Located in `tests/e2e/`
- Run with `npm run test:playwright`
- Reports in `tests/reports/`

**Manual testing checklist:**
1. Ideas CRUD and voting
2. Events CRUD and registration
3. Admin authentication via Authentik
4. Member/patron management
5. Loan items management
6. Financial dashboard
7. PWA offline mode

## Documentation

**Key documentation files:**
- `README.md` - Complete project documentation
- `docs/` - Organized technical documentation
- `docs/deployment/` - Deployment guides
- `docs/features/` - Feature documentation (e.g., `CUSTOMIZATION.md`)
- `docs/migration/` - Migration reports (NestJS, Authentik)
- `.cursor/rules/` - Extensive Cursor AI rules (100+ files)

## Common Issues and Solutions

**"Module not found" errors:**
- Check import aliases are configured in `tsconfig.json`
- Verify file exists at expected path
- Restart TypeScript server

**Database connection errors:**
- Ensure PostgreSQL container is running: `docker compose -f docker-compose.services.yml ps`
- Check `DATABASE_URL` format and credentials
- For Neon: use connection string from Neon dashboard

**Authentik authentication fails:**
- Verify Authentik services are running: `docker compose -f docker-compose.services.yml logs authentik-server`
- Check callback URL matches in both `.env` and Authentik provider config
- Ensure application is created in Authentik with correct OAuth2 settings
- Verify groups exist in Authentik and are mapped to users

**Build fails with heap out of memory:**
- Use production Dockerfile: `docker build -f Dockerfile.production .`
- Or build locally and deploy: `./scripts/build-and-copy-to-vps.sh`

**Service worker not updating:**
- Clear browser cache and service worker
- Check `deploy-info.json` has new timestamp
- Hard reload: Ctrl+Shift+R

## Key Files to Reference

**Architecture:**
- `server/src/main.ts` - Application bootstrap
- `server/src/app.module.ts` - Module imports and global config
- `shared/schema.ts` - Database schema and validation

**Authentication:**
- `server/src/auth/auth.module.ts` - Passport and session config
- `server/src/auth/strategies/authentik.strategy.ts` - OAuth2 strategy
- `server/src/auth/guards/auth.guard.ts` - Session auth guard

**Frontend:**
- `client/src/App.tsx` - Main app component and routing
- `client/src/hooks/` - TanStack Query hooks
- `client/src/lib/branding.ts` - Branding helpers

**Configuration:**
- `client/src/config/branding-core.ts` - Branding configuration
- `docker-compose.services.yml` - Docker services
- `.env.example` - Environment variable template

**Scripts:**
- `scripts/start-dev.sh` - Automated dev environment setup
- `scripts/setup-authentik.sh` - Authentik configuration automation
- `scripts/build-and-copy-to-vps.sh` - VPS deployment with local build
