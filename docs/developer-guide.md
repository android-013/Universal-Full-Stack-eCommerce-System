# Developer Guide

## Backend Modules

Backend code lives under `apps/backend/src/modules`.

Each module should own its routes, validation, service logic, and integration adapters. Shared cross-cutting utilities belong in `apps/backend/src/lib`, `apps/backend/src/middleware`, or `apps/backend/src/shared`.

## Frontend

The frontend uses the Next.js app router, TypeScript, Tailwind CSS, and shadcn-style UI primitives. Keep domain-specific pages close to their route and move reusable UI into `components`.

## Adding Features

1. Update or add database models when durable data is needed.
2. Add route validation with Zod.
3. Keep business rules in services, not route handlers.
4. Add tests for service logic and API behavior.
5. Update docs and `progress.md`.

## Package Manager

The workspace is pinned to `pnpm@12.4.1`. If the host's global npm/Corepack shim fails, use:

```bash
node scripts/pnpm-local.mjs <pnpm arguments>
```

For example, `node scripts/pnpm-local.mjs --recursive typecheck`.

When using the local runner, prefer direct workspace arguments, such as `node scripts/pnpm-local.mjs --filter @ucp/backend test`, instead of root scripts that call `pnpm` again.

## Progress Tracking

Every implementation step should update `progress.md` with:

- Changed checklist status.
- Revised completion percentage.
- A dated note describing what changed.

## SQLite Fallback

The project keeps Prisma migrations as the desired database workflow. In restricted Windows sandboxes where Prisma 7's schema engine can validate and generate the client but fails during `migrate dev`, run:

```bash
node scripts/pnpm-local.mjs --filter @ucp/backend db:setup-sqlite
```

The fallback applies `apps/backend/prisma/migrations/20260913000000_init/migration.sql` with `better-sqlite3`, writes a Prisma migration marker, and then runs the seed script.

It runs compiled JavaScript from `dist` because `tsx` can fail in some Windows sandbox runtimes when Node's `os.userInfo()` API is unavailable.
