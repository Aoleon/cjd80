# ===================================
# Stage 1: Builder - Construction de l'application
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (toutes, y compris devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Vérifications et build (frontend + backend)
# Augmenter la limite de mémoire Node.js pour éviter les erreurs "heap out of memory"
# Désactiver source maps en production pour économiser la mémoire
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=3072
# Séparer check et build pour éviter les problèmes de mémoire
RUN npm run check
RUN npm run build

# ===================================
# Stage 2: Runner - Image de production
# ===================================
FROM node:20-alpine AS runner

WORKDIR /app

# Installer wget pour les health checks
RUN apk add --no-cache wget

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S cjd && adduser -S cjduser -G cjd

# Copier package.json pour référence
COPY --from=builder /app/package*.json ./

# Installer les production dependencies + drizzle-kit pour les migrations
# drizzle-kit est nécessaire pour exécuter les migrations en production
RUN npm ci --omit=dev && \
    npm install drizzle-kit --save-dev --no-audit --no-fund || true

# Copier les fichiers nécessaires pour les migrations (drizzle-kit)
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared

# Créer vite.config.js (nécessaire pour les imports dynamiques, même si non utilisé en production)
# En production, setupVite n'est pas appelé, mais le module peut être importé
RUN echo 'export default {};' > vite.config.js

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist ./dist

# Créer le dossier logs avec les bonnes permissions
RUN mkdir -p /app/logs && chown -R cjduser:cjd /app

# Utiliser l'utilisateur non-root
USER cjduser

# Exposer le port
EXPOSE 5000

# Build arg pour le tag Git
ARG GIT_TAG=main-unknown

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000
ENV GIT_TAG=${GIT_TAG}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Commande de démarrage
CMD ["node", "dist/index.js"]
