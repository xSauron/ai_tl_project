# Data request — catalogue source for timing, companion relations and pruning windows, requested 2026-10-19

- Question it answers: Q01 / A03 in `product-brief.md`. Where do catalogue facts for vegetables, berry bushes and fruit trees (timing, companion relations, pruning windows) come from, under what licence, and who checks them? Tracked in issue #12 (E01-T02).
- Source system and owner: public or licensed plant datasets (candidates below). The project owner chooses; someone qualified in horticulture checks.
- Filter and period: species in the MVP catalogue (vegetables, berry bushes, fruit trees per D02). Each candidate's licence was read on 2026-10-19.
- Format and where to drop it (this directory): this note. The owner's choice goes into a decision record under `research/decisions/`. Seed files are out of scope here; they go in `packages/db/src/seeds/` later.
- Personal data present? How it is reduced before it lands here: none. The candidates are plant reference data. Growstuff's member planting logs would carry personal data, but that candidate is rejected below.

## How this was checked

Licence pages and repositories were fetched on 2026-10-19 with `curl` and `gh api` from the agent sandbox. Quoted licence terms are what those pages said on that date. **Not verified** means the page could not be read from the sandbox, so the claim rests on general knowledge and the owner must confirm it. No dataset was downloaded or copied.

Rejection rules (from issue #12 and `AGENTS.md`):
- No stated reuse licence → reject.
- Derived from another planner or gardening app → reject. Planter is excluded outright.
- Share-alike or non-commercial terms → not rejected, but flagged, because they bind the seed files we would publish.

## Candidates

Coverage key: ✅ usable data · ◐ partial or sparse · — none.

| # | Candidate | Licence (as stated) | Link | Veg timing | Bushes | Trees | Companions | Pruning | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Trefle (botanical API) | Compilation **CC-BY-4.0**. "Individual records aggregate facts from upstream sources … each upstream source keeps its own licence." Attribution: "Data: Trefle.io (CC-BY-4.0)" | https://trefle.io/about · fields: https://docs.trefle.io/docs/advanced/plants-fields | ◐ `days_to_harvest`, `sowing` text, `row_spacing`, `growth/fruit_months` (coverage per crop not checked) | ◐ taxonomy, fruit months | ◐ taxonomy, fruit months | — | — | **Shortlist** for taxonomy, spacing and days-to-harvest. Check the upstream licence of every record we use. |
| 2 | Wikidata | **CC0** for structured data | https://www.wikidata.org/wiki/Wikidata:Licensing | — | ◐ taxonomy only | ◐ taxonomy only | — | — | **Shortlist** for stable species ids and names (including Polish labels). No horticultural facts. |
| 3 | FAO EcoCrop (GAEZ) | FAO site terms: content "may be copied … for private study, research and teaching purposes, and for use in non-commercial products or services", with citation. Commercial use needs an FAO licence. | https://gaez.fao.org/pages/ecocrop · terms: https://www.fao.org/contact-us/terms/en/ | ◐ crop cycle length and temperature ranges, not sowing windows | ◐ | ◐ | — | — | **Conditional.** Non-commercial terms fit the MVP (no payments, N03). Revisit if the product ever charges. Useful as a cross-check, not as the main timing source. |
| 4 | USDA PLANTS | US federal work, generally public domain (**not verified**: the about page gave no licence text from the sandbox) | https://plants.usda.gov/ | — | ◐ taxonomy, US-centric | ◐ taxonomy, US-centric | — | — | **Not shortlisted.** Adds nothing beyond Wikidata/Trefle for a Polish garden. |
| 5 | OpenFarm | Data **CC0** ("All data within the OpenFarm.cc database is in the Public Domain"). Servers shut down in April 2025; repository archived. | https://github.com/openfarmcc/OpenFarm | ◐ crowd-sourced growing guides | ◐ | ◐ | ◐ crowd-sourced | — | **Rejected.** The service is gone, no data dump was found in the repository, and the crowd-sourced guides were never checked. Borderline on the "another gardening app" rule. |
| 6 | Growstuff | **CC-BY-SA** (stamped on its CSV exports); code AGPL-3.0 | https://github.com/Growstuff/growstuff | ◐ member planting/harvest logs | ◐ | ◐ | — | — | **Rejected.** It is another gardening app's crowd-sourced member data, and the logs carry personal data. |
| 7 | Permapeople | API data **CC BY-SA 4.0**, has a companion-plants endpoint | https://permapeople.org/knowledgebase/api-docs.html · sources: https://permapeople.org/knowledgebase/data-acknowledgement/ | ◐ | ◐ | ◐ | ◐ | — | **Rejected.** The licence chain is unclear. Its acknowledgement page names Plants for a Future (whose own site now says its text is copyrighted, see #8) and Kew ("must not use any part of the content … for commercial purposes without obtaining a licence"). It is also a grower community app, and share-alike would bind our seeds. |
| 8 | Plants For A Future (PFAF) | "The information on this site is copyrighted by Ken Fern/Plants for a Future (1995-2026)." No reuse licence for the text; images CC BY-NC-ND. | https://pfaf.org/user/cmspage.aspx?pageid=136 | ◐ | ✅ broad perennial coverage | ✅ | ◐ | ◐ | **Rejected.** No stated licence for reusing the text or data. |
| 9 | Polish official integrated-production methodologies (*Metodyki integrowanej produkcji*, approved by PIORiN, prepared by IO-PIB) | **Not verified.** piorin.gov.pl failed TLS verification from the sandbox, and the gov.pl page gave no readable text. They may count as official materials excluded from copyright (Polish Copyright Act art. 4), but that needs a legal check. | https://www.gov.pl/web/piorin · https://www.inhort.pl/ | ◐ field vegetables | ◐ e.g. currants, blueberry (if published) | ◐ e.g. apple, cherry (if published) | — | ◐ commercial-orchard pruning, not home-garden | **Open.** Promising as a *cited primary reference* for Polish timing and fruit pruning. The owner must confirm availability and licence status. |
| — | Planter (planter.garden) | — | — | — | — | — | — | — | **Excluded** by `AGENTS.md`: never copy its data. |

## Coverage against D02

No candidate with a clean licence covers **companion relations** or **pruning windows**. Gaps for the shortlisted set (Trefle + Wikidata, with EcoCrop as a cross-check):

- **Pruning windows (bushes and trees):** no open dataset found. This is the gap that A03 feared. Shortlist coverage: none.
- **Companion relations:** no dataset with a clean licence. Permapeople and OpenFarm, the only ones with companion data, are rejected above. Shortlist coverage: none.
- **Berry-bush and fruit-tree timing:** sparse (`fruit_months` only). Planting-out and pruning months for a Polish climate are missing.
- **Vegetable sowing and planting-out windows relative to frost dates:** partial. Trefle gives days-to-harvest and sowing text, not frost offsets (weeks before or after last frost), which `services/calendar/` needs.
- **Polish names and varieties:** Wikidata labels cover names only; varieties are not covered.

## Proposed answer to Q01 (for the owner to decide)

The owner curates a small catalogue and cites the source of every fact. Open datasets only back it up:

1. **Identity and taxonomy** come from Wikidata (CC0), with the Wikidata QID as the stable reference.
2. **Spacing and days-to-harvest** come from Trefle (CC-BY-4.0) where a record exists and its upstream licence allows reuse. The `source` field names the record, and Trefle is credited in the app.
3. **Frost offsets, companion relations and pruning windows** are written by the owner from published references: books, official methodologies (#9 once verified) and extension-service guides. Each fact gets a bibliographic citation in `source`. Facts themselves are not copyrightable, but copying a substantial part of one database is restricted under the EU database right (Directive 96/9/EC). So entries are compiled from several references and never bulk-copied from one.
4. **Checking:** the owner (a trained gardener) authors the entries. A second person qualified in horticulture checks every pruning entry before it ships, because a wrong cut can kill some plants (*Prunus* in the owner's account). If no second checker can be found, the owner checks pruning entries alone, and the decision record says so as an accepted risk.

**Consequence for scope (A02, A03):** pruning and companion data become authoring work for the owner, not an import. Its cost should be estimated against the 25-hour budget (Q04). If it does not fit, this supports cutting pruning windows from Now. That is the owner's call under D02.

## Outcome

The owner accepted the proposal above in full on 2026-10-19 and will check pruning entries alone, as an accepted risk. Recorded as `decisions/D04-catalogue-source-owner-curated.md`, which supersedes D03.

Still open: confirm the availability and licence status of the PIORiN/IO-PIB methodologies (#9) before citing them.
