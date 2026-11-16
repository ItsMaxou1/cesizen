# ===== Étape 1 : build =====
FROM node:26-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Génère le client Prisma (pour Alpine) puis compile TypeScript -> dist/
RUN npx prisma generate && npm run build

# ===== Étape 2 : image d'exécution (légère, sans outils de dev) =====
FROM node:26-alpine
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
# Dépendances de production + la CLI Prisma (même version) pour appliquer les migrations au démarrage
RUN npm ci --omit=dev \
 && npm install --no-save prisma@5.22.0 \
 && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma
# Exécution avec un utilisateur non-root (principe du moindre privilège)
RUN addgroup -S cesizen && adduser -S cesizen -G cesizen && chown -R cesizen:cesizen /app
USER cesizen
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1
# Applique les migrations de la base puis démarre l'API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
