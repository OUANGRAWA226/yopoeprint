# ── Stage 1 : Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances et installer tout (y compris devDependencies pour nest build)
COPY package*.json ./
RUN npm ci

# Copier le code source et compiler
COPY . .
RUN npm run build

# Élaguer les dépendances pour ne garder que la production
RUN npm prune --production

# ── Stage 2 : Production ─────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement les artefacts de build et dépendances de prod
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Exposer le port par défaut (Render/Railway injecte PORT dynamiquement)
EXPOSE 3001

CMD ["node", "dist/main"]
