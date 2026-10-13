# Spec: CI pipeline, unit tests (100 % coverage) and browser integration tests

- **Status:** implemented
- **Date:** 2026-10-13
- **Run log:** [.ai/runs/2026-10-13-ci-and-testing.md](../runs/2026-10-13-ci-and-testing.md)

## Goal

Every pull request runs **lint**, **build**, **unit tests** and **integration tests** on GitHub Actions. Unit coverage is enforced at 100 %. Integration tests boot the real app against an ephemeral PostgreSQL and drive it with **agent-browser**.

## Decisions

| Concern | Choice | Why |
| --- | --- | --- |
| Unit framework | **Vitest 5** + `@vitest/coverage-v8` | TS/ESM-native, works with the source-only workspace packages; one root config with `projects` per package. |
| Coverage gate | 100 % statements/branches/functions/lines over `packages/*/src/**` + `packages/app/next.config.ts` | User requirement. Exclusions listed explicitly in `vitest.config.ts` with a reason each. |
| Unit test location | Colocated `*.test.ts(x)` next to the source | Easy to spot missing tests; per-package environment (`node` for core/app, `jsdom` for ui). |
| Integration runner | Vitest (`vitest.integration.config.ts`), tests in `tests/integration/` | Same tooling. `globalSetup` owns the DB + server lifecycle. |
| Ephemeral DB | `@testcontainers/postgresql` (`postgres:17-alpine`) | Matches `docker-compose.yml`. Fallback: `INTEGRATION_DATABASE_ADMIN_URL` → a fresh throwaway database on an existing server (for machines without Docker). |
| App under test | Production build (`next start`) on a free port, migrations applied with the real MikroORM CLI | Tests what ships. |
| Browser | `agent-browser` (npm devDependency, Chrome for Testing via `agent-browser install`) | User requirement. Wrapped in `tests/integration/support/browser.ts` (execFile, no shell, unique session per file). |
| CI | `.github/workflows/ci.yml`: jobs `lint` (lint + typecheck), `unit`, `build`, `integration`; on `pull_request` + push to `main` | Separate status checks per concern. Artifacts: coverage report, integration screenshots on failure. |

## Integration scenarios (basics)

1. Home page: title, hero heading, feature cards, Admin link navigates to `/admin`.
2. Admin panel: dashboard renders, navigation to Gardens, empty state on a fresh DB, creating a garden via the form shows it in the table and persists across reload.
3. `/api/health` reports `ok` against the container DB.

## Out of scope

Branch protection settings (configured in GitHub UI), `npm audit` gate, ESLint for non-app packages (tracked in AGENTS.md migration table).
