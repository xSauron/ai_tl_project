# Run — om-backlog on the product brief (re-run after D06–D10)

- **Date:** 2026-10-20
- **Goal:** `/om-backlog .ai/specs/product-brief.md`
- **Related spec:** `.ai/specs/product-brief.md` (design authority); record in `.ai/specs/backlog.md`

## Steps
1. Read config, the GitHub tracker descriptor, `SDLC.md` (no Definition of Ready section), the brief, `backlog.md`, and issues #11, #12, #13 and #18.
2. Readiness: not met. Target group rests only on `[ASSUMPTION]` (A01). Goals' outcome and metric are proposals (Q02, Q03). Q07 is open and blocking. D05 (active) holds implementation planning until the gardener interviews are done.
3. Research variant: E01 #11 with T01 #18, T02 #12 (closed) and T03 #13 already covers every open collection-plan entry. The remaining gaps (Q03, Q07, Q08) are owner questions for `om-discover --refresh`, so no new ids or tasks were needed.
4. Drift: D10/R07 postdated the last E01 refresh. Told to proceed without confirmation, I treated this as a sync of a recorded owner decision. Added D10 to #11's *Decisions in play*. Marked R01 superseded on #13 and added R07 and D10. Verified the source/id pairs and that neither issue was claimed before editing.

## Results
- Tracker: #11 and #13 bodies updated (Decisions in play only). Nothing created.
- `backlog.md`: dated note added to this source's section.
- No implementation tree filed.

## Open issues
- Implementation backlog waits for #18 (D05 interviews), #13 (A04 layout) and Q07, then `om-discover --refresh`.
- `SDLC.md` lacks a Definition of Ready. `om-setup-discovery-pipeline` would add it.

## Follow-up — unblocking kit (user: "przygotujmy to")
- Added `research/templates/interview-guide-last-season.md` (script for #18: last-season episodes first, no app until part 4, paper flow with H01–H06, a Guide checks block for each note).
- Added `research/templates/interview-synthesis.md` (A01 threshold set by the owner before interviewing, Q07 due/done/how tally with consequences for D07 item 1 and R05, D07/D08/D09 review triggers, hand-off to `om-discover --refresh`).
- Linked both from the brief's collection plan and in a comment on #18.
- Owner-only, still open: the A01 threshold, task cards A/B for H04 (from the owner's D04 entry), the interviews themselves, the A04 layout (#13), and the D05 alternative (b) if no gardener is available.

## Follow-up — om-discover --refresh (third pass, status only)
- No new material: no interview notes (#18), no layout (#13), no open spec PRs with resolved assumptions.
- Asked one round (D05 reach over foundations, A01 threshold, Q08). The user told the agent to proceed without answering, so nothing was decided: Q10 and Q11 were added as open blocking questions, the agent's Q10 recommendation was recorded as a proposal, and Q08 was marked asked again.
- Brief: header pass line, Coverage corrected 45 → 47 (R07, D10 rows; no new evidence), sources (D10, kit, draft specs), Decision summary Next, A01 smallest test, DoR addendum (D04–D10, Q10, Q11).
- Skeptic: run inline (no subagent). One correction: Q10 now notes that spec A's gate answer (Q3) approved design, not a D05 release.

## Follow-up — om-discover --refresh (fourth pass: owner decisions)
- The owner broke the loop: no interviews with other gardeners are possible in a solo project. Recorded D11 (build for the owner's and family gardens; supersedes D05; A01 accepted untested). Q08 answered (own, mother's and grandmother's gardens). Q10 and Q11 moot.
- The owner answered Q07 → D12 (task list of what needs doing and when, plus tasks the gardener adds; AI support within D08/N02; marking done not chosen) and Q03 → D13 (the owner's own hands-on test). Added R08 (gardener-added tasks are stored user data).
- Brief: Coverage 53 (42 sourced, 11 assumed); collection plan down to 1 entry (A04). Readiness met by the brief's own check for the narrowed target group. `SDLC.md` has no DoR.
- Skeptic inline: D12's reading of "zlecana przez ogrodnika" as user-added tasks is flagged as the agent's reading.
- Left for later: #18 is obsolete (discover is tracker read-only). Specs A/B status lines still mention the D05 gate. Next step: `om-backlog .ai/specs/product-brief.md --dry-run`.

## Follow-up — om-discover --refresh (fifth pass: independent review)
- No new material since the fourth pass.
- Ran the fresh-context skeptic that the fourth pass skipped. It returned 3 critical and 6 warning findings.
- Corrected from sources:
  - recorded the owner's "hypothetical" remark in the evidence basis and readiness
  - restored "agent's reading" on D12/R08 and attributed derived tasks to D07
  - made the Q08 source pass consistent
  - fixed stale references: Now item 1's task list, Sources D01–D13, lapsed triggers on D01 and D07–D09 (also noted in those records), A01, H01/H03/H05
  - set the A04 deadline to grid Phases 2–4
  - added R08 to the `AGENTS.md` conflicts
  - narrowed the user outcome to the owner's garden
- Added owner questions Q12 (meaning of "zlecana"), Q13 (AI-suggested tasks in MVP?), Q14 (D13 revisit condition), and Q15 (concept owning stored tasks, for the spec).
- The owner told the agent to proceed without answering, so Q12–Q14 stay open in the brief and no decision changed. Next step: `om-backlog .ai/specs/product-brief.md --dry-run`. The story of gardener-added tasks waits on Q12.

## Follow-up — om-discover (sixth pass: owner answers Q12–Q15)
- Q12 and Q15 → D14: gardener-added operations, planned or already done, in a separate list, one operation for many plantings. R09 supersedes R08. D12 is superseded in part.
- Q13 recorded as delegated to the agent (proposal: AI-suggested tasks Later; an alternative reading is recorded). Q14 skipped.
- A focused independent skeptic found 1 critical issue (R09 made the Q13 proposal binding) and 6 warnings; all were corrected. New Q16 (notes on operations; one list for planned and done work), non-blocking for the backlog.
- Coverage 55 (44 sourced, 11 assumed). No question blocks the backlog. Next: `om-backlog .ai/specs/product-brief.md --dry-run`.
- Q16 confirmed by the owner ("jesli dziennik to zadanie to dla mnie jest to okej"): one list for planned and done work, no notes or photos on operations; the D09 journal stays Later. D14, the brief rows and the interview addendum were updated. Inline check only (small change). Coverage unchanged at 55.

## Follow-up — om-backlog filing run (implementation tree)
- Dedupe: no duplicates. #8 (landing page, closed) is unrelated. Ids E02–E05 were free.
- The owner had seen the full dry-run tree and told the agent to proceed without confirming; treated as the step-4 yes. Closing #18 was taken as the default, per D11.
- Filed 19 issues through `om-prepare-issue`'s procedure (REST create with labels, label-rationale comment, overlay footer):
  - E02 #19, E03 #20, E04 #21, E05 #22
  - stories #23–#30 and #37
  - tasks #31–#36
- Epic checklists were written on #19–#21. Every issue's source/id pair was verified.
- #18 was commented and closed as not planned (superseded by D11). The E01 (#11) checklist and Decisions in play were refreshed.
- `backlog.md` now has the implementation tree in this source's section; E01 rows are kept and E01-T01 is reserved.
