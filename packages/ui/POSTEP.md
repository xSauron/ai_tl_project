# Plant.AI design system — progress log

Read this file first in a new session and continue from "Next step". Stages run 0 → 5; stop after each one and wait for the owner's "dalej" before continuing.

## How to resume (new session / new chat)

Everything below is **committed** on `main` (local commit `84a51da`, not pushed anywhere). To continue in a fresh session:

1. Open this repo and paste: *"Przeczytaj packages/ui/POSTEP.md i kontynuuj budowę design systemu od Etapu 2."* (or just "dalej" if the original task instructions are still in context).
2. The agent should read this file, `AGENTS.md`'s design-system task context isn't needed again — this file plus `lekcja-06/tokeny.md` and `lekcja-06/referencje.md` have every decision made so far.
3. Nothing is half-written mid-stage: Stage 0 and Stage 1 are both finished and committed, so Stage 2 starts clean (no uncommitted state to recover).
4. Quick sanity check before continuing: `npm test` (expect 100% coverage, ~132 tests) and `node scripts/check-design-tokens-cli.mjs` (expect exactly 7 pre-existing findings in `badge.tsx`/`button.tsx`/`input.tsx`/`table.tsx` — that's Stage 2's job to fix, not a regression).

## Stages

- [x] Stage 0 — Inventory and plan
- [x] Stage 1 — Foundations (in review)
- [x] Stage 2 — Base components (minimal pass, 2026-10-21)
- [x] Stage 3 — cut to one example screen (minimal pass)
- [ ] Stage 4 — Teaching pages: **dropped for MVP** (owner, 2026-10-21: "more minimal approach, less money on design strategy")
- [x] Stage 5 — Verification (browser-checked, see below)

## Stage 0 — what was read

- `AGENTS.md`, `.ai/docs/engineering-standards.md` (domain concepts, migration status).
- `.ai/specs/product-brief.md` (decisions D01–D15, rules R01–R09, N01–N03, open questions Q1–Q16).
- `.ai/specs/backlog.md` (epics E01–E05, stories, issue ids).
- `.ai/specs/2026-10-20-app-primitives.md` (spec A: server/client primitive layer, auth, owned gardens — the component contracts most of Primitives comes from).
- `.ai/specs/2026-10-20-garden-grid.md` (spec B: beds, placement, companion conflicts, `CellGrid`/`BedGrid`).
- `.ai/specs/2026-10-20-catalogue.md` (crops, read-only catalogue).
- `.ai/specs/2026-10-20-task-list.md` (frost dates, derived tasks, operations).
- `.ai/specs/2026-10-20-garden-sharing.md` — **skeleton, gated, conflicts with active N03/D11/AGENTS.md scope. Not used as source for this design system.**
- `.ai/specs/2026-10-14-landing-page.md` and the current `packages/app/src/app/(frontend)/page.tsx` (already matches the spec — this is where the Stage 1 step 7 link lands).
- `lekcja-06/referencje.md` (reference decisions, status-filtered: only R01.1, R02.1, R02.2, R02.3 are "przyjęte").
- `lekcja-06/ekran-bez-ds.html` (ad-hoc screen, no design system — source of concrete phase-badge colors used in the earlier tokens draft).
- `lekcja-06/tokeny.md` — **does not exist on disk.** The previous session produced a draft proposal in chat (raw/semantic/component token table for R01.1 + R02.2, a contrast fix for the prune phase, and a list of unapproved proposals) but it was never approved or written. This blocks Stage 1 step 2 until resolved (see Open questions).
- Repo inspection: npm workspaces, Node ≥22.18, Next 16.4.0, React 19.2.8, Tailwind v4 in `app` and `ui`. `@plant-ai/*` scope (not yet renamed to `@plantai/*`, per the AGENTS.md migration table). `packages/ui` already has shadcn `components.json` (style `new-york`, base color `neutral`, icon library `lucide`), `class-variance-authority`, `cn`, `lucide-react`, `radix-ui`, and seven unmodified default shadcn components (`badge`, `button`, `card`, `input`, `label`, `separator`, `table`), each with a colocated `.test.tsx`. No Storybook anywhere in the repo. `vitest.config.ts` enforces 100 % coverage over `packages/*/src/**` — anything added under `packages/ui/src/**` (including `.stories.tsx` if colocated there) counts toward that gate.
- Only `Garden` entity and admin CRUD exist in the app today; no auth, catalogue, grid, calendar or AI yet. The design system therefore documents the *target* components the specs already describe, not screenshots of a built product.

