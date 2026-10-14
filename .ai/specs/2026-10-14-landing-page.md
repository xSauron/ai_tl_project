# Product landing page

- **Status:** draft
- **Date:** 2026-10-14
- **Issue:** #8

## 📝 TLDR

People who land on `/` today see a short generic pitch, three vague feature cards and an `Admin →` link. Nothing says this is a vegetable-garden planner, and there's no way to start. **Proposed:** rewrite the public home page as a mobile-first landing page:

- a hero with a "Plan your garden" CTA to `/register`
- four feature cards matching the MVP concepts
- a static sample square-foot bed
- a footer

The page stays static, Tailwind-only and database-free.

## Resolved assumptions (autonomous defaults)

| # | Question | Applied default | Why |
| --- | --- | --- | --- |
| Q1 | The brief asks for "Tailwind + existing shadcn components". Use shadcn on the public page? | **No, Tailwind only**, with the `(frontend)` `@theme` tokens. | `AGENTS.md` (Tech stack) says public pages use "Tailwind CSS v4 … No shadcn/ui there". `(frontend)/layout.tsx` doesn't load the `@plant-ai/ui` theme, so shadcn components would render unstyled. Reversible: changing it means updating `AGENTS.md` first. |
| Q2 | `/register` doesn't exist yet (no `auth` concept). Link the CTA anyway? | **Yes, link to `/register`** as the brief asks. | The brief names the target explicitly. `typedRoutes` is off, so the build doesn't fail. Until auth ships, the link shows Next's 404 page. It's a one-line `href` change if that's unwanted. |
| Q3 | Keep the header `Admin →` link? | **Keep it.** | Removing it isn't requested, and `tests/integration/home.test.ts` covers navigation to `/admin` (the only way into the admin panel from the UI). |
| Q4 | Mark the not-yet-built features (calendar, AI layouts) as "coming soon"? | **No badge.** Describe each capability plainly. | Smallest scope, and the brief asks for exactly these four cards. Adding a badge later is a copy-only change. |
| Q5 | Split into several specs? | **No.** | One independently deployable capability: a single static page. |

## 📝 Problem Statement

`packages/app/src/app/(frontend)/page.tsx` renders the heading "Grow a smarter garden.", one paragraph and three cards ("Plan your beds", "Companion planting", "AI growing advice"). The cards don't match the MVP concepts in `AGENTS.md`: there's no square-foot grid, no frost-date calendar, and "AI growing advice" overstates the assistant's scope. There's no call to action and no footer. A first-time visitor can't tell what the product does or how to begin.

## 📝 Proposed Solution

Rewrite `page.tsx` in place as one Server Component with four sections. The content lives in named constants in the same file, following the existing `features` pattern.

1. **Header:** `🌱 Plant.AI` wordmark plus the existing `Admin →` link.
2. **Hero:**
   - `<h1>`: "Plan your vegetable garden, one square foot at a time."
   - Pitch paragraph: "Lay out raised beds on a simple grid, see which crops are happy neighbours, and know when to sow from your own frost dates — with AI suggestions you can accept or ignore."
   - Primary CTA, a `next/link` to `/register`, text **"Plan your garden"**.
   - From `md` up, the hero is two columns: text on the left, the sample bed on the right. On mobile they stack, text first.
3. **Features:** four `<article>` cards in a grid (one column by default, two at `sm`, four at `lg`):
   - **Square-foot bed planner:** "Draw beds in feet and drop crops onto the grid. Spacing tells you how many plants fit in each square."
   - **Companion planting hints:** "Get a heads-up when neighbouring crops tend to compete, based on sourced catalog data."
   - **Planting calendar:** "Sowing and transplant windows worked out from your last and first frost dates."
   - **AI layout suggestions:** "Ask for a bed layout. You review the proposal and apply it only if you like it."
4. **Sample bed:** a static, decorative 4 × 4 CSS grid (`grid-cols-4`, square cells via `aspect-square`). Each cell shows a crop emoji and a "×N" plants-per-square label (e.g. 🍅 ×1, 🥬 ×4, 🥕 ×16, 🧅 ×9). The wrapper has `role="img"` and an `aria-label` ("Example 4 by 4 foot raised bed planted square by square"), and its cells are `aria-hidden`. A caption reads "Example bed — 4 × 4 ft, illustrative only", so the picture isn't read as a planting recommendation.
5. **Footer:** `<footer>` with the wordmark and the line "A square-foot vegetable garden planner." No year (it would make the output time-dependent), no external links.

**All copy above is original.** Nothing is taken from planter.garden.

**Alternatives rejected:**
- *Split the page into colocated components* (`Hero`, `FeatureGrid`, `SampleBed`): there's only one consumer, so `AGENTS.md` rule 4 ("colocated until a second consumer appears") doesn't call for it. A single file is enough.
- *Render the bed with `@plant-ai/ui` or core grid math:* this is a decorative static picture. Pulling in core logic would make a public static page depend on the domain layer for no benefit.

