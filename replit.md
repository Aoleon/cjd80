# CJD Amiens - Internal Web Application

## Overview

This is an internal web application for the Centre des Jeunes Dirigeants (CJD) d'Amiens, designed to facilitate communication and collaboration among members. The application serves as a comprehensive platform that enables members to share ideas, vote on proposals, and manage event registrations.

The application replicates the functionality of an existing tool on cjd80.fr while providing a modern, responsive interface. It features a collaborative idea-sharing system (called "Boîte à Kiffs"), event management capabilities, and administrative controls for managing content and users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture. The application uses Vite as the build tool and development server, providing fast development cycles and optimized production builds. The UI is built with shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistent design patterns.

Key frontend technologies:
- React 18 with TypeScript for type safety
- Vite for build tooling and development server
- TanStack Query for server state management
- Wouter for lightweight client-side routing
- Tailwind CSS for styling with custom design tokens
- shadcn/ui component library for consistent UI elements

The application follows a single-page application (SPA) pattern with different sections (ideas, propose, events, admin) managed through client-side routing. State management is handled through React Query for server state and React's built-in state management for local component state.

### Backend Architecture
The backend follows a RESTful API architecture built with Express.js and TypeScript. The server provides API endpoints for managing ideas, votes, events, and event registrations, along with authentication capabilities for administrative functions.

Key backend technologies:
- Express.js with TypeScript for the REST API
- Passport.js with local strategy for authentication
- Session-based authentication with PostgreSQL session store
- Password hashing using Node.js crypto module with scrypt

The API is structured around resource-based endpoints (/api/ideas, /api/votes, /api/events, etc.) and includes proper error handling, validation, and authentication middleware where required.

### Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes tables for ideas, votes, events, event registrations, and administrative users.

Database design:
- PostgreSQL with Neon serverless for cloud hosting
- Drizzle ORM for schema definition and queries
- Type-safe database operations with generated TypeScript types
- Session storage using connect-pg-simple for PostgreSQL
- UUID-based primary keys for all entities

The schema supports the core functionality with proper relationships between entities (ideas to votes, events to registrations) and includes audit fields like creation timestamps.

### Authentication and Authorization
The application implements a two-tier access model. Public access is available for core functionality (viewing/voting on ideas, proposing ideas, viewing/registering for events) without requiring user accounts. Administrative access is protected by username/password authentication for content moderation and management.

Authentication features:
- Public access for member interactions (no registration required)
- Administrative authentication using Passport.js
- Session-based authentication with secure cookies
- Password hashing using scrypt for security
- Protected routes for administrative functions

### External Dependencies

**Development and Build Tools:**
- Vite for frontend build tooling and development server
- TypeScript for type safety across the entire stack
- ESBuild for optimized production builds
- PostCSS with Tailwind CSS for styling

**Database and ORM:**
- Neon Database (serverless PostgreSQL) for data persistence
- Drizzle ORM for type-safe database operations
- connect-pg-simple for PostgreSQL session storage

**UI and Component Libraries:**
- Radix UI primitives for accessible component foundations
- shadcn/ui for pre-built component library
- Lucide React for consistent iconography
- Tailwind CSS for utility-first styling

**State Management and Data Fetching:**
- TanStack React Query for server state management
- React Hook Form with Zod resolvers for form handling
- Zod for runtime type validation

**Authentication and Security:**
- Passport.js for authentication strategy
- Express Session for session management
- Node.js crypto module for password hashing

**Development Environment:**
- Replit-specific plugins for development environment integration
- Custom Vite plugins for error handling and debugging