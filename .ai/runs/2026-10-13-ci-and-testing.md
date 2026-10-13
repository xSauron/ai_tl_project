# Run: CI + unit (100 %) + integration (testcontainers + agent-browser)

- **Date:** 2026-10-13
- **Goal:** GitHub Actions CI for every PR (build, lint, unit, integration), Vitest with 100 % coverage over existing code, agent-browser integration tests for home + admin. AGENTS.md: 100 % unit coverage rule.
- **Spec:** [.ai/specs/2026-10-13-ci-and-testing.md](../specs/2026-10-13-ci-and-testing.md)

## Steps
- [x] Environment check: no Docker in sandbox (testcontainers path can only run in CI), `gh` authenticated, remote `xSauron/ai_tl_project` (only `main` pushed — bootstrap work still uncommitted).
- [x] `.github/workflows/ci.yml`: `lint`, `unit`, `build`, `integration` jobs on `pull_request` + push to `main`, each a separate status check.
- [x] Root `vitest.config.ts`: Vitest `projects` for `core` (node), `ui` (jsdom), `app` (node, with the `server-only` stub and `@/` alias) — coverage over `packages/*/src/**` + `next.config.ts`, 100 % thresholds.
- [x] `vitest.integration.config.ts` + `tests/integration/`: `global-setup.ts` boots Testcontainers Postgres (`@testcontainers/postgresql`, fallback `INTEGRATION_DATABASE_ADMIN_URL` for Docker-less machines), runs real migrations, starts `next start` on a free port, waits on `/api/health`; `support/browser.ts` wraps the `agent-browser` CLI (execFile, no shell, one session per file, screenshot on failure).
- [x] Unit tests added for every existing source file (25 test files, 62 tests) — `packages/core` (env, db config, orm, DI container, `Garden` entity, `GardenService`, package index), `packages/ui` (shadcn primitives, `cn` util), `packages/app` (both route groups' layouts/pages, gardens server actions, `/api/health`, request-scope helper, `next.config.ts`).
- [x] Integration tests for the basics: home page (title/hero/features, admin nav link), admin panel (dashboard nav, empty gardens state, create-garden round trip through Postgres), `/api/health` against the real container DB.
- [x] AGENTS.md: explicit 100 % unit coverage rule in `## Tests`, integration suite described, Commands table + validation gate updated with `npm run test:integration`, migration-status "Test runner" row closed.
- [x] Verified locally (no Docker in this sandbox, so `test:integration` itself is CI-only): `npm run typecheck`, `npm run lint`, `npm test` (100 % coverage), `npm run build` all pass.
- [ ] `npm audit --omit=dev` reports 4 high-severity advisories, all transitive through `awilix`'s `fast-glob` → `braces` (pre-existing, unrelated to this change; `npm audit fix --force` would downgrade `awilix` to 6.0.0, a breaking change to a fixed stack component — left for a separate, explicitly-approved upgrade).
- [ ] Not committed yet — bootstrap work (monorepo restructure) and this CI/testing work are both still uncommitted in the working tree; commit is the next action.

## Result

CI, 100 % unit coverage, and the home/admin integration suite are implemented and passing locally everywhere Docker isn't required. Spec moved to `.ai/specs/implemented/`.
