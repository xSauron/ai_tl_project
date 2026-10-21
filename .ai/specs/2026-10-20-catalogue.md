# Plant catalogue

Serves E02-S03 (#25) of epic E02 (#19). Companion spec: `2026-10-20-task-list.md`.

- **Changes:** 2026-10-21 — owner grilling on #19 (`.ai/runs/2026-10-21-grill-e02-specs.md`): timing moves to `crop_timing_windows` (G3), named source columns per fact group (G20), catalogue is signed-in only in MVP and the public catalogue is Later (G11), #26 needs only one cited crop per kind (G10).

## 📝 TLDR
The owner grows vegetables, berry bushes and fruit trees, but the app has no catalogue and no plant list today. **Proposed (future):** a read-only catalogue where every fact carries a source (D04, R03), and the `Crop` data the per-garden plant list builds on. The plant list itself (unplaced `Planting`, no bed, D10, R07) is owned by `2026-10-20-garden-grid.md` Phase 1; this spec supplies the `Crop` entity and read API that phase needs.

## Resolved assumptions (autonomous defaults)
| Q | Chosen answer | Rationale |
|---|---|---|
| Q1 Missing D07, D10–D14, R07, R09, Q16 | Resolved: the owner's uncommitted decision records, brief rows and specs `app-primitives` / `garden-grid` are now committed in this PR, so the ids are real. | Owner confirmed they were simply not committed. |
| Q2 Split catalogue / task list? | Two specs. | The catalogue works without tasks and vice versa. |
| Q3 Seed size | Only what the owner grows, at most 30 entries. | Each entry is hand-cited and pruning is checked by the owner alone (D04). Smallest scope. |
| Q4 Who updates `AGENTS.md`? | Done in PR #38, owner-authorised (D02, D08, D09, R07, `operations`); the 2026-10-21 grilling PR marks the public catalogue Later. | Nothing left for the implementing PR. |
| Q5 Public catalogue in `(marketing)`? | Later; MVP catalogue is for signed-in users only (owner, 2026-10-21, G11). | One persona, smallest scope. |
| Q6 Seed minimum for E02 | At least one vegetable, one bush and one tree with cited timing windows; the rest grows in #34 (owner, 2026-10-21, G10). | Owner-authored data must not block the code. |

## 📝 Problem Statement
With many plants the owner loses track of what to do and when (`[INTERVIEW]` owner, one account, no episode; D11). Tasks cannot be derived until the app knows which plants exist and their timing.

## 📝 Proposed Solution
- **Catalogue** = versioned seed data in `packages/db/src/seeds/`, loaded by the seed command; identity from Wikidata (CC0), spacing and days-to-harvest from Trefle (CC-BY-4.0), frost offsets, companions and pruning written and cited by the owner (D04). Users cannot edit it (R03).
- **Plant list** = garden-grid Phase 1 (`Planting` with `garden`, `crop`, `note`; `/api/gardens/[id]/plantings`). Not redefined here, to avoid two `plantings` migrations.
- Alternatives rejected: a live Trefle API call at request time (violates "tests never touch the network", licence attribution per call, no pruning data); a user-editable catalogue (R03).

## 📝 Architecture
- Concept `crops` only. `CropService` exposes `list`, `get` and the contract garden-grid expects: `getFootprints(ids)` and `relationsAmong(ids)` (the latter returns seeded companions, consumed by E03).
- Browse is readable within the signed-in app only; the public `(marketing)` catalogue is Later (G11).
- Cross-system: the task-list spec reads `crops` timing and the plant list; this spec changes neither's contracts afterwards. Companion data is seeded (`crop_companions`) but consumed only by a later spec.

## 📝 Data Model
- `crops`: `id` uuid, `slug` unique, `kind` (`vegetable | herb | bush | tree`, matching garden-grid footprints), `commonName`, `latinName`, footprint (`plantsPerCell` 1/4/9/16 **or** `cellsPerSide` ≥ 2), `spacingCm`, `daysToHarvest` nullable, and one source per fact group (G20): `identitySource`/`identitySourceUrl` (names, kind; Wikidata) and `footprintSource`/`footprintSourceUrl` (footprint, spacing, days to harvest; Trefle), all NOT NULL.
- `crop_timing_windows`: many per crop (`kind`, `anchor`, bound pair, `source`, `sourceUrl` NOT NULL). Columns, checks and derivation are defined in `2026-10-20-task-list.md`; this spec's migration creates the table (G3).
- `crop_companions`: `cropId`, `otherCropId`, `relation`, `source`, `sourceUrl` NOT NULL (seeded now, unused now).
- `plantings` is **not** defined here; garden-grid Phase 1 owns it (no bed or geometry columns until its Phase 3).
- One migration plus snapshot. Seed-integrity test: every companion references an existing crop; every fact has a non-empty source.
- No sensitive data.

## 📝 API Contracts
- `GET /api/crops?kind=` → `{ ok, data: Crop[] }` (bounded; ≤30 seeded). `GET /api/crops/[id]`. Requires a session, like every `/api` route outside the public ones.
- The plant-list endpoints are garden-grid's (`GET, POST /api/gardens/[id]/plantings`, `DELETE /api/plantings/[id]`).
- No catalogue write endpoint exists (404/405).
- Errors: unknown crop → 404; bad query → 422 with `fieldErrors`.

## 📝 UI/UX
Catalogue page: list grouped by kind, each fact with a visible source link; an "Add to garden" action. "Add to garden" hands off to the garden-grid plant list (`CropPicker` there reuses this API); the plant list page itself is garden-grid's. Uses `DataTable`, `EmptyState`, `apiCall`. States: loading, empty, error, offline retry. Keyboard reachable; source links have text, not icons only.

## 📝 Edge Cases & Failure Scenarios
- Adding the same crop twice is a plant-list concern (garden-grid allows it).
- Crop with a missing pruning timing: listed, but the task list shows no prune task (see task-list spec).
- Seed run twice: idempotent upsert keyed by a stable `slug`; timing windows and companions of a crop are replaced as a set. A seed that drops a crop in use fails loudly (garden-grid's `plantings.crop_id` is `ON DELETE RESTRICT`).
- DB down: pages render the error state; app still boots without a DB.

## 📝 Risks & Impact Review
- `AGENTS.md` conflicts to fix in the first implementing PR: "vegetable-garden planner" (D02) → vegetables, bushes and trees; "a Planting occupies a cell rectangle" → optional until placed (D10); Migration-status table. The hard-to-reverse contracts are the `Crop` footprint columns (shared with garden-grid) and the `crop_timing_windows` table (shared with the task-list spec); a crop with no owner data simply has no windows.
- Wrong pruning entries mislead the owner (accepted risk, D04); mitigated by showing the source on every fact.
- Evidenced rule violation: none. Product direction call: seed size (Q3).

## 📝 Decisions in play
D02, D04, D10 / R07 (via garden-grid Phase 1), R03 — all committed in `product-brief.md` and `research/decisions/`. Owner of all: project owner.

## 📋 Phasing
Phase 1 — catalogue seed and read API (ships alone; unblocks garden-grid Phase 1). Phase 2 — catalogue page.

## 📋 Implementation Plan
**Phase 1 — Catalogue**
1. Entities `Crop`, `CropTimingWindow`, `CropCompanion`, registered in `entities/index.ts`; migration + snapshot (footprint columns and the timing-window table with its anchor/bound check included). Test: migration applies on an ephemeral DB (integration).
2. Seed data file with citations + seed-integrity unit test (sources non-empty, every crop has exactly one footprint form, every timing window has a bound pair matching its anchor, companions symmetric where marked, references exist). Seed v1 holds at least one vegetable, one bush and one tree with cited windows (G10).
3. `CropService.list/get/getFootprints/relationsAmong`, validators, `GET /api/crops(/[id])`. Unit tests: kind filter, unknown id → 404, no session → 401.
**Phase 2 — Page**
4. Catalogue page with every fact's source shown; no edit controls (test asserts none, and that no write route exists).
5. Add-to-garden action wired to garden-grid Phase 1's create endpoint once it exists; until then the page is browse-only. Integration test: add crop → listed with no bed (garden-grid step 3).
(`AGENTS.md` alignment already landed in PR #38.) All steps keep `typecheck`, `lint`, 100 % coverage and `build` green.

## 📝 Acceptance coverage
| Story criterion | Where covered |
|---|---|
| #25 vegetables, bushes, trees listed, every fact with source | API `GET /api/crops`, UI, seed-integrity test (steps 2, 3, 4) |
| #25 add to garden → plant list, no bed, no cells | garden-grid Phase 1 (entity, API, page); step 5 here |
| #25 owner cannot edit catalogue | no write endpoint; step 4 test |
| #34 (seed v1) | steps 1–2; owner authoring is outside the 25 build hours (D06) |

## 🧪 Review limits
Author review against #25, #34 and D04; a fresh-context scope-cohesion review was not run. Companion data is seeded here but shown by E03 (#37).
