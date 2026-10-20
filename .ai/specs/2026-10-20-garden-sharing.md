# Garden sharing: a garden owner gives another account access to one garden

- **Status:** skeleton, waiting at the Open Questions gate. Nothing below is approved.
- **Date:** 2026-10-20
- **Origin:** the owner's note on issue #23 (E02-S01): "you should be able to share gardens with other users if you want".
- **Builds on:** [`2026-10-20-app-primitives.md`](2026-10-20-app-primitives.md) (spec A). Its Phases 4–5 (auth, owned gardens) remain the design authority for #23 and are not changed by this spec.
- **Conflicts with (active):** N03 (no sharing or multi-tenancy), D11 ("each private"), `AGENTS.md` Product scope ("sharing/collaborative gardens … do not build or scaffold"), and #23's acceptance criterion "no endpoint or screen shares a garden or invites another user". This spec can't be approved until a superseding decision is recorded.

## 📝 TLDR

**Who:** the owner and the family members whose gardens D11 covers (mother, grandmother). **Today:** every garden has exactly one owner, and spec A makes it invisible to everyone else (404). **Proposed (future behavior):** a garden's owner can give one or more existing accounts access to that garden, and can take the access back. Shared gardens appear in the member's garden list beside their own. **Why:** the owner tends the family gardens alongside their own, so the person who plans a garden is not always the person who owns its account.

## ❓ Open Questions (gate — answer before design continues)

- **Q1 — Scope decision.** Sharing reverses N03 and the "each private" part of D11. Do you approve recording **D15**, which supersedes N03 for garden sharing only (social features, roles beyond garden membership and multi-tenancy stay out), plus the matching `AGENTS.md` and standards edits in the first implementing PR? (yes / no — keep it Later)
- **Q2 — When.** Now, added after spec A Phase 5 and before Now item 1 (calendar and task list, D07), which spends part of the 25 hours (D06)? Or Later, after the three Now items? *(recommended: Later. The owner can test the MVP (D13) on their own account first)*
- **Q3 — One spec or folded in.** Sharing works without sign-in changes beyond spec A, and spec A works without sharing. Keep it as this separate spec, and keep #23 as is (with its "no sharing" AC rewritten to point here)? *(recommended: separate)*
- **Q4 — Access level.** (a) every member can edit, (b) every member can only view, (c) the owner picks view or edit per member. *(recommended: (a), one level. The family plants together, and stale writes are already rejected with 409)*
- **Q5 — How access is given.** (a) the owner types the email of an **existing** account and access is granted at once, with no email sent; (b) a share link the other person opens while signed in. *(recommended: (a). No email infrastructure, no link that can leak. Its cost: see the enumeration risk below)*

## 📝 Problem Statement

The only problem account is the owner's (D11): with many plants it is easy to lose track of what to do and when. The owner knows three gardens first-hand: their own, their mother's and their grandmother's. Under spec A each of them needs its own account, and only that account can see or edit the garden. So either the owner signs in as a family member, which means a shared password, or the family member keeps no plan at all. The note on #23 is the only evidence of the need. It has no episode or frequency, so it counts as an owner decision, not a researched problem.

## 📝 Proposed Solution (direction only, detailed after the gate)

- A `garden_members` join (`garden_id`, `user_id`, plus a role if Q4 = (c)). The owner stays on `gardens.owner_id`, so the owner never appears as a member and can't remove themselves.
- Access is resolved through the garden, as spec A requires. Spec A's single owner filter per entity (`ownedBy.garden(userId)`) becomes an **access filter**: owner **or** member. Because spec A writes "resolved through the garden" exactly once, sharing changes that one place and not every service. Owner-only actions (delete the garden, manage members, rename if Q4 says so) keep the strict owner filter.
- Concurrent edits by two people are what the existing bed `version` check (409, reload) is for. No new conflict model is needed.
- **AI (D08):** a member who asks about a shared garden sends only that garden's data. Questions count against the **asker's** quota (R06).

## 📝 Risks & Impact Review (initial)

- **Account enumeration.** Under Q5 (a), "grant access to `x@…`" reveals whether that account exists, which goes against the generic-auth-error rule. One mitigation: the response is the same whether the account exists or not, and the member list shows only accepted members. That makes it pending-acceptance, so it is more surface. Decided after Q5.
- **Fail-closed regressions.** Widening the access filter is the riskiest change in the codebase: one wrong `or` exposes every garden. The design needs tests that a non-member gets 404 on every garden, bed and planting route, plus a revocation test (access ends on the next request, not after the JWT expires).
- **Contract changes:** a new table and migration, new member endpoints, and the `GardenDto` gains `role`/`isOwner`. `BACKWARD_COMPATIBILITY.md` must list the member endpoints once they ship.

## 📝 Decisions in play

- **N03** (no sharing): proposed to be superseded **for garden sharing only** by D15. Owner: project owner. Approval: Q1.
- **D11** (owner and family gardens, each private): the "each private" reading changes. Each garden is private to its owner **and the members the owner adds**. Owner: project owner.
- **D06** (25 h) and **D07** (Now order): affected by Q2.
- **D13** (owner's own test): unaffected under Q2 = Later.
- **R06** (AI rate limit): per user, unchanged.
