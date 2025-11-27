# Stage de build
FROM node:20-alpine AS builder
WORKDIR /build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages
RUN corepack enable && corepack prepare pnpm@9 --activate
RUN pnpm install --frozen-lockfile
COPY apps/backend ./apps/backend
RUN pnpm --filter @app/backend build

# Stage runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=prod

# Copiar artefactos de build y archivos necesarios para instalar deps prod
COPY --from=builder /build/apps/backend/dist ./dist
COPY --from=builder /build/apps/backend/package.json ./package.json
COPY --from=builder /build/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /build/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Instalar solo dependencias de producción para el paquete backend
RUN corepack enable && corepack prepare pnpm@9 --activate \
  && pnpm install --frozen-lockfile --prod --filter @app/backend

# Ejecutar como usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001
CMD ["node", "dist/main.js"]