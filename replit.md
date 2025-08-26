# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens". Its primary purpose is to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. The application serves internal CJD Amiens members (business leaders, entrepreneurs). The project involves migrating from an existing Firestore-based system to a modern, responsive, and optimized architecture, aiming for high performance and a user-friendly interface.

## User Preferences & Communication

### Primary Communication Rule
**🎯 CRITICAL**: Les remarques de l'utilisateur concernent **TOUJOURS** ce qu'il voit dans l'interface utilisateur (UI/frontend), sauf indication contraire explicite. Interpréter systématiquement depuis la perspective visuelle de l'utilisateur.

### Response Format
- **Langage**: Simple et quotidien, éviter le jargon technique complexe
- **Structure**: 
  1. Expliquer d'abord ce que vous allez faire et pourquoi
  2. Décomposer les tâches complexes en étapes claires (max 5 étapes)
  3. Utiliser des listes à puces (✓) pour montrer les progrès
  4. Demander des clarifications si les exigences ne sont pas claires
  5. Fournir des explications brèves (1-2 phrases) pour les décisions techniques

### UI-First Interpretation
- **Défaut**: Toute remarque = problème d'interface visible
- **Priorités**: Interface visible > Logique métier > Backend > Infrastructure
- **Validation**: Toujours vérifier visuellement après chaque modification
- **Feedback**: Utiliser `mark_completed_and_get_feedback` après chaque changement UI

## Test-Driven Development Culture

### Testing Philosophy
**"Test First, Code Second, Refactor Third"**

### Testing Pyramid (90% Coverage Target)
```
         /\         E2E Tests (10%)
        /  \        - Critical user journeys
       /    \       - Cross-browser testing
      /      \      
     /--------\     Integration Tests (30%)
    /          \    - API endpoints
   /            \   - Database operations
  /              \  - Component interactions
 /________________\ Unit Tests (60%)
                    - Business logic
                    - Utility functions
                    - Component rendering
```

### Iterative Development Process
1. **Small Steps** (max 30 min per iteration)
   - Break features into micro-tasks
   - Test each micro-task independently
   - Create checkpoint after each success
   
2. **Test Categories**
   - **Pre-Implementation**: Write test scenarios first
   - **During Implementation**: Run tests every 5 lines of code
   - **Post-Implementation**: Full regression testing
   - **Performance Testing**: < 50ms API response required

3. **Validation Checklist** (Before Each Commit)
   - [ ] LSP diagnostics clean (`get_latest_lsp_diagnostics`)
   - [ ] Type safety verified (no `any` types)
   - [ ] UI renders correctly in browser
   - [ ] API response < 50ms
   - [ ] Error handling tested
   - [ ] Accessibility checked (ARIA labels)

### Tests Systématiques Obligatoires
**🚨 RÈGLE ABSOLUE** : Toute modification ou ajout de fonctionnalité DOIT être accompagné de tests couvrant SANS EXCEPTION :

1. **Backend** : 
   - Tests unitaires des services et utilitaires
   - Tests d'intégration des opérations de base de données
   - Validation des schémas Zod
   - Gestion d'erreurs et cas limites

2. **Routes API** :
   - Tests de tous les endpoints (GET, POST, PUT, DELETE)
   - Validation des codes de statut HTTP
   - Tests d'authentification et d'autorisation
   - Validation des corps de requête et réponse

3. **Frontend** :
   - Tests de rendu des composants
   - Tests d'interactions utilisateur (clics, saisies)
   - Tests de gestion d'état (hooks, context)
   - Tests de navigation et routing

4. **Interface Utilisateur** :
   - Tests E2E des parcours critiques
   - Tests d'accessibilité (ARIA, navigation clavier)
   - Tests responsive (mobile, tablet, desktop)
   - Tests de performance UI (Core Web Vitals)

**Aucune Pull Request ne sera acceptée sans cette couverture complète.**

### Checkpoint Strategy
- **Before**: Major changes, database migrations, dependency updates
- **During**: Every successful test pass
- **After**: Feature completion, before deployment
- **Rollback Trigger**: 3 consecutive test failures

## Quality Standards & Metrics