## Decisions approved by the owner (2026-10-20)

- **Tokens file:** approve the previous chat draft as-is (raw/semantic/component layers for R01.1 and R02.2, with the prune-phase contrast fix `#e65100` → `#bf360c`). Write it to `lekcja-06/tokeny.md` before Stage 1 step 2, then carry it into code.
- **Dark theme:** in scope. Foundations and tokens define both light and dark from Stage 1 onward; contrast is checked in both.
- **Density/spacing:** the referencje.md Konflikty #1 resolution is approved as the basis for the spacing scale — bed screen dense (grid + info pinned to the cell), calendar and lists sparse (one label, details on tap); R01 wins when in doubt.
- **Touch target / contrast threshold:** 44 px minimum touch target for every base control (not just grid cells). Contrast stays at WCAG AA (4.5 : 1 text, 3 : 1 UI elements) — no higher threshold for sun readability.
- **Character words:** both the character words (czytelny, spokojny, praktyczny, konkretny) and the anti-character words (sklepowy, nachalny, generyczny-AI, drobny i zagęszczony) are approved for use in Start here / Content / What to avoid, sourced to `lekcja-06/referencje.md`.
- **Scope — Later excluded now:** AI layout-proposal preview, journal with photos, and garden sharing are confirmed **out of scope** for this design system pass (D08/D09 Later; `garden-sharing.md` gated/blocked). They go on "What is missing" as Later, with no components, patterns or epic pages built for them. Epic pages cover only E02, E03, E04.
- **Homepage link (Stage 1 step 7):** "Design system" link lives in the footer of `packages/app/src/app/(frontend)/page.tsx`, next to the existing wordmark, always visible (no dev-mode gate).

## Open questions

None blocking Stage 1. Technical risk to watch in Stage 1: `@storybook/addon-vitest` normally runs stories through a real browser (Playwright) — need to confirm the sandbox can install browser binaries, or fall back to jsdom and document the limitation.

## Stage 1 — what was built

