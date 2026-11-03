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

## Open issues

- Q17 remainder and D16 changes block Phase 4.