### Code Quality Gates
- **Type Coverage**: 100% (no implicit `any`)
- **Test Coverage**: 90% minimum
- **Bundle Size**: < 500KB gzipped
- **Lighthouse Score**: > 95 all categories
- **API Response**: < 50ms (p99)
- **Error Rate**: < 0.1%
- **Code Duplication**: < 3%

### Performance Benchmarks
```typescript
// Required performance standards
const PERFORMANCE_REQUIREMENTS = {
  api: {
    p50: 30,  // ms
    p95: 45,  // ms
    p99: 50   // ms
  },
  frontend: {
    FCP: 1.0,   // First Contentful Paint (seconds)
    LCP: 2.5,   // Largest Contentful Paint (seconds)
    FID: 100,   // First Input Delay (ms)
    CLS: 0.1    // Cumulative Layout Shift
  },
  database: {
    connectionPool: { min: 2, max: 20 },
    queryTimeout: 5000,  // ms
    idleTimeout: 60000   // ms
  }
};
```

## Coding Guidelines & Best Practices

### TypeScript Strict Mode
```typescript
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

### Component Pattern
```typescript
// ALWAYS use this pattern for components
interface ComponentProps {
  // Explicit types, no 'any'
  data: SpecificType;
  onAction: (param: TypedParam) => void;
  className?: string; // Optional props marked
}

export function Component({ data, onAction, className }: ComponentProps) {
  // Early returns for edge cases
  if (!data) return null;
  
  // Custom hooks at top
  const { state, actions } = useCustomHook();
  
  // Effects with cleanup
  useEffect(() => {
    const cleanup = setupSomething();
    return cleanup;
  }, [dependency]);
  
  // Memoized values
  const computed = useMemo(() => expensiveCalc(data), [data]);
  
  // Event handlers
  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    onAction(computed);
  }, [computed, onAction]);
  
  return (
    <div className={cn("base-styles", className)} data-testid="component-name">
      {/* Content */}
    </div>
  );
}
```

### API Pattern with Error Handling
```typescript
// ALWAYS use Result pattern for API operations
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

