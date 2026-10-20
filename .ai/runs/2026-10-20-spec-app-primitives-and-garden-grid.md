# Run — specs for the app primitives and the garden grid (from #13)

- **Date:** 2026-10-20
- **Goal:** the user asked for a spec based on #13 that also designs the reusable backend and frontend primitives the app will grow on.
- **Related specs:** `.ai/specs/2026-10-20-app-primitives.md` (A), `.ai/specs/2026-10-20-garden-grid.md` (B)

## Steps
1. Read `.ai/lessons.md`, issue #13 (a research task, "no spec owed"), the product brief, D02/D07/N01, the A04 sheet, the engineering standards, current code (`core`, `app`, `ui`), `BACKWARD_COMPATIBILITY.md` and the Next 16 docs (auth DAL, `proxy.ts`, Route Handler `params`).
2. Wrote a skeleton with four Open Questions and stopped at the gate.
3. Owner answers (2026-10-20): Q1 two specs; Q2 minimal auth inside the primitives spec; Q3 full design now, grid phases blocked on A04; Q4 a planting may exist without a bed.
4. Q4 changes R01, so it was recorded as D10, and the brief gained R07 (superseding R01).
5. Wrote spec A and spec B. A fresh-context subagent then reviewed scope cohesion.

## Key decisions
- #13's own deliverable (the owner's paper layout) is still owed. These specs don't close #13, and the grid phases of B wait for it.
- Primitives that only have a consumer in B (`withAggregateLock`, `CellGrid`) are designed in A and built in B's first step that needs them.
- `upload.ts`, the events emitter and `proxy.ts` aren't built: D09 moves photos to Later, nothing yet needs an event, and the DAL covers auth.

## Open issues
- A04 untested (#13). D05 interviews and Q07 still open; D07 puts the calendar before beds.

## Review (fresh-context subagent) and fixes applied
- **Critical:**
  - A `RESTRICT` planting→bed FK can break the garden-delete cascade. Now `NO ACTION`, with an integration test.
  - Planting writes locked only beds. They now lock the planting row too (beds in id order, then the planting) and re-check `bed_id`.
- **High:**
  - D05 gate made explicit in both status lines (⚠️ the owner must confirm that D05 doesn't block spec A).
  - Lock and owned-lookup primitives moved into `db` (only `db` imports `@mikro-orm/*`).
  - Catalogue spec named as a hard dependency of B Phase 1.
  - B Phase 1 no longer ships geometry ahead of A04.
- **Medium/Low:**
  - Composite FK for same-garden placement.
  - The lock query locks the root row alone.
  - Count limits checked under a parent row lock.
  - Primitives without a consumer moved to "built with first consumer".
  - Rate limiter pinned to the root container, with a trusted-IP rule.
  - Error-code list, migration names and the public `/admin` dashboard stated.
