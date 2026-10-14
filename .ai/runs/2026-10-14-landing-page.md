# Run: product landing page (issue #8)

- **Date:** 2026-10-14
- **Engine:** `om-auto-create-pr` (steps: 3, --loop: no), driven by `om-auto-fix-issue 8` → `om-auto-implement-spec 9`
- **Source doc:** `.ai/specs/2026-10-14-landing-page.md` (on spec PR #9, not yet on `main`)
- **Issue:** #8 · **Spec PR:** #9

## Goal

Replace the generic public home page with the mobile-first landing page the spec describes:
- a hero with a "Plan your garden" CTA to `/register`
- four feature cards
- a static sample bed
- a footer

The page stays static and DB-free.

## Scope

- **Changed:** `packages/app/src/app/(frontend)/page.tsx`, its colocated `page.test.tsx`, and `tests/integration/home.test.ts`.
- **Non-goals:**
  - `/register` or auth
  - renaming `(frontend)` → `(marketing)`
  - new dependencies, tokens or routes
  - shadcn on the public page
  - companion/conflict claims in the sample bed
  - committing the spec file (it merges via PR #9)

## Implementation Plan

### Phase 1: Landing page

1. Rewrite `page.tsx` per the spec and update `page.test.tsx` (unit coverage stays 100 %).
2. Update `tests/integration/home.test.ts` for the new heading, cards, footer, and a CTA → `/register` test.
3. Run the full validation gate and confirm `/` builds as a static (○) route.

## Risks

- **Integration tests can't run in this sandbox** (no Docker, per `.ai/lessons.md`). Review them carefully; CI's `integration` job is the proof.
- **The sample bed uses emoji.** Their rendering varies by platform, but they're decorative only (`aria-hidden`).

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Landing page

- [ ] 1.1 Rewrite page.tsx and its unit test
- [ ] 1.2 Update the home-page integration test
- [ ] 1.3 Full validation gate
