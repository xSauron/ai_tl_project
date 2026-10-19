# Run — om-auto-fix-issue on #13 (garden layout on the grid)

- **Date:** 2026-10-19
- **Goal:** move E01-T03 (#13) as far as possible without the owner's input.
- **Related spec:** none owed. Design authority is `.ai/specs/product-brief.md` (A04, R01, N01, D02).

## Steps
1. Concurrency check: no assignee, no `in-progress` label, no open PR referencing #13.
2. Classification: neither a bug nor a feature request. It is a research task, so the bug chain's triage gate and the feature route don't apply.
3. The owner's garden data (bed sizes, tree and blueberry positions, shade) is not on the issue, even though it was asked for twice. The user told the agent to continue autonomously.
4. Added `research/templates/garden-layout.md`: a fill-in sheet with beds, plantings as whole-cell rectangles, seven cases to check against A04 (all derived from R01/N01/D02, not invented data) and a verdict section.

## Decisions
- **No layout invented.** A made-up garden would fake the evidence that A04 is waiting for, so the note itself is still owed.
- The PR uses `Refs #13`, not `Closes`. The issue's acceptance criteria need the real layout.

## Open
- Owner: fill in the template with the real garden (a sketch or photo is enough). An agent then writes `research/YYYY-MM-DD-grid-fit-owner-garden.md` and closes #13.
- After that, `om-discover --refresh` updates A04, and #11 can close.
