# Plant.AI — product brief

- Date: 2026-10-19
- Mode: own; Owner: project owner; Pass: full; refreshed 2026-10-19 (status only — the owner did not answer the refresh questions, so no decision changed)
- Evidence basis: one real account — the project owner, a trained gardener, describing problems in general terms with no episode, frequency or cost. Three interviews, the workshop export and a 47-response survey exist but are illustrative course material, not real people (source manifest), so everything they say about gardeners is treated as an assumption. One real benchmark (Planter, checked 2026-10-17). Scope rests on the owner's decisions D01–D04, N01, N02. Most consequential untested belief: that growers other than the owner share the problems the MVP targets (A01), and that the widened scope fits the build budget (A02).
- Coverage: 33 claims — 21 sourced (interview 4, data 0, document 9, product 7, benchmark 1), 0 synthetic, 12 assumed; 2 entries on the collection plan (A01 interviews, A04 garden layout; the catalogue-source entry is done)
- Synthetic hypotheses outside Coverage: 0
- Definition of Ready signed by: not yet signed — Target group has no real support beyond the owner, Now (Q02) and success/stop criteria (Q03) are proposals; catalogue source decided (D04); ready for: research, and the owner's own provisional build once Q02 and Q04 are answered
- Sources: `.ai/specs/research/interviews/2026-10-19-owner-trained-gardener.md`, `.ai/specs/research/decisions/` (N01, N02, D01–D04), `.ai/specs/research/2026-10-17-benchmark-planter.md`, `.ai/specs/research/2026-10-18-source-manifest.md`, `.ai/specs/research/2026-10-16-miro-board-*.md`, illustrative `.ai/specs/research/2026-10-1{4,5,6,8}-{interview,workshop,survey}-*.md`, `AGENTS.md`

## Decision summary

