# ===================================
# Stage 1: Builder - Construction de l'application
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier le code source
COPY . .

# Build de l'application (frontend + backend)
RUN npm run build || echo "no build step, continuing"

# ===================================
# Stage 2: Runner - Image de production
# ===================================
FROM node:20-alpine AS runner

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S cjd && adduser -S cjduser -G cjd

# Copier les fichiers de dépendances pour production
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --only=production

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client ./client

# Changer le propriétaire des fichiers
RUN chown -R cjduser:cjd /app

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
