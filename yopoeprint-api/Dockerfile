# ── Stage 1 : Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

COPY . .
RUN npm run build

# ── Stage 2 : Production ─────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement les artefacts de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Exposer le port (Railway/Render utilise PORT par défaut)
EXPOSE 3001

CMD ["node", "dist/main"]