- Storybook 10.6.x installed in `packages/ui/.storybook` (`@storybook/react-vite`). Removed `@chromatic-com/storybook` and `@storybook/addon-mcp` (auto-added by `storybook init`, not in the plan) and the generated `src/stories/` demo content. `a11y.test: 'error'` in `preview.tsx`. Stories run as real Vitest tests via `@storybook/addon-vitest` — wired as the `storybook` project in the root `vitest.config.ts` (headless Chromium via Playwright). `remark-gfm` wired into `addon-docs` for Markdown tables in MDX (rule 8), verified in a built Storybook. Branding (`manager.tsx`): only "Plant.AI" shown, What's-new/telemetry disabled, back-to-app toolbar link. Toolchain provenance recorded in `.storybook/TECHNICAL-NOTE.md`, not in the UI (rule 10). Geist self-hosted for Storybook too (`.storybook/fonts.css` + vendored woff2, OFL license kept) — the app's own `next/font` loading is untouched.
- `lekcja-06/tokeny.md` written from the approved draft, plus dark-theme rows (dark theme was approved after that draft).
- Token layers in `packages/ui/src/styles/tokens/`: `raw.css` + `semantic.css` (R02.2 calendar-phase colors, light + dark, contrast re-measured; R01.1 grid-cell radius), `spacing.css` (4-relation scale, flagged as this file's own mapping of the approved density decision), `typography.css` (Geist roles, flagged as an unapproved-material proposal apart from the font family itself). Wired into Tailwind via `globals.css`'s existing `@theme inline` pattern.
- Theme switch: `.storybook/preview.tsx` toggles `.dark` on `document.documentElement` (rule 9), with a toolbar control and an env-var hook (`VITE_STORYBOOK_THEME`) so `npm run design-system:test` runs every story in both themes.
- `scripts/check-design-tokens.mjs` (+ `-cli.mjs` wrapper, excluded from coverage like `setup-cli.mjs`): flags color literals, Tailwind palette classes and arbitrary values outside the token layer. Run via `npm run design-system:check-tokens`. **Current real findings (expected — Stage 2's job):** `text-white` and `ring-[3px]`/`translate-y-[2px]` arbitrary values in the untouched shadcn `badge`/`button`/`input`/`table` components.
- Foundations pages (`packages/ui/src/foundations/*.mdx`, 7 pages: Color, Typography, Spacing & layout, Shape & depth, Motion, Icons, Themes), each rendering live token values via doc-only helpers in `.storybook/docs-blocks/` (not exported from the package — rule 5). Every page marks what's grounded vs. this session's own proposal.
- Root scripts added: `design-system:build` (static build → `packages/app/public/design-system`, gitignored), `design-system:test` (both themes), `design-system:check-tokens`.
- Home page footer link "Design system →" → `/design-system/index.html`, always visible (approved in Stage 0). Fallback page at `(frontend)/design-system/page.tsx` explains the build command when the static export doesn't exist yet (only reachable then — Next serves the real static file once built). Back-link to `/` lives in the Storybook toolbar (manager.tsx).
- Full gate re-run: `npm test` 100% coverage (132 tests), `npm run typecheck -w @plant-ai/app` clean, `npx storybook build` succeeds.

## Not done in this pass (scope cut short on request)

- Did not drive a real browser against the built Storybook to eyeball rendering (MDX tables, fonts, both themes) — relied on `storybook build` succeeding, the Vitest/Storybook integration picking up all 7 MDX pages, and the coverage/typecheck gate. Worth a manual spot-check before Stage 2.
- Did not verify `npm run design-system:build` end-to-end (output path, that `/design-system/index.html` actually serves from `next dev`/`next build`) — only unit-level pieces (the fallback page, the footer link's href) are tested.

## Minimal pass (2026-10-21) — what was built

Owner asked to finish with a minimal approach and a working page. Run log: `.ai/runs/2026-10-21-design-system-minimal.md`.

- **Token findings fixed (7 → 0):** `text-white` → new `--destructive-foreground` token (light + dark in `globals.css`); `ring-[3px]` → `ring-3`; `translate-y-[2px]` → `translate-y-0.5`.
- **44 px touch target applied:** new `--spacing-touch` in `spacing.css` (`h-touch`/`size-touch`), used by Button `default`/`lg`/`icon`/`icon-lg` and Input. Button `xs`/`sm`/`icon-xs`/`icon-sm` (below 44 px) removed on the owner's call (2026-10-21).
- **Stories:** one `*.stories.tsx` per base component (7, `autodocs`), plus `src/examples/GardenList.stories.tsx`, a "Moje ogrody" screen built only from base components. 14 stories, a11y-checked in both themes. Stories are excluded from coverage in `vitest.config.ts` (they are test fixtures run by the `storybook` project).
- **Bug found and fixed: Tailwind was never processed in Storybook.** Every story and doc page rendered unstyled since Stage 1, and a11y passed only because there was nothing to check. Fix: `.storybook/storybook.css` (`@import "tailwindcss"` + `globals.css` + `@source "../src"`) and `viteFinal` in `main.ts` adding `@tailwindcss/postcss` (now a devDependency of `@plant-ai/ui`).
- **Coverage fix:** components imported `* as React` at runtime only for types; in the browser project Vite's CJS-interop wrapper added an uncovered branch on line 1. Now `import type * as React`.
- ESLint (`packages/app`) ignores `public/design-system/**` (the build output).
- **Verified:** `npm test` (146 tests, 100 %), typecheck, lint, token check, `design-system:test` (light + dark), `design-system:build`, `next build`, `npm audit --omit=dev` 0 vulns. In a browser on `next start`: homepage footer link → `/design-system/index.html`, Foundations pages, the example screen and dark-theme components all render styled.

## Not done (cut for MVP)

- Teaching pages (Start here / Content / What to avoid), epic pages, product components (`BedGrid`, `CellGrid`, phase badges). Build them with the features that need them, not ahead.
- Neutral palette stays shadcn's default (flagged in Color.mdx, owner's call).

## Next step

None scheduled. New components get a story when they are built with their feature. Run `npm run design-system:build` **before** `npm start`: `next start` snapshots `public/` at boot, so a rebuild while it runs gives 404s on the new asset hashes.
