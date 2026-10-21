<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Plant.AI — Project Rules

Plant.AI is a single-persona, mobile-first **garden planner (vegetables, berry bushes and fruit trees) with AI assistance**. Planter (planter.garden) is a functional/UX benchmark only: never copy its branding, content, data or code. Users lay out gardens and beds on a **square-foot grid**, place plantings from a **crop catalog**, see **companion conflicts**, get a **planting calendar** from their frost dates, keep a list of **operations** (planned or done), and use **AI** to answer questions about their garden. The journal with photos, spraying advice and the AI layout proposal are Later (D09, D08).

These rules are **binding** for every coding agent. Full standards with rationale: [`.ai/docs/engineering-standards.md`](.ai/docs/engineering-standards.md). If a change must break a rule, update this file and the standards doc in the same PR and say why. When two principles conflict, pick the one that keeps the change **smaller and more explicit**.

## Product scope (MVP)

Domain concepts: `auth`, `gardens` (gardens + beds), `plantings`, `crops` (catalog, companion relations, pruning and sowing timing), `calendar`, `operations`, `assistant`. `journal` and `photos` are Later (D09): do not build or scaffold them, nor `upload.ts`/`apiUpload`, before they are specced.

**Out of scope, do not build or scaffold "for later":** sharing/collaborative gardens, social features, marketplace/seed shop, payments, RBAC beyond a single `user` role, multi-tenancy, background queues/workers, native apps, weather/IoT integrations, freeform (non-grid) garden drawing.

**Ask First** (stop and get human approval with a spec): a `packages/shared` package, social login, a cron route or reminders, swapping any stack component below.

