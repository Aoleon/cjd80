# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens." Its primary purpose is to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. The application serves internal CJD Amiens members (business leaders, entrepreneurs). The project aims to provide a modern, responsive, and optimized architecture, high performance, and a user-friendly interface. Key capabilities include a comprehensive CRM for patron and member management, an engagement scoring system, subscription tracking, and an admin dashboard for quick overviews.

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
- **Test-Driven Development**: Target 90% test coverage.
- **Strict TypeScript**: Enforced strict mode, no implicit `any`, strict null checks.
- **Component Pattern**: Standardized functional components with explicit types, custom hooks, and memoization.
- **API Pattern**: Use of `Result` type for all API operations for consistent error handling.
- **Database Transactions**: All related database operations must use transactions for data integrity.
- **Anti-Pattern Prevention**: Strategies to detect and prevent common issues like state mutation, missing list keys, incorrect `useEffect` dependencies, unhandled promises, and SQL injection.

### Feature Specifications
- **Admin Interface**: Separate visual and functional admin interface with distinct navigation and responsive design.
- **Pagination**: Backend pagination for lists and a reusable frontend component.
- **CRM Systems**: Patron Management (schema, API, frontend CRM with search, tabs), Member Management (schema, engagement scoring, API, frontend CRM with search, member cards, activity timelines), Member Subscriptions (schema, API, frontend tab).
- **Admin Dashboard**: Aggregated platform statistics, quick actions section, responsive design.
- **Performance Optimizations**: Consolidated database queries, composite indexes, CSS cleanup, and backend/frontend optimizations.
- **PWA Enhancements**: Offline queue and synchronization (IndexedDB-based), automatic sync service, offline status banner, native sharing (Web Share API), rich push notifications with inline actions, and Badge API for notification counters.
- **Branding & Customization**: Fully centralized branding configuration system enabling easy multi-tenant support and open-source deployment. Three-layer architecture: `branding-core.ts` (pure config, Node.js compatible), `branding.ts` (extends with Vite assets for frontend), and generation script for static files (index.html, manifest.json). All 15+ components use branding helpers (getAppName, getShortAppName, getOrgName). Systematic theme unification across all application layers: service worker (generic cache names), CSS variables (documented aliases), email templates (dynamic branding), and static files. Comprehensive customization guide in `CUSTOMIZATION.md`. Execute `npm run generate:config` to regenerate static files after branding changes. README.md includes complete documentation of features, installation, and branding configuration.

### Security Measures
- **Authentication**: Scrypt password hashing, rolling session timeout, CSRF tokens, login rate limiting.
- **Data Protection**: Zod schema validation, Drizzle ORM for SQL injection prevention, XSS prevention, environment variables for secrets.

### Monitoring & Observability
- Integrated performance monitoring for database queries, API calls, and error capture (Winston for logging).

### Deployment Strategy
- **Autoscale Deployments**: Preferred for web applications and APIs.
- **Reserved VM Deployments**: For background processes and real-time systems.
- **Process**: Local testing, staging, performance validation, production with auto-scaling, and continuous monitoring.

## External Dependencies
- **Core**: `react`, `typescript`, `vite`, `express`, `postgresql`, `winston` (logging)
- **UI**: `tailwindcss`, `@shadcn/ui`, `@radix-ui`, `lucide-react`
- **State Management**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- **Testing**: `vitest`, `@testing-library/react`, `playwright`, `msw`