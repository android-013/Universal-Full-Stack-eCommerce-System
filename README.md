# Universal Commerce Platform

A modular commerce engine that can power fashion, grocery, electronics, food, parts, and custom product businesses through configuration instead of hardcoded store logic.

## Workspace

- `apps/frontend` - Next.js storefront and admin shell.
- `apps/backend` - Express.js API with modular commerce services.
- `packages/config` - Shared configuration loader and types.
- `config` - JSON configuration for store, theme, SEO templates, dynamic rules, and product templates.
- `docs` - API, database, deployment, and developer guides.
- `progress.md` - Project completion tracker and remaining implementation checklist.

## Quick Start

1. Install a working package manager. The project is configured for `pnpm@12.4.1`.
2. Copy `.env.example` to `.env` and update secrets.
3. Install dependencies:

```bash
pnpm install
```

On this Windows host, the global npm/Corepack shim may fail with a signature-key error. Use the workspace-local runner when that happens:

```bash
node scripts/pnpm-local.mjs install
node scripts/pnpm-local.mjs --recursive build
```

When using the local runner, prefer passing workspace filters directly instead of invoking root scripts that call `pnpm` again.

4. Generate the Prisma client and run the development migration:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

If `prisma migrate dev` fails on a locked-down Windows sandbox with a blank schema-engine error, use the checked-in SQLite fallback:

```bash
node scripts/pnpm-local.mjs --filter @ucp/backend db:setup-sqlite
```

This applies the generated initial SQL migration to `apps/backend/prisma/dev.db` and runs the seed script.

The fallback uses compiled JavaScript instead of `tsx`, because some Windows sandbox runtimes throw from Node's `os.userInfo()` API, which `tsx` calls during startup.

5. Start both apps:

```bash
pnpm dev
```

The frontend defaults to `http://localhost:3000`; the backend defaults to `http://localhost:4000`.

On this Windows host, the compiled backend plus local frontend runner is the verified path:

```powershell
$env:DATABASE_URL='file:./apps/backend/prisma/dev.db'; $env:PORT='4000'; node .\apps\backend\dist\src\server.js
$env:NEXT_PUBLIC_API_BASE_URL='http://localhost:4000/api'; node .\scripts\pnpm-local.mjs --filter @ucp/frontend dev -p 3000
```

## Architecture Principles

- SQL stores all transactional and durable commerce data.
- JSON files store configuration, themes, templates, and dynamic rules only.
- Product attributes, categories, variants, inventory, and SEO metadata are dynamic.
- Backend modules stay bounded by domain ownership.
- Payment and shipping providers are abstractions, not hardcoded one-off integrations.
- `progress.md` must be updated as implementation steps are completed.

## Current Status

See `progress.md` for the current percentage, completed items, and remaining work required before the project is fully functional.
