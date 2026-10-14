# Run: fix #6 — `npm audit --omit=dev` fails on `braces` via awilix

- **Goal:** make the `npm audit --omit=dev` gate pass on `main` (issue #6), which blocks #5 and every other PR.
- **Spec:** none (dependency fix, small surface).
- **Skill:** `om-auto-fix-issue 6` (bug route).

## Steps
1. Triage: real and unfixed. `braces` advisory GHSA-vfj7-8cjw-p6xm covers `<=3.0.3` = every published version; `micromatch` 4.0.8, `fast-glob` 3.3.3 and `awilix` 13.0.5 are all latest. The issue's suggested fix (override to a patched `braces`, or bump `awilix`) is impossible.
2. Asked the user to choose between a fast-glob stub, an audit allow-list, replacing awilix, or waiting. Chosen: stub fast-glob.
3. Added `tools/fast-glob-disabled` (CJS, default export + `.sync` throw) and root `overrides: { awilix: { "fast-glob": "file:../../tools/fast-glob-disabled" } }`.
4. Regression test in `packages/core/src/di/container.test.ts`: `listModules`/`loadModules` throw. Verified it fails with the real fast-glob.

## Key decisions
- Override scoped to `awilix` so dev-only consumers (shadcn CLI, eslint-config-next) keep the real fast-glob.
- The override path is `../../tools/...` because npm 11 resolves nested `file:` overrides relative to the dependent package (`node_modules/awilix`), not the root. `npm ls` reports the entry as "invalid" for the same reason; `npm ci`, `npm audit` and runtime resolution are correct.

## Results
- `npm audit --omit=dev`: 0 vulnerabilities. Clean `npm ci` reproduces the tree without changing the lockfile.
- Full gate: see PR.

## Open issues
- Remove the override once `braces` publishes a fix for GHSA-vfj7-8cjw-p6xm.
