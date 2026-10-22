# Run: design system — minimal finish (Stage 2 cut down, one example screen, working page)

- **Date:** 2026-10-21
- **Goal:** owner asked to continue the Storybook design system with a minimal approach (spend fewer tokens, MVP over design strategy) and have a working page at the end.
- **Related:** `packages/ui/POSTEP.md` (Stage 0–1 done), no separate spec (design-system task context lives in POSTEP.md).
- **Branch:** `feat/design-system-minimal` from `main`.

## Plan
1. Fix the 7 token-checker findings in base shadcn components (`text-white`, `ring-[3px]`, `translate-y-[2px]`).
2. One `.stories.tsx` per base component (7), colocated.
3. One example screen story composed only of base components (replaces Stages 3–4).
4. Build the static Storybook into `packages/app/public/design-system` and verify it serves from the app.
5. Update POSTEP.md: Stages 3–5 collapsed, list what was cut.

## Steps / results
- Fixed the 7 token findings (new `--destructive-foreground`, `ring-3`, `translate-y-0.5`).
- Added 7 component stories + `examples/GardenList.stories.tsx`; stories excluded from coverage (test fixtures).
- Coverage dropped to 94 % branches: Vite CJS interop for `import * as React` in the browser project. Fixed with `import type`.
- Browser check showed **Storybook never had Tailwind** (unstyled since Stage 1). Wired `@tailwindcss/postcss` via `viteFinal` + `.storybook/storybook.css`.
- Applied the approved 44 px touch target (`--spacing-touch`) to Button and Input.
- ESLint in `app` now ignores `public/design-system/**`.
- Gate: test 100 % (146), typecheck, lint, token check, design-system:test ×2 themes (14), design-system:build, next build, audit 0 — all green. Browser-verified on `next start`.

## Open issues
- ~~Button `xs`/`sm`/`icon-xs`/`icon-sm` below 44 px~~ — owner said remove; removed.
- Teaching/epic pages and product components dropped for MVP (see POSTEP.md).
- Shipped as PR #41.
