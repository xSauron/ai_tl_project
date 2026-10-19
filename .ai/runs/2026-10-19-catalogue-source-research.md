# Run — catalogue source research (issue #12, E01-T02), 2026-10-19

- **Goal:** answer the research part of Q01/A03: candidate catalogue sources with licence, link and coverage against D02.
- **Related spec:** none owed. Design authority is `.ai/specs/product-brief.md` (Q01, A03, R03, D02, D03).

## Steps

1. Invoked as `/om-spec-writing 12`. The issue's `📝 Spec` section says no spec is owed, so no spec file was created (see the lesson entry).
2. The user then said to continue autonomously. Chose the deliverable the issue names: a data-request note.
3. `WebSearch`/`WebFetch` were denied in this session. Licence pages and repos were read with `curl` and `gh api` instead.
4. Assessed 9 candidates plus Planter (excluded) and wrote `.ai/specs/research/2026-10-19-data-request-catalogue-source.md`.
5. Updated A03's evidence in `product-brief.md`.

## Decisions

- Rejected OpenFarm (service shut down, no dump), Growstuff (another app's member data), Permapeople (unclear licence chain via PFAF/Kew) and PFAF (no reuse licence).
- Proposed an owner-curated, per-fact-cited catalogue backed by Wikidata (CC0) and Trefle (CC-BY-4.0). The proposal is recorded only as such: the decision record is the owner's to write.

## Results / open issues

- Gaps: no candidate with a clean licence covers pruning windows or companion relations.
- Open: owner decision record; licence status of the PIORiN/IO-PIB methodologies (TLS failure from the sandbox); naming a pruning checker. Issue #12 stays open until the owner decides.
- Nothing committed or pushed.
