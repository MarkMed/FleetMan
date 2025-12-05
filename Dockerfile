# ============================================
# FleetMan Backend - Multi-stage Dockerfile
# Optimized for pnpm monorepo workspaces
# ============================================

# ============================================
# Stage 1: Builder - Compila todo el monorepo
# ============================================
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="FleetMan Team"
LABEL description="FleetMan Backend - Builder Stage"

# Habilitar pnpm con corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Set working directory
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copiar configs (tsconfig.base.json necesario para builds)
COPY configs ./configs

# Copiar TODOS los packages (necesarios para resolver workspace:*)
COPY packages ./packages

# Copiar el backend app
COPY apps/backend ./apps/backend

# Instalar todas las dependencias (resuelve workspace:*)
RUN pnpm install --frozen-lockfile

# Build de todos los packages EN ORDEN (respetando dependencias)
RUN pnpm --filter @packages/shared build
RUN pnpm --filter @packages/domain build
RUN pnpm --filter @packages/contracts build
RUN pnpm --filter @packages/persistence build
RUN pnpm --filter @packages/infra build

# Build del backend
RUN pnpm --filter @app/backend build

# ============================================
# Stage 2: Production - Solo runtime necesario
# ============================================
FROM node:20-alpine AS production

# Metadata
LABEL maintainer="FleetMan Team"
LABEL description="FleetMan Backend - Production"

# Habilitar pnpm (necesario para resolver workspace dependencies en runtime)
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Instalar dumb-init para mejor manejo de señales
RUN apk add --no-cache dumb-init

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Cambiar ownership al usuario nodejs
RUN chown -R nodejs:nodejs /app

# Copiar workspace config (necesario para pnpm)
COPY --chown=nodejs:nodejs pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copiar packages compilados (solo dist + package.json)
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/package.json ./packages/shared/package.json

COPY --from=builder --chown=nodejs:nodejs /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/domain/package.json ./packages/domain/package.json

COPY --from=builder --chown=nodejs:nodejs /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/contracts/package.json ./packages/contracts/package.json

COPY --from=builder --chown=nodejs:nodejs /app/packages/persistence/dist ./packages/persistence/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/persistence/package.json ./packages/persistence/package.json

COPY --from=builder --chown=nodejs:nodejs /app/packages/infra/dist ./packages/infra/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/infra/package.json ./packages/infra/package.json

# Copiar backend compilado
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/package.json ./apps/backend/package.json

# Instalar SOLO dependencias de producción
RUN pnpm install --frozen-lockfile

# Cambiar al usuario no-root
USER nodejs

# Variables de entorno (defaults, se sobrescriben en runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Health check nativo de Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Exponer puerto
EXPOSE 3000

# Working directory del backend
WORKDIR /app/apps/backend

# Usar dumb-init para mejor manejo de señales (SIGTERM, SIGINT)
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
# CMD ["node", "dist/main.js"]
CMD ["pnpm", "start:prod"]
