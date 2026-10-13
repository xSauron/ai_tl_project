# Lessons Learned

Long-term memory for AI agents working in this repository. Read this file before starting a task; append to it after fixing a bug, finishing a run, or discovering anything worth remembering.

## How to use

- Add one entry per lesson, newest first, in the format below.
- Keep entries short (a few lines). If a lesson needs more detail, put it in `.ai/lessons/YYYY-MM-DD-slug.md` and link it from the entry.
- Do not duplicate: update an existing entry instead of adding a near-copy.
- Remove or correct entries that turn out to be wrong.

## Entry format

```md
### YYYY-MM-DD — Short title
- **Context:** what was being done / what went wrong
- **Lesson:** the finding, root cause, or improvement
- **Action:** what to do (or avoid) next time
- **Details:** (optional) [lessons/YYYY-MM-DD-slug.md](lessons/YYYY-MM-DD-slug.md)
```

## Entries

### 2026-10-13 — Integration tests must boot the production build, not `next dev`
- **Context:** Integration tests (Testcontainers Postgres + `agent-browser`) need a stable app instance to point the browser at.
- **Lesson:** `next start` requires `npm run build` first; `tests/integration/support/app-server.ts` fails fast with a clear error if `.next/BUILD_ID` is missing, instead of falling back to `next dev` (which would test a different code path than what ships).
- **Action:** CI's `integration` job always runs `npm run build` before `npm run test:integration`. Do the same locally before running the integration suite.

### 2026-10-13 — No Docker in this sandbox
- **Context:** `docker info` fails here, so the Testcontainers-backed integration suite can't be exercised locally in this environment.
- **Lesson:** Unit tests, typecheck, lint and build all run without Docker and were verified locally (100 % coverage, all green). The integration suite is CI-only in this sandbox; it still needs a real pass in CI (or on a machine with Docker, or via `INTEGRATION_DATABASE_ADMIN_URL` against an existing Postgres) before trusting it beyond static review.
- **Action:** When adding integration tests in this sandbox, review them carefully (support code, selectors, expected copy) since they can't be run here — then confirm green once CI runs.

### 2026-10-13 — Next 16: `export const dynamic = "force-dynamic"` is legacy
- **Context:** The engineering standards required DB access only in `force-dynamic` routes/pages.
- **Lesson:** Next 16 docs list `dynamic` (with `revalidate` and `fetchCache`) as previous-model options, removed when Cache Components is enabled.
- **Action:** Use `await connection()` from `next/server` for request-time DB/AI access. Check `node_modules/next/dist/docs/` before encoding a Next API in project rules.

### 2026-10-13 — Don't share the MikroORM instance across Next.js layers
- **Context:** ORM cached on `globalThis`; `Metadata for entity h not found` depending on which route was hit first.
- **Lesson:** Server Components, Route Handlers and Server Actions are separate module layers with separate entity classes; MikroORM 7 matches entities by class reference. `serverExternalPackages` does not externalize workspace packages under Turbopack.
- **Action:** Keep `getOrm()`/`getContainer()` module-level. Test new DB code paths from a fresh server in more than one layer.
- **Details:** [lessons/2026-10-13-mikroorm-next-layers.md](lessons/2026-10-13-mikroorm-next-layers.md)

### 2026-10-13 — MikroORM 7 connects lazily
- **Context:** `/api/health` reported `Connection not established` on a healthy DB.
- **Lesson:** `orm.checkConnection()` returns `ok: false` until the first query runs.
- **Action:** Health checks run `select 1` via a forked EM.

### 2026-10-13 — Root `.env` in a monorepo: `@next/env` is cached
- **Context:** `loadEnvConfig(repoRoot)` from `next.config.ts` silently did nothing under `next start`.
- **Lesson:** `@next/env` caches the first load (Next already loaded the app dir), so a second call is a no-op.
- **Action:** Load the root `.env.local`/`.env` with Node's `process.loadEnvFile` in `next.config.ts` and in `mikro-orm.config.ts`.

### 2026-10-13 — Sandbox exports `NODE_ENV=development`
- **Context:** `next build` failed prerendering `/_global-error` with `Cannot read properties of null (reading 'useContext')`.
- **Lesson:** A non-standard `NODE_ENV` during `next build` causes this. It's an environment problem, not a code one.
- **Action:** Run builds with `env -u NODE_ENV npm run build` in this sandbox; never set `NODE_ENV` in scripts.

### 2026-10-13 — shadcn CLI emits `import { cn } from "cn"`
- **Context:** `shadcn add` (v4) wrote `cn` imports from the `cn` npm package and installed it.
- **Lesson:** `cn` is shadcn's official replacement for `clsx` + `tailwind-merge`, not a typo-squat.
- **Action:** Keep `cn`; `@plant-ai/ui/lib/utils` re-exports it.
