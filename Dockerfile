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
RUN npm run check && npm run build

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

# Installer UNIQUEMENT les production dependencies
# (les devDependencies comme Vite ne sont pas nécessaires en production)
RUN npm ci --omit=dev

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist ./dist

# Créer le dossier logs avec les bonnes permissions
RUN mkdir -p /app/logs && chown -R cjduser:cjd /app

# Utiliser l'utilisateur non-root
USER cjduser

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });"

# Commande de démarrage
CMD ["node", "dist/index.js"]
