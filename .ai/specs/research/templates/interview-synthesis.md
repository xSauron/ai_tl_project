# Interview synthesis — D05 gardeners, {date}

Combines the 2–3 interview notes from E01-T01 (#18), each written with `interview-guide-last-season.md`, into what `om-discover --refresh` needs: a result for A01 (and so D01), an answer to Q07, and the review triggers in D07, D08 and D09. Save the filled copy as `.ai/specs/research/{date}-interview-synthesis-d05.md`.

## Set before the first interview

Write the threshold down **before** any interview, so the result can't be read to fit afterwards. The brief doesn't set one, and that choice belongs to the owner.

- A01 holds if: {for example "at least 2 of 3 describe, unprompted, a missed or mistimed task, or companion or pruning trouble"}
- A01 fails if: {for example "at most 1 of 3 does, and the others describe other problems"}
- Written by the owner on: {date}

## Per interview

| Note | Role | Bushes/trees | Unprompted: missed/mistimed task | Unprompted: companions | Unprompted: pruning | Other problems they raised |
|---|---|---|---|---|---|---|
| `interviews/…` | | | | | | |

Count only answers given **before part 4** (the paper flow). Prompted answers go in the note but not in this table.

## A01 → D01

- Result against the threshold above: holds / fails / mixed
- Supports D01 (MVP aims at the most common problems) or revisits it. If it fails, list the problems they did describe. Those are the input for a new Now.
- Limit to state in the brief: the interviewees are people the owner knows (D05), so this shows that the problem exists, not how widespread it is.

## Q07 — what "losing track" means

| Episode | Note | Class (due / done / how / other) | Cost |
|---|---|---|---|
| | | | |

What each majority means for Now item 1 (D07). These are consequences for the owner to decide on, not decisions:

- **due**: a list of upcoming tasks with dates is the answer. Item 1 stands as decided.
- **done**: the list needs a way to mark a task done. R05 stores only user overrides, so recording completions needs a new rule or an owner decision before the task-list spec.
- **how**: knowing *when* doesn't help without *how*. Item 1 gives only when. *How* comes from Now item 3 (the AI answer, D08), which D07 cuts first, or from how-to text in the catalogue entries (D04). The cut order in D07 should be reviewed.
- **mixed / other**: write out what they said. The owner decides the shape in `om-discover --refresh`.

## Review triggers

| Trigger | Where it is set | Seen? (unprompted / prompted / no) | Notes |
|---|---|---|---|
| Spraying named unprompted | D09 | | |
| Lost notes named unprompted | D09 | | |
| Anything that changes the Now order | D07 | | |
| Anything that bears on the AI answer (how-to questions, trust in suggestions) | D08, A05 | | |

## Hypotheses (paper flow, part 4)

| Id | What was seen | Notes |
|---|---|---|
| H01 | where they hesitated or would stop | |
| H02 | tree/bush on the grid | |
| H03 | advice used for placement | |
| H04 | task card A vs B | |
| H05 | how they knew their frost dates | |
| H06 | marking done | |

Each item seen in only one interview stays a lead, not a finding.

## For `om-discover --refresh`

- Tag interview claims `[INTERVIEW]`, by role and date, and link the notes.
- Update A01's Result, Q07's Status, and the Target group line.
- Note which D07/D08/D09 triggers fired.
- Then `om-backlog .ai/specs/product-brief.md` can check readiness again. The other gate is A04 (#13).
