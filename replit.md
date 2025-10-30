# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens," designed to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. It targets internal CJD Amiens members (business leaders, entrepreneurs), aiming to provide a modern, responsive, and high-performance platform with a user-friendly interface. Key capabilities include comprehensive CRM for patron and member management, an engagement scoring system, subscription tracking, and an admin dashboard for quick overviews. The project emphasizes a modern, optimized architecture.

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
- **Admin Interface**: Dedicated visual and functional admin interface with distinct navigation and responsive design.
- **CRM Systems**: Comprehensive Patron and Member Management with search, tabs, engagement scoring, and activity timelines. Includes tracking of member subscriptions and CJD Roles.
- **Event Management**: Integration with HelloAsso, and a comprehensive event sponsorship system allowing multi-level tracking, public visibility, and management via admin interfaces and public display.
- **Idea Management**: Collaborative "Boîte à Kiffs" for proposing and voting on ideas, including a "Nouveau" badge for recent ideas.
- **Admin Dashboard**: Provides aggregated platform statistics and quick actions.
- **System Status Page**: Centralized monitoring page (`/statuts`) displaying real-time health checks for all services (Application, Database, Database Pool, Memory, Email, Push Notifications). Features visual indicators, auto-refresh every 30 seconds, and manual refresh. Public endpoint `/api/status/all` with strongly-typed responses using shared Zod schemas.
- **Branding & Customization**: A centralized, multi-tenant branding configuration system with a SUPER_ADMIN UI for live customization, allowing dynamic branding across all application layers, including PWA enhancements, email templates, and static files. Features a unified semantic color system.
- **Performance Optimizations**: Consolidated database queries, composite indexes, and general backend/frontend optimizations.
- **PWA Enhancements**: Offline queue and synchronization, automatic sync service, offline status banner, native sharing, rich push notifications, and Badge API.

### Security Measures
- **Authentication**: Scrypt password hashing, rolling session timeout, CSRF tokens, login rate limiting.
- **Data Protection**: Zod schema validation, Drizzle ORM for SQL injection prevention, XSS prevention, environment variables for secrets.

### Monitoring & Observability
- Integrated performance monitoring for database queries, API calls, and error capture (Winston for logging).
- **Database Resilience Layer**: Circuit breaker pattern with CLOSED/OPEN/HALF_OPEN states, automatic retry logic with exponential backoff, differentiated timeouts (2s health checks, 5s normal queries, 10s complex operations), health status caching for graceful degradation during Neon outages. Prevents application hangs (300s → 2-5s max) and enables fail-fast behavior.

### Deployment Strategy
- **Autoscale Deployments**: Preferred for web applications and APIs.
- **Reserved VM Deployments**: For background processes and real-time systems.

## External Dependencies
- **Core**: `react`, `typescript`, `vite`, `express`, `postgresql`, `winston` (logging)
- **UI**: `tailwindcss`, `@shadcn/ui`, `@radix-ui`, `lucide-react`
- **State Management**: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
- **Testing**: `vitest`, `@testing-library/react`, `playwright`, `msw`