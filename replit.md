# CJD Amiens - Application Web Interne "Boîte à Kiffs"

## Overview
This project is an internal web application for the "Centre des Jeunes Dirigeants (CJD) d'Amiens". Its primary purpose is to facilitate collaborative idea sharing ("Boîte à Kiffs"), enable voting on proposals, and manage events with HelloAsso integration. The application serves internal CJD Amiens members (business leaders, entrepreneurs). The project involves migrating from an existing Firestore-based system to a modern, responsive, and optimized architecture, aiming for high performance and a user-friendly interface.

## User Preferences
**Style**: Utilisez un langage simple et quotidien, évitez le jargon technique complexe.

**Format des Réponses**:
- Expliquez d'abord ce que vous allez faire et pourquoi
- Décomposez les tâches complexes en étapes claires
- Utilisez des listes à puces (✓) pour montrer les progrès
- Demandez des clarifications si les exigences ne sont pas claires
- Fournissez des explications brèves pour les décisions techniques

**Reporting**: Utilisez `mark_completed_and_get_feedback` après chaque fonctionnalité majeure complète pour obtenir des retours utilisateur.

**Anti-Loop Strategy**: Utilisez les checkpoints automatiques Replit pour éviter les boucles de développement :
- **Checkpoint Before**: Créer un point de sauvegarde avant toute modification majeure
- **Validate First**: Tester une petite partie avant d'implémenter la solution complète
- **Rollback Ready**: Utiliser `suggest_rollback` si plus de 3 tentatives échouent sur la même fonctionnalité
- **Progress Tracking**: Documenter chaque étape réussie pour éviter la répétition d'actions

**Coding Guidelines**:
- **Always use TypeScript** pour tous les nouveaux fichiers JavaScript
- **Type Safety**: Définir explicitement les types pour tous les paramètres de fonction et valeurs de retour
- **Interfaces**: Utiliser des interfaces pour les objets complexes, pas des types inline
- **Functional Components**: Toujours utiliser des composants fonctionnels avec hooks
- **Custom Hooks**: Créer des hooks personnalisés pour la logique réutilisable
- **State Management**: React Query pour l'état serveur, useState pour l'état local
- **Drizzle ORM**: Utiliser exclusivement Drizzle pour les opérations DB
- **Type Safety**: Définir des schémas avec validation Zod
- **Transactions**: Grouper les opérations liées dans des transactions
- **Tailwind CSS**: Utiliser exclusivement Tailwind pour le styling
- **Design System**: shadcn/ui components comme base, personnaliser si nécessaire
- **Color Scheme**: Couleur principale CJD `#00a844` définie comme `cjd-green`
- **Typography**: Police Lato pour toute l'application
- **API Errors**: Toujours utiliser try/catch avec middleware de gestion d'erreur
- **Form Validation**: React Hook Form + Zod resolver pour validation côté client
- **Toast Notifications**: useToast hook pour les retours utilisateur

**Robustness & Maintainability Patterns**:
- **NEVER** utiliser des opérations destructrices (DELETE, UPDATE) sans demande explicite
- **ALWAYS** utiliser des transactions pour les opérations liées
- **BACKUP-FIRST**: Créer checkpoint avant toute migration/modification de schéma
- **VALIDATE-BEFORE**: Tester les requêtes avec `EXPLAIN ANALYZE` avant exécution
- **ROLLBACK-READY**: Préparer les scripts de rollback avant chaque changement

**Iterative Testing Strategy (Anti-Loop)**:
- **Never** répéter la même approche qui a échoué 2 fois
- **Always** analyser les logs d'erreur avant nouvelle tentative
- **Stop** si aucun progrès après 15 minutes sur une seule fonctionnalité
- **Document** chaque échec avec la raison pour éviter répétition

## System Architecture

