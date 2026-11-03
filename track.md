# Implementation tracker — App primitives

- **Spec:** [`.ai/specs/2026-10-20-app-primitives.md`](.ai/specs/2026-10-20-app-primitives.md)
- **Branch:** `feat/app-primitives`, checked out in `/workspace` (worked in a `/tmp` worktree until task 1.5; moved so the editor and preview on :3000 show the branch).
- **Run log:** [`.ai/runs/2026-11-03-implement-app-primitives.md`](.ai/runs/2026-11-03-implement-app-primitives.md)
- **Rules:** one commit per task; full gate (`typecheck`, `lint`, `test` 100 %, `build`, `npm audit --omit=dev`, `/api/health`) green after every task; stop for manual testing after every phase.
- **Gate note:** D05 is superseded by D11 (brief Q10: moot), so Phases 0–3 are unblocked. Phase 4 waits for the spec update for D16/Q17 (task 4.0, owner decision).

Legend: `[x]` done · `[ ]` pending · `[~]` in progress · `[!]` blocked

## Phase 0 — Alignment

- [x] 0.1 Rules alignment (D02, D08, D09, R07): verify `AGENTS.md` + standards already updated (#38); fill gaps only. Gaps filled: remaining MVP references to journal/photos/upload/layout proposal marked Later in-place; double-apply integration test deferred (D08).
- [x] 0.2 Rename scope `@plant-ai/*` → `@plantai/*` (package.json files, imports, scripts, configs, docs, `BACKWARD_COMPATIBILITY.md`).
- [x] 0.3 Create `packages/db` (entities in `entities/<concept>/`, migrations + snapshot, ORM config, `getOrm`).
- [x] 0.4 Core container split: `core/src/container/{container,cradle,scope}.ts` with `withScope`; `services/gardens/garden.service.ts`; app uses `withScope` (remove `request-scope.ts`).
- [x] 0.5 ESLint over every package + `no-restricted-imports` layer rules (`app → core → db`, `ui` isolated, `@mikro-orm/*` only in `db`); update `AGENTS.md` migration table.

**Manual test after Phase 0:** `npm run dev` → `/`, `/admin`, `/admin/gardens` (create a garden), `/api/health` behave as before. ✅ Owner confirmed 2026-11-03.

## Phase 1 — Server foundation

- [x] 1.1 `core/src/config/env.ts` on Zod (lazy parse, `JWT_SECRET`, `LOG_LEVEL`), `.env.example` updated.
- [x] 1.2 `core/src/logger.ts` (pino, redaction, child logger with `requestId`).
- [x] 1.3 `core/src/http/errors.ts` (`AppError` hierarchy, codes, `details`).
- [x] 1.4 `validators/common/*` (`uuidSchema`, `idParamsSchema`, `boundedText`), `validators/limits.ts`, `@plantai/core/validators` export, ESLint rule keeping validators client-safe.
- [x] 1.5 DTO convention: `services/gardens/garden.dto.ts` (`toGardenDto`), `GardenService` returns DTOs.

**Manual test after Phase 1:** no visible change; app and `/api/health` work; review the new modules and tests. ✅ Owner confirmed 2026-11-03.

## Phase 2 — HTTP layer

- [x] 2.1 `core/src/http/apiHandler.ts` (body limit, CSRF, Zod parse, envelope, error mapping, request logging, injected `resolveActor`).
- [x] 2.2 `db/src/ownership.ts` (`findOwned`, `OwnerFilter`, `EntityManager`/`EntityName` re-export) + `core/src/services/shared/owned.ts` (`findOwnedOrFail`). `ownedBy` deferred: `ownedBy.garden` lands in 5.1 with the `owner` column (no empty registry now).
- [x] 2.3 `core/src/http/makeCrudRoute.ts` (+ `CrudService` type).

**Manual test after Phase 2:** no route uses it yet; review tests (`npm test`). ✅ Owner confirmed 2026-11-03.

## Phase 3 — Client layer

- [x] 3.1 shadcn primitives moved to `ui/src/components/ui/` (`@plantai/ui/components/ui/*`, AGENTS.md migration row closed); `alert-dialog`, `sheet`, `textarea`, `select` added via the CLI (+ smoke tests, stories).
- [ ] 3.2 `ui/src/backend/api/{apiCall,useMutation}.ts` + ESLint `no-restricted-syntax` for raw `fetch("/api`.
- [ ] 3.3 `backend/feedback/*`, `backend/dialogs/ConfirmDialog.tsx`, `backend/layout/{AppShell,PageHeader}.tsx`.
- [ ] 3.4 `backend/forms/CrudForm.tsx`.
- [ ] 3.5 `backend/tables/DataTable.tsx`.

**Manual test after Phase 3:** Storybook / `npm test` for the new components (no page uses them yet).

## Phase 4 — Auth (blocked until 4.0 is done)

- [!] 4.0 Update spec A for D16/Q17 (e-mail verification, reset, settings, PL/EN, e-mail port, confirmation-link sign-in, unconfirmed log-in) with the owner; update `AGENTS.md` ports list. Re-plan Phase 4 tasks from the updated spec.
- [ ] 4.1 `User` entity + migration `add-users`; `password.ts`; `user.service.ts`.
- [ ] 4.2 `http/auth.ts` (jose session cookie, `requireSession`), `http/rate-limit.ts` + `InMemoryRateLimiter`; `apiHandler` uses the real session.
- [ ] 4.3 `/api/auth/{register,login,logout,me}`, `app/src/server/session.ts` DAL, `(auth)` layout + login/register pages; integration test.

## Phase 5 — Owned gardens

- [ ] 5.1 Migration `add-garden-owner` + `ownedBy.garden` in `db/src/ownership.ts`; `GardenService` as `CrudService(actor)` with `MAX_GARDENS_PER_USER` under user row lock.
- [ ] 5.2 `api/gardens` + `api/gardens/[id]` via `makeCrudRoute`; `validators/gardens/garden-{create,update}.schema.ts`.
- [ ] 5.3 `(app)` layout with `AppShell`, `(app)/gardens` page; remove `/admin/gardens` + `createGardenAction`; integration tests; `BACKWARD_COMPATIBILITY.md`, `AGENTS.md` table.
