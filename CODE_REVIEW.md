# Code review rules

This document is the repo-specific checklist `om-code-review` (and therefore `om-auto-review-pr`) applies automatically. It complements, and never relaxes, the full rules in `AGENTS.md`, `CLAUDE.md`, and `.ai/docs/engineering-standards.md` — those are the source of truth; this file is the review-time distillation. It also complements, rather than replaces, the `reviewChecklist` field in `.ai/agentic.config.json` (currently unset — AGENTS.md/CLAUDE.md are read directly instead).

## Review priorities, in order

1. **Correctness** — does the change do what it claims, including error/empty/null paths?
2. **Security** — see Blockers below; these gate the PR regardless of everything else.
3. **Contracts** — does the change respect `BACKWARD_COMPATIBILITY.md` and the monorepo's dependency direction (`app → core → db`, `ui` never imports `core`/`db`)?
4. **Quality** — naming, dead code, test coverage, scope discipline.

## Stack-specific checks

This repo is a Next.js 16 (App Router) / React 19 / TypeScript (strict) monorepo with MikroORM 7 (`@mikro-orm/postgresql`), Awilix DI, Zod validation, pino logging, Tailwind v4 + shadcn/ui, npm workspaces. Check for:

- **No `any`** and no unexplained `unknown` — narrowed at runtime where it enters.
- **No raw MikroORM queries or AI SDK calls in `packages/app`** — persistence lives in `db`/`core`, HTTP/rendering in `app`. A page or route handler that constructs an `EntityManager` query directly, or calls a vendor AI SDK outside `adapters/`, is a blocker.
- **No `core` import inside `packages/ui`.** `ui` is presentation-only; grid/companion/calendar math reaches the client through API responses.
- **`defineEntity` + `setClass`, no decorators**; entities registered by hand in `entities/index.ts` (or the current `packages/core/src/entities/` location per the migration table in `AGENTS.md`) — no folder auto-discovery.
- **Every schema change ships a migration** — review the generated SQL and confirm the matching `.snapshot-*.json` is committed. A merged migration is never edited in place.
- **No global `EntityManager`.** Code works through a request-scoped `EntityManager` (`withRequestScope` / `withScope`); `allowGlobalContext` stays `false`.
- **Services take one destructured cradle argument**, compose collaborators, and are registered explicitly in the DI container — no `container.resolve` inside a service, no base-service hierarchy.
- **Mass assignment**: only Zod-parsed output reaches `em.create()` / `em.assign()`, never a raw request body.
- **Routes use the shared layer**: `makeCrudRoute`/`apiHandler` for routes, `upload.ts`/`apiUpload` for file uploads, `CrudForm`/`DataTable`/`feedback/*` on the client. A bare `try/catch` + hand-rolled `NextResponse.json`, a raw `fetch('/api/...')` in a component, or a hand-rolled form/table/loading state needs a stated reason — otherwise it is a finding.
- **Bed grid, companion, and calendar math lives in pure modules** (`grid-rules.ts`, `companions.ts`, `sowing-windows.ts`), not inlined in services, routes, or React components. `PlantingService` calls the pure functions and persists; it does not reimplement the rules.
- **Pages resolve services through a request scope** and call `await connection()` (Next 16 — not the old `export const dynamic = "force-dynamic"`) before any DB/AI access. The app must still build and boot with no database and no AI provider reachable.
- **Vendor SDKs only inside `adapters/`** behind a port (`AiGateway`, `ImageStorage`, `FrostDateProvider`). Tests and CI must never call a real AI provider or network service — confirm mock/static/local adapters are used.
- **AI output**: parsed with Zod and validated against domain rules (crop IDs exist, every placement passes `grid-rules.ts`); invalid output gets exactly one retry then `AiUnavailableError`; results persist `model` + `promptVersion`; AI never writes a planting directly — only an explicit "apply" through `PlantingService`.

## Security blockers

A PR is blocked on any of the following (do not approve, even if everything else is clean):