### Tech Stack & Core Decisions
The application uses a modern web stack:
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui.
-   **Backend**: Express.js, TypeScript, Passport.js for authentication.
-   **Database**: PostgreSQL (Neon) with Drizzle ORM, optimized for connection pooling.
-   **State Management**: TanStack Query for server state, React hooks for local state.
-   **Routing**: Wouter for lightweight client-side routing.

### Recent Performance Achievements (August 19, 2025)
-   **Ultra-Robust Validation**: Pattern Result<T> implemented for 100% error handling
-   **Database Performance**: 181ms average query time, optimized connection pooling
-   **Transaction Safety**: All operations atomic with commit/rollback logging
-   **Real-time Monitoring**: DB pool stats, query logging, performance tracking
-   **Anti-Duplicate Protection**: Votes and inscriptions with business logic validation

### UI/UX Decisions
-   **Styling**: Exclusively uses Tailwind CSS for utility-first styling.
-   **Component Library**: Based on shadcn/ui components, customizable as needed.
-   **Color Scheme**: The primary CJD color `#00a844` is defined as `cjd-green` in the CSS.
-   **Typography**: Lato font is used consistently across the application.
-   **Responsiveness**: Designed with a responsive interface to ensure usability across devices.

### System Design Choices
-   **Database Schema**: Designed to mirror the original Firestore structure, including `admins`, `ideas`, `votes`, `events`, and `inscriptions` tables.
-   **API Structure**: RESTful endpoints (`/api/ideas`, `/api/votes`, `/api/events`, `/api/inscriptions`).
-   **Authentication**: Session-based authentication using Passport.js, with email as the primary username. Admin routes are protected, while core functionalities are publicly accessible.
-   **Input Validation**: All API inputs are validated using Zod schemas.
-   **Performance Optimizations**: Includes an optimized database connection pool (max: 20, idle: 30s) and frontend caching/invalidation via TanStack Query. Real-time DB performance monitoring is integrated.
-   **Security**: Implements Scrypt hashing for passwords, secure cookies with timeouts, CSRF protection, and rate limiting for login attempts. SQL injection is prevented through exclusive use of Drizzle ORM, parameterized queries, and Zod input validation.
-   **Robustness**: Emphasizes ultra-safe database operations (transactions, backup-first, validate-before, rollback-ready), robust error handling with try/catch and middleware, and comprehensive form validation. Features like graceful degradation, circuit breakers, and health checks are integrated.

## External Dependencies
**Core Stack**: React 18, TypeScript, Vite, Express.js, PostgreSQL (Neon), Drizzle ORM
**UI/UX**: Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons  
**State/Auth**: TanStack Query, Passport.js, React Hook Form, Zod validation
**Performance**: Connection pooling optimisé, monitoring temps réel, health checks automatiques
**Security**: Scrypt hashing, CSRF protection, input sanitization, rate limiting
**Monitoring**: Real-time DB stats, error tracking, performance alerts, automated recovery

## Development Anti-Patterns (AVOID)

**❌ Loop-Causing Patterns**:
- Modifier plusieurs fichiers simultanément sans test intermédiaire
- Réessayer la même solution échouée plus de 2 fois
- Ignorer les messages d'erreur LSP avant de continuer
- Implémenter des fonctionnalités complexes sans décomposition

**❌ Robustness Killers**:
- Utiliser `any` type au lieu de types stricts
- Oublier la validation d'entrée sur les APIs
- Mutation directe d'état sans immutabilité
- Requêtes DB sans gestion d'erreur/transaction

**❌ Maintenance Nightmares**:
- Code dupliqué au lieu de patterns réutilisables
- Couplage fort entre composants
- Absence de documentation sur les décisions techniques
- Tests unitaires manquants pour la logique métier critique

**✅ Success Indicators**:
- **Reliability**: Zero downtime deployment possible
- **Performance**: < 200ms response time maintained
- **Security**: No vulnerabilities in dependency scan
- **Maintainability**: New features can be added in < 2 hours
- **Testability**: 90%+ code coverage on critical paths