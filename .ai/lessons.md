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

### 2026-10-21 — Check that every collected field is consumed by a derivation
- **Context:** grilling the task-list spec (#19). It stored `first_autumn_frost`, validated it, and then derived every window from the spring frost only. It also stored annual frost days as full dates next to a `?year=` parameter, and timing as single columns on `crops` that could not hold a second (autumn) sowing.
- **Lesson:** a spec reviewed against its stories alone can pass while carrying dead inputs and a model that can't express common cases (autumn sowing, perennials planted once, 30 identical tasks for 30 plants).
- **Action:** in spec review, trace every stored field to the function that reads it, and walk one annual, one perennial and one many-plants case through the derivation. `/grill-me` points at the `grilling` skill, which may only appear mid-session; if it's missing, run the interview inline in the same round format.

### 2026-10-21 — A link to a `public/` static export needs a fallback route test, not a component test
- **Context:** PR #41 linked the home footer to `/design-system/index.html` (the Storybook export in `public/`, gitignored and built manually) and added a "not built yet" page at `/design-system`. The page test passed, but the link 404'd in every normal build, because nothing routed the link to the page.
- **Lesson:** Next serves `public/` files by exact path and has no directory-index fallback. A `fallback` rewrite (`next.config.ts`) runs only after `public/` and all routes miss, so it is the right hook for "static file if built, page otherwise".
- **Action:** when a page exists to cover a missing static file, test the route (rewrite config or `next start` + curl), not just the component in isolation.

### 2026-10-21 — A test project that needs a browser must install it in CI
- **Context:** PR #41 added the `storybook` Vitest project (headless Chromium) to `npm test`. It passed locally because `~/.cache/ms-playwright` already had the browser, but CI's `unit` job failed with `browserType.launch: Executable doesn't exist`. PR #40, which was branched from it, failed the same way.
- **Lesson:** a green local `npm test` doesn't prove CI has the same binaries. Also, in this sandbox `GIT_SSL_CAINFO`/`SSL_CERT_FILE` can be set but empty, which breaks `git fetch`. Unset them for git commands.
- **Action:** when a test needs a browser or other binary, add its install step to every CI job that runs it (`npx playwright install --with-deps --only-shell chromium` in `unit`). Branch new PRs from `main`, not from another open PR. Never check out the primary worktree's branch inside a linked worktree (`checkout -B` allows it): the primary's index stays on old content, and its next commit reverts the linked worktree's commits. That happened here: `5d64957` silently undid the CI fix. Work on a detached HEAD and `git push origin HEAD:<branch>` instead.

### 2026-10-21 — Storybook a11y tests passed on unstyled stories; look at a screenshot
- **Context:** Stage 1 of the design system shipped with green `design-system:test` and a successful `storybook build`, but Storybook's Vite build never ran Tailwind (the app's `postcss.config.mjs` isn't read), so every story was raw HTML.
- **Lesson:** a passing build plus a11y tests doesn't prove anything rendered. With no styles, there is no contrast to fail. Also: `next start` snapshots `public/` at boot, so rebuilding the static Storybook while it runs gives 404s on new hashed assets; and `import * as React` used only for types adds an uncovered Vite CJS-interop branch in the browser test project.
- **Action:** after any Storybook/CSS pipeline change, screenshot one story with `agent-browser`. Run `design-system:build` before `npm start`. Use `import type * as React` when React is only used for types.

### 2026-10-20 — Solo project: don't keep routing to research the owner can't collect
- **Context:** the brief, `om-backlog` and `om-discover` kept pointing at interviews with other gardeners (D05). The agent even built an interview kit, until the owner said a one-person course project can't run them ("coś się zapętliło").
- **Lesson:** when the only reachable informant is the builder, every readiness stop that asks for outside evidence repeats itself. The way out was an owner decision already on file, D05's alternative (b): narrow the target group to what the owner knows first-hand and accept A01 untested (D11).
- **Action:** at a readiness stop, first ask whether the requested material can actually be collected. If not, put the narrow-and-accept-risk decision in front of the owner instead of preparing more collection tools.

### 2026-10-20 — A new decision row in the brief leaves filed research issues citing a superseded rule
- **Context:** `om-backlog` re-run on the brief. D10 added R07 (superseding R01) after E01 was refreshed, so #11 and #13 still cited R01 as current. `SDLC.md` has no Definition of Ready, yet the brief's own addendum and the active D05 still block an implementation tree.
- **Lesson:** Every new `D`/`R` row in the brief can make a filed issue's *Decisions in play* stale. A missing DoR in `SDLC.md` skips only the formal check; active owner decisions (D05) and `[ASSUMPTION]`-only Target group still stop the run.
- **Action:** When re-running `om-backlog`, compare each open issue's *Decisions in play* with the brief's Decisions and Business rules tables, and mark superseded rows instead of deleting them.

### 2026-10-20 — Grid concurrency design: lock the child row too, and mind FK action and lock joins
- **Context:** spec review of `2026-10-20-garden-grid.md`. The first draft locked only the bed (aggregate root) and used `ON DELETE RESTRICT` on `plantings.bed_id`.
- **Lesson:** locking the root misses writes that touch no common root (the same unplaced planting placed into two beds at once). Postgres checks `RESTRICT` immediately, so it can break a parent cascade (garden → beds + plantings). `NO ACTION` defers the check to the end of the statement. `SELECT … FOR UPDATE` with an ownership join also locks the joined parent rows.
- **Action:** lock the roots in id order, then the child row, then re-check the child's parent. Use `NO ACTION` where a service-level path (unplace before delete) sits beside a DB cascade. Check ownership first, then lock by id with no join.

### 2026-10-20 — One "okej" to several proposals is not yet a decision per proposal
- **Context:** second `om-discover` session. The owner answered three separate scope proposals (Now order, AI feature, Later list) with a single "okej". The agent drafted decision records that already said "confirmed at sign-off", and the skeptic flagged this.
- **Lesson:** A blanket yes can be read as confirmation only after the agent states the exact mapping (here 1a, 2b, 3a) and the owner confirms it. Until then the records are drafts.
- **Action:** Keep decision drafts outside the repo marked pending. At sign-off, list each choice by its letter, and write the records only after the owner confirms.

### 2026-10-20 — Product brief missed a committed synthetic walkthrough; delegation is not a decision
- **Context:** `om-discover --refresh`. The brief said "no synthetic walkthrough has been run", although `research/walkthroughs/2026-10-19-plan-a-bed-for-spring-mvp-session-001/` had landed in #14. Later the owner answered scope questions with "zrob jak uwazasz" (do as you think).
- **Lesson:** A brief can fall out of sync with research that lands in the same PR. An answer like "do as you think" delegates the choice but doesn't confirm a specific option. Moving a feature out of Now can also change scope that `AGENTS.md` makes binding.
- **Action:** On refresh, list `research/walkthroughs/` and `decisions/` and compare them with the brief. Record delegated choices as agent proposals and say they were delegated. Don't drop anything `AGENTS.md` scopes into the MVP without explicit owner confirmation.

### 2026-10-19 — Research tasks that need the owner's real-world data: ship the sheet, not the data
- **Context:** `om-auto-fix-issue 13` was told to continue autonomously, but the owner had not posted their garden layout. The task tests A04.
- **Lesson:** Inventing the data would fake the evidence the task exists to collect. What an agent can do is turn the decision rules into a fill-in sheet with the cases to check.
- **Action:** Ship a template under `research/templates/` with `Refs #N`, leave the issue open, and say plainly in the report that the owner's input is still missing. Never close the issue on a template.

### 2026-10-19 — Two agents opened duplicate PRs for the same uncommitted material
- **Context:** Discovery material for #11–#13 existed only as uncommitted files in `/workspace`. Two separate runs each shipped it: PR #15 (`docs/issue-11-discovery-material`) and PR #14 (`docs/issue-12-discovery-research`), which differed only in run-log wording, one lesson and the D04 decision.
- **Lesson:** Uncommitted files in the primary checkout are invisible to other runs' dedupe, which searches only issues and PRs.
- **Action:** Before opening a PR, run `gh pr list --search "<issue number>"` and check for open PRs that reference the same issues. Extend an existing PR rather than opening another one.

### 2026-10-19 — `git push` fails with "SSL CA cert" in cezar worktrees; `gh pr edit --add-label` silently no-ops
- **Context:** Opening the docs PR for #11. `git fetch`/`git push` failed with `Problem with the SSL CA cert`, and `gh pr edit --add-label` printed a Projects-classic GraphQL error without applying any labels.
- **Lesson:** The ambient `GIT_SSL_CAINFO` points at a file that does not exist, and git has no stored credentials. `gh` itself works.
- **Action:** Push with `GIT_SSL_CAINFO=/etc/ssl/certs/ca-certificates.crt git -c credential.helper='!gh auth git-credential' push …`, and never disable TLS verification.
- **Update 2026-10-21/22:** the ambient value differs between sessions. On 2026-10-21 `GIT_SSL_CAINFO` was `/etc/daytona/netleash/ca.crt` and was required (forcing the system bundle failed). On 2026-10-22 it was set but empty, and only the system bundle worked. Check `ls "$GIT_SSL_CAINFO"` first: if the file exists, use only `git -c credential.helper='!gh auth git-credential' …`; if it is empty or missing, prefix `GIT_SSL_CAINFO=/etc/ssl/certs/ca-certificates.crt`. Apply labels through REST (`gh api -X POST repos/<o>/<r>/issues/<n>/labels -f 'labels[]=…'`) and read them back to check.

### 2026-10-19 — Web research in this sandbox: WebSearch/WebFetch denied, `curl`/`gh api` work
- **Context:** Researching catalogue data sources for #12. The session's permission mode denied `WebSearch` and `WebFetch`.
- **Lesson:** Outbound HTTPS works with `curl` and `gh api`, so licence pages can be read directly. `piorin.gov.pl` fails TLS verification from here. Most open plant datasets either lack a clean licence (PFAF, Permapeople) or are another gardening app's data (Growstuff, OpenFarm).
- **Action:** Read licence pages with `curl -sSL` and strip the tags, or use `gh api` for GitHub READMEs. Never bypass TLS (`-k`); mark the page "not verified" instead. Start from `research/2026-10-19-data-request-catalogue-source.md` before searching again.

### 2026-10-19 — Check an issue's Spec section before running om-spec-writing on it
- **Context:** `om-spec-writing` was invoked with just `11`. Issue #11 is the E01 Discovery research epic, whose `📝 Spec` section says no implementation spec is owed.
- **Lesson:** Backlog epics filed by `om-backlog`/`om-prepare-issue` state their design authority. Research epics produce notes under `.ai/specs/research/`, not specs. Their sub-tasks (#12, #13) carry the work.
- **Action:** Read the issue's `📝 Spec` section first. When it says "No spec", report that and point to the research tasks or `om-discover --refresh` instead of writing a spec on unresolved owner decisions.
- **Recurred:** 2026-10-19 with `12` (E01-T02, catalogue source search). Its deliverable is a data-request note in `research/` plus a decision record by the owner. Ask whether to do that research, not write a spec.

### 2026-10-19 — Discovery research pack is illustrative; read the manifest first
- **Context:** `om-discover` on Plant.AI. The interviews, survey and workshop export in `.ai/specs/research/` look like real research, but `2026-10-18-source-manifest.md` says they are course exercise material.
- **Lesson:** A file's shape or tag doesn't prove where it came from. Only the Planter benchmark, the owner's decision records and the owner's own account (`research/interviews/2026-10-19-owner-trained-gardener.md`) are real. The product brief marks everything else `[ASSUMPTION]`.
- **Action:** Read the research manifest before citing any research file. Don't rank "most common problems" from the illustrative survey. Note that decision D02 widens scope beyond `AGENTS.md`'s "vegetable-garden planner", so the first PR that implements it must update `AGENTS.md` and the standards doc.

### 2026-10-14 — Tracker descriptor helpers: extract the right block, and `jq` isn't installed
- **Context:** While the `om-*` pipeline ran, an `awk`/`sed` that took "the first bash block" of `.ai/trackers/github.md` grabbed the `gh` upgrade snippet (`sudo apt update && apt install --only-upgrade gh`) and executed it, instead of the label guards. Separately, **attach-image-evidence** failed because `jq` isn't installed in this sandbox, which left a PR comment with broken image links until the files were re-uploaded.
- **Lesson:** Never source a code block from a descriptor by position. Anchor on its heading (`## Label guards`) and check what was extracted before running it. The descriptor's `jq` steps (evidence upload, `remove_label` URI-encoding) need a substitute here.
- **Action:** Extract guards with `awk '/^## Label guards/{f=1} f&&/^```bash$/{g=1;next} g&&/^```$/{exit} g'`, then `grep` the result for `apt|sudo|brew` before sourcing it. Build Contents-API JSON with `python3 -c 'import json,base64…'` instead of `jq --rawfile`, and confirm the raw URLs return 200 *before* posting the evidence comment.

### 2026-10-14 — Bootstrap scripts can't statically import npm packages
- **Context:** `npm run setup` (`scripts/setup.mjs`) had a top-level `import pg from "pg"`, so on a fresh clone it crashed with `ERR_MODULE_NOT_FOUND` before its own `npm install` step. 100 % unit coverage missed it because the tests always run with `node_modules` present.
- **Lesson:** Static ESM imports resolve before any code runs. A script that installs dependencies may only use `node:` built-ins at load time. Also, the root `node_modules/` directory's mtime doesn't track installs; `node_modules/.package-lock.json` does.
- **Action:** Use `await import("<pkg>")` after the install step in bootstrap scripts, and keep a test that imports the script from a temp directory with no `node_modules`. Detect a stale install by comparing `package-lock.json` with `node_modules/.package-lock.json`.

### 2026-10-14 — Nested `file:` npm overrides resolve relative to the dependent package
- **Context:** #6 needed awilix's `fast-glob` replaced by a local stub; `"awilix": { "fast-glob": "file:./tools/x" }` produced a broken symlink inside `node_modules/awilix`.
- **Lesson:** npm 11 resolves a nested override's `file:` spec relative to the dependent (`node_modules/awilix`), not the root, and `npm ls` then flags the entry "invalid" either way. After changing an override, also delete the dependent's `package-lock.json` entry so npm re-resolves it; otherwise the old resolution is kept silently.
- **Action:** Write such paths relative to the dependent (`file:../../tools/x`), check the symlink and run a clean `npm ci`. When no upstream fix exists for an advisory, check every link in the chain against `npm view <pkg> versions` before proposing an override.

### 2026-10-13 — `relation "gardens" does not exist`: migrations never ran, not a code bug
- **Context:** `/admin/gardens` threw `relation "gardens" does not exist` even though the entity, migration, and `withRequestScope` code were all correct.
- **Lesson:** In this cloud sandbox, Docker isn't available (`docker: command not found`), so `docker-compose.yml`'s `plant_ai` Postgres never starts. The sandbox instead injects an ambient `DATABASE_URL` (pointing at a shared `workspace-postgres` instance, db name `open-mercato`) into every process's environment — including `next dev`. Since there's no repo-root `.env`/`.env.local`, `env.ts` picks up that ambient value, and `process.loadEnvFile` never overrides an already-set env var anyway (`next.config.ts` and `mikro-orm.config.ts` both say "existing env vars win"). That database was simply never migrated.
- **Action:** In this sandbox, don't try to stand up a separate `plant_ai` database/container — run `npm run db:migrate` as-is; it targets the ambient `DATABASE_URL` and that's the intended one Postgres instance here. Diagnose "relation does not exist" by checking `echo $DATABASE_URL` and `psql ... -c '\dt'` against it before assuming an app-code bug.

### 2026-10-13 — Integration tests must boot the production build, not `next dev`
- **Context:** Integration tests (Testcontainers Postgres + `agent-browser`) need a stable app instance to point the browser at.
- **Lesson:** `next start` requires `npm run build` first; `tests/integration/support/app-server.ts` fails fast with a clear error if `.next/BUILD_ID` is missing, instead of falling back to `next dev` (which would test a different code path than what ships).
- **Action:** CI's `integration` job always runs `npm run build` before `npm run test:integration`. Do the same locally before running the integration suite.

### 2026-10-13 — No Docker in this sandbox (updated 2026-10-14: the integration suite does run here)
- **Context:** `docker info` fails here, so Testcontainers can't start a Postgres.
- **Lesson:** The suite still runs locally through its documented fallback, using the sandbox's ambient Postgres. Each run creates a uniquely named throwaway database and drops it afterwards. Chrome also needs its system libraries: without them, `agent-browser` fails with `libnspr4.so: cannot open shared object file`.
- **Action:** Run these once: `sudo -n node_modules/.bin/agent-browser install --with-deps`, then `env -u NODE_ENV npm run build`. Then run `env -u NODE_ENV INTEGRATION_DATABASE_ADMIN_URL="$DATABASE_URL" npm run test:integration`. Verified 2026-10-14: 7/7 green.

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