The owner has decided to build an MVP aimed at the most common problems of home growers (D01), now covering vegetables, berry bushes and fruit trees with pruning tasks (D02). Which items go into Now is still a proposal (Q02).
The only real problem account is the owner's own: with many plants it is easy to lose track of what to do and when, companion planting is a problem, and pruning needs care. See Problems and Target group.
Proposed Now: square-foot beds holding all three plant kinds, a sourced catalogue, companion warnings, a frost-date calendar, pruning windows, a task list and the AI layout proposal; journal and photos later. See Scope.
What could change this: nobody besides the owner has yet been heard (A01); the widened scope may not fit 25 hours (A02); no licensed dataset covers pruning and companion data, so the owner writes them from cited references (A03, D04); trees may not fit the grid (A04). Binding `AGENTS.md` still says "vegetable-garden planner", so D02 conflicts with project rules until `AGENTS.md` and the engineering standards are updated. What the AI feature should help with (Q06) and what "losing track" means in practice (Q07) are open.
Next: the owner fills in the garden-layout sheet for A04 (#13), decides who the MVP is for (talk to real gardeners first for A01, or narrow the target group to the owner's own garden), and answers Q02, Q04, Q06 and Q07. The catalogue source is decided (D04). Dates are not set.

## Vision

For home growers with vegetables, berry bushes and fruit trees, Plant.AI is meant to keep track of what to do in their own garden and when, so a growing garden doesn't get lost; this is the team's intended direction, not a demonstrated benefit. `[DOCUMENT]` D01, D02

## Target group and stakeholders

- Customer (pays): nobody; hobby project with no payments. `[PRODUCT]` AGENTS.md, Product scope
- User (uses): home growers with a garden holding several plants; whether anyone besides the owner has this problem is untested, and whether the owner's account covers only their own garden or also people they advise is unknown (Q08). `[ASSUMPTION]` interviews/2026-10-19-owner-trained-gardener.md; see A01
- Allotment beginners, experienced raised-bed growers and balcony growers are candidate segments from illustrative material only. `[ASSUMPTION]` 2026-10-16-miro-board-vision-target-needs.md; see A01
- Stakeholders (decides, blocks, operates): the project owner decides and builds; the AI Tech Leaders course sets the pace. `[DOCUMENT]` 2026-10-18-source-manifest.md
- Decider for scope decisions: project owner

## Problems, with evidence

- As a garden grows, it becomes easy to lose track of what to do, even for an experienced grower. One account, no episode or cost given. `[INTERVIEW]` owner, 2026-10-19
- Knowing when to do certain tasks is a problem. `[INTERVIEW]` owner, 2026-10-19
- Companion planting ("good neighbours") is a problem; what exactly goes wrong was not described. `[INTERVIEW]` owner, 2026-10-19
- Pruning needs care because some plants (the owner named *Prunus*) may not grow back after a cut. `[INTERVIEW]` owner, 2026-10-19
- Generic frost advice, contradictory companion lists, lost previous-season notes, unidentified plant disease and rotation mistakes appear only in illustrative material. `[ASSUMPTION]` survey and interviews, 2026-10-14 to 2026-10-18
- Person, situation, outcome: a grower whose number of plants keeps growing wants to keep track of what to do and when. A "this week" list is a proposed framing from illustrative material, not the owner's words; see Q07.

## Product and how it stands out

- What it is: a mobile-first web planner for square-foot beds with a sourced plant catalogue, companion warnings, a frost-date calendar and an AI layout proposal; see Scope. `[PRODUCT]` AGENTS.md
- What makes it different: calendar from the user's own frost dates and Polish growing conventions are the owner's intended differentiators, not compared with users. `[ASSUMPTION]` 2026-10-16-miro-board-product-goals.md

| reference | what it does well | where it falls short for our users | checked on | link |
|---|---|---|---|---|
| Planter | square-foot grid a beginner can finish; companion hints beside the plan; already lists 80+ fruits and vegetables, so including fruit is not a differentiator; phone and web `[BENCHMARK]` | listing English-only; frost-date handling, rotation, AI layout and photo diagnosis not described on the pages checked; app itself not checked `[BENCHMARK]` | 2026-10-17 | https://planter.garden |

## Goals and success criteria

- Business goal: none commercial; finish the course with a working app built through the om-* pipeline, and plan the owner's own 2027 beds in it. `[ASSUMPTION]` 2026-10-16-miro-board-product-goals.md; whether the boards are real owner positions or course exercise is Q05
- User outcome: a grower can see what to do this week in their garden, including pruning, without tracking it by memory. Proposed; addresses the owner's account. `[ASSUMPTION]` Q02
- Primary metric, baseline today, threshold, date: proposed "at least three real gardeners open it more than once during spring 2027", from the owner's goals board; not confirmed as the success check. No baseline. `[ASSUMPTION]` Q03
- What must not get worse: the app builds and boots without a database or AI provider, and `/api/health` keeps working. `[PRODUCT]` AGENTS.md

## Scope

- **Now (proposal, Q02):** square-foot beds (N01) holding vegetables, berry bushes and fruit trees as multi-cell plantings (D02, R01); a catalogue whose facts each carry a source (R03); companion conflict warnings (R04); a calendar from the user's frost dates with sowing and planting-out windows (R05), pruning windows from sourced catalogue timing (A03), and a task list (shape open, Q07); the AI layout proposal (N02, R02).
- **Later:** journal with notes and photos; rotation history; photo diagnosis; balcony boxes in centimetres. All proposals with illustrative backing only.
- **Not doing:** see Non-goals.

## Domain glossary

| Term | Meaning | Owned by | Visible to |
|---|---|---|---|
| Bed | a rows × cols square-foot grid | user | user |
| Planting | a crop, bush or tree occupying a rectangle of whole cells in a bed | user | user |
| Task | something to do in a given period (sow, plant out, prune) derived from catalogue timing and, where relevant, frost dates; proposed, and whether completed tasks are recorded is Q07 | system (derived) | user |
| Proposal | an AI layout shown as a preview, applied at most once by the user | system | user |

## Key flows

- Current state: deferred; the owner's account names problems but no steps, and the journey map is illustrative.
- Future state (proposed): the user sets frost dates, lays out a bed with vegetables, bushes or trees, sees companion warnings, optionally previews and applies an AI layout, then opens a task list including pruning tasks. `[ASSUMPTION]` Q02

## Business rules

| Id | Rule | Applies to | Source | Status | Review by | Required path to change | Owner | Supersedes |
|---|---|---|---|---|---|---|---|---|
| R01 | Every planting, including bushes and trees, occupies a rectangle of whole cells; placement validity is decided only by grid rules | beds, plantings | `[DOCUMENT]` N01, D02 | active | if A04 fails | superseding row by project owner | project owner | none |
| R02 | AI output is a preview; nothing is written until the user applies it through the same rules as a manual edit | AI layout | `[DOCUMENT]` N02 | active | unknown | superseding row by project owner | project owner | none |
| R03 | Every catalogue fact, including pruning windows and companion relations, has a source; users cannot edit the catalogue in MVP | catalogue | `[PRODUCT]` AGENTS.md, Domain invariants | active | unknown | AGENTS.md change by project owner | project owner | none |
| R04 | Companion conflicts are computed server-side from catalogue data, never hard-coded in the UI | companions | `[PRODUCT]` AGENTS.md, Domain invariants | active | unknown | AGENTS.md change by project owner | project owner | none |
| R05 | Calendar windows and tasks are derived from catalogue timing and the user's frost dates, never stored; only user overrides persist | calendar | `[PRODUCT]` AGENTS.md, Domain invariants | active | unknown | AGENTS.md change by project owner | project owner | none |

## Non-goals

| Id | We are not building | Why | Owner | Status | Review by | Required path to change | Source | Supersedes |
|---|---|---|---|---|---|---|---|---|
| N01 | freehand or free-position garden drawing | keeps placement rules testable and the MVP finishable | project owner | active | unknown | superseding record by project owner | `[DOCUMENT]` decisions/N01-grid-only.md | none |
| N02 | AI that writes to the plan without the user pressing apply | the user stays responsible for what is planted | project owner | active | unknown | superseding record by project owner | `[DOCUMENT]` decisions/N02-ai-proposes-user-applies.md | none |
| N03 | sharing, social features, marketplace, payments, multi-tenancy, queues, native apps, weather/IoT | out of MVP scope | project owner | active | unknown | AGENTS.md change | `[PRODUCT]` AGENTS.md, Product scope | none |

## Decisions

| Id | Date | Decision | Why | Owner | Status | Review by | Required path to change | Source | Supersedes |
|---|---|---|---|---|---|---|---|---|---|
| D01 | 2026-10-19 | MVP aims at the most common home-grower problems | owner's stated aim; which problems are most common is A01 | project owner | active | when real growers are heard | superseding record by project owner | `[DOCUMENT]` decisions/D01-mvp-targets-common-problems.md | none |
| D02 | 2026-10-19 | MVP covers vegetables, berry bushes and fruit trees, including pruning tasks | owner: "hard to focus only on vegetable"; agent recommended vegetables only (budget, catalogue source, pruning risk) and was overruled | project owner | active | if A02 or A03 fails | superseding record by project owner; AGENTS.md "vegetable-garden planner" and the engineering standards must change in the first implementing PR | `[DOCUMENT]` decisions/D02-scope-includes-bushes-trees-pruning.md | none |
| D03 | 2026-10-19 | catalogue source chosen in a separate step | keeps discovery on scope; agent recommendation accepted | project owner | superseded by D04 | before catalogue seed work | superseding record by project owner | `[DOCUMENT]` decisions/D03-catalogue-source-deferred.md | none |
| D04 | 2026-10-19 | catalogue is owner-curated and cited: Wikidata (CC0) for identity, Trefle (CC-BY-4.0) for spacing and days-to-harvest, owner-written frost offsets, companions and pruning; owner checks pruning alone (accepted risk) | no cleanly licensed dataset covers companions or pruning (data-request note); agent proposal accepted in full | project owner | active | if a licensed companion/pruning dataset appears or a pruning entry proves wrong | superseding record by project owner | `[DOCUMENT]` decisions/D04-catalogue-source-owner-curated.md | D03 |

## Riskiest assumptions

| Id | Assumption | Importance | Evidence today | If false | Smallest test | Owner | By when | Result |
|---|---|---|---|---|---|---|---|---|
| A01 | Growers other than the owner lose track of tasks and timing, and have companion or pruning trouble `[ASSUMPTION]` owner account + illustrative material | high | one real account (owner); survey and interviews illustrative | Now targets the wrong problem; D01 revisited | ask a few real gardeners the owner knows about their last season, without showing the app. Supports D01 if they describe, unprompted, missed or mistimed tasks, or companion or pruning trouble; revisit D01 if they describe other problems. Tests only that the problem exists, not whether they would use a task list; people the owner knows may share the owner's habits | project owner | unknown | untested |
| A02 | Vegetables, bushes, trees, pruning windows, calendar, companions and the AI proposal fit the 25-hour MVP `[ASSUMPTION]` owner goals board | high | owner's board said 25 h fits only with photo diagnosis and rotation deferred, before D02 widened scope | build overruns; cut Now | estimate the Now items during spec writing / backlog dry run and compare with 25 h | project owner | before implementation planning | untested |
| A03 | A licensed source exists for timing, companion relations and per-species pruning windows of vegetables, bushes and trees `[ASSUMPTION]` no material | high | 2026-10-19 source search (`research/2026-10-19-data-request-catalogue-source.md`): Wikidata (CC0) and Trefle (CC-BY-4.0) cover taxonomy and some timing; no candidate with a clean licence covers companion relations or pruning windows | catalogue or pruning tasks cannot ship under R03 | catalogue source search (Q01) | project owner | before catalogue seed work | partly tested: no open source for pruning or companions; owner-curated cited entries decided (D04) |
| A04 | A square-foot grid represents bushes and trees well enough for planning `[ASSUMPTION]` no material | high | none; trees spread and shade beyond their cells | R01 or N01 revisited for perennials | lay out the owner's own garden, including a tree and a blueberry, on the grid, using `research/templates/garden-layout.md` (#13) | project owner | before implementation planning | untested; sheet ready, owner's layout not yet supplied |

## Kill criteria

Not decided (Q03). Proposed: if, after spring 2027, fewer than three real gardeners have opened the app more than once, the owner reconsiders direction. This is the owner's earlier goal, not a confirmed stop rule.

## Hypotheses to test

None; no synthetic walkthrough has been run.

## Open questions

| Id | Question | Blocking | Who can answer | Status |
|---|---|---|---|---|
| Q01 | Where does the plant catalogue (vegetables, bushes, trees, companions, pruning windows) come from, under what licence, and who checks it? | no — answered by D04 | project owner | answered (D04) |
| Q02 | Is the proposed Now list (Scope) confirmed, with journal and photos deferred? | yes — implementation planning | project owner | open — asked 2026-10-19, not answered |
| Q03 | Is "three real gardeners open it more than once in spring 2027" the success check, and what result means stop or revise? | no — needed before the spring 2027 test | project owner | open |
| Q04 | Is the 25-hour build budget still the constraint after D02? | yes — implementation planning (A02) | project owner | open — asked 2026-10-19, not answered |
| Q05 | Are the Miro boards and the 25-hour limit the owner's real positions, or part of the course exercise? | no — affects how Goals and A02 are sourced | project owner | open |
| Q06 | Which of the owner's problems should the one AI feature address (Now proposes the layout proposal, which none of them names)? | yes — the AI part of Now | project owner | open |
| Q07 | When growers lose track, is it not knowing a task is due, not knowing whether it was done, or not knowing how to do it (for example, how to cut)? | yes — shape of the task list and pruning content | project owner, then real gardeners (A01) | open — asked 2026-10-19, not answered |
| Q08 | Did the owner describe their own garden only, or also gardens of people they work with or advise? | no — affects how much the account supports Target group | project owner | open |

## Definition of Ready addendum (own)

Problems have one real account (the owner's); Target group has no real support beyond the owner, so implementation readiness is blocked under the common Definition of Ready. D01–D04 are confirmed; Now (Q02), the AI feature's purpose (Q06), the task list's shape (Q07), the budget (Q04) and success/stop criteria (Q03) are proposals. D02 conflicts with binding `AGENTS.md` until it is updated. No assumption has been tested or explicitly accepted untested. Ready for: collecting evidence (A01, A04), catalogue seed work under D04, and the owner's own provisional build once Q02 and Q04 are answered. The 2026-10-19 refresh asked who the MVP is for, the budget (Q04) and the last time the owner lost track of a task (Q07); none was answered, so nothing here changed.

## Collection plan

### Do home growers other than the owner lose track of tasks, timing and companions, and who are they?

- What decision or work needs it: Target group and Problems support for implementation readiness; tests A01 and D01
- Who can answer it: real gardeners the owner knows, with at least one season behind them
- How: short interviews about their last season, starting from the last time something went wrong; no app shown
- Owner and by when: project owner; unknown
- Template: `.ai/specs/research/templates/interview-note.md`

### Which licensed source supplies timing, companion relations and pruning windows for vegetables, bushes and trees?

- What decision or work needs it: Q01, A03; catalogue seed data and pruning tasks
- Who can answer it: project owner, with a check by someone qualified in horticulture
- How: search candidate public or licensed datasets and record licence and coverage
- Owner and by when: project owner; before catalogue seed work
- Template: `.ai/specs/research/templates/data-request.md`
- Status: done 2026-10-19 — `research/2026-10-19-data-request-catalogue-source.md`; decided in D04 (owner checks pruning alone)

### Does a square-foot grid represent the owner's fruit tree and blueberry well enough for planning?

- What decision or work needs it: A04; whether R01 and N01 hold for bushes and trees before the grid editor is specified
- Who can answer it: project owner (own garden)
- How: fill in the sheet with the real beds, the tree and the blueberry, recording the seven listed cases; a sketch or photo is enough for an agent to transcribe
- Owner and by when: project owner; before implementation planning
- Template: `.ai/specs/research/templates/garden-layout.md` (issue #13)
