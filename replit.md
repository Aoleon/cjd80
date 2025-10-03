# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens". Its primary purpose is to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. The application serves internal CJD Amiens members (business leaders, entrepreneurs). The project involves migrating from an existing Firestore-based system to a modern, responsive, and optimized architecture, aiming for high performance and a user-friendly interface.

## Recent Changes (October 2025)
### CRM System for Patron Management
Extended the platform with a complete CRM (Customer Relationship Management) system to track and manage potential patrons/donors for the organization:

**Database Schema** (3 new tables):
- `patrons`: Store patron information (firstName, lastName, email, company, phone, role, notes)
- `patron_donations`: Track donation history with amounts in cents, dates (YYYY-MM-DD format), and occasions
- `idea_patron_proposals`: Link ideas with potential patron sponsors, track proposal status (proposed, contacted, declined, converted)

**Backend API** (16 secure routes):
- Patron CRUD: GET/POST/PATCH/DELETE `/api/patrons`, GET `/api/patrons/:id`
- Donations: GET/POST `/api/patrons/:id/donations`
- Proposals: GET `/api/patrons/:id/proposals`, PATCH `/api/proposals/:id`
- All routes protected with `requirePermission('admin.manage')` (super-admin only)

**Frontend Features**:
- `/admin/patrons`: Dedicated CRM page with responsive list/detail layout
- Search functionality with local filtering
- Tabs for patron details, donation history, and proposal timeline
- Quick patron creation dialog accessible from idea proposal form
- Euro formatting for amounts (automatic conversion from cents)
- French date formatting (dd/MM/yyyy)
- Status badges with colors (proposed=orange, contacted=blue, declined=red, converted=green)

**Integration**:
- Patron selector added to idea proposal form (`/propose`) with autocomplete and quick creation
- Admin navigation updated: "Mécènes" link visible only for super-admin role
- TanStack Query integration with proper cache invalidation
- Full TypeScript coverage with Zod validation schemas

**Bug Fixes**:
- Fixed date validation: `donatedAt` now accepts YYYY-MM-DD format (was expecting datetime)
- Corrected TanStack Query keys to use complete URLs for proper cache management
- Added permission guards on all queries to prevent unauthorized API calls

**Testing**:
- E2E test suite covering full CRM workflow: patron creation, donation tracking, idea-patron linking, status updates
- All tests passing with expected UI/UX behavior

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
- **Backend**: Express.js 4.21, TypeScript, Passport.js, compression, helmet
- **Database**: PostgreSQL 16 (Neon) with Drizzle ORM
- **State Management**: TanStack Query v5 (server), Zustand (client), Context (auth)
- **Testing**: Vitest, React Testing Library, Playwright, MSW

### Core Architectural Principles
- **Test-Driven Development**: "Test First, Code Second, Refactor Third" with a 90% test coverage target across unit, integration, and E2E tests.
- **Strict TypeScript**: Enforced strict mode, no implicit `any`, strict null checks, and unused variable/parameter detection.
- **Component Pattern**: Standardized functional components with explicit types, early returns, custom hooks, effects with cleanup, memoized values, and useCallback for event handlers.
- **API Pattern**: Use of `Result` type for all API operations for consistent error handling.
- **Database Transactions**: All related database operations must use transactions for data integrity and automatic rollback on failure.
- **Anti-Pattern Prevention**: Strategies to detect and prevent common issues like state mutation, missing list keys, incorrect `useEffect` dependencies, unhandled promises, and SQL injection.

### Performance Optimizations
- **Database**: Connection pooling (min=2, max=20), optimized indexes, prepared statements, and query execution times under 1ms.
- **Frontend**: Code splitting, image lazy loading, virtual scrolling, memoization, and Service Worker caching.
- **Backend**: Response compression, ETag caching, rate limiting (100 req/min), and circuit breakers for external services.

### Security Measures
- **Authentication**: Scrypt password hashing, 24h rolling session timeout, CSRF tokens, and login rate limiting.
- **Data Protection**: Zod schema validation on all endpoints, Drizzle ORM for SQL injection prevention, XSS prevention via React auto-escaping and CSP headers, and environment variables for secrets management.

### Monitoring & Observability
- Integrated performance monitoring for database queries (logging slow queries), API calls, and error capture with context.

### Deployment Strategy
- **Autoscale Deployments**: Preferred for web applications and APIs with variable traffic and horizontal scalability.
- **Reserved VM Deployments**: For background processes, persistent connections, and real-time systems.
- **Deployment Process**: Local testing, staging deployment, performance validation, production deployment with auto-scaling, and continuous monitoring.

## External Dependencies
- **Core**: `react`, `typescript`, `vite`, `express`, `postgresql`
- **UI**: `tailwindcss`, `@shadcn/ui`, `@radix-ui`, `lucide-react`
- **State Management**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- **Testing**: `vitest`, `@testing-library/react`, `playwright`, `msw`
```