# Spec: Plant.AI monorepo bootstrap

- **Status:** implemented
- **Date:** 2026-10-13
- **Run log:** [.ai/runs/2026-10-13-monorepo-bootstrap.md](../../runs/2026-10-13-monorepo-bootstrap.md)

## Goal

Initialise Plant.AI — a garden-planning app in the spirit of planter.garden — as a TypeScript monorepo that every later feature builds on.

## Stack (fixed decisions)

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Database | PostgreSQL |
| ORM | MikroORM 7 (`@mikro-orm/postgresql`), migrations via `@mikro-orm/migrations`, built-in connection pooling |
| DI | Awilix (`InjectionMode.PROXY`, request scopes) |
| Frontend (public) styling | Tailwind CSS v4 |
| Backend (admin) UI | shadcn/ui (on Tailwind v4) living in `@plant-ai/ui` |
| Package manager | npm workspaces |

## Package layout

```
packages/
├── app/   @plant-ai/app   Next.js app — integration / composition root (routes, pages, API handlers)
├── core/  @plant-ai/core  Domain: MikroORM entities, migrations, ORM config, services, Awilix container
└── ui/    @plant-ai/ui    shadcn/ui components + `cn()` for backend (admin) pages
```

Dependency direction: `app → core`, `app → ui`. `core` and `ui` never import `app`; `core` never imports `ui` (and vice versa).

Internal packages ship TypeScript source (no build step); Next.js/Turbopack transpiles workspace packages. `@mikro-orm/*` and `pg` stay external on the server (`serverExternalPackages`). `core` uses explicit `.ts` relative imports + `erasableSyntaxOnly` so it also runs under plain Node/tsx (MikroORM CLI).

## Key design points

1. **Entities** are declared with `defineEntity` (no decorators, no reflect-metadata) so they bundle cleanly in Next.js.
2. **ORM singleton**: `getOrm()` caches the `MikroORM` instance at **module level** (one per Next.js module layer). *Revised during implementation:* a `globalThis` cache breaks because Server Components / Route Handlers / Server Actions have separate entity class instances (see `.ai/lessons/2026-10-13-mikroorm-next-layers.md`).
3. **Request scope**: every request/server action creates an Awilix scope (`createRequestScope()`), which registers a forked `EntityManager` as `em`. Services get `em` by injection — never use the global EM.
4. **Routing split**: public frontend under `app/src/app/(frontend)` styled with plain Tailwind; backend/admin under `app/src/app/admin` using `@plant-ai/ui` shadcn components.
5. **Migrations** live in `packages/core/src/migrations`, run with `npm run db:migrate` (MikroORM CLI). Schema changes must always come with a migration.
6. **Config** via env vars (`DATABASE_URL`, `DB_POOL_*`, `DB_DEBUG`), documented in `.env.example`; `.env*` live at the repo root and are loaded with `process.loadEnvFile` by `next.config.ts` and the MikroORM CLI config.
7. **Health**: `GET /api/health` runs `select 1` (MikroORM 7 connects lazily).

## Out of scope

Auth, real garden features, deployment, CI.

## Acceptance

- `npm install`, `npm run typecheck`, `npm run lint`, `npm run build` pass from the repo root.
- `docker compose up -d db` + `npm run db:migrate` creates the initial schema.
- `AGENTS.md` captures all of the above for coding agents; `README.md` has architecture notes.
