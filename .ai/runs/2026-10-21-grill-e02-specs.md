# 2026-10-21 — Grill E02 (#19) and its specs

- **Goal:** stress-test epic #19 and its specs (`2026-10-20-task-list.md`, `2026-10-20-catalogue.md`, `2026-10-20-garden-grid.md` Phase 1, `2026-10-20-app-primitives.md`) with the owner via `/grill-me`, then write the decisions into the specs.
- **Related specs:** the four above; stories #24–#27.

## Steps
1. Read #19, #23–#27 acceptance criteria, the four specs, the brief's decision rows and D14.
2. Interview in four rounds (Q1–Q24). The owner accepted every recommendation: Q1 ("Rekomendacje sa okej", mapping 1a+1b stated back), Q2 ("Tak o to mi chodzilo zeby to grupowac"), Q3–Q12 ("Tak na wszystko", after each was listed with its recommendation), Q13–Q20 ("Tak"), Q21–Q24 ("Tak"). Applied after "Wprowadzaj".
3. Rewrote `2026-10-20-task-list.md` (G1–G24 table, data model, derivation rules, API, a fourth phase for done status); updated `catalogue` (timing table, source columns, signed-in only, seed minimum), `garden-grid` (Phase 1 gate without D05, `crop_id` `ON DELETE RESTRICT`), `AGENTS.md` and the standards doc (operation types, `MM-DD`, `APP_TIME_ZONE`, public catalog Later).
4. Updated acceptance criteria on #24, #26, #27.

## Key decisions
See the "Owner grilling, 2026-10-21" table in `2026-10-20-task-list.md`. Derived consequence (agent, not asked separately): with `MM-DD` frost days the old "spring before autumn" validation is dropped, since it would reject Southern Hemisphere gardens that the spec already claims to support.

## Results
Specs, `AGENTS.md`, standards doc changed on branch `docs/e02-grill-decisions`; PR opened. No product code.

## Open issues
- The owner supplies the sourced voivodeship frost table (G9) and the seed windows (G10, #34).
- The brief needs no change: D14 delegates "does an operation clear a task" to the task-list spec, and Q07 was already answered.
