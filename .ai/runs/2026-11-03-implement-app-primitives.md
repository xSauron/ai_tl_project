# 2026-11-03 — Implement app primitives (spec A)

- **Goal:** implement `.ai/specs/2026-10-20-app-primitives.md` phase by phase, one subagent per task, one commit per task, owner's manual test after each phase.
- **Spec:** `.ai/specs/2026-10-20-app-primitives.md`
- **Tracker:** `track.md` (repo root of this branch)
- **Branch / worktree:** `feat/app-primitives` from `feat/design-system-minimal` (`bbcb02f`), worktree `/tmp/opencode/app-primitives` (the primary checkout has unrelated uncommitted work).

## Decisions (owner, 2026-11-03)

- Phase 4 (auth) waits: first update spec A for D16/Q17 with the owner (task 4.0).
- One branch, a commit per task, no PRs per phase; stop for manual testing after each phase.
- D05 gate from the spec's Status: superseded by D11 (brief Q10 "moot"), so Phases 0–3 proceed.

## Steps

- Baseline gate on `bbcb02f`: typecheck, lint, test (100 %) green.
- 0.2: scope renamed `@plant-ai/*` → `@plantai/*` (package names, deps, imports, scripts, ui tsconfig/components.json, docs, `BACKWARD_COMPATIBILITY.md` rename row, AGENTS.md table row removed); lockfile relinked; gate green except pre-existing `next` 16.4.0 critical advisory (same as baseline); `/api/health` 200.
- 0.3: `packages/db` (`@plantai/db`) created by `git mv`: entities → `entities/<concept>/` (`gardens/garden.entity.ts`), migration + `.snapshot-plant_ai.json` (100 % renames, content untouched), `config.ts`, `orm.ts` (module-level cache kept), `mikro-orm.config.ts`, and the DB `env.ts` (→ `db/src/env.ts`; `db` can't import `core`, AGENTS.md env rule notes the exception, spec row 1.1 updated). `@mikro-orm/*` + cli/tsx moved to db; root `db:migrate*` → `-w @plantai/db`; `core` imports `getOrm`, `Garden`, `EntityManager`/`MikroORM` types from `@plantai/db` (no `@mikro-orm/*` import left in core). Vitest `db` project + migration coverage exclusion repointed, `.gitignore` integration-snapshot path repointed. Docs: AGENTS.md table (2 rows removed), README, BACKWARD_COMPATIBILITY, CODE_REVIEW. Gate green (100 % coverage); audit unchanged (`next` advisory only); `db:migrate` → init still executed, no pending; `next start` `/api/health`, `/admin`, `/admin/gardens` 200; integration 7/7.

## Open issues

- Q17 remainder and D16 changes block Phase 4.
