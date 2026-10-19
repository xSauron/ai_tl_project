# Walkthrough: Plan a bed for spring (MVP), `.ai/specs/product-brief.md`, 2026-10-19

[ASSUMPTION] Most of what the personas are built from is assumption: apart from the owner's own account, every line comes from illustrative course material. This was a single exploratory run, so **no finding is reported**. The items below were seen once and are leads to check with real gardeners, not evidence. Nothing here satisfies the Definition of Ready.

The lead worth checking first: both personas would stop at the start, before getting any value. The flow asks for an account, frost dates and a full grid layout before showing a single task, and both personas said their problem isn't where things go but when to do things (P01) or that the grid doesn't fit their space at all (P02). Real check: watch two or three real gardeners the owner knows set up their own garden from a paper version of the flow, and note where they stop.

Stance: adversary
Panel: 1 run × 2 personas; run 1: P01, P02
Basis: brief Key flows (Future state, proposed), Product, Scope, Business rules, Non-goals, Domain glossary. P01 rests on `research/interviews/2026-10-19-owner-trained-gardener.md` (`[INTERVIEW]`, the project owner's own account), D02 (`[DOCUMENT]`) and the illustrative allotment-beginner note (`[ASSUMPTION]`). P02 rests on the illustrative balcony note (`[ASSUMPTION]`) and AGENTS.md (`[PRODUCT]`, the planner sits behind login). Persona coverage: 11 sourced lines and 21 assumed.
Panel snapshot: `.ai/specs/research/walkthroughs/2026-10-19-plan-a-bed-for-spring-mvp-session-001/personas.md`
Session: `.ai/specs/research/walkthroughs/2026-10-19-plan-a-bed-for-spring-mvp-session-001/`; subject `.ai/specs/product-brief.md`; flow "Plan a bed for spring (MVP), decided steps", mapped with the user's confirmation to Key flows → Future state (proposed). None of its steps are decided; only rules N01, N02 and R01–R05 are.
Composition: assumed (no data gives proportions); one central seat (P01) and one indifferent seat (P02, whose low interest is itself an assumption)
Saturation: not reached; 2 interviews, and 13 of P01's 14 topics did not appear in P02's list
Parity: exercise only, not recorded as calibration. The held-out note `2026-10-15-interview-raised-beds-experienced.md` is illustrative, not real. The panel fully raised 2 of its 8 themes and partly raised 3 more.
Elapsed: personas and prompts about 10 min; interviews and walks about 1 min per persona (run in parallel); consolidation and the parity exercise about 10 min
Not askable of this panel: A02 (whether the scope fits the build budget: a team question) and the provenance side of A03 (whether a licensed source exists). Only A03's trust angle was asked.

## 🎯 Scope and limits

- **Walked:** the brief's proposed flow, on paper. No screens, prototype or running app exist for it, and no one was logged in.
- **Not walked:** anything outside the five described steps.
- **No findings:** with one run, nothing can be shown to repeat. Every item is listed under *Seen once*.
- **Outside the material:** no persona represents an experienced raised-bed grower, because that note was held out.
- **P01's bias:** P01's sourced lines come from the person building the product, so agreement from P01 is weak by construction.

## 🔍 Outliers

P02, the indifferent seat, would leave at the first decision (D1). She won't create an account before seeing anything, and she would only glance at the public catalogue under the eased pressure. Her real problems are sun hours, centimetre-sized containers and diagnosing yellow leaves from a photo. Two of these are in the brief's Later list, and sun hours appear nowhere. The illustrative note behind her says she would leave, so her exit tells us little new. If real balcony growers behave the same way, the current scope simply isn't for them. That is a positioning question, not a usability one.

## 🔁 Seen once, not reported as a finding

Run 1. Items marked "both" came up independently with both personas in this one run. They still count as seen once.

1. **Setup before value (both, D1 and S1–S2).** The account and full setup come before any task. P01 would "likely put it off" and P02 "closes it". Under the eased pressure (catalogue browsable without an account), P01 would browse the pruning facts and sources. This bears on the order of the flow (Scope, Q02) and on A01.
2. **Grid-first vs. list-first (both, S2, Q5, Q8).** P01: "my trouble isn't where things go. It's when to do things to them", and "a plum tree on a square-foot grid feels artificial", plus a missing case for a tree that isn't in any bed. P02: her centimetre boxes and round pots can't be entered under R01/N01. This bears on A04 and the order of the flow.
3. **AI layout discarded under both pressures (both, D2).** Neither persona would apply it, and spending time first only made them more annoyed. This bears on Q06: what the one AI feature is for.
4. **A visible source decides whether a task gets acted on (both, D3).** Both would act only when a source is shown, and with no source both would ignore the task. P01 added that "a 'source' label doesn't automatically make a fact right for my tree". The brief doesn't say whether users see the source (R03 only requires one to exist). This bears on A03 and R03.
5. **"I don't know my frost dates" (both, S1).** The flow starts by asking for the input the user is unsure of ("After the last frost — which one?"). The brief doesn't describe a regional default or help finding the dates. This bears on R05 and Scope.
6. **No way to mark a task done (P01, S5).** R05 stores only overrides, so it's unclear how a completed task is remembered. This bears on Q07.
7. **Pruning: plants that must not be cut the generic way (P01, Q4, S5).** "One bad one cancels every good one". The pruning task needs plant-specific warnings. This bears on A03 and D02.
8. **Companion warnings: a way to disagree, and the warnings P02 actually needed (P01, P02, S3).** P01 wants to disagree with a warning. P02 needed "basil in the shade" kinds of warnings. This bears on R04.
9. **Sun hours and orientation missing (P02, S1, Q4).** They are not in the brief at all.

## 🧪 To confirm with real users

No surviving findings, so there are no rows. Checks worth planning for the leads above:

| # | Lead (seen once) | Persona ids / runs | Settles | Who to recruit | How |
|---|---|---|---|---|---|
| — | Setup before value; grid-first vs list-first | P01, P02 / run 1 | Q02 (order of Now), A01, A04 | real gardeners the owner knows, including at least one with bushes or trees | give them the five steps on paper with their own garden; note where they stop, then ask about the last time they missed or mistimed a task |
| — | AI layout discarded | P01, P02 / run 1 | Q06 | same interviews | ask about the last time they used any advice to decide where plants go, and what they did with it |
| — | Visible source decides action; pruning caution | P01, P02 / run 1 | A03, R03 | same, plus someone qualified to check pruning advice | show a sample pruning task with and without a source; record what they would do and why |
| — | Frost dates unknown | P01, P02 / run 1 | R05, Scope | same | ask how they knew when to plant out last spring |

## 📝 Interviews

- `transcripts/run-1-P01.md`
- `transcripts/run-1-P02.md`

The yes/no check for agreeableness: 4 of the 6 answered questions came back yes (2 had no basis). Each yes is backed by a persona line (ChatGPT use, a paper notebook, the lost basil), so none counts as reflexive agreement. Every interview raised objections, as the adversary stance requires.

## 🔍 Parity with real interviews

This is not a real parity check. The held-out note is illustrative course material, so no calibration point was recorded (see `../../calibration.md`). As an exercise only:

- **Themes in both:** distrust of generic companion advice in favour of one's own judgment, and "the AI may propose, I decide" (both personas discarded the AI layout).
- **Partly in both:**
  - keeping a paper notebook (but not years of notebooks)
  - local frost timing ("which frost?", but not the valley being later than the regional rule)
  - dislike of logging in (the account-first objection, but not frequent logins)
- **Only in the held-out note:**
  - crop-rotation history over several years
  - photos that attach themselves to a bed
  - deleting a foreign app with the wrong calendar
  - unwanted frequent notifications

  The panel lacked rotation material because that note was held out. Rotation is the strongest theme to ask real experienced growers about.
- **Only in the panel:**
  - setup before value
  - list-first over grid-first
  - visible sources
  - marking tasks done
  - sun hours
  - centimetre containers
  - fear of a diagnosis that ends in an upsell

  These are questions for the next real interview, not findings.

## 📸 Evidence

Narrative walk; no screens.
