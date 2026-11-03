# Gardener onboarding — discovery prototype, revision 001

- **Date:** 2026-11-02
- **Brief:** `.ai/specs/product-brief.md` (Key flows → Future state)
- **Flow:** gardener onboarding: from sign-up to the first task list
- **Previous revision:** none
- **Panel report:** none supplied. The brief's only walkthrough (`.ai/specs/research/walkthroughs/2026-10-19-plan-a-bed-for-spring-mvp-session-001/report.md`) walked an older flow. Its hypotheses are cited below as `[SYNTHETIC]` from the brief, not as a panel report for this flow.
- **Artifact:** `index.html` (self-contained, no network, no storage). Open it directly in a browser (`file://`). Use **Reset simulation** in the top bar to start over.
- **Not evidence:** every record is fictitious simulation data. This prototype and its browser checks show how the simulation behaves. They do not show user demand, and they do not satisfy the Definition of Ready or production readiness.

## Simulation boundary (confirmed by the owner 2026-11-02)

- **Actor:** a new user, the owner or a family member (each has their own account, WŁ:L19 in `.ai/prototypes/konto-i-ogrody/mapa-ekranow.md`).
- **Start:** the home page entry “Plan your garden”.
- **Success outcome:** the user sees “What to do and when” for their garden: sowing, planting-out and pruning windows, each with its source.
- **Owner choices at the boundary gate:** include registration; setup steps in **free order** from the garden page; screens in **English**.
- **Excluded (labelled “Outside this prototype” on the garden page):** beds and square-foot grid (Now item 2, gated on A04 / #13); operations list (D14, R09); asking the AI (D08); account settings; login, password reset and the other account states (covered by the `konto-i-ogrody` screen map).

## Preserved rules and decisions

| Id | Meaning kept in the simulation | Source | Owner / status | Change path |
|---|---|---|---|---|
| D02 | Catalogue offers vegetables, berry bushes and fruit trees; pruning tasks shown | brief, decisions/D02 | project owner / active | superseding record by owner |
| D07 | Task list (item 1) is the success outcome. Beds and AI are not simulated | decisions/D07 | project owner / active | superseding record by owner |
| D10 / R07 | Plants are added to the garden with no bed (“not in a bed”) | decisions/D10 | project owner / active | superseding row by owner |
| R03 | Every catalogue fact and task shows a source (here: “Simulated source (fictitious)”) | AGENTS.md | project owner / active | AGENTS.md change |
| R05 | Tasks are derived on every render from catalogue offsets and frost dates. Nothing derived is stored, and changing frost dates moves the windows | AGENTS.md | project owner / active | AGENTS.md change |
| D12 | Task list shows what needs doing and when; marking done is not offered | decisions/D12 | project owner / active (in part superseded by D14) | superseding record |
| D14 / R09 | Operations exist but are outside this prototype; nothing here records work done | decisions/D14 | project owner / active | superseding record |
| D09 | No spraying advice, journal or photos | decisions/D09 | project owner / active | superseding record |
| N02 / D08 | No AI on any screen | decisions/N02, D08 | project owner / active | superseding record |
| N03 | No sharing or invites. Each family member registers separately | AGENTS.md | project owner / active | AGENTS.md change |
| W:L22 | Email confirmation is part of sign-up | `konto-i-ogrody/mapa-ekranow.md` (owner, 2026-11-02) | project owner | owner decision |
| W:L13 | UI exists in Polish and English; this revision shows English only | same | project owner | owner decision |
| Task-list spec | Frost-date form with region prefill and editable dates; spring before autumn; without frost dates, frost-dependent tasks are omitted, a banner asks for dates, and prune (month-based) tasks still appear; empty state links to adding plants | `.ai/specs/2026-10-20-task-list.md` (draft) | project owner | spec revision |
| Spec A | Password 10–128, email ≤ 254, garden name ≤ 120 / description ≤ 2000; generic refusal text “Could not create the account. If you already have one, log in.”; empty gardens text | `.ai/specs/2026-10-20-app-primitives.md` (draft) | project owner | spec revision |

## Synthetic leads in play

- `[SYNTHETIC]` H01: a grower may stop before getting value when account, frost dates and a full layout come before any task. The free-order checklist and the absence of a bed step relate to it. Brief, Hypotheses to test.
- `[SYNTHETIC]` H05: growers may not know their frost dates. The region prefill, optional dates and prune tasks shown without frost dates relate to it.
- `[SYNTHETIC]` H04: a task is acted on only when its source is visible. Every task line shows a source.

These are leads, not requirements. The screens carry no copy that hints at the expected reaction.

## Assumptions

| Id | Assumption | Why needed | How to check |
|---|---|---|---|
| `[ASSUMPTION]` AS01 | After email confirmation the user goes straight to “My gardens” with a session (L22 leaves open whether a session exists before confirmation) | sign-up has to land somewhere | owner decision on L22 |
| `[ASSUMPTION]` AS02 | Garden page shows a two-item setup checklist (Frost dates, Plants you grow) with status tags, in any order (owner chose free order; the checklist form is the agent's) | free order needs a hub | owner walks the prototype (D13) |
| `[ASSUMPTION]` AS03 | Frost dates are optional and either date may be saved alone; only spring frost affects tasks in this simulation | spec gives both as optional fields | task-list spec review |
| `[ASSUMPTION]` AS04 | Region names, their dates and every crop timing are fictitious placeholders, not catalogue facts (D04 says the owner writes them) | tasks need numbers | replace with seed v1 (#34) |
| `[ASSUMPTION]` AS05 | Prune windows are shown for season 2027 as whole months; a planting can be removed from the plant list without confirmation | display needs a year; removal needs a rule | task-list / garden-grid spec |
| `[ASSUMPTION]` AS06 | Crop with no timing (Rhubarb) produces no task and no explanation on the task list | spec says “no task, no guessed date” but not whether to explain | owner walk |
| `[ASSUMPTION]` AS07 | Error texts for catalogue load failure and frost-date save failure (“Nothing was changed. Try again.”) | spec lists error states but not copy | spec A copy review |
| `[ASSUMPTION]` AS08 | Guard screens for opening garden pages without an account or garden | recovery for direct links | spec A redirect rules (in production: redirect to login) |

## Screen / state map

| Id | Screen | Action → next state | Rules / assumptions |
|---|---|---|---|
| `#start` | Entry | “Plan your garden” → `#register` | — |
| `#register` | Create your account | invalid → inline field errors, focus first invalid; refused (test toggle) → generic alert; valid → `#check-inbox`; Back → `#start` | Spec A, W:L22 |
| `#check-inbox` | Check your inbox | “Send the link again” → status; Test state “Open the confirmation link” → `#confirmed` | W:L22, AS01 |
| `#confirmed` | Email confirmed | → `#gardens` | AS01 |
| `#gardens` | My gardens | empty text; “New garden” → inline form; empty name → error; Escape/Cancel closes; create → `#garden` | Spec A |
| `#garden` | Garden home | Frost dates → `#frost`; Plants you grow → `#plants`; “See what to do and when” → `#tasks`; excluded destinations listed as text | AS02, D07 |
| `#frost` | Frost dates | region → dates prefilled, editable; autumn ≤ spring → field error; save failure (test toggle) → alert, nothing changed; save → `#garden` with summary | task-list spec, AS03, AS07 |
| `#plants` | Plants you grow | loading → catalogue by kind with sources; failure (toggle) → “Try again”; Add → listed as “not in a bed”; Remove | D02, D10, R03, AS05, AS07 |
| `#tasks` | What to do and when | no plants → empty state + “Add plants”; plants without frost → banner + prune tasks only; with frost → all tasks grouped by month, each with source | R05, D12, AS05, AS06 |
| `#need-account`, `#need-garden`, `#not-found` | Recovery | each offers one link back | AS08 |

## Browser verification (agent-browser 0.39.1, headless Chrome, 2026-11-02)

Evidence is in `evidence/`. Sessions `proto-onb-001` and `proto-onb-001b` were both closed.

| # | Check | Expected | Observed | Evidence |
|---|---|---|---|---|
| 1 | Open entry | heading “Plant.AI”, CTA | as expected | `01-start.png` |
| 2 | Register invalid | both field errors, focus on email | as expected | `02-register-invalid.png` |
| 3 | Register valid | Check inbox with email, focus on h1 | as expected | `03-check-inbox.png` |
| 4 | Resend | status “We sent the link again.” | as expected | — |
| 5 | Direct `#gardens` before confirmation; browser Back | “You need an account first”; Back returns to inbox | as expected | — |
| 6 | Confirm link (test state) | Email confirmed | as expected | `04-confirmed.png` |
| 7 | Gardens empty; New garden empty submit; create | empty text; name error with focus; garden page | as expected | `05-gardens-empty.png`, `06-garden-setup.png` |
| 8 | Tasks with no plants | empty state, no frost banner | as expected | `07-tasks-empty.png` |
| 9 | Catalogue failure, then retry | loading → error → catalogue | as expected | `08-catalogue-error.png` |
| 10 | Add 5 plants (plants-first order) | listed “not in a bed”, announced | as expected | `09-plants-added.png` |
| 11 | Tasks without frost dates | banner; only prune tasks (blueberry Feb–Mar, plum Jun–Aug) | as expected | `10-tasks-no-frost.png` |
| 12 | Frost: autumn before spring | field error, focus on autumn field | as expected | `11-frost-invalid.png` |
| 13 | Frost: save failure toggle | alert “Could not save… Nothing was changed.” | as expected | `12-frost-save-failed.png` |
| 14 | Frost: region prefill + save | garden summary 15 May / 28 Sep 2027 | as expected (rerun in clean session, see note) | `13-garden-both-done.png` |
| 15 | Tasks with frost | banner gone; sow tomato, sow carrot, plant out tomato added; rhubarb no task | as expected | `14-tasks-complete.png` |
| 16 | Browser back/forward | garden ↔ tasks | as expected | — |
| 17 | Unknown fragment `#nowhere` | “Page not found”, focus on heading, link to start | as expected | `15-unknown-fragment.png` |
| 18 | Narrow viewport 375 px | no horizontal overflow on plants and tasks | as expected | `16-plants-narrow.png`, `17-tasks-narrow.png` |
| 19 | Keyboard: Tab to Remove, Enter | visible solid outline; plant removed, focus to list heading, announced | as expected | `18-keyboard-focus.png` |
| 20 | Keyboard: New garden form Escape | form closes, focus back to button, input cleared | as expected | — |
| 21 | Register refused toggle, then correction | generic message; after untick → inbox | as expected | `19-register-refused.png` |
| 22 | Reset via keyboard | start screen, focus on heading, “Simulation reset.” announced; `#tasks` then shows the account guard; inputs and toggles cleared | as expected | `20-after-reset.png` |

**Notes and limits**
- In headless Chrome, typed digits did not reach the native `<input type="date">` fields, but arrow keys did. Date entry was therefore checked with arrow keys and the region prefill, not by typing.
- During the first session one save click produced its announcement without navigating. Repeating the same click in that session, and the full path in a fresh session, navigated correctly. It was not reproduced, so no fix was made. If it shows up during manual walks, look at it again.
- No screen-reader walk was performed. Live-region announcements were read from the DOM, not heard.
- Contrast was checked by inspection (near-black on white/grey), not with a tool.
- The agent's image reader could not open the screenshots. They were checked for existence and size, not looked at.

## How to use

Open `index.html`. Use the **Test state** panel at the bottom to open the simulated confirmation email and to force refusal or failure states. **Reset simulation** clears everything in memory.
