# Plant catalogue and garden plant list

Serves E02-S03 (#25) of epic E02 (#19). Companion spec: `2026-10-20-task-list.md`.

## 📝 TLDR
The owner grows vegetables, berry bushes and fruit trees, but the app has no catalogue and no plant list today. **Proposed (future):** a read-only catalogue where every fact carries a source (D04, R03), and a per-garden plant list the owner builds by adding catalogue entries, with no bed and no cells (D10, R07).

## Resolved assumptions (autonomous defaults)
| Q | Chosen answer | Rationale |
|---|---|---|
| Q1 Where are D07, D10–D14, R07, R09, Q15, Q16 and the `app-primitives` / `garden-grid` specs? | They are not in this repo; treat the text of #19–#27 as authoritative and cite them as "per #19". ⚠ NEEDS HUMAN CONFIRMATION | Cannot invent their content; the brief must gain these rows before implementation. |
| Q2 Split catalogue / task list? | Two specs. | The catalogue works without tasks and vice versa. |
| Q3 Seed size | Only what the owner grows, at most 30 entries. | Each entry is hand-cited and pruning is checked by the owner alone (D04). Smallest scope. |
| Q4 Who updates `AGENTS.md`? | The first implementing PR, listing the diff in Risks below. | D02 already requires it. |

## 📝 Problem Statement
With many plants the owner loses track of what to do and when (`[INTERVIEW]` owner, one account, no episode; D11). Tasks cannot be derived until the app knows which plants exist and their timing.

## 📝 Proposed Solution
- **Catalogue** = versioned seed data in `packages/db/src/seeds/`, loaded by the seed command; identity from Wikidata (CC0), spacing and days-to-harvest from Trefle (CC-BY-4.0), frost offsets, companions and pruning written and cited by the owner (D04). Users cannot edit it (R03).
- **Plant list** = a garden-owned list of entries referencing a crop, with no bed reference.
- Alternatives rejected: a live Trefle API call at request time (violates "tests never touch the network", licence attribution per call, no pruning data); a user-editable catalogue (R03).

## 📝 Architecture
- Concept `crops` (catalogue) and concept `plantings` (plant list). `PlantingService.addToGarden` verifies garden ownership through `requireSession` + garden assertion, then persists.
- Browse is public-readable within the signed-in app only (no marketing catalogue in this spec).
- Cross-system: the task-list spec reads `crops` timing and the plant list; this spec changes neither's contracts afterwards. Companion data is seeded (`crop_companions`) but consumed only by a later spec.

## 📝 Data Model
- `crops`: `id` uuid, `kind` (`vegetable | bush | tree`), `commonName`, `latinName`, `spacingCm`, `daysToHarvest` nullable, pruning window columns (see task-list spec for the timing shape), `source` text NOT NULL per fact group, `sourceUrl`.
- `crop_companions`: `cropId`, `otherCropId`, `relation`, `source` (seeded now, unused now).
- `plantings`: `id`, `gardenId` (FK, ownership), `cropId` (FK), `bedId` nullable, `row/col/rowSpan/colSpan` nullable together (all null or all set — a DB check), `plantsPerCell` nullable, `version`, timestamps. Grid columns exist so the grid spec adds placement without migrating this table; this spec only ever writes them null.
- One migration plus snapshot. Seed-integrity test: every companion references an existing crop; every fact has a non-empty source.
- No sensitive data.

## 📝 API Contracts
- `GET /api/crops?kind=` → `{ ok, data: Crop[] }` (bounded; ≤30 seeded). `GET /api/crops/:id`.
- `GET /api/gardens/:gardenId/plants` → list; `POST /api/gardens/:gardenId/plants` body `{ cropId: uuid, quantity?: int 1..MAX_PLANTS_PER_ENTRY }` → 201; `DELETE /api/gardens/:gardenId/plants/:id`. Workflow handlers use `apiHandler`; client sends the CSRF header via `apiCall`.
- No catalogue write endpoint exists (404/405).
- Errors: unknown crop → 404; foreign garden → 404; bad body → 422 with `fieldErrors`.

## 📝 UI/UX
Catalogue page: list grouped by kind, each fact with a visible source link; an "Add to garden" action. Plant list page per garden: rows with crop name and kind, remove action; empty state points to the catalogue. Uses `DataTable`, `EmptyState`, `apiCall`. States: loading, empty, error, offline retry. Keyboard reachable; source links have text, not icons only.

## 📝 Edge Cases & Failure Scenarios
- Adding the same crop twice: allowed as separate entries (varieties, locations differ); each is its own planting.
- Crop with a missing pruning timing: listed, but the task list shows no prune task (see task-list spec).
- Seed run twice: idempotent upsert keyed by a stable `slug`; a removed seed row does not delete user plantings (FK restrict, seed fails loudly).
- DB down: pages render the error state; app still boots without a DB.

## 📝 Risks & Impact Review
- `AGENTS.md` conflicts to fix in the first implementing PR: "vegetable-garden planner" (D02) → vegetables, bushes and trees; "a Planting occupies a cell rectangle" → optional until placed (D10); Migration-status table. A hard-to-reverse contract: `plantings` nullable grid columns, chosen so the grid spec needs no destructive migration.
- Wrong pruning entries mislead the owner (accepted risk, D04); mitigated by showing the source on every fact.
- Evidenced rule violation: none. Product direction call: seed size (Q3).

## 📝 Decisions in play
D02, D04, D10 / R07, R03 — and Q1's caveat that D10 and R07 are cited per #19, not yet in the brief. Owner of all: project owner.

## 📋 Phasing
Phase 1 — catalogue seed and read API (ships alone). Phase 2 — plant list. Phase 3 — pages.

## 📋 Implementation Plan
**Phase 1 — Catalogue**
1. Entities `Crop`, `CropCompanion`, registered in `entities/index.ts`; migration + snapshot. Test: migration applies on ephemeral DB (integration).
2. Seed data file with citations + seed-integrity unit test (sources non-empty, companions symmetric where marked, references exist).
3. `CropService.list/get`, validators, `GET /api/crops(/:id)`. Unit tests incl. kind filter and unknown id → 404.
**Phase 2 — Plant list**
4. Entity `Planting` (nullable grid, check constraint) + migration. Test: all-or-none grid check.
5. `PlantingService.addToGarden/remove/list` with ownership through the garden; foreign garden → 404 regression test.
6. Routes under `api/gardens/:gardenId/plants`; validators bounded.
**Phase 3 — Pages**
7. Catalogue page with sources; no edit controls (test asserts none).
8. Plant list page; add/remove through `apiCall`. Integration test: add crop → appears with no bed.
9. `AGENTS.md` + standards doc update per Risks.
All steps keep `typecheck`, `lint`, 100 % coverage and `build` green.
