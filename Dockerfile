# Dockerfile pour AMD Parc Informatique
# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build du frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY next.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY app/ ./app/
COPY components/ ./components/
COPY public/ ./public/

# Build de l'application
RUN npm run build

# Stage 2: Build du backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copier les fichiers de configuration backend
COPY backend/package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source backend
COPY backend/ ./

# Stage 3: Image finale
FROM node:18-alpine AS production

# Installer les dépendances système
RUN apk add --no-cache dumb-init

# Créer l'utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Créer les répertoires de travail
WORKDIR /app

# Copier le frontend buildé
COPY --from=frontend-builder --chown=nextjs:nodejs /app/out ./out
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./public

# Copier le backend
COPY --from=backend-builder --chown=nextjs:nodejs /app ./backend

# Copier les scripts de démarrage
COPY --chown=nextjs:nodejs scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Exposer les ports
EXPOSE 3000 10000

# Utiliser dumb-init pour gérer les signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande par défaut
CMD ["./start.sh"]
