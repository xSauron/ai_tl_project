# Backward compatibility

This document inventories Plant.AI's protected contract surfaces as they exist today and the required path for changing each one. Review skills (`om-code-review`, `om-auto-review-pr`) check PRs against it; implementation skills warn when a change is not compliant. Update this file in the same PR that adds, removes, or changes a surface listed here — a surface the repo doesn't have yet is not listed until it exists.

The repo is at the bootstrap stage (see the migration table in `AGENTS.md`): these are today's actual surfaces, not the target architecture. Re-run `om-setup-agent-pipeline` (or hand-edit this file) as new concepts land.

## HTTP routes (`packages/app/src/app/api/`)

| Route | Contract | Breaking change | Required path |
|---|---|---|---|
| `GET /api/health` | Runs a real `select 1` via `checkDbConnection()`. Returns `200 { status: "ok", db: { ok: true } }` or `503 { status: "error", db: { ok: false, reason: string } }`. | Changing the status codes, the `status`/`db` field names, or `db.ok`'s boolean meaning. Removing the real DB round-trip (the route exists specifically so uptime checks and `AGENTS.md`'s "`/api/health` must keep working" rule have a real signal). | Keep the shape additive (new optional fields only); a breaking change needs a version bump in the path (`/api/v2/health`) or an explicit deprecation window announced in the PR body, plus updating every consumer (currently none outside ops tooling). |

As `api/<concept>/route.ts` handlers are added per the domain-invariants section of `AGENTS.md`, each row here gets: the JSON envelope shape (`{ ok: true, data }` / `{ ok: false, error: { code, message, fieldErrors? } }` once `core/src/http/apiHandler.ts` exists), the request schema, and the auth/ownership requirement.

## Server Actions (`packages/app/src/app/(admin)/...`)

| Action | Contract | Breaking change | Required path |
|---|---|---|---|
| `createGardenAction(formData: FormData)` (`admin/gardens/actions.ts`) | Reads `name` (required, trimmed; no-ops silently if empty) and `description` (optional) from `FormData`, creates a `Garden` through `GardenService`, revalidates `/admin/gardens`. Returns `void`. | Renaming the `name`/`description` form fields, changing the silent-no-op-on-empty-name behavior to a thrown error (or vice versa), or changing what the action revalidates. | Server Actions aren't versioned like routes — coordinate the form field names with every `<form>` that posts to this action in the same PR; a validation-behavior change needs a note in the PR body since there's no client-visible error path yet to signal it. |

