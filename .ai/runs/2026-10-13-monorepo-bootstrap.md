# Run: Monorepo bootstrap for Plant.AI

- **Date:** 2026-10-13
- **Goal:** Turn the single-app Next.js starter into the Plant.AI npm-workspaces monorepo (Next.js + TypeScript + React, PostgreSQL via MikroORM, Awilix DI, Tailwind for the public frontend, shadcn/ui for backend/admin pages). Write AGENTS.md conventions and README architecture notes.
- **Related spec:** [.ai/specs/2026-10-13-monorepo-bootstrap.md](../specs/implemented/2026-10-13-monorepo-bootstrap.md)

## Steps
- [x] Read `.ai/lessons.md` (empty), inspected repo (Next 16.3.4, React 19.2.8, npm lockfile, TS 5.9).
- [x] Read bundled Next docs: `transpilePackages`, `serverExternalPackages`, CSS/Tailwind v4, route groups (multiple root layouts), `connection()`.
- [x] Wrote spec, moved app into `packages/app`, set up npm workspaces + `tsconfig.base.json`.
- [x] `packages/core`: env, `defineEntity` Garden entity, ORM config (pool), CLI config (Migrator), `GardenService`, Awilix container + request scopes. Initial migration generated against a throwaway local Postgres 17; `migration:create` afterwards reports no drift.
- [x] `packages/ui`: shadcn `components.json`, button/card/table/input/label/badge/separator, neutral theme CSS.
- [x] `packages/app`: `(frontend)` + `(admin)/admin` root layouts, Gardens admin page with a Server Action, `/api/health`, `withRequestScope`.
- [x] AGENTS.md (project rules) + README.md (architecture), `.env.example`, `docker-compose.yml`.
- [x] Upgraded Next 16.3.4 → 16.4.0 (critical advisories in ≤16.3.7).
- [x] Validation: `typecheck`, `lint`, `build` pass with no DB/env; E2E on `next start`: health, RSC page, Server Action form POST.

## Key decisions
- The user's message was cut off after "app package - which is the main, integration package for h…". Chose the minimal set `app`, `core`, `ui`; to be confirmed with the user.
- npm workspaces (existing lockfile + preview command use npm).
- Two root layouts isolate the Tailwind public site from the shadcn admin.
- ORM/container are module-level singletons (not `globalThis`); see lesson `2026-10-13-mikroorm-next-layers`.
- Root `.env` is loaded via `process.loadEnvFile` (the `@next/env` second call is a no-op).
- Adopted shadcn's `cn` package in place of clsx + tailwind-merge.

## Results
Monorepo bootstrapped; all gates are green. Spec moved to `implemented/`.

## Open issues
- Confirm the intended package list (the request was truncated).
- ESLint only covers `packages/app`; consider a root flat config that lints `core` and `ui`.
- `npm audit`: `braces` (high, ReDoS-style DoS) via `awilix → fast-glob`; only reachable via `listModules` with untrusted patterns (unused). Watch for an awilix update.
- No test runner yet (Vitest suggested for `core`).
- The sandbox exports `NODE_ENV=development`; builds here need `env -u NODE_ENV`.
