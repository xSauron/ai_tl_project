<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Workflow Metadata (`.ai/`)

All AI agents (Claude Code, Codex, Grok, etc.) MUST use the `.ai/` folder as follows. This is mandatory, not optional.

```
.ai/
├── specs/              # Specifications for Spec-Driven Development (SDD)
│   ├── implemented/    # Specs whose implementation has shipped
│   └── archive/        # Abandoned, superseded, or obsolete specs
├── runs/               # Logs of autonomous AI runs
├── lessons.md          # Index of lessons learned (long-term memory)
└── lessons/            # Detailed lesson notes linked from lessons.md
```

All dated files use the naming `YYYY-MM-DD-slug.md` (ISO date, lowercase kebab-case slug), e.g. `2026-10-13-user-auth.md`.

## Specs (`.ai/specs/`)
- Non-trivial features/changes start with a spec (SDD). Before implementing, look for an existing spec in `.ai/specs/` and follow it; if the code must deviate, update the spec first.
- Active specs live in `.ai/specs/`. When the implementation ships, move the spec to `.ai/specs/implemented/`. When abandoned or superseded, move it to `.ai/specs/archive/` with a note explaining why.

## Runs (`.ai/runs/`)
- Every autonomous run MUST create a log `.ai/runs/YYYY-MM-DD-slug.md` at the start and keep it updated: goal, related spec, steps taken, key decisions, results, open issues.
- Never overwrite another run's log; if the slug exists for the same day, pick a more specific slug.

## Lessons (`.ai/lessons.md` + `.ai/lessons/`)
- Read `.ai/lessons.md` before starting work.
- After fixing a bug, finishing a run, or finding anything worth remembering (pitfalls, conventions, improvements), append an entry to `.ai/lessons.md` using the format described there.
- Put long-form detail in `.ai/lessons/YYYY-MM-DD-slug.md` and link it from the entry.

## Rules
- Do not store specs, run logs, or lessons anywhere else.
- Do not modify other tool-owned folders under `.ai/` (e.g. `.ai/cezar/`).
- Use today's date for new files; never invent dates.

# Working Principles

Distilled from [Boris Cherny's Claude Code tips](https://github.com/ykdojo/claude-code-tips/blob/main/content/boris-claude-code-tips.md).

1. **Plan before you build; re-plan when it goes sideways.** For any complex task, start by planning: write or refine the spec in `.ai/specs/` until the implementation can be done in one pass. If the work drifts or keeps failing, stop and re-plan instead of pushing through.
2. **Turn every correction into a rule.** When a human corrects you, or you find your own mistake, record it right away in `.ai/lessons.md`. If it is a project-wide rule, add it to this file. Never make the same mistake twice.
3. **Own bugs end to end.** Given a bug report, failing test, or red CI, find the root cause from logs and code, fix it, and verify the fix (run tests, lint, and build). Do not ask the human to show you how. Leave a regression test and a lesson entry.
4. **Prefer the elegant solution over the first patch.** Once a fix works, ask: "Knowing everything I know now, is there a cleaner way?" If there is, replace the hack instead of piling on more. Specific specs reduce ambiguity, so resolve open questions before coding.
5. **Automate what repeats.** If a workflow is done more than once a day, capture it as a skill or command (`.claude/skills/`, `.agents/skills/`) and commit it, so every agent reuses it instead of redoing it.

