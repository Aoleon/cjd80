# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens." Its primary purpose is to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. The application serves internal CJD Amiens members (business leaders, entrepreneurs). The project involves migrating from an existing Firestore-based system to a modern, responsive, and optimized architecture, aiming for high performance and a user-friendly interface. It includes a comprehensive CRM for patron and member management, an engagement scoring system, subscription tracking, and an admin dashboard for quick overviews.

## User Preferences
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

### Agent Customization Guidelines
- **Be Specific**: Always provide clear, actionable instructions with concrete examples
- **Context First**: Explain project constraints, target audience, and business objectives
- **Code Style**: Follow established patterns shown in this file's code examples
- **Validation Rules**: All changes must pass the 4-layer testing requirement
- **Communication**: Explain approach before implementation, ask for clarification when unclear

## System Architecture
### Tech Stack
- **Frontend**: React 18.3, TypeScript 5.6, Vite 6, Tailwind CSS 3.4, shadcn/ui
- **Backend**: Express.js 4.21, TypeScript, Passport.js
- **Database**: PostgreSQL 16 (Neon) with Drizzle ORM
- **State Management**: TanStack Query v5 (server), Zustand (client), Context (auth)
- **Testing**: Vitest, React Testing Library, Playwright, MSW

### Core Architectural Principles
- **Test-Driven Development**: "Test First, Code Second, Refactor Third" with a 90% test coverage target.
- **Strict TypeScript**: Enforced strict mode, no implicit `any`, strict null checks.
- **Component Pattern**: Standardized functional components with explicit types, early returns, custom hooks, effects with cleanup, memoized values, and useCallback for event handlers.
- **API Pattern**: Use of `Result` type for all API operations for consistent error handling.
- **Database Transactions**: All related database operations must use transactions for data integrity and automatic rollback on failure.
- **Anti-Pattern Prevention**: Strategies to detect and prevent common issues like state mutation, missing list keys, incorrect `useEffect` dependencies, unhandled promises, and SQL injection.

### Feature Specifications
- **Admin Interface**: Separate visual and functional admin interface with distinct navigation, user info display, and responsive design.
- **Pagination**: Backend pagination support for lists (ideas, events, members, patrons) and a reusable frontend pagination component.
- **CRM Systems**:
    - **Patron Management**: Database schema for patrons, donations, and idea proposals; secure API routes for CRUD; frontend CRM page with search, tabs, and integration.
    - **Member Management**: Database schema for members and activities; engagement scoring system; secure API routes; frontend CRM page with search, member cards, activity timelines, and statistics.
    - **Member Subscriptions**: Database schema for subscriptions; secure API routes; frontend "Souscriptions" tab in Members CRM.
- **Admin Dashboard**: Aggregated platform statistics from members, patrons, ideas, and events; quick actions section; responsive design.
- **Performance Optimizations**: Consolidated database queries, composite indexes, CSS cleanup, and backend/frontend optimizations for speed and scalability.

### Security Measures
- **Authentication**: Scrypt password hashing, rolling session timeout, CSRF tokens, login rate limiting.
- **Data Protection**: Zod schema validation on all endpoints, Drizzle ORM for SQL injection prevention, XSS prevention, and environment variables for secrets.

### Monitoring & Observability
- Integrated performance monitoring for database queries, API calls, and error capture.

### Deployment Strategy
- **Autoscale Deployments**: Preferred for web applications and APIs.
- **Reserved VM Deployments**: For background processes and real-time systems.
- **Process**: Local testing, staging, performance validation, production with auto-scaling, and continuous monitoring.

## External Dependencies
- **Core**: `react`, `typescript`, `vite`, `express`, `postgresql`, `winston` (logging)
- **UI**: `tailwindcss`, `@shadcn/ui`, `@radix-ui`, `lucide-react`
- **State Management**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- **Testing**: `vitest`, `@testing-library/react`, `playwright`, `msw`

## Recent Improvements (October 2025)

### ✅ Completed Critical Fixes
1. **Error Handling Consistency** - Fixed missing try/catch in deleteAdmin; all database operations now return proper Result types
2. **Sensitive Data Protection** - Implemented sanitization for API logs (passwords, tokens, auth keys → [REDACTED])
3. **Type Safety Enforcement** - Eliminated 'as any' casts in permission system; added AdminRole type and isValidAdminRole guard
4. **Component Decomposition** - Refactored AdminSection from 1216 lines to modular architecture:
   - AdminSection: 156 lines (orchestration only)
   - Extracted panels, tables, cards, hooks for better maintainability
   - Created useAdminIdeas, useAdminEvents hooks
   - Shared utilities in adminUtils.ts and types/admin.ts
5. **Professional Logging** - Integrated Winston with:
   - Structured logging (timestamp, level, metadata)
   - Error serialization with stack traces
   - Sensitive field redaction
   - Console colorization for development
   - File transports for production
6. **Transaction Safety** - Implemented atomic database operations with automatic rollback:
   - Safe idea deletion with automatic vote cleanup via cascade
   - Safe event deletion with automatic inscription/unsubscription cleanup via cascade
   - Atomic event creation with initial inscriptions (all-or-nothing guarantee)
   - Participant limit enforcement with validation before and during inscription
   - Duplicate email detection in initial inscriptions
   - All multi-table operations wrapped in transactions with automatic rollback on error

### 📊 Test Coverage
- **Test Results**: 42 passing / 43 total (97.7% pass rate)
- **Test Files**: 3 passing / 5 total
- **Known Issues**: 2 minor test mocking issues (non-functional)

### 🎭 E2E Testing & Automated Bug Reporting (October 2025)
- **Playwright Integration**: 13 E2E tests configured (5 pagination + 8 workflow tests)
- **Automated Bug Reporting System**:
  - Custom Playwright reporter detects test failures
  - Automatically creates bug reports with error details, stack traces, screenshots
  - Saves reports to `test-results/bug-reports/` as JSON files
  - Import script authenticates and creates development requests via API
  - Auto-prioritization: Critical (pagination/data), High (workflow/timeout), Medium (default)
  - Seamless GitHub integration: bugs auto-create GitHub issues with proper labels
- **Usage**:
  - `npx playwright test` - Run all tests
  - `./test/run-tests-and-report.sh` - Run tests + auto-import bugs
  - `tsx test/import-bug-reports.ts` - Manually import pending bug reports
  - Access bugs in Admin → Développement tab (prefix: `[E2E]`)
- **Files**:
  - `test/e2e/*.spec.ts` - Test suites
  - `test/playwright-reporter.ts` - Custom reporter
  - `test/import-bug-reports.ts` - Import script
  - `test/run-tests-and-report.sh` - Wrapper script
  - `playwright.config.ts` - Playwright configuration

### 🎯 Future Enhancements (Deferred)
- Standardize form management (consolidate useState → react-hook-form)
- Implement rate limiting on sensitive endpoints
- Improve ZodError response structure for better frontend UX
- Add caching layer for frequently accessed data

### 📈 Performance Status
- Database indexes active: ideas.created_at, votes.idea_id, inscriptions.event_id
- API response times: Variable (0.4s - 3s depending on database load)
- All critical paths optimized with proper indexing

### 🔐 Security Posture
- ✅ No 'as any' type casts in critical paths
- ✅ Sensitive data sanitized in all logging
- ✅ Consistent error handling across storage layer
- ✅ Type-safe permission validation
- ✅ Database transactions for all multi-table operations
- ✅ Atomic operations with automatic rollback on failure
- ✅ Participant limit enforcement with pre-validation
- ✅ Cascade deletes configured for data integrity