This surface is pre-auth (no `auth` concept exists yet per `AGENTS.md`'s migration table) — the first PR that adds ownership checks to garden mutations is a deliberate breaking change to this action's signature (it will need a session/user argument) and should be called out explicitly.

## `@plant-ai/core` package exports (`packages/core/src/index.ts`)

Everything re-exported here is the public surface other workspaces (`@plant-ai/app`) are allowed to import; anything not exported here is internal to `core` even if the file is technically reachable.

| Export | Contract | Breaking change | Required path |
|---|---|---|---|
| `getOrm()`, `closeOrm()`, `checkDbConnection()`, `DbConnectionStatus` | `checkDbConnection()` resolves `{ ok: true }` or `{ ok: false, reason: string }`, matching the `/api/health` response above — the route's contract and this type must change together. `getOrm()`/`closeOrm()` manage the per-layer ORM instance (see `.ai/lessons/2026-10-13-mikroorm-next-layers.md` — never cached on `globalThis`). | Changing the `DbConnectionStatus` shape, or making `getOrm()` return a cached global instance. | Update `/api/health` and the admin dashboard (`(admin)/admin/page.tsx`) in the same PR; note the MikroORM-layer caveat from the linked lesson. |
| `getContainer()`, `createRequestScope()`, `AppContainer`, `AppCradle`, `RequestScope`, `RequestCradle` types | The Awilix DI surface: `createRequestScope()` must keep returning a scope with a forked `EntityManager` per request, matching `AGENTS.md`'s "Never cache the ORM or container on `globalThis`" rule. `AppCradle`/`RequestCradle` name every resolvable service. | Removing a cradle key a page already resolves (e.g. `gardenService`), or changing `createRequestScope()` to share an `EntityManager` across requests. | Add new cradle keys freely (additive); removing or renaming one needs every consumer in `packages/app` updated in the same PR, and the DI rules in `AGENTS.md` kept in sync. |
| `GardenService`, `CreateGardenInput` | `list()` returns `Garden[]` ordered `createdAt: "desc"`; `create(input)` persists and flushes, defaulting `description` to `null` when omitted. | Changing the default ordering, making `create()` not flush before returning, or narrowing `CreateGardenInput` in a way existing callers violate. | Widen `CreateGardenInput` freely; narrowing or removing a field needs every caller (`admin/gardens/actions.ts` today) updated in the same PR. |
| Entity re-exports (`./entities/index.ts` — currently `Garden`, `base.entity` properties) | See DB schema below — entities are re-exported as-is, so their contract is the DB schema's contract. | See DB schema below. | See DB schema below. |

Future ports/adapters (`AiGateway`, `ImageStorage`, `FrostDateProvider` — not yet present) join this table once they exist; the adapter implementation (`MockAiGateway` vs. a real vendor SDK) is explicitly *not* part of the contract — only the port interface is.

## Database schema & migrations (`packages/core/src/entities/`, `packages/core/src/migrations/`)

| Surface | Contract | Breaking change | Required path |
|---|---|---|---|
| `base.entity.ts` shared columns (`id: uuid primary`, `createdAt`, `updatedAt`) | Every entity gets a random UUID primary key and audit timestamps (`timestamptz`, set on create/update). | Changing the primary key type, making `id` client-settable, or dropping `createdAt`/`updatedAt` from an entity that has them. | Any column removal or type change on an existing table ships as a migration with an explicit up/down pair; never edit a merged migration (`AGENTS.md`). |
| `Garden` entity (`garden.entity.ts`, table `gardens`) | Columns: `name` (`varchar(120)`, required), `description` (`text`, nullable), plus the base columns above. | Shrinking `name`'s length below what existing rows may contain, making `description` non-nullable, or renaming/dropping a column without a migration. | Generate a migration (`npm run db:migrate:create -- --name <slug>`), commit the migration **and** its `.snapshot-*.json`, and review the SQL for data loss on existing rows. |
| `Migration20261013192505_init.ts` and every future migration file | Migrations are append-only history; MikroORM replays them in order against every environment including CI's ephemeral Postgres. | Editing, renaming, or deleting a migration that has already been merged to `main`. | A mistake in a merged migration is fixed by a **new** forward migration, never by editing the old one — per `AGENTS.md`'s persistence rules. |

As more entities and concepts (`plantings`, `crops`, `calendar`, `journal`, `photos`) land, each gets a row here, plus the domain invariants from `AGENTS.md` that constrain their schema (e.g. beds use optimistic locking via a `version` column; calendar dates are date-only `YYYY-MM-DD`, never `timestamptz`).

## Config file formats

| Surface | Contract | Breaking change | Required path |
|---|---|---|---|
| `.env.example` / `core/src/config/env.ts` (env vars: `DATABASE_URL`, `DB_POOL_MIN`, `DB_POOL_MAX`, `DB_DEBUG`) | Every documented variable is read through the Zod-validated `env.ts` (per `AGENTS.md`); `.env.example` is the source of truth for what must be set, and the app must still build and boot with no database reachable. | Renaming or removing a documented env var without a fallback/migration note, or making a previously-optional var required without a default. | Add new vars to `.env.example` with a comment in the same PR that starts reading them; a rename keeps the old name working for one deprecation window or documents the cutover explicitly in the PR body. |

## Package manager scripts (root `package.json`, workspace `package.json`s)

| Surface | Contract | Breaking change | Required path |
|---|---|---|---|
| `npm run db:migrate`, `db:migrate:create -- --name <slug>`, `db:migrate:down` | Thin wrappers over the MikroORM CLI (`mikro-orm migration:up/create/down`) scoped to `@plant-ai/core`; documented in `AGENTS.md`'s Commands table. | Changing a script's name, its required flags, or which workspace it targets, without updating `AGENTS.md` and `SDLC.md`'s validation gate in the same PR. | Treat these as a CLI surface: keep flag compatibility or document the new invocation everywhere it's referenced (`AGENTS.md`, CI, this file). |
| `npm run typecheck`, `lint`, `test`, `build`, `test:integration` | The validation gate every PR passes (`SDLC.md`); `test` enforces 100% coverage via `vitest.config.ts`. | Changing what counts as passing (e.g. lowering the coverage threshold, dropping a workspace from `--workspaces --if-present`) without updating `SDLC.md`'s Validation gate section and `.ai/agentic.config.json`'s `validation.commands` together. | Update `SDLC.md`, `.ai/agentic.config.json`, and `.github/workflows/ci.yml` in the same PR as any gate change. |

## Not yet present

No published events/webhooks exist yet (`core/src/events`, per `AGENTS.md`'s migration table — "not yet present"), no `auth` concept, and no AI ports/adapters. When any of these land, add a section here in the same PR, inventorying the actual contract (event ID naming `concept.entity.action`, port interfaces, etc.) rather than the target design — this file always describes what exists, not what's planned.
