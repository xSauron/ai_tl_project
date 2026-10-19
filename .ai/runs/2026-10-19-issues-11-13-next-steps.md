# Run — next steps for issues #11, #12, #13 and branch cleanup

- **Date:** 2026-10-19
- **Goal:** move E01 (#11) forward: consolidate the duplicate docs PRs, land the #12 deliverable, close what is done, and remove unused branches.
- **Related spec:** none owed. Design authority is `.ai/specs/product-brief.md`.

## Steps
1. Compared PR #14 (`docs/issue-12-discovery-research`) with PR #15 (`docs/issue-11-discovery-material`) blob by blob. #14 is a superset (it adds D04, D03 superseded, brief updates). #15 has only one extra item, the SSL push lesson, which was copied into #14.
2. Added a lesson on the duplicate PRs. Closed #15 as superseded by #14.
3. Branch cleanup: on GitHub only `main` and the two PR branches were left. Locally, `git fetch --prune` dropped 8 stale `origin/*` refs. Deleted 5 local branches whose tips equal (or are ancestors of) their merged PR heads, and removed the stale `.ai/tmp/pr5-merge-main` worktree. Turned on the repository setting `delete_branch_on_merge`. `cez/*` branches and the worktrees belong to cezar tasks and were left alone.
4. Reviewed #14 (docs only, no code or schema) and merged it once CI was green. Closed #12 (D04 answers Q01).

## Open
- #13 needs the owner's real garden layout (bed rows × cols, tree and blueberry positions).
- #11 closes after #13 and `om-discover --refresh`.
- A01 (target group) is untested and still blocks implementation readiness.
