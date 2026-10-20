# Plant catalogue and garden plant list

Status: skeleton — blocked on Open Questions. Serves E02-S03 (#25) of epic E02 (#19).

## 📝 TLDR
The owner (who grows vegetables, berry bushes and fruit trees) can today do nothing in the app: there is no catalogue and no plant list. **Proposed (future):** a read-only, owner-curated catalogue where every fact carries a source (D04, R03), and a per-garden plant list the owner builds by adding catalogue entries, with no bed and no cells (D10, R07).

## ⚠️ Open Questions
Shared with `2026-10-20-task-list.md`; answer once, both specs follow.

- **Q1** Issue #19 and its stories cite D07, D10–D14, R07, R09, Q15, Q16 and the specs `2026-10-20-app-primitives.md` and `2026-10-20-garden-grid.md`. None exist in this repo (the brief stops at D04/R05; `.ai/specs/` has only the landing page). Where do they live? (a) an unmerged branch/PR: point me to it; (b) treat the issue text as authoritative and I record them in each spec under "Decisions in play" as "per #19, not yet in the brief".
- **Q2** Catalogue (#25) and task list (#26, #27) are separately deployable. Two specs (catalogue; task list incl. frost dates and operations)? Recommend **yes**; frost dates (#24) go in the task-list spec as its small prerequisite.
- **Q3** How big is the first catalogue seed? (a) only what the owner grows, ≤30 entries; (b) a broad set of ~80 like Planter. Recommend **(a)**: every entry is hand-cited under D04 and the owner checks pruning alone.
- **Q4** `AGENTS.md` still says "vegetable-garden planner" (D02) and defines a planting as a cell rectangle in a bed (conflicts with D10, a planting with no bed). Who changes it, and when? Recommend **the first implementing PR changes both**, as D02 already requires; this spec only states the diff.

## 📝 Problem Statement
With many plants the owner loses track of what to do and when (`[INTERVIEW]` owner, one account, no episode). Tasks cannot be derived until the app knows which plants the owner has and when each is sown, planted out and pruned.

## 📝 Proposed Solution (to be filled after the gate)
Catalogue as versioned seed data (`db/src/seeds/`), Wikidata identity + Trefle spacing/days + owner-written frost offsets, companions and pruning (D04); a read-only browse API/page; a `garden plant list` entity linking garden to crop with no bed reference.
