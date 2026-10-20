# Plant.AI — Engineering Standards & Package Structure

Date: 2026-10-13
Status: active (draft — product scope assumptions in §0 to be confirmed)

> **Repo adaptations (2026-10-13, applied when adopting this doc into `AGENTS.md`):**
> - §1 "DB access only in `export const dynamic = "force-dynamic"` routes/pages": in Next.js 16
>   `dynamic` is a legacy route segment option and is **removed when Cache Components is enabled**
>   (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/index.md`).
>   The binding rule is therefore: DB/AI-reading pages and Route Handlers opt into request-time rendering with
>   `await connection()` from `next/server` (works with and without Cache Components). The intent — the app
>   builds and boots with no database and no AI provider — is unchanged.
> - §3 / §5: the repo is at the "bootstrap" state, not at the DevMentor end state. `AGENTS.md` carries a
>   *Migration status* table mapping each target rule to the current code and the §5 step that closes the gap.
> - The ORM must not be cached on `globalThis` (Next.js module layers each have their own entity classes) —
>   see `.ai/lessons/2026-10-13-mikroorm-next-layers.md`. This applies unchanged once the ORM moves to `db`.

> **2026-10-20 rules alignment (D02, D08, D09, D10/R07, D14/R09):** scope is vegetables, berry bushes and fruit trees; the MVP AI feature is garden Q&A (layout proposal is Later); journal, photos and spraying advice are Later; a planting may have no bed; stored `operations` are a concept. `AGENTS.md` is authoritative where this document's §0 still mentions the older scope.

Adapted from the DevMentor engineering standards (2026-09-01) for a different product:
**Plant.AI**, a vegetable-garden planner with AI assistance, using Planter
(planter.garden) as a functional/UX benchmark — not copying its branding, content,
data or code. The layered monorepo, the reusable API/UI layer and the `awilix` DI
decision carry over unchanged; domain concepts, ports and security rules are rewritten.

---

## 0. Product Scope Assumptions

Plant.AI is a single-persona, mobile-first web app where a user:

- creates **gardens** and **beds** (raised beds / plots) laid out on a
  **square-foot grid** (rows × columns of cells),
- places **plantings** of crops into cells; each crop defines how many plants fit in
  one square (1, 4, 9, 16...) or how many squares one plant needs,
- browses a **crop catalog** (~80 vegetables/fruits/herbs, each with varieties) with
  spacing, sun, days to maturity, and **companion / combative** relations,
- sees **companion conflicts and suggestions** for neighboring cells while planning,
- gets a **planting calendar** (start seeds indoors, transplant, direct sow, harvest
  windows) computed from their **frost dates**,
- keeps a **garden journal** (notes + photos per garden/bed/planting),
- uses **AI** for: suggesting a bed layout from a list of desired crops, answering
  questions about their garden, and (stretch) diagnosing a plant problem from a photo.

Domain concepts (~8): `auth`, `gardens` (gardens + beds), `plantings`, `crops`
(catalog, varieties, companion relations), `calendar`, `journal`, `photos`, `assistant`.

**Explicitly not in scope for MVP:** sharing/collaborative gardens, social features,
marketplace/seed shop, payments, RBAC beyond a single `user` role, multi-tenancy,
background queues/workers, native apps, weather/IoT integrations, freeform
(non-grid) garden drawing. Do not smuggle these back in "for later".

Decisions carried over from DevMentor: **domain sub-folders inside the existing
layered packages** (not a module runtime), **keep `awilix` DI**.

---

## 1. Final List of Engineering Rules

### Naming

| Element | Convention | Example |
|---|---|---|
| Package | `packages/<name>`, scoped `@plantai/<name>` | `@plantai/core` |
| Domain concept folder | plural (or uncountable) single word, matches the event namespace | `gardens`, `plantings`, `crops`, `calendar` |
| Entity | PascalCase singular class via `defineEntity`, file `<name>.entity.ts` in its concept folder | `Bed` → `entities/gardens/bed.entity.ts` |
| DB table | snake_case, plural | `beds`, `crop_companions` |
| DB column | snake_case (mapped from camelCase) | `last_frost_date` ← `lastFrostDate` |
| Service | PascalCase + `Service`, file `<name>.service.ts` | `PlantingService` → `services/plantings/planting.service.ts` |
| Pure domain logic (no I/O) | kebab-case module, file `<name>.ts`, functions only | `services/plantings/grid-rules.ts`, `services/calendar/sowing-windows.ts` |
| Port (external integration interface) | PascalCase + `Gateway`/`Port`, file `<name>.port.ts` | `AiGateway` → `services/assistant/ai-gateway.port.ts` |
| Adapter | PascalCase + adapter name, under `adapters/` | `MockAiGateway` → `services/assistant/adapters/mock-ai-gateway.ts` |
| Prompt template | kebab-case + version suffix, under `core/src/ai/prompts/` | `suggest-bed-layout.v1.ts` |
| Catalog seed data | kebab-case JSON/TS under `db/src/seeds/` | `db/src/seeds/crops.ts` |
| DI cradle key | camelCase, one entry per dependency | `plantingService: PlantingService` |
| Zod schema | camelCase + `Schema`, file `<name>.schema.ts`, shared client/server | `plantingPlaceSchema` → `validators/plantings/planting-place.schema.ts` |
| Event ID | `concept.entity.action`, past tense | `plantings.planting.placed`, `gardens.bed.resized` |
| API route | one `route.ts` per resource under `api/<concept>/...` | `api/beds/[id]/plantings/route.ts` |
| Page | `<segment>/page.tsx`, default export `<Segment>Page` | `gardens/page.tsx` → `GardensPage` |
| UI component | PascalCase; shadcn in `components/ui/`, concept components in `components/<concept>/`, generic panel primitives in `backend/<category>/` | `BedGrid`, `CropPicker`, `CrudForm` |
| Domain error | PascalCase + `Error`, extends `AppError`, in `core/src/http/errors.ts` | `CellOccupiedError`, `AiUnavailableError` |
| API route handler builder | `makeCrudRoute` (plain CRUD) or `apiHandler` (workflow), from `core/src/http` | `export const { GET, POST } = makeCrudRoute({ ... })` |
| Client fetch helper | `apiCall`/`apiCallOrThrow` from `ui/src/backend/api`, never raw `fetch` | `await apiCall<Garden[]>('/api/gardens')` |

### Reusable API & UI Layer (no duplicated fetch / validation / auth / CRUD code)

Two shared layers exist so ~8 concepts don't each reinvent
fetch/validation/auth/error-handling — **build a new one only when a genuinely new
pattern appears, never re-implement an existing one inline.**

**Server side — `packages/core/src/http/`:**

- `errors.ts` — typed hierarchy (`AppError`; `NotFoundError`, `ForbiddenError`,
  `UnauthorizedError`, `ValidationError`, `ConflictError`, `RateLimitedError`,
  `AiUnavailableError`, `PayloadTooLargeError`). Grid-specific errors
  (`CellOccupiedError`, `OutOfBedBoundsError`) extend `ConflictError`/`ValidationError`.
  Services throw these; a service never builds an HTTP response.
- `apiHandler.ts` — maps `AppError`s to status + JSON envelope
  (`{ ok: true, data }` / `{ ok: false, error: { code, message, fieldErrors? } }`),
  logs unexpected failures, never leaks a stack trace. No route writes its own
  `try/catch`.
- `makeCrudRoute.ts` — for plain list/create/update/delete resources (`gardens`,
  `beds` metadata, `journal` entries, catalog reads). Workflow endpoints (placing /
  moving plantings in the grid, applying an AI layout, uploading photos, calendar
  generation) use `apiHandler` directly.
- `auth.ts` — `requireSession(req)` and ownership assertions
  (`assertOwnsGarden`, `assertOwnsBed`, `assertOwnsPhoto`). Ownership of a bed or
  planting is always resolved **through its garden** — never trust a `gardenId` sent
  by the client alongside a `bedId`.
- `upload.ts` — the only multipart parser (size limit, magic-byte MIME check).

**Client side — `packages/ui/src/backend/`:**

- `api/apiCall.ts` (+ `apiUpload`) — the only sanctioned `fetch()` to `/api/*`;
  defensive envelope parsing; typed `ApiResult<T>`.
- `forms/CrudForm.tsx` — schema-driven form bound to the server's Zod schema; shows
  `fieldErrors`; `Cmd/Ctrl+Enter` submits, `Escape` cancels. Bespoke UI only where
  the UX isn't form-over-schema — the **bed grid editor** is the main legitimate
  exception.
- `tables/DataTable.tsx` — column-config lists with loading/empty/error, pagination,
  row actions, card mode on mobile (crop catalog, journal, calendar list view).
- `feedback/{LoadingMessage,ErrorMessage,EmptyState}.tsx` — the only sanctioned
  loading/error/empty renderers.

The JSON envelope is a **shape convention**, not a shared TS type — `ui` must not
import `core`. A `packages/shared` package is an **Ask First** change. Pure grid and
calendar math lives in `core` and is exposed to the client via API responses (e.g. the
bed endpoint returns computed conflicts), not by importing `core` into `ui`.

**Where a new reusable component goes:**

1. Raw shadcn primitive → `ui/src/components/ui/`, only via `npx shadcn@latest add`.
2. Generic, concept-agnostic panel pattern (new field type, image dropzone, generic
   grid/cell renderer) → `ui/src/backend/<category>/`.
3. Component tied to one concept's domain shape (`BedGrid`, `CropPicker`,
   `CompanionBadge`, `CalendarTimeline`) → `ui/src/components/<concept>/`.
4. Used by exactly one page → colocate; promote on the second consumer.

### Architecture

- Keep the enforced dependency direction `app → core → db`, `ui` importable by `app`
  only (ESLint `no-restricted-imports`).
- A concept folder is created **only when its first entity/service is added**.
- **Grid model is the core invariant.** A bed has `rows × cols` cells; a `Planting`
  occupies a rectangle of cells (`row`, `col`, `rowSpan`, `colSpan`) and stores
  `plantsPerCell` derived from the crop's spacing. All placement rules (bounds, no
  overlap, crop footprint, spacing) live in **pure functions** in
  `services/plantings/grid-rules.ts`, fully unit-tested; `PlantingService` calls them
  and persists. Overlap is enforced in the service inside a transaction (the DB only
  guarantees per-cell uniqueness when a cell-occupancy table is used — pick one model
  and document it in the entity file).
- **Companion logic is pure and data-driven.** Companion/combative relations live in
  the catalog (`crop_companions`: `cropId`, `otherCropId`, `relation`
  (`companion` | `combative`), `source`). Conflict detection for a bed is a pure
  function `(plantings, relations) → conflicts`, computed server-side and returned with
  the bed — the UI never hard-codes crop relationships.
- **Calendar is computed, not stored.** Sowing/transplant/harvest windows are derived
  from crop timing data (weeks before/after last frost, days to maturity) + the user's
  frost dates, via pure functions in `services/calendar/`. Persist only user decisions
  (planned sowing date overrides), not derived dates.
- **Catalog is reference data.** Crops, varieties and companion relations come from
  versioned seed files applied by migration/seed scripts; users cannot edit the global
  catalog in MVP (custom user varieties are a separate, user-owned table if ever added).
  Every catalog fact has a `source` field; do not scrape or copy another app's dataset.
- **External integrations go through ports in `core`**, each with a mock/local
  adapter used in tests and CI:
  - `AiGateway` — layout suggestions, garden Q&A, (stretch) photo diagnosis.
    `MockAiGateway` is deterministic. No vendor AI SDK outside its adapter file.
  - `ImageStorage` — journal/diagnosis photos. `LocalDiskImageStorage` for MVP;
    entities store only a storage key.
  - `FrostDateProvider` — frost dates for a region/postal code.
    `StaticFrostDateProvider` (bundled table) for MVP; the user can always override
    dates manually.
- **AI layer — `core/src/ai/`:** versioned prompts (`prompts/<name>.vN.ts`); every
  response parsed with a Zod schema (`ai/schemas/`). AI layout output is additionally
  validated **against the domain**: crop IDs must exist in the catalog, every proposed
  planting must pass `grid-rules.ts`. Invalid output → one retry, then
  `AiUnavailableError`. Persisted AI results store `model` and `promptVersion`.
- **AI proposes, the user applies.** An AI layout is returned as a *proposal* (preview
  diff on the grid). Only an explicit "apply" request writes plantings, through the
  same `PlantingService` path as manual placement — there is no AI-only write path.
- **No background workers in MVP.** "What to do this week" is computed on read from
  the calendar. Email/push reminders, if ever needed, = one cron-invoked route — an
  **Ask First** change.
- AI calls are synchronous with a hard timeout (e.g. 30 s).
- Domain events via the lightweight typed emitter in `core/src/events`, in-process
  only.
- Shared Zod schemas in `core/src/validators/<concept>/`, imported by route and form.
- DB access only in `export const dynamic = "force-dynamic"` routes/pages; the app
  must build and boot with no database **and no AI provider** reachable.
  *(Repo adaptation: use `await connection()` — see the note at the top.)*
- **Concurrent grid edits** (two devices editing the same bed): beds carry a `version`
  column (optimistic locking). A stale write → `ConflictError` (409) and the client
  reloads the bed — never a silent last-write-wins on a layout.

### Engineering Principles

When two principles conflict, prefer the one that keeps the change **smaller and
more explicit**.

- **SRP.** Entity = schema; pure module = rules/math; service = orchestration +
  persistence for one concept; route = HTTP wiring; prompt file = one prompt.
  `grid-rules.ts` decides whether a placement is valid; it never touches the DB.
- **DRY.** One Zod schema per input, imported by route and form; one grid-rule
  implementation used by manual placement *and* AI layout validation; one companion
  check used by the bed view *and* AI prompts.
- **Separation of Concerns.** Persistence in `db`, business rules in `core`,
  HTTP/rendering in `app`, presentation in `ui`. A page never runs a MikroORM query or
  an AI SDK call.
- **Functional core, imperative shell.** Grid, companion and calendar logic are pure
  functions with exhaustive unit tests; services are the thin I/O shell around them.
- **Dependency Inversion.** Services depend on `AiGateway`, `ImageStorage`,
  `FrostDateProvider` — never on vendor SDKs. Only `db` imports `@mikro-orm/*`.
  `awilix` wires mock vs real adapters.
- **Explicit over implicit.** `container.ts` registers every dependency by hand — no
  `loadModules` globbing.
- **YAGNI.** No sharing, no freeform drawing, no weather API, no `assistant/` folder
  before the first AI feature.
- **Composition over inheritance.** `PlantingService` composes grid rules, the crop
  catalog and the event bus; no base-service class hierarchies.
- **Fail closed.** Ownership errors deny. An AI failure surfaces an error state — it
  never silently applies a partial layout.
- **Idempotency.** Applying the same AI proposal twice, or double-tapping "place",
  must not create duplicate plantings: proposals have an ID and are applied at most
  once; placement is guarded by the bed `version` + overlap check in one transaction.
- **AI output is untrusted input.** Validate with Zod and against the domain, never
  render as HTML, never write without explicit user action.

### Security & Validation — Minimum Requirements

- **Password hashing:** `bcrypt`/`bcryptjs`, cost ≥ 12; upgrade path `argon2id`
  (memory ≥ 19 MiB, iterations ≥ 2, parallelism 1). If social login (e.g. Google) is
  added, it's an **Ask First** change with its own spec.
- **JWT:** `HS256` minimum, secret ≥ 32 random bytes from zod-validated `env.ts`;
  24 h expiry; no refresh flow in MVP (documented limitation).
- **Cookies:** `httpOnly`, `secure` in production, `sameSite=lax`, scoped `path`. No
  JWT in `localStorage`.
- **CSRF:** every state-changing route requires the custom header `apiCall`/
  `apiUpload` always set, plus `sameSite` cookies.
- **Rate limiting:** login/register (per IP+email, cooldown) and **every AI endpoint**
  (per-user daily quota + per-minute limit) → `RateLimitedError` (429). In-memory
  limiter is MVP-only.
- **Location data minimization:** store the user's frost dates and a coarse region
  (postal-code prefix or climate zone), never precise coordinates. Never send location
  to the AI provider beyond what the task needs (climate zone, frost dates).
- **File uploads:** server-side size limit (e.g. 8 MB) before buffering; allow-list
  `image/jpeg|png|webp` by **magic bytes**; re-encode/resize server-side; **strip EXIF**
  (garden photos carry the GPS of the user's home); random UUID storage keys; never
  use client filenames in paths.
- **Photo access:** private, served only through an authenticated, ownership-checked
  route — never from a public static folder.
- **Ownership:** a user can only read/modify *their own* gardens, beds, plantings,
  journal entries, photos and AI conversations. Missing ownership checks are blockers.
- **Mass assignment:** never spread the raw body into `em.create()`/`em.assign()`;
  use the Zod-parsed output (no smuggled `userId`, `gardenId`, `version`).
- **Input bounds:** bed dimensions, number of beds per garden, plantings per bed and
  journal text length have explicit max values in the Zod schemas (prevents
  10 000×10 000 grids and payload abuse).
- **Injection:** MikroORM entity/query APIs only — no raw SQL with interpolated input.
- **Prompt injection & data minimization:** user text (journal notes, questions) goes
  to the model as delimited data, never merged into system instructions; the model
  sees only the current garden's relevant data — no email, no IDs of other users'
  objects.
- **AI safety copy:** AI answers are labeled as suggestions ("AI may be wrong");
  safety-relevant facts (e.g. toxicity of plant parts) come from the catalog, not from
  free-form model output.
- **Secrets & logging:** all secrets (incl. AI API key) via env; `.env` git-ignored;
  `pino` redacts passwords, tokens, JWTs, API keys; AI calls logged as metadata (model,
  prompt version, latency, tokens) — not full prompts with user content, never image
  bytes.
- **Auth error messages:** generic, never revealing whether an email is registered.
- **IDs:** UUIDs — no enumerable garden/photo IDs.
- **Dependency hygiene:** `npm audit` in the validation gate; no dependency for what
  20 lines of local code cover.

### Code Quality

- No `any`; narrow unknown types at runtime.
- Self-documenting code; comments only for a non-obvious *why*.
- Three similar lines are fine; copy-pasted branching logic is not.
- No feature you don't need yet (see §0).
- One thing per function; early returns over nesting.
- Error/empty/null paths handled where they occur.
- No empty `catch`.
- No magic numbers/strings — name them and say why (cells per square foot, max bed
  size, AI quota, AI timeout, upload limit, default frost-date fallback).
- Dates: calendar dates are **date-only values** (`YYYY-MM-DD`, no time, no timezone
  shifts); only timestamps (`createdAt`) are `timestamptz`.
- Booleans read positively (`isCompanion`, not `!isNotCompanion`); no bare
  `true`/`false` arguments.
- No dead code, commented-out code or debug `console.log`s.
- A PR's diff traces entirely to its stated purpose.

### Code Review Checklist

#### Structure & conventions

- Concept folder naming matches the table; entity/service pairing on both sides.
- No import breaks `app → core → db` or reaches into another concept's internals.
- Routes use `makeCrudRoute`/`apiHandler`; uploads use `upload.ts`/`apiUpload`; forms
  use `CrudForm`; lists use `DataTable` — bespoke versions need a stated reason.
- Grid/companion/calendar rules are in pure modules, not inside services, routes or
  React components.
- No vendor AI/storage SDK outside its adapter.
- `npm run lint`, `npm run typecheck` and relevant tests pass before review.

**Security fundamentals:**

- [ ] Auth enforced **server-side** on every non-public route. (blocker)
- [ ] Authorization checks **the specific record**, resolving bed/planting ownership
  through its garden. (blocker)
- [ ] Grid writes check bounds + overlap + bed `version` in one transaction. (blocker)
- [ ] No secret, token, API key or full JWT in logs, errors or client payloads.
  (blocker)
- [ ] No untrusted input reaches a query, shell command or file path unparameterized.
  (blocker)
- [ ] Write endpoints parse an explicit, bounded Zod shape — no mass assignment.
  (blocker)
- [ ] Uploads: size limit, magic-byte MIME check, EXIF stripped, random key. (blocker)
- [ ] AI output validated with Zod **and** domain rules; never rendered as HTML; never
  written without explicit user "apply". (blocker)
- [ ] User text sent to the model is delimited as data. (major)
- [ ] AI endpoints rate-limited / quota-checked. (major)
- [ ] No precise location stored or sent to the AI. (major)
- [ ] Cookie flags preserved when auth-cookie code is touched. (major)
- [ ] Security decisions fail **closed**. (blocker)
- [ ] Security-relevant bug fixes ship with a regression test. (major)

#### Correctness & tests

- `grid-rules.ts`, companion conflict detection and calendar window math have
  table-driven unit tests covering edges (bed borders, multi-cell crops, empty bed,
  crop with no frost dependency, Southern Hemisphere / late frost dates).
- All tests use `MockAiGateway`, `StaticFrostDateProvider` and local image storage —
  **CI never calls a real AI provider or the network.**
- AI parsing is tested against malformed, partial and hostile output, and against
  layouts that violate grid rules or reference unknown crops.
- Concurrency: an integration test covers two conflicting edits to the same bed
  (second gets 409) and double-applying the same AI proposal (applied once).
- Catalog seed integrity test: every companion relation references existing crops;
  relations are symmetric where the data says they should be.
- Behavior changes ship with a test that fails on the pre-change code; bug fixes ship
  a regression test.

---

## 2. How to Place & Generate a New Example (for the agent)

When asked to scaffold a new domain concept (e.g. "add journal"):

1. Create `packages/db/src/entities/<concept>/<name>.entity.ts`; register in
   `entities/index.ts`; generate a MikroORM migration. Reference data → seed file in
   `db/src/seeds/`.
2. Put any non-trivial rules/math in a pure module in
   `packages/core/src/services/<concept>/` with unit tests first.
3. Create `packages/core/src/services/<concept>/<name>.service.ts`; register in
   `container.ts` (`asClass(...).scoped()`) and type in `cradle.ts`.
4. External system? Define the port (`<name>.port.ts`), a mock/local adapter under
   `adapters/`, register it explicitly.
5. AI involved? Versioned prompt in `core/src/ai/prompts/`, Zod output schema in
   `core/src/ai/schemas/`, domain validation of the output, `model` + `promptVersion`
   persisted, proposal-then-apply flow for anything that writes.
6. Shared validation at `packages/core/src/validators/<concept>/<name>-<action>.schema.ts`
   with explicit max bounds.
7. Emit `concept.entity.action` events from the service after successful mutations,
   only if a side effect needs them.
8. HTTP surface in `packages/app/src/app/api/<concept>/route.ts`:
   - Plain CRUD → `makeCrudRoute({ schema, service })`.
   - Workflow → `apiHandler` + `requireSession` + ownership assertion + service call(s)
     via `withScope`.
   - Never a bare `try/catch` + manual `NextResponse.json`.
9. Pages under `(marketing)/`, `(auth)/` or `(app)/`: `apiCall`/`apiUpload`,
   `CrudForm`, `DataTable`, `feedback/`. Check `ui/src/backend/` and
   `ui/src/components/<concept>/` before writing a new component.
10. Never create `modules/<concept>/`, per-concept `setup.ts`/`acl.ts`, or
    auto-discovery.

---

## 3. Changes to Apply to `AGENTS.md`

Applied on 2026-10-13 — see `AGENTS.md` sections *Domain concept convention*, *Domain invariants*,
*External integrations & AI*, *Reusable API & UI layer*. (The original diff text is reproduced
verbatim there.) DI qualification: `awilix` stays (scoped `EntityManager`, mock/real swaps for
`AiGateway`, `ImageStorage`, `FrostDateProvider`).

---

## 4. Proposed Scalable Package Structure

```
packages/
  app/
    src/app/
      (marketing)/
        page.tsx                                  # landing
        crops/page.tsx                            # public crop catalog
        crops/[cropId]/page.tsx                   # crop detail: spacing, timing, companions
      (auth)/
        login/page.tsx
        register/page.tsx
      (app)/
        gardens/page.tsx                          # my gardens
        gardens/[gardenId]/page.tsx               # garden overview: beds
        gardens/[gardenId]/beds/[bedId]/page.tsx  # bed grid editor + conflicts
        gardens/[gardenId]/calendar/page.tsx      # planting calendar
        gardens/[gardenId]/journal/page.tsx       # journal
        gardens/[gardenId]/assistant/page.tsx     # AI: layout suggestions, Q&A
        settings/page.tsx                         # frost dates / region, profile
      api/
        auth/route.ts
        crops/route.ts
        crops/[id]/route.ts
        gardens/route.ts
        gardens/[id]/route.ts
        gardens/[id]/beds/route.ts
        beds/[id]/route.ts                        # bed + plantings + computed conflicts
        beds/[id]/plantings/route.ts              # place
        plantings/[id]/route.ts                   # move / resize / remove
        gardens/[id]/calendar/route.ts            # computed windows
        gardens/[id]/journal/route.ts
        journal/[id]/photos/route.ts              # upload
        photos/[id]/route.ts                      # authorized read / delete
        beds/[id]/layout-proposals/route.ts       # AI: create proposal
        layout-proposals/[id]/apply/route.ts      # apply once
        gardens/[id]/assistant/route.ts           # AI Q&A
        health/route.ts

  core/
    src/
      config/env.ts
      container/{container.ts,cradle.ts}
      logger.ts
      http/
        errors.ts
        apiHandler.ts
        makeCrudRoute.ts
        auth.ts
        upload.ts
      events/
        event-bus.ts
        event-map.ts
      ai/
        prompts/
          suggest-bed-layout.v1.ts
          garden-qa.v1.ts
        schemas/
          layout-proposal.schema.ts
          garden-answer.schema.ts
      services/
        auth/user.service.ts
        gardens/garden.service.ts
        gardens/bed.service.ts
        plantings/planting.service.ts
        plantings/grid-rules.ts                   # pure: bounds, overlap, footprint
        crops/crop.service.ts
        crops/companions.ts                       # pure: conflict detection
        calendar/calendar.service.ts
        calendar/sowing-windows.ts                # pure: date math
        calendar/frost-date-provider.port.ts
        calendar/adapters/static-frost-date-provider.ts
        journal/journal.service.ts
        photos/photo.service.ts
        photos/image-storage.port.ts
        photos/adapters/local-disk-image-storage.ts
        assistant/layout-proposal.service.ts
        assistant/assistant.service.ts
        assistant/ai-gateway.port.ts
        assistant/adapters/mock-ai-gateway.ts
      validators/
        auth/register.schema.ts
        gardens/garden-create.schema.ts
        gardens/bed-create.schema.ts
        plantings/planting-place.schema.ts
        ...

  db/
    src/
      entities/
        base.entity.ts
        define.ts
        auth/user.entity.ts                       # + frost dates / region
        gardens/garden.entity.ts
        gardens/bed.entity.ts                     # rows, cols, version
        plantings/planting.entity.ts              # bed, crop, variety, row/col/span
        crops/crop.entity.ts
        crops/variety.entity.ts
        crops/crop-companion.entity.ts
        journal/journal-entry.entity.ts
        photos/photo.entity.ts
        assistant/layout-proposal.entity.ts       # proposal payload, appliedAt
      seeds/
        crops.ts
        crop-companions.ts

  ui/
    src/
      components/
        ui/                                       # shadcn primitives only
        gardens/
          bed-grid.tsx                            # the grid editor
          bed-card.tsx
        crops/
          crop-picker.tsx
          companion-badge.tsx
        calendar/
          calendar-timeline.tsx
        journal/
          journal-entry-card.tsx
        assistant/
          layout-proposal-preview.tsx
      backend/
        api/
          apiCall.ts                              # + apiUpload
          types.ts
        forms/
          CrudForm.tsx
          ImageDropzone.tsx
        tables/
          DataTable.tsx
        feedback/
          LoadingMessage.tsx
          ErrorMessage.tsx
          EmptyState.tsx
```

Dependency direction unchanged: `app → core → db`, `ui` standalone.

---

## 5. Migration Instructions (current repo → this structure)

One buildable step at a time — never a single move-everything commit.

1. **Remove DevMentor leftovers** if present (mentor entities, seeds, pages, README
   sections). Rename package scope to `@plantai/*`. Generate a migration dropping
   obsolete tables. Run `npm run typecheck && npm run lint && npm run build`.
2. **Move `auth` into its concept sub-folder** (`entities/auth/`, `services/auth/`);
   update `index.ts`, `container.ts`, `cradle.ts`.
3. **Add the shared layers** — `core/src/http/` (incl. `upload.ts`) and
   `ui/src/backend/` — before the second concept.
4. **`crops` catalog first**: entities + seed data + read-only routes + catalog pages.
   Everything else depends on it. Use `makeCrudRoute`/`DataTable` here as the reference
   example later concepts copy.
5. **`gardens` + beds, then `plantings`** with `grid-rules.ts` (tests first), the bed
   grid editor, optimistic locking, and server-computed companion conflicts. This is
   the core loop — finish it before anything AI.
6. **`calendar`** with `sowing-windows.ts`, `FrostDateProvider` and frost dates in
   settings.
7. **`journal` + `photos`** with the `ImageStorage` port.
8. **`assistant`**: `AiGateway` + `MockAiGateway`, layout proposals (proposal → preview
   → apply once), then Q&A. Plug in a real AI adapter only after the mock-driven flow
   and its tests are green.
9. Add `core/src/events/` and validators when the first concept needs them.
10. **Update `AGENTS.md`** with the §3 diff in the same PR as step 2.
11. After each step, confirm `npm run build` succeeds and `/api/health` works.