- [ ] Auth enforced **server-side** on every non-public route.
- [ ] Authorization resolves ownership through the garden for every bed/planting/journal/photo/AI-conversation record — never trusts a client-sent `gardenId`.
- [ ] Grid writes check bounds + overlap + the bed's optimistic-lock `version` inside one transaction; a stale write returns `ConflictError` (409), never last-write-wins.
- [ ] No secret, token, API key, or full JWT appears in logs, errors, or client payloads (pino redaction stays intact).
- [ ] No untrusted input reaches a query, shell command, or file path unparameterized.
- [ ] Every write endpoint parses an explicit, bounded Zod schema — no mass assignment.
- [ ] Uploads: size limit enforced before buffering, magic-byte MIME allow-list (`jpeg`/`png`/`webp`), EXIF stripped, random UUID storage key, no client filename in the path.
- [ ] AI output is validated (Zod + domain rules), never rendered as HTML, never written without an explicit user "apply".
- [ ] Security decisions fail **closed**.
- [ ] A security-relevant bug fix ships with a regression test.

Major (block unless explicitly waived with a reason in the PR):

- [ ] User text sent to the AI model is delimited as data, never merged into the instruction/system prompt.
- [ ] Every AI endpoint is rate-limited / quota-checked (per-user daily quota + per-minute limit).
- [ ] No precise location is stored or sent to the AI — only climate zone / frost dates.
- [ ] Cookie flags (`httpOnly`, `secure` in production, `sameSite=lax`, scoped `path`) are preserved wherever auth-cookie code is touched.

## Correctness & test checks

- `grid-rules.ts`, companion-conflict detection, and `sowing-windows.ts` carry table-driven unit tests covering edges: bed borders, multi-cell crops, empty bed, a crop with no frost dependency, Southern Hemisphere / late-frost dates.
- AI parsing is tested against malformed, partial, and hostile model output, plus layouts that violate grid rules or reference unknown crop ids.
- A stale bed write (409) and double-applying the same AI proposal (applied once, not twice) are covered — by unit tests for the pure logic, by an integration test for the end-to-end transaction behavior.
- A seed-integrity test checks every `crop_companions` relation references existing crops and is symmetric where the data says it should be.
- **100% statements/branches/functions/lines coverage is enforced by CI** (`npm test`, Vitest, over `packages/*/src/**`). A PR that drops coverage does not merge; new exclusions in `vitest.config.ts` need an inline reason comment and are not an acceptable way to dodge the gate.
- A behavior change ships with a test that fails on the pre-change code; a bug fix ships a regression test.

## Quality checks

- No magic numbers/strings — named constants (cells per square foot, max bed size, AI quota/timeout, upload size limit, frost-date fallback).
- Booleans read positively (`isCompanion`, not `!isNotCompanion`); no bare `true`/`false` call-site arguments.
- No dead code, commented-out code, or debug `console.log`.
- Comments explain a non-obvious *why* only — not what well-named code already shows.
- A PR's diff traces entirely to its stated purpose — no drive-by refactors bundled into an unrelated fix.
- Concept folders (`gardens`, `plantings`, `crops`, `calendar`, `journal`, `photos`, `assistant`, `auth`) are used consistently across `db`/`core`/`app` — no `modules/<concept>/`, per-concept `setup.ts`/`acl.ts`, or `loadModules` globbing.

## Severity guidance

- **Blocker** — the checked-box security items above; broken dependency direction (`app`/`ui` reaching into `core`/`db` internals it shouldn't); a grid write missing bounds/overlap/version checks; a merged migration edited in place; coverage dropped below 100%.
- **Major** — the unchecked-box "Major" security items; a missing regression test for a behavior change; a reusable-layer bypass (hand-rolled fetch/form/table) without a stated reason; an AI call made synchronously without the documented timeout.
- **Minor** — naming drift, a missed opportunity to use an existing pure-rule module, a magic number that should be named, a comment that explains "what" instead of "why".

Run the full validation gate (see `SDLC.md`) before approving: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`.
