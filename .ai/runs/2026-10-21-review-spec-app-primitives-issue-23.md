# Run: architectural review of the app-primitives spec for issue #23

- **Goal:** the task input was "23". Read as issue #23 (E02-S01, sign-in and private gardens). The issue names `.ai/specs/2026-10-20-app-primitives.md` (Phases 0–5) as its design authority, so no new spec was written. Ran an `om-spec-writing` review instead.
- **Related spec:** `.ai/specs/2026-10-20-app-primitives.md`
- **Assumption:** the user could not be asked, so review was chosen over implementation. No code and no spec were edited.

# 🔍 Architectural Review: App primitives

Proceed after small edits. The design is sound: ownership lives in the query and returns 404, the CSRF, envelope and DAL layers are coherent, and each phase is testable. The two issues that matter are a stale gate and an unlimited registration path.

## ⚠️ Decision needed

- **Is registration open?** D11 limits the audience to the owner and family, but `POST /api/auth/register` is public. Recommended: keep it open, rate-limited and capped at `MAX_USERS`, or gated by an invite env secret. Tradeoff: an open endpoint is simple but lets anyone create accounts and burn bcrypt CPU. Evidence still needed: whether the owner wants family to self-register.

## 🔍 Findings

- **Medium: the Status gate is stale.** Line 4 says the owner must lift D05 before Phase 1. The brief records D05 as superseded by D11 (2026-10-20, "no interviews"). Impact: a phantom blocker that stops `om-auto-implement-spec`. Fix: replace the ⚠ with a reference to D11 and drop the "confirm before Phase 1" requirement.
- **Medium: register is rate-limited per email only.** The Rate limiter row keys on the normalised email, and the IP is added only with `TRUSTED_PROXY_IP_HEADER`. One attacker rotating emails faces no limit, and each attempt costs a bcrypt hash at cost 12. Fix: add a global per-window cap on register, plus the registration decision above.
- **Medium: register leaks email existence through timing.** The spec has `verifyPassword` do a dummy compare for login only. Register for an existing email returns early, while a new email pays a bcrypt hash. Fix: hash the password before the existence check in `UserService.register`, and add a timing-shape test.
- **Low: contradiction in the login limit key.** The API table says "per IP + email". The limiter row says IP joins the key only behind a trusted proxy header. Fix: align the table with the limiter row.
- **Low: JWT algorithm is not pinned.** The spec checks "HS256, exp, iss" but does not require `jose`'s `algorithms: ["HS256"]` option. Fix: state it and add a test with an `alg: none` and an HS512 token.
- **Low: scope of #23.** T01 covers Phases 0–3, including the full client layer (`DataTable`, `CellGrid` designs and so on). Acceptance for #23 needs only the server, auth, the login and gardens pages, and the forms. This is not a defect. Consider splitting T01 so Phase 3 pieces without a consumer in #23 are not built early. The spec's "built with first consumer" rule already points this way.
- **Low: the garden-limit lock needs a transaction.** `FOR UPDATE` on the user row only works inside the `em.transactional` that also inserts. Say so in step 19, and test two concurrent creates at the limit.

## 🧪 Review limits

Read the spec in full. Checked the brief for D05/D11 and `gh issue view 23` and the E02 epic. Did not check `engineering-standards.md`, `BACKWARD_COMPATIBILITY.md`, the real package contents beyond a directory listing, or the spec B interfaces. Did not run any gate.
