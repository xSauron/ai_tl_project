# 🌱 Plant.AI

Plant.AI is a garden-planning web app, in the spirit of [planter.garden](https://planter.garden/app/gardens). You lay out gardens and beds, place plants with companion-planting hints, and get AI-assisted growing advice.

> Coding agents: the binding rules are in [`AGENTS.md`](AGENTS.md). Specs, run logs and lessons live in [`.ai/`](.ai).

## Quick start

Requirements: Node.js ≥ 22.18, npm, and either Docker (for PostgreSQL) or an existing PostgreSQL reachable at `DATABASE_URL`.

```bash
npm run setup                   # installer: runs every step below, skipping what's already done
npm run dev                     # http://localhost:3000
```

`npm run setup` is idempotent — re-run it any time; it skips steps that are already satisfied (dependencies installed, `.env` present). For the database, it first checks whether `DATABASE_URL` already points at a reachable PostgreSQL and uses it as-is; only when nothing answers there does it fall back to starting `docker compose`'s `db` service and waiting for it to become healthy. Either way it finishes by applying pending migrations.

<details>
<summary>Manual steps (what the installer automates)</summary>

```bash
npm install
cp .env.example .env            # repo-root .env is shared by Next.js and the MikroORM CLI
docker compose up -d db         # PostgreSQL 17 on localhost:5432
npm run db:migrate              # apply migrations
npm run dev                     # http://localhost:3000
```

</details>

- Public site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> (example CRUD: *Gardens*)
- Health probe: <http://localhost:3000/api/health>

## Architecture

### Stack

| Layer | Technology |
| --- | --- |
| Web framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict) |
| Database | PostgreSQL |
| ORM / migrations / pooling | MikroORM 7 (`@mikro-orm/postgresql`, `@mikro-orm/migrations`) |
| Dependency injection | Awilix |
| Public frontend styling | Tailwind CSS v4 |
| Backend (admin) UI | shadcn/ui on Tailwind v4 |
| Monorepo | npm workspaces |

### Packages

```
.
├── packages/
│   ├── app/    @plantai/app   Next.js application — integration layer / composition root
│   ├── core/   @plantai/core  Business rules — services, DI container
│   ├── db/     @plantai/db    Persistence — entities, migrations, ORM config (the only `@mikro-orm/*` importer)
│   └── ui/     @plantai/ui    shadcn/ui component library + admin theme
├── docker-compose.yml          Local PostgreSQL
├── tsconfig.base.json          Shared compiler options
└── .env.example                Environment variables (copy to .env)
```

```mermaid
graph LR
  app["@plantai/app<br/>Next.js routes, layouts,<br/>Server Actions, Route Handlers"]
  core["@plantai/core<br/>services · Awilix"]
  dbpkg["@plantai/db<br/>entities · migrations · MikroORM"]
  ui["@plantai/ui<br/>shadcn/ui components"]
  pg[(PostgreSQL)]
  app --> core
  app --> ui
  core --> dbpkg
  dbpkg --> pg
```

- **`@plantai/app`**: the only package that knows about Next.js. It holds routing, layouts, Server Actions and Route Handlers, and stays thin: validate input, resolve a service, render.
- **`@plantai/core`**: server-only business logic. It has no Next.js or React dependencies and reaches the database only through `@plantai/db`.
- **`@plantai/db`**: persistence — entities, migrations, ORM config and `getOrm()`. It re-exports the MikroORM types other packages need.
- **`@plantai/ui`**: presentational shadcn/ui components used by the admin pages.

Internal packages are consumed as TypeScript source (no build step). Next.js transpiles them.

### Frontend vs. backend pages

`packages/app/src/app` uses two route groups, each with its **own root layout and stylesheet**:

| Route group | URL | Styling |
| --- | --- | --- |
| `(frontend)/` | `/`, … | Tailwind CSS with Plant.AI `@theme` tokens (`frontend.css`) |
| `(admin)/admin/` | `/admin/…` | Tailwind + shadcn/ui theme from `@plantai/ui/styles.css` (`admin.css`) |

Because these are separate root layouts, moving between the public site and the admin is a full page load. That keeps the two design systems fully isolated.

### Request lifecycle & dependency injection

```
Request ─► Server Component / Server Action / Route Handler
             └─ withScope(({ gardenService }) => …)               packages/core/src/container/scope.ts
                  └─ Awilix scope: em = orm.em.fork()              packages/core/src/container/container.ts (cradle types: cradle.ts; ORM from packages/db/src/orm.ts)
                       └─ GardenService({ em }) → MikroORM → PostgreSQL
```

- The **root container** holds singletons (`orm`). Each request creates a **scope** that registers a forked `EntityManager` (its own identity map / unit of work), and services are registered as `scoped`.
- The global `EntityManager` is disabled (`allowGlobalContext: false`), so any code that bypasses the scope fails loudly.
- The ORM and the container are cached at **module level**, not on `globalThis`. Next.js evaluates Server Components, Route Handlers and Server Actions in separate module layers, and MikroORM identifies entities by class reference. In practice each layer gets its own pool, so set `DB_POOL_MAX` with that in mind.

### Persistence

- Entities are defined with `defineEntity` (no decorators) in `packages/db/src/entities/<concept>/` and registered explicitly in `entities/index.ts`.
- Connection pooling is configured by `DB_POOL_MIN` / `DB_POOL_MAX`.
- Migrations live in `packages/db/src/migrations` and are generated from entity changes:

  ```bash
  npm run db:migrate:create -- --name add-beds   # diff entities → new migration
  npm run db:migrate                             # apply
  npm run db:migrate:down                        # roll back the last one
  ```

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | — (required at runtime) | PostgreSQL connection string |
| `DB_POOL_MIN` / `DB_POOL_MAX` | `0` / `10` | Connection pool size |
| `DB_DEBUG` | `false` | Log SQL queries |
| `JWT_SECRET` | — (required at request time, ≥ 32 bytes) | Session signing secret; `npm run setup` generates one (or `openssl rand -base64 48`) |
| `LOG_LEVEL` | `info` | pino level: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |
| `TRUSTED_PROXY_IP_HEADER` | unset | Header the proxy overwrites with the client IP; when set, login/register rate limits also key by IP |

All variables are Zod-validated on first use, not at import, so `npm run build` needs none of them: `packages/db/src/env.ts` (DB vars) and `packages/core/src/config/env.ts` (the rest). Errors name the variable, never its value.

`.env.local` and `.env` are read from the **repo root**, both by `next.config.ts` and by the MikroORM CLI config. Variables already set in the environment take precedence.

## Scripts

| Command | Description |
| --- | --- |
| `npm run setup` | Idempotent local installer — runs Quick start's steps, skipping what's already done |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` / `npm start` | Production build / start |
| `npm run typecheck` | Type-check all packages |
| `npm run lint` | Lint every package plus `tests/`, `scripts/`, `tools/` (one root `eslint.config.mjs`, with the `app → core → db` layer import rules) |
| `npm run db:migrate` · `db:migrate:create` · `db:migrate:down` | Database migrations |
| `npm run ui:add -- <component>` | Add a shadcn/ui component to `@plantai/ui` |

## AI-assisted development

This repo uses Spec-Driven Development with the `.ai/` folder (`specs/`, `runs/`, `lessons.md`). See [`AGENTS.md`](AGENTS.md).
