FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN corepack enable && pnpm install --filter @ucp/frontend --frozen-lockfile=false

FROM deps AS build
COPY apps/frontend apps/frontend
RUN pnpm --filter @ucp/frontend build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/frontend/.next apps/frontend/.next
COPY --from=build /app/apps/frontend/public apps/frontend/public
COPY --from=build /app/apps/frontend/package.json apps/frontend/package.json
WORKDIR /app/apps/frontend
CMD ["node", "../../node_modules/next/dist/bin/next", "start"]
