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

- **Integration tests:** `.ai/lessons.md` said they couldn't run in this sandbox. They now run via the `INTEGRATION_DATABASE_ADMIN_URL` fallback; see Results.
- **The sample bed uses emoji.** Their rendering varies by platform, but they're decorative only (`aria-hidden`).

## Progress

PR: #10

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Landing page

- [x] 1.1 Rewrite page.tsx and its unit test — 0c13dcb
- [x] 1.2 Update the home-page integration test — 883eb2c
- [x] 1.3 Full validation gate — 883eb2c

## Decisions

- **CTA colour:** `bg-leaf-700` (hover `leaf-900`) instead of the spec's `leaf-600`. White text on `leaf-600` is below the spec's own 4.5 : 1 contrast floor. The spec on PR #9 is updated to match.
- **Sample bed cells:** each carries a `title` with the crop name, so the `crop` field isn't dead data. The cells stay `aria-hidden`.

## Results

- **Static checks:** `npm run typecheck`, `npm run lint` and `npm test` pass (110 tests, 100 % statements/branches/functions/lines).
- **Build:** `npm run build` passes (run as `env -u NODE_ENV`, per the existing lesson), with `/` listed as static (○).
- **Audit:** `npm audit --omit=dev` reports 0 vulnerabilities.
- **Integration:** `npm run test:integration` passes, 3 files and 7 tests. It ran locally against a throwaway database via `INTEGRATION_DATABASE_ADMIN_URL=$DATABASE_URL`, after `agent-browser install --with-deps` added Chrome's missing system libraries. This includes `/api/health`.
- **Review** (`om-auto-review-pr`): approve. One minor finding: the feature card titles were `<h2>` beside the hidden Features `<h2>`. Fixed in 461b396 (now `<h3>`); the spec on #9 is updated to match. The gate and integration suite were re-run green.
- **CI:** all four jobs pass on 461b396.