## 📝 Architecture

- Only `packages/app/src/app/(frontend)/page.tsx` and its tests change. No new route, package, dependency, token or API.
- The page stays a static Server Component: no `connection()`, no `@plant-ai/core` import, no data fetching. It therefore renders and pre-renders at build time without a database.
- `(frontend)/layout.tsx` (metadata, Geist font) and `frontend.css` stay unchanged. The existing `leaf-*` / `soil-*` tokens (plus Tailwind's default palette for the soil-coloured bed frame) are enough.
- The sample bed **makes no companion or conflict claims**. `AGENTS.md` says "Never hard-code crop relationships in the UI", so the cells show only crop and count.

## 📝 UI/UX

- **Mobile-first:** base styles target ~375 px with `px-6`. No fixed widths, and no horizontal scrolling at 320–375 px. Breakpoints `sm`/`md`/`lg` only add columns.
- **Hierarchy:** one `<h1>` (hero), then a visually hidden `<h2>Features</h2>` for screen readers, with the feature titles as `<h3>` under it.
- **CTA:** a pill-shaped link (`rounded-full bg-leaf-700 px-6 py-3 text-white hover:bg-leaf-900`; white on `leaf-600` is only 4.0 : 1, on `leaf-700` 6.2 : 1) with a visible `focus-visible` ring, a ≥ 44 px touch target and a contrast ratio of at least 4.5 : 1 against its background.
- **Contrast and touch targets:** ratios and the 44 px target aren't checked by unit tests. They are verified at 320–375 px during UI QA (`om-auto-qa-pr` screenshots).
- **Prototype:** `.ai/specs/assets/landing-page/mockup-01-landing.html`. Renders: `mockup-01-landing.png` (desktop) and `mockup-02-landing-mobile.png` (375 px). The current page is in `current-01-landing.png` / `current-02-landing-mobile.png` in the same folder.

## 📝 Edge Cases & Failure Scenarios

- **No database:** the page touches none, so it renders the same whether or not the DB is up. The proof is the build: `next build` must list `/` as a static (○) route. That is a manual check of the build output in step 3. The unit test alone doesn't prove DB independence.
- **`/register` missing:** clicking the CTA shows Next's 404 page until auth ships (Q2). It's not a build error.
- **Very narrow screens (320 px):** cards stack in one column, and the bed grid shrinks with its container (`max-w-xs w-full`).

## 📝 Risks & Impact Review

- **No contract in `BACKWARD_COMPATIBILITY.md` is touched.** The home page isn't a listed surface.
- **Test churn:** `page.test.tsx` and `tests/integration/home.test.ts` assert the old heading and card titles, so both must change in the same PR. The integration test can't run in this sandbox (no Docker; see `.ai/lessons.md`), so CI's `integration` job is the proof.
- **Rollback:** reverting the single commit restores the old page.

## 📋 Phasing

One phase, shipped as one PR: the static page rewrite plus its tests.

## 📋 Implementation Plan

### Phase 1: Landing page

1. **Rewrite `packages/app/src/app/(frontend)/page.tsx`** as specified in Proposed Solution:
   - `HomePage` stays the default export.
   - Named constants: `features` (four entries) and `sampleBed` (16 cells `{ emoji, crop, perSquare }`).
   - Update `page.test.tsx` (rendered with `renderToStaticMarkup`) to assert:
     - the new `<h1>` text;
     - an `<a href="/register">` containing "Plan your garden";
     - all four feature titles;
     - the sample bed's `role="img"` + `aria-label`;
     - a `<footer>`;
     - the visually hidden `<h2>Features</h2>`;
     - the `/admin` link.
   - Coverage stays 100 %.
   - **Verify:** `npm test`, `npm run typecheck`, `npm run lint`.
2. **Update `tests/integration/home.test.ts`:**
   - "renders the public landing page": `headingText(<new h1>)`, the four feature titles in `main`, the footer text via `text("footer")`.
   - Add a test: `clickRole("link", "Plan your garden")` → `waitForPath("/register")` → `pathname()` is `/register` (this proves the CTA is visible, clickable and points to `/register`; it doesn't prove the destination works, which is expected to 404 until auth ships, see Q2).
   - Keep "navigates to the admin panel" unchanged.
   - Update scenario 1 in `.ai/specs/implemented/2026-10-13-ci-and-testing.md` only if its wording becomes wrong. (It says "hero heading, feature cards, Admin link", which still holds.)
   - **Verify:** `npm run build`, then CI `integration`.
3. **Full gate:** `npm run typecheck && npm run lint && npm test && npm run build && npm audit --omit=dev`. Check that `/` builds as a static (○) route in the `next build` output, and that `/api/health` still responds.