async function apiOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error('[API Error]', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

### Database Transaction Pattern
```typescript
// ALWAYS use transactions for related operations
async function safeDbOperation() {
  return await db.transaction(async (tx) => {
    try {
      // Validation first
      const validation = validateInput(data);
      if (!validation.success) {
        throw new ValidationError(validation.error);
      }
      
      // Operations
      const result1 = await tx.insert(table1).values(data1);
      const result2 = await tx.update(table2).set(data2);
      
      // Logging
      console.log('[DB] Transaction successful', { result1, result2 });
      
      return { success: true, data: { result1, result2 } };
    } catch (error) {
      console.error('[DB] Transaction failed, rolling back', error);
      throw error; // Triggers automatic rollback
    }
  });
}
```

## Anti-Pattern Detection & Prevention

### Loop Prevention Strategy
```typescript
const MAX_RETRIES = 3;
const ERROR_TRACKER = new Map<string, number>();

function preventLoop(errorKey: string, action: () => void) {
  const attempts = ERROR_TRACKER.get(errorKey) || 0;
  
  if (attempts >= MAX_RETRIES) {
    console.error(`[LOOP DETECTED] ${errorKey} failed ${MAX_RETRIES} times`);
    // Trigger rollback
    return { needsRollback: true };
  }
  
  ERROR_TRACKER.set(errorKey, attempts + 1);
  
  try {
    action();
    ERROR_TRACKER.delete(errorKey); // Reset on success
  } catch (error) {
    console.error(`[Attempt ${attempts + 1}/${MAX_RETRIES}]`, error);
    throw error;
  }
}
```

### Common Anti-Patterns to Detect
1. **State Mutation**: Use `immer` or spread operators
2. **Missing Keys in Lists**: Always provide stable, unique keys
3. **useEffect Dependencies**: ESLint rule must be enabled
4. **Async Without Cleanup**: Always handle component unmounting
5. **SQL Injection**: Use parameterized queries only
6. **Unhandled Promises**: Every promise needs .catch or try/catch
7. **Memory Leaks**: Clear intervals, remove listeners, abort fetches

## System Architecture

### Tech Stack (Optimized 2025)
- **Frontend**: React 18.3, TypeScript 5.6, Vite 6, Tailwind CSS 3.4, shadcn/ui
- **Backend**: Express.js 4.21, TypeScript, Passport.js, compression, helmet
- **Database**: PostgreSQL 16 (Neon) with Drizzle ORM, optimized indexes
- **State**: TanStack Query v5 (server), Zustand (client), Context (auth)
- **Testing**: Vitest, React Testing Library, Playwright, MSW
- **Monitoring**: Custom performance tracking, error boundaries, health checks

### Performance Optimizations Applied
- **Database**: 
  - Connection pool: min=2, max=20, idle=60s
  - Indexes on all foreign keys and filtered columns
  - Query optimization: < 1ms execution time
  - Prepared statements for all queries
  
- **Frontend**:
  - Code splitting by route
  - Image lazy loading with intersection observer
  - Virtual scrolling for large lists
  - Memoization of expensive computations
  - Service Worker with intelligent caching
  
- **Backend**:
  - Response compression (gzip/brotli)
  - ETag caching headers
  - Rate limiting: 100 req/min per IP
  - Circuit breaker for external services

### Security Measures
- **Authentication**: 
  - Scrypt password hashing (N=16384, r=8, p=1)
  - Session timeout: 24h rolling
  - CSRF tokens on all mutations
  - Rate limiting on login: 5 attempts/15min
  
- **Data Protection**:
  - Input validation: Zod schemas on all endpoints
  - SQL injection prevention: Drizzle ORM only
  - XSS prevention: React auto-escaping + CSP headers
  - Secrets management: Environment variables only

### Monitoring & Observability
```typescript
// Performance monitoring integrated
const MONITORING = {
  dbQueries: {
    slowThreshold: 100, // ms
    logQuery: (query, time) => {
      if (time > MONITORING.dbQueries.slowThreshold) {
        console.warn(`[SLOW QUERY] ${time}ms:`, query);
      }
    }
  },
  apiCalls: {
    logRequest: (method, path, time, status) => {
      console.log(`[API] ${method} ${path} - ${status} in ${time}ms`);
    }
  },
  errors: {
    captureException: (error, context) => {
      console.error('[ERROR]', { error, context, timestamp: Date.now() });
      // Send to monitoring service in production
    }
  }
};
```

## Development Workflow

### Branch Strategy
- `main`: Production-ready code only
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `test/*`: Experimental changes

### Pre-Commit Checklist
1. [ ] All tests passing (`npm test`)
2. [ ] No TypeScript errors (`npm run type-check`)
3. [ ] No ESLint warnings (`npm run lint`)
4. [ ] Performance benchmarks met
5. [ ] Documentation updated
6. [ ] Changelog entry added

### Deployment Process
1. **Local Testing**: Full test suite + manual QA
2. **Staging**: Deploy to test environment
3. **Smoke Tests**: Critical path validation
4. **Production**: Blue-green deployment
5. **Monitoring**: Watch metrics for 30 min
6. **Rollback Ready**: Previous version on standby

## Success Metrics

### User Experience
- **Page Load**: < 2s on 3G
- **Interaction**: < 100ms response
- **Error Rate**: < 0.1% of sessions
- **Availability**: 99.9% uptime

### Developer Experience
- **Build Time**: < 30s
- **Test Suite**: < 2 min
- **New Feature**: < 2 hours to implement
- **Bug Fix**: < 30 min average
- **Code Review**: < 1 hour turnaround

### Business Metrics
- **User Engagement**: > 80% weekly active
- **Feature Adoption**: > 60% within 1 week
- **Support Tickets**: < 5 per week
- **Performance Complaints**: 0 tolerance

## External Dependencies (Locked Versions)
```json
{
  "core": {
    "react": "^18.3.1",
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "express": "^4.21.0",
    "postgresql": "^16.0.0"
  },
  "ui": {
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "^0.9.0",
    "@radix-ui": "^1.2.0",
    "lucide-react": "^0.400.0"
  },
  "state": {
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "zod": "^3.24.0"
  },
  "testing": {
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "playwright": "^1.48.0",
    "msw": "^2.6.0"
  }
}
```

## Continuous Improvement
- **Weekly**: Performance review & optimization
- **Bi-weekly**: Dependency updates & security scan
- **Monthly**: User feedback integration
- **Quarterly**: Architecture review & refactoring

---
*Last Updated: January 2025*
*Version: 2.0.0*
*Maintainer: CJD Amiens Development Team*