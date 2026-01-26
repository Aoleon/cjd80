# CJD80 Project Context

## Project Information
- **Name:** CJD80 - Boîte à Kiffs
- **Type:** Internal Web Application
- **Organization:** Centre des Jeunes Dirigeants (CJD) Amiens
- **Status:** Production + Development
- **Priority:** Medium (Internal business application)

## URLs
- **Production:** https://cjd80.fr
- **Development:** http://cjd80.rbw.ovh
- **Local Dev:** http://localhost:3000 (Next.js) + http://localhost:5000 (NestJS)

## Purpose
Collaborative platform for CJD Amiens members to:
- Manage and vote on innovative ideas
- Organize events with HelloAsso integration
- Manage CRM for members and sponsors
- Handle administrative tasks with role-based permissions
- Provide PWA experience with offline capabilities

## Technical Stack Summary
- **Backend:** NestJS 11 + TypeScript + Drizzle ORM + PostgreSQL 16
- **Frontend:** Next.js 15 + React 19 + TanStack Query + Tailwind CSS
- **Auth:** Authentik (OAuth2/OIDC)
- **Storage:** MinIO (S3-compatible)
- **Services:** PostgreSQL, Redis, MinIO, Authentik (Docker Compose)

## Key Migration Status (January 2025)
- ✅ Backend migrated from Express.js to NestJS 11
- ⚠️ Next.js 15 → 16 + Turbopack migration planned
- ⚠️ Zod v3 → v4 migration planned
- ⚠️ tRPC → REST API + OpenAPI/Swagger migration planned

## Critical Patterns
- TypeScript strict mode (zero `any` types)
- Drizzle ORM query builders (no raw SQL)
- Semantic color system (17 configurable colors)
- NestJS dependency injection
- Session-based authentication via Authentik
- PWA with service workers and offline queue

## Documentation
- CLAUDE.md - Architecture and development patterns
- .claude-stack.md - Complete technical stack
- .claude-rules.md - Project-specific rules
- README.md - Full project documentation
- docs/ - Organized technical documentation
