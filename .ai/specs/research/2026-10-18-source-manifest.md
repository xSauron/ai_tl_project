# Plant.AI: input for om-discover, packed 2026-10-18

What this is: the material the project owner gathered before anyone runs `om-discover`. Only what existed before the skill: three interviews, the board exported frame by frame, one survey, one benchmark, and the two decisions already taken. Nothing the skill writes is here.

**Read this first: course exercise material.** Plant.AI is a hobby project in the AI Tech Leaders course. The interviews, the survey and the workshop notes below are illustrative, written to practise the discovery flow in the shape of the DevMentor pack; they are not recordings of real people. Treat every claim in them as `[ASSUMPTION]` until it is checked with a real gardener. The benchmark is the exception: it restates what the Planter listing showed on the date checked.

Not included, on purpose: `product-brief.md` (the skill writes it); the DevMentor-only files (mentor list, Discord export, payout and revenue boards, RACI, stakeholders, five mentoring benchmarks), which have no Plant.AI equivalent yet; `research/templates/` (the skill hands them out).

How to use it, from an empty folder:

```
mkdir -p ~/Documents/plantai-clean && cd ~/Documents/plantai-clean && unzip -q ~/Downloads/plantai-om-discover-input-2026-10-18.zip && git init -q && git add -A && git commit -q -m "Research material for discovery" && claude
```

Then, in Claude Code: `/om-discover "Plant.AI" --mode own --quick`

Files (14):

- .ai/specs/research/2026-10-14-interview-allotment-beginner.md
- .ai/specs/research/2026-10-14-workshop-export.md
- .ai/specs/research/2026-10-15-interview-raised-beds-experienced.md
- .ai/specs/research/2026-10-16-interview-balcony-grower.md
- .ai/specs/research/2026-10-16-miro-board-journey-current-state.md
- .ai/specs/research/2026-10-16-miro-board-product-goals.md
- .ai/specs/research/2026-10-16-miro-board-vision-target-needs.md
- .ai/specs/research/2026-10-16-miro-board-vpc-gardener.md
- .ai/specs/research/2026-10-17-benchmark-planter.md
- .ai/specs/research/2026-10-18-source-manifest.md
- .ai/specs/research/2026-10-18-source-readme.md
- .ai/specs/research/2026-10-18-survey-fb-group-planning.md
- .ai/specs/research/decisions/N01-grid-only.md
- .ai/specs/research/decisions/N02-ai-proposes-user-applies.md