## Tech stack (fixed)

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router only), **React 19**, **TypeScript** (strict) | Read `node_modules/next/dist/docs/` before using a Next API. |
| Database | **PostgreSQL** (17 in `docker-compose.yml`) | |
| ORM | **MikroORM 7** (`@mikro-orm/postgresql`, `defineEntity`) | Migrations via `@mikro-orm/migrations`; pooling via `pool`. Only `db` imports `@mikro-orm/*`. |
| Dependency injection | **Awilix** | `InjectionMode.PROXY`, `strict: true`, explicit registration (no `loadModules`; root `package.json` `overrides` swaps awilix's `fast-glob` for the throwing `tools/fast-glob-disabled`, which keeps the unpatched `braces` advisory out of production deps). Stays in place: scoped `EntityManager`, mock/real adapter swaps. |
| Validation | **Zod** | Shared client/server schemas in `core/src/validators/`. |
| Logging | **pino** | With redaction (see Security). |
| Public pages | **Tailwind CSS v4** | `(marketing)` only. No shadcn/ui there. |
| App/backend pages | **shadcn/ui** on Tailwind v4 | `(auth)`, `(app)`; primitives in `@plantai/ui`. |
| Package manager | **npm workspaces** | No pnpm/yarn lockfiles. |
| Runtime | Node.js ≥ 22.18 | |

## Monorepo layout (target)

```
packages/
├── app/  @plantai/app   Next.js: routes, pages, Route Handlers (HTTP + rendering only)
├── core/ @plantai/core  Business rules: services, pure domain modules, ports/adapters, http layer, AI, validators, DI container
├── db/   @plantai/db    Persistence: entities, migrations, seeds, ORM config
└── ui/   @plantai/ui    Presentation: shadcn primitives, concept components, reusable backend panel layer
```

- **Dependency direction:** `app → core → db`. `ui` is imported by `app` only. `ui` never imports `core` or `db`. No package imports `app`. Enforce with ESLint `no-restricted-imports`.
- **Separation of concerns:** persistence in `db`, business rules in `core`, HTTP/rendering in `app`, presentation in `ui`. A page never runs a MikroORM query or an AI SDK call.
- Internal packages ship TypeScript source (no build step). Next.js transpiles them.
- The full target tree is in §4 of the standards doc. Don't create folders ahead of need.

### Domain concept convention

Domain code is not organized into `modules/`. Each concept (`auth`, `gardens`, `plantings`, `crops`, `calendar`, `operations`, `assistant`) is a same-named sub-folder repeated across the layers that need it:

- `packages/db/src/entities/<concept>/<name>.entity.ts` (+ `db/src/seeds/` for catalog data)
- `packages/core/src/services/<concept>/`: `<name>.service.ts` plus pure rule modules (`grid-rules.ts`, `companions.ts`, `sowing-windows.ts`)
- `packages/core/src/validators/<concept>/` (shared, bounded Zod schemas)
- `packages/app/src/app/api/<concept>/route.ts` and pages under `(marketing)`, `(auth)`, `(app)`

Create a concept folder only when its first file is added. No per-concept setup/ACL/auto-discovery. Never create `modules/<concept>/`, per-concept `setup.ts`/`acl.ts`, or `loadModules` globbing.

Event IDs follow `concept.entity.action`, past tense (e.g. `plantings.planting.placed`), emitted via the typed in-process emitter in `packages/core/src/events`. Emit only when a side effect needs the event. No queue/worker.

### Domain invariants

- A `Planting` belongs to a garden and may have no bed (R07, D10): an unplaced planting has no cells, no grid check and no companion neighbours. Beds are square-foot grids (`rows × cols`); a placed `Planting` occupies a cell rectangle (`row`, `col`, `rowSpan`, `colSpan`) and stores `plantsPerCell` derived from crop spacing. Placement validity (bounds, overlap, footprint, spacing) is decided only by the pure functions in `services/plantings/grid-rules.ts`. `PlantingService` calls them and persists, checking overlap inside a transaction. Document the chosen occupancy model in the entity file.
- Companion/combative relations come from catalog data (`crop_companions`: `cropId`, `otherCropId`, `relation`, `source`). Conflicts are computed server-side by a pure function `(plantings, relations) → conflicts` and returned with the bed. Never hard-code crop relationships in the UI.
- An `Operation` (spraying, pruning, sowing… planned or done, D14, R09) is stored user data owned through the garden; one operation links to many plantings of that garden. It has a type from a fixed list, a date-only date and an `isDone` flag, and no notes, photo or assignee. Derived tasks are never stored (R05) and are not operations.
- Calendar windows are derived from crop timing + the user's frost dates by pure functions in `services/calendar/`, never stored. Persist only user decisions (overrides). Calendar dates are date-only values (`YYYY-MM-DD`); only timestamps are `timestamptz`.
- The catalog is reference data from versioned seed files. Users can't edit it in MVP, and every fact has a `source`. Never scrape or copy another app's dataset.
- Beds use optimistic locking (`version`). A stale write → `ConflictError` (409) and the client reloads. Never silently let the last write win on a layout.
- Grid, companion and calendar math lives in `core` and reaches the client through API responses, never by importing `core` into `ui`.

### External integrations & AI

- External systems only through ports in `core`: `AiGateway`, `ImageStorage`, `FrostDateProvider`. Vendor SDKs only inside `adapters/`. MVP adapters: `MockAiGateway` (deterministic), `LocalDiskImageStorage`, `StaticFrostDateProvider`. Users can always override frost dates manually.
- Tests and CI always use mock/static/local adapters, never a real AI provider or network call.
- Prompts are versioned in `core/src/ai/prompts/<name>.vN.ts`. AI output is parsed with Zod (`core/src/ai/schemas/`) **and** validated against domain rules (crop IDs exist, every planting passes `grid-rules.ts`). Invalid output → one retry, then `AiUnavailableError`. Results store `model` + `promptVersion`.
- (Layout proposal is Later, D08; the rule stays for when it is built.) AI proposes, the user applies: AI never writes plantings directly. A layout is a *proposal* with an ID, applied at most once via an explicit "apply" request through `PlantingService`, like a manual edit.
- AI calls are synchronous with a hard timeout (named constant, e.g. 30 s). No `assistant/` folder before the first AI feature.

### Reusable API & UI layer

- `packages/core/src/http/`:
  - `errors.ts`: `AppError` hierarchy (`NotFoundError`, `ForbiddenError`, `UnauthorizedError`, `ValidationError`, `ConflictError`, `RateLimitedError`, `AiUnavailableError`, `PayloadTooLargeError`; grid errors such as `CellOccupiedError` and `OutOfBedBoundsError` extend these). Services throw these and never build HTTP responses.
  - `apiHandler.ts`: maps errors to status + envelope `{ ok: true, data }` / `{ ok: false, error: { code, message, fieldErrors? } }`, never leaks stack traces.
  - `makeCrudRoute.ts`: plain CRUD. Workflow endpoints (grid placement, applying AI layouts, uploads, calendar) use `apiHandler` directly.
  - `auth.ts`: `requireSession`, plus ownership assertions resolved **through the garden**.
  - `upload.ts`: the only multipart parser.
- `packages/ui/src/backend/`:
  - `api/apiCall.ts` (+ `apiUpload`): the only sanctioned `fetch()` to `/api/*`.
  - `forms/CrudForm.tsx`: Zod-driven, shows `fieldErrors`, `Cmd/Ctrl+Enter` submits, `Escape` cancels.
  - `tables/DataTable.tsx`.
  - `feedback/{LoadingMessage,ErrorMessage,EmptyState}.tsx`.
  - The bed grid editor is the main legitimate bespoke-UI exception.
- The JSON envelope is a shape convention, not a shared TS type, because `ui` must not import `core`.
- Never write a bare `try/catch` + manual `NextResponse.json` in a route, a raw `fetch('/api/...')` in a component, or a hand-rolled form/table/loading state when the shared layer covers it.

New reusable components go here:
1. shadcn primitive → `ui/src/components/ui/`, via `npx shadcn@latest add` only.
2. Generic panel pattern → `ui/src/backend/<category>/`.
3. Concept-specific component → `ui/src/components/<concept>/`.
4. Single-page component → colocated until a second consumer appears.

### Pages & routing (`packages/app/src/app`)

- `(marketing)/`: landing + public crop catalog. Own root layout, plain Tailwind with `@theme` tokens.
- `(auth)/` (login, register) and `(app)/` (gardens, beds, calendar, operations, assistant, settings): shadcn/ui theme from `@plantai/ui`. They don't share a root layout with `(marketing)`, so the two design systems never mix. There is no top-level `app/layout.tsx`.
- `api/<concept>/...`: one `route.ts` per resource. `api/health` must keep working (it runs a real `select 1`).
- Pages default-export `<Segment>Page`.
- Server code resolves services via `withScope` (one Awilix request scope with a forked `EntityManager` per request).
- **DB/AI access only at request time:** pages and handlers that touch them call `await connection()` from `next/server`. Next 16 replaces the standards' `export const dynamic = "force-dynamic"` with this; `dynamic` is removed under Cache Components. The app must build and boot with **no database and no AI provider** reachable.

## Naming

| Element | Convention | Example |
| --- | --- | --- |
| Package | `packages/<name>`, scope `@plantai/<name>` | `@plantai/core` |
| Concept folder | plural/uncountable single word = event namespace | `gardens`, `plantings`, `calendar` |
| Entity | PascalCase singular via `defineEntity`, `<name>.entity.ts` in concept folder | `Bed` → `entities/gardens/bed.entity.ts` |
| DB table / column | snake_case plural / snake_case | `crop_companions`, `last_frost_date` |
| Service | `<Name>Service`, `<name>.service.ts` | `services/plantings/planting.service.ts` |
| Pure logic | kebab-case module, functions only | `services/plantings/grid-rules.ts` |
| Port / adapter | `<Name>Gateway`/`Port` in `<name>.port.ts`; adapters in `adapters/` | `ai-gateway.port.ts`, `adapters/mock-ai-gateway.ts` |
| Prompt | kebab-case + version | `core/src/ai/prompts/suggest-bed-layout.v1.ts` |
| Seed data | kebab-case under `db/src/seeds/` | `crops.ts`, `crop-companions.ts` |
| Cradle key | camelCase, one per dependency | `plantingService` |
| Zod schema | `<name>Schema` in `<name>-<action>.schema.ts` | `validators/plantings/planting-place.schema.ts` |
| Event ID | `concept.entity.action`, past tense | `gardens.bed.resized` |
| Domain error | `<Name>Error extends AppError` in `core/src/http/errors.ts` | `CellOccupiedError` |
| UI component | PascalCase | `BedGrid`, `CropPicker`, `CrudForm` |

## Persistence & DI rules

- Entities use `defineEntity` + `setClass` (no decorators), with UUID ids and shared base properties, and are registered in `db/src/entities/index.ts` (no folder discovery).
- **Every schema change ships with a migration** (`npm run db:migrate:create -- --name <slug>`): review the SQL, commit the migration **and** the `.snapshot-*.json`. Never edit a merged migration.
- Never use the global `EntityManager` (`allowGlobalContext: false`). Work only through the request scope.
- **Don't cache the ORM or container on `globalThis`.** Next.js layers (Server Components, Route Handlers, Server Actions) have separate entity classes, and MikroORM matches by class reference. See `.ai/lessons/2026-10-13-mikroorm-next-layers.md`. Plan `DB_POOL_MAX` for one pool per layer.
- MikroORM 7 connects lazily, so `checkConnection()` is false before the first query.
- Container: `core/src/container/container.ts` registers every dependency by hand; `cradle.ts` types them.
  - Infrastructure (`orm`, config, adapters) → singleton.
  - Anything touching `em` → `.scoped()`.
  - Services take one destructured cradle argument and compose collaborators. No base-service hierarchies, no `container.resolve` inside services.
- Mass assignment: pass only Zod-parsed output to `em.create()`/`em.assign()`, never the raw body.

## Security minimums (see the standards doc for detail)

- Passwords: `bcrypt`/`bcryptjs` cost ≥ 12 (upgrade path `argon2id`).
- JWT: HS256+, secret ≥ 32 random bytes from Zod-validated `env.ts`, 24 h expiry, no refresh flow in MVP.
- Cookies: `httpOnly`, `secure` in production, `sameSite=lax`, scoped `path`. Never store a JWT in `localStorage`.
- CSRF: state-changing routes require the custom header that `apiCall`/`apiUpload` always set.
- Rate limiting: login/register and **every AI endpoint** (per-user daily quota + per-minute limit) → 429.
- Ownership on every record (gardens, beds, plantings, operations, AI conversations), resolving bed/planting ownership through the garden and never trusting a client-sent `gardenId`. Fail closed.
- Uploads: size limit before buffering (e.g. 8 MB), allow-list `jpeg/png/webp` by magic bytes, re-encode, **strip EXIF**, random UUID keys, no client filenames in paths. Photos are served only via an authenticated, ownership-checked route.
- Location minimization: store frost dates + coarse region only. Send the AI only climate zone/frost dates.
- AI: user text goes to the model delimited as data, never merged into instructions. The model sees only the current garden's data. Output is untrusted: never rendered as HTML, never written without explicit "apply". Answers are labeled as suggestions, and safety facts (e.g. toxicity) come from the catalog.
- Input bounds: max bed size, beds per garden, plantings per bed and text lengths in the Zod schemas, as named constants.
- No raw SQL with interpolated input.
- Secrets only via env. `pino` redacts passwords, tokens, JWTs and API keys. AI calls log metadata only (model, prompt version, latency, tokens).
- Auth errors are generic and never reveal whether an email exists.
- `npm audit` is part of the gate. Don't add a dependency for what 20 lines of local code cover.

## Code quality

- No `any`; narrow `unknown` at runtime. No empty `catch`. No dead code, commented-out code or debug `console.log`.
- Comments only for a non-obvious *why*. One thing per function; early returns.
- No magic numbers/strings: name them (cells per sq ft, max bed size, AI quota/timeout, upload limit, frost-date fallback).
- Booleans read positively (`isCompanion`). No bare `true`/`false` arguments.
- TS: strict, `noUncheckedIndexedAccess`, `erasableSyntaxOnly` (no `enum`/`namespace`/parameter properties). In non-Next packages, relative imports use explicit `.ts` extensions.
- Env vars only through `core/src/config/env.ts` (Zod-validated), each documented in `.env.example`. `.env*` files live at the repo root.
- A PR's diff traces entirely to its stated purpose.

## Tests

- **100 % unit test coverage is mandatory.** Every new feature, module, branch and function ships with unit tests that fully cover it — `npm test` enforces 100 % statements/branches/functions/lines over `packages/*/src/**` and `scripts/*.mjs` (`vitest.config.ts`) and CI's `unit` job fails the PR otherwise. There is no "add tests later": a PR that drops coverage below 100 % does not merge. The only exclusions are the ones explicitly listed in `vitest.config.ts`, each with a reason comment (e.g. generated migrations, exercised by integration tests instead) — don't add new ones to dodge the gate; write the test.
- Colocate unit tests next to the source as `<name>.test.ts(x)`, so missing coverage is easy to spot in review.
- Pure modules (`grid-rules.ts`, companion detection, `sowing-windows.ts`) get **table-driven unit tests first**, covering edges: bed borders, multi-cell crops, empty bed, crops with no frost dependency, Southern Hemisphere / late frost.
- AI parsing is tested against malformed, partial and hostile output, grid-rule violations and unknown crops.
- Integration tests (`tests/integration/`, `npm run test:integration`) boot the real app against an ephemeral PostgreSQL (Testcontainers) and drive it with `agent-browser`; CI's `integration` job runs them on every PR. They cover a stale bed write (409) and double-applying a proposal (applied once), on top of the always-on basics (home page, admin panel, `/api/health`).
- A seed-integrity test checks that companion relations reference existing crops and are symmetric where the data says so.
- Behavior changes ship with a test that fails on the old code. Bug fixes (especially security ones) ship a regression test.

## Scaffolding a new concept (e.g. "add journal")

1. `db/src/entities/<concept>/<name>.entity.ts` → register → generate migration (reference data → `db/src/seeds/`).
2. Pure rules in `core/src/services/<concept>/`, **tests first**.
3. `<name>.service.ts` → register in `container.ts` (`asClass(...).scoped()`) and type it in `cradle.ts`.
4. External system → port + mock/local adapter, registered explicitly.
5. AI → versioned prompt, Zod output schema, domain validation, `model` + `promptVersion` persisted, proposal-then-apply.
6. Bounded Zod schema in `core/src/validators/<concept>/`.
7. Events only if a side effect needs them.
8. `app/src/app/api/<concept>/route.ts`: `makeCrudRoute` for CRUD; otherwise `apiHandler` + `requireSession` + ownership + `withScope`.
9. Pages use `apiCall`/`apiUpload`, `CrudForm`, `DataTable`, `feedback/`. Check `ui/src/backend/` and `ui/src/components/<concept>/` first.

## Review checklist: blockers

- [ ] Server-side auth on every non-public route.
- [ ] Record-level authorization, with ownership resolved through the garden.
- [ ] Grid writes check bounds + overlap + `version` in one transaction.
- [ ] No secrets/tokens/full JWTs in logs, errors or payloads.
- [ ] No unparameterized untrusted input in queries, shell commands or paths.
- [ ] Bounded Zod parsing on every write, with no mass assignment.
- [ ] Uploads: size limit, magic bytes, EXIF stripped, random key.
- [ ] AI output validated with Zod + domain rules, never rendered as HTML, never auto-applied.
- [ ] Security decisions fail closed.

**Major:** AI input delimited, AI endpoints rate-limited, no precise location, cookie flags preserved, regression tests for security fixes. The full checklist is in the standards doc.

## Commands (repo root)

| Command | What |
| --- | --- |
| `npm install` | Install all workspaces |
| `npm run setup` | Idempotent local installer: install, `.env`, reachable DB (or Docker `db`), migrations |
| `docker compose up -d db` | Start PostgreSQL |
| `npm run dev` / `npm run build` / `npm start` | Next.js dev / build / start |
| `npm run typecheck` · `npm run lint` | Type-check / lint all workspaces |
| `npm test` · `npm run test:watch` | Unit tests (Vitest) with 100 % coverage gate, plus every Storybook story in headless Chromium (one-time `npx playwright install chromium`) |
| `npm run test:integration` | Integration tests: Testcontainers Postgres + built app + `agent-browser` (needs Docker, or `INTEGRATION_DATABASE_ADMIN_URL`; run `npm run build` first) |
| `npm run db:migrate` · `db:migrate:create -- --name <slug>` · `db:migrate:down` | Migrations |
| `npm run ui:add -- <component>` | Add a shadcn primitive |

**Validation gate before every commit/PR:** `npm run typecheck && npm run lint && npm test && npm run build && npm audit --omit=dev`, and `/api/health` must still respond. Run `npm run test:integration` too whenever Docker is available (always true in CI — see `.github/workflows/ci.yml`, which runs lint, unit, build and integration as separate required checks on every PR). Never set `NODE_ENV` yourself (`NODE_ENV=development` breaks `next build`).

## Migration status (current code → target)

The repo is at the bootstrap stage. Follow §5 of the standards doc **one buildable step at a time**. Until a step lands, the current code below is authoritative for that area. New code always follows the target rules.

| Target rule | Current state | Closed by §5 step |
| --- | --- | --- |
| Scope `@plantai/*` | `@plant-ai/*` | 1 |
| `packages/db` owns entities/migrations/ORM config | in `packages/core` (`entities/`, `migrations/`, `db/`) | 1–2 |
| `core/src/services/<concept>/` | `core/src/modules/gardens/` (example `GardenService`) | 2 |
| `core/src/container/{container,cradle}.ts` | `core/src/di/container.ts` | 2 |
| `withScope` | `withRequestScope` in `app/src/server/request-scope.ts` | 2 |
| Entities in `entities/<concept>/` | `entities/garden.entity.ts` (flat) | 2 |
| `core/src/http/`, `ui/src/backend/`, Zod, pino, events | not yet present | 3 / 9 |
| ESLint `no-restricted-imports` layer rules; ESLint over all packages | ESLint covers `app` only | 3 |
| shadcn primitives in `ui/src/components/ui/` | `ui/src/components/` | 3 |
| Route groups `(marketing)`, `(auth)`, `(app)` | `(frontend)`, `(admin)/admin` | 3–5 |
| Auth (`auth` concept) | none yet | when first needed (before user-owned data) |

Update this table in the same PR that closes a row. Delete the section once it's empty.

# AI Workflow Metadata (`.ai/`)

All AI agents (Claude Code, Codex, Grok, etc.) MUST use the `.ai/` folder as follows. This is mandatory, not optional.

```
.ai/
├── specs/              # Specifications for Spec-Driven Development (SDD)
│   ├── implemented/    # Specs whose implementation has shipped
│   └── archive/        # Abandoned, superseded, or obsolete specs
├── runs/               # Logs of autonomous AI runs
├── docs/               # Long-lived reference docs (e.g. engineering-standards.md)
├── lessons.md          # Index of lessons learned (long-term memory)
└── lessons/            # Detailed lesson notes linked from lessons.md
```

All dated files use the naming `YYYY-MM-DD-slug.md` (ISO date, lowercase kebab-case slug), e.g. `2026-10-13-user-auth.md`.

## Specs (`.ai/specs/`)
- Non-trivial features/changes start with a spec (SDD). Before implementing, look for an existing spec in `.ai/specs/` and follow it; if the code must deviate, update the spec first.
- Active specs live in `.ai/specs/`. When the implementation ships, move the spec to `.ai/specs/implemented/`. When abandoned or superseded, move it to `.ai/specs/archive/` with a note explaining why.

## Runs (`.ai/runs/`)
- Every autonomous run MUST create a log `.ai/runs/YYYY-MM-DD-slug.md` at the start and keep it updated: goal, related spec, steps taken, key decisions, results, open issues.
- Never overwrite another run's log; if the slug exists for the same day, pick a more specific slug.

## Lessons (`.ai/lessons.md` + `.ai/lessons/`)
- Read `.ai/lessons.md` before starting work.
- After fixing a bug, finishing a run, or finding anything worth remembering (pitfalls, conventions, improvements), append an entry to `.ai/lessons.md` using the format described there.
- Put long-form detail in `.ai/lessons/YYYY-MM-DD-slug.md` and link it from the entry.

## Docs (`.ai/docs/`)
- Long-lived reference documents that are not specs, e.g. `engineering-standards.md`. Undated file names. Update in place; note changes at the top.

## Rules
- Do not store specs, run logs, lessons, or reference docs anywhere else.
- Do not modify other tool-owned folders under `.ai/` (e.g. `.ai/cezar/`).
- Use today's date for new files; never invent dates.

# Working Principles

Distilled from [Boris Cherny's Claude Code tips](https://github.com/ykdojo/claude-code-tips/blob/main/content/boris-claude-code-tips.md).

1. **Plan before you build; re-plan when it goes sideways.** For any complex task, start by planning: write or refine the spec in `.ai/specs/` until the implementation can be done in one pass. If the work drifts or keeps failing, stop and re-plan instead of pushing through.
2. **Turn every correction into a rule.** When a human corrects you, or you find your own mistake, record it right away in `.ai/lessons.md`. If it is a project-wide rule, add it to this file. Never make the same mistake twice.
3. **Own bugs end to end.** Given a bug report, failing test, or red CI, find the root cause from logs and code, fix it, and verify the fix (run tests, lint, and build). Do not ask the human to show you how. Leave a regression test and a lesson entry.
4. **Prefer the elegant solution over the first patch.** Once a fix works, ask: "Knowing everything I know now, is there a cleaner way?" If there is, replace the hack instead of piling on more. Specific specs reduce ambiguity, so resolve open questions before coding.
5. **Automate what repeats.** If a workflow is done more than once a day, capture it as a skill or command (`.claude/skills/`, `.agents/skills/`) and commit it, so every agent reuses it instead of redoing it.

