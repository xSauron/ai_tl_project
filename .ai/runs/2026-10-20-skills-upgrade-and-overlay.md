# Run: commit uncommitted skills upgrade and repo-local overlay

- Goal: land files left uncommitted in the primary checkout after the om-* skills upgrade.
- Contents: updated `.agents/skills/*` (om-create-skill, om-setup-agent-pipeline, om-synthetic-users, om-ux-review-pr, om-ux-setup, om-ux-shape), refreshed hashes in `skills-lock.json`, and the repo-local cosmetic overlay `.ai/skills/om-prepare-issue/SKILL.md`.
- Not included: spec/decision/run files (already in PR #38); `packages/core/src/migrations/.snapshot-open-mercato.json`, an untracked generated snapshot from a differently named database (the tracked one is `.snapshot-plant_ai.json`), left alone for the owner to delete or explain.
