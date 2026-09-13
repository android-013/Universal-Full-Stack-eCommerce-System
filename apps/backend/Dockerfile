FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
RUN corepack enable && pnpm install --filter @ucp/backend --frozen-lockfile=false

FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter @ucp/backend db:generate && pnpm --filter @ucp/backend build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/backend/dist apps/backend/dist
COPY --from=build /app/apps/backend/prisma apps/backend/prisma
COPY --from=build /app/apps/backend/package.json apps/backend/package.json
CMD ["node", "apps/backend/dist/src/server.js"]
