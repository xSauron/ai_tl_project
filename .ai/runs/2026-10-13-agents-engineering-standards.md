# Run: Adopt Plant.AI engineering standards into AGENTS.md

- **Date:** 2026-10-13
- **Goal:** Update `AGENTS.md` according to the user-provided "Plant.AI — Engineering Standards & Package Structure" (2026-10-13).
- **Related doc:** [.ai/docs/engineering-standards.md](../docs/engineering-standards.md)

## Steps
- [x] Stored the full standards verbatim as `.ai/docs/engineering-standards.md`, with a "Repo adaptations" note at the top. Added `docs/` to the `.ai/` structure in AGENTS.md, because the standards reference that path.
- [x] Rewrote the "Plant.AI — Project Rules" section of AGENTS.md: scope, stack, target layout (`app → core → db`, `ui`), the §3 sections (domain concept convention, invariants, integrations & AI, reusable API/UI layer), naming, persistence/DI, security minimums, code quality, tests, scaffolding steps, blocker checklist, commands/gate, and a migration-status table.
- [x] Kept the Next.js managed block, the `.ai/` workflow and the Working Principles.

## Key decisions
- **`force-dynamic` → `await connection()`:** Next 16 docs list `dynamic` as a legacy segment option that is removed under Cache Components. Recorded as a repo adaptation in the standards doc.
- **Documentation only, no code moves:** the standards' §5 requires one buildable step at a time. AGENTS.md has a *Migration status* table so agents know the current code vs target per area.
- Kept the existing lesson-backed rules: no `globalThis` ORM cache, lazy MikroORM connections, root `.env`, `NODE_ENV`.
- Validation gate extended with `npm test` and `npm audit --omit=dev` per the standards. `npm test` doesn't exist yet (see the migration table).

## Results
`AGENTS.md` updated; standards stored under `.ai/docs/`.

## Open issues
- §0 product scope is marked "draft — to be confirmed".
- Code migration (§5 steps 1–11) not started. Step 1: scope rename `@plant-ai` → `@plantai` + `packages/db`.
- README still describes the bootstrap layout (`@plant-ai/*`, `(frontend)`/`(admin)`); update alongside the code migration.
