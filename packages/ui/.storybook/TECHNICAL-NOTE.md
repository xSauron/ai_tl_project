# Technical note (not shown in the Storybook UI)

Rule 10 of the design-system brief: the Storybook interface shows only the product name ("Plant.AI"), set via `manager.tsx`'s `brandTitle`. This file is where the underlying toolchain is recorded instead.

- **Storybook** 10.6.x, framework `@storybook/react-vite` (Vite builder — `packages/ui` doesn't import Next, so the lighter Vite builder is enough).
- **Base component library:** shadcn/ui (`new-york` style, `neutral` base color, `lucide` icons — see `components.json`) on **Radix primitives** (`radix-ui` package). Every primitive in `Primitives/` starts from a shadcn/Radix component and is adapted to Plant.AI's tokens and decisions (Stage 2); none are shipped as shadcn's defaults look.
- **Addons:** `@storybook/addon-docs` (MDX, with `remark-gfm` for Markdown tables — rule 8), `@storybook/addon-a11y` (`a11y.test: 'error'` in `preview.tsx` — violations fail the Vitest run), `@storybook/addon-vitest` (stories execute as Vitest tests through a headless Chromium via Playwright, wired as the `storybook` project in the repo-root `vitest.config.ts`).
- Chromatic (`@chromatic-com/storybook`) and the MCP addon (`@storybook/addon-mcp`) were added automatically by `storybook init` and removed: neither is part of the approved plan (no Chromatic account, no MCP server for this project).
- The Storybook "What's new" notifications and onboarding checklist are disabled (`core.disableWhatsNewNotifications` in `main.ts`; the generated `src/stories/` demo content was deleted rather than kept).
