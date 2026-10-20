# Backlog

One section per `Backlog source:`. The tracker is the live authority; this file keeps the source-to-issue map and reserved ids.

## Backlog source: .ai/specs/product-brief.md

Filed 2026-10-19 by `om-backlog` (research variant: the brief's Target group rests on A01, an assumption, so no implementation tree was filed).

| Id | Title | Issue | Status |
|---|---|---|---|
| E01 | Discovery | [#11](https://github.com/xSauron/ai_tl_project/issues/11) | open |
| E01-T01 | Find out from real gardeners whether they lose track of tasks, timing and companions | [#18](https://github.com/xSauron/ai_tl_project/issues/18) | closed as not planned 2026-10-20 (superseded by D11); id reserved |
| E01-T02 | Find a licensed source for timing, companion relations and pruning windows | [#12](https://github.com/xSauron/ai_tl_project/issues/12) | closed |
| E01-T03 | Lay out the owner's own garden, including a tree and a blueberry, on the square-foot grid | [#13](https://github.com/xSauron/ai_tl_project/issues/13) | open |

Updated 2026-10-20 by `om-backlog` (research variant again; E01 body and checklist refreshed).

Updated 2026-10-20 (second run) by `om-backlog`: readiness still not met (A01, Q07, D05); no new ids. D10/R07 added to *Decisions in play* on #11 and #13 (R01 marked superseded on #13).

Held back until 2026-10-20: the implementation tree, on A01, D05 and Q07. All three were resolved by D11 (A01 accepted untested), D12 and D14.

### Implementation tree (Scope → Now, D07)

Filed 2026-10-20 by `om-backlog` through `om-prepare-issue`. Readiness was judged by the brief's own check, because `SDLC.md` has no Definition of Ready. It rests on the owner's decision D11, not on an observed episode. Labels: category, priority and risk, each with a rationale comment.

| Id | Title | Issue | Parent | Depends on | Status |
|---|---|---|---|---|---|
| E02 | Know what to do in my garden and when | [#19](https://github.com/xSauron/ai_tl_project/issues/19) | — | — | open |
| E02-S01 | The owner signs in and sees only their own gardens | [#23](https://github.com/xSauron/ai_tl_project/issues/23) | E02 | — | open |
| E02-S01-T01 | Spec A Phases 0–3: alignment and primitives | [#31](https://github.com/xSauron/ai_tl_project/issues/31) | E02-S01 | — | open |
| E02-S01-T02 | Spec A Phase 4: auth | [#32](https://github.com/xSauron/ai_tl_project/issues/32) | E02-S01 | E02-S01-T01 | open |
| E02-S01-T03 | Spec A Phase 5: owned gardens | [#33](https://github.com/xSauron/ai_tl_project/issues/33) | E02-S01 | E02-S01-T02 | open |
| E02-S02 | The owner sets frost dates for a garden | [#24](https://github.com/xSauron/ai_tl_project/issues/24) | E02 | E02-S01 | open |
| E02-S03 | The owner adds the plants they grow from the catalogue, without a bed | [#25](https://github.com/xSauron/ai_tl_project/issues/25) | E02 | E02-S01 | open |
| E02-S03-T01 | Catalogue spec and seed v1 | [#34](https://github.com/xSauron/ai_tl_project/issues/34) | E02-S03 | — | open |
| E02-S04 | The owner sees which tasks are due and when | [#26](https://github.com/xSauron/ai_tl_project/issues/26) | E02 | E02-S02, E02-S03 | open |
| E02-S05 | The owner records operations, planned or done, once for many plants | [#27](https://github.com/xSauron/ai_tl_project/issues/27) | E02 | E02-S03 | open |
| E02-S05-T01 | Name the concept for stored operations and update AGENTS.md | [#35](https://github.com/xSauron/ai_tl_project/issues/35) | E02-S05 | — | open |
| E03 | Lay plants out on square-foot beds and see bad neighbours | [#20](https://github.com/xSauron/ai_tl_project/issues/20) | — | #13 | open |
| E03-S01 | The owner creates square-foot beds | [#28](https://github.com/xSauron/ai_tl_project/issues/28) | E03 | E02-S01, #13 | open |
| E03-S02 | The owner places a plant into a bed as a whole-cell rectangle | [#29](https://github.com/xSauron/ai_tl_project/issues/29) | E03 | E03-S01, E02-S03, #13 | open |
| E03-S03 | The owner sees companion warnings | [#37](https://github.com/xSauron/ai_tl_project/issues/37) | E03 | E03-S02, E02-S03-T01 | open |
| E04 | Ask about my own garden | [#21](https://github.com/xSauron/ai_tl_project/issues/21) | — | — | open |
| E04-S01 | The owner asks about their garden and gets a suggestion | [#30](https://github.com/xSauron/ai_tl_project/issues/30) | E04 | E02-S04 | open |
| E04-S01-T01 | A05 check before shipping | [#36](https://github.com/xSauron/ai_tl_project/issues/36) | E04-S01 | — | open |
| E05 | Later (parked) | [#22](https://github.com/xSauron/ai_tl_project/issues/22) | — | — | open |

Reserved ids for this source: E01–E05 and every id above. Not filed: Not doing (N01–N03). AI-suggested tasks are parked in E05 (Q13, agent proposal).
