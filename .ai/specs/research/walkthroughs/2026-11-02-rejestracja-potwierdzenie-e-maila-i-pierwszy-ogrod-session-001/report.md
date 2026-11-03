# Walkthrough: rejestracja, potwierdzenie e-maila i pierwszy ogród, `packages/app/public/prototypes/konta-i-role/index.html`, 2026-11-02

[ASSUMPTION] The personas rest on one real account (the project owner's) plus assumptions; the family-gardener seat is an assumption persona in both runs. Everything below is synthetic, a hypothesis to check, and does not satisfy the Definition of Ready.

The most consequential repeated hypothesis: after confirming the e-mail, every persona in both runs would hit the second log-in (S5 "Adres potwierdzony" → S6 with **both fields empty**) as the most irritating step, and every persona would abandon sign-up if the confirmation e-mail did not arrive quickly, because S3 has no way forward except "Wyślij link ponownie". Together with an empty garden at the end (S10), the flow asks four auth steps before showing anything for the user's garden. Real check: the owner's own test (D13) on a phone, timing the sign-up and noting where they hesitate; and the owner deciding open question L22 (session before confirmation) in the auth spec.

Stance: validate (user's choice; the brief's mode `own` defaults to adversary — friction on screens was looked for, not reasons to reject the product)
Panel: 2 runs × 2 personas; run 1: P03, P04; run 2: P05, P06
Basis: brief sections Target group, Problems, Key flows, Scope, Business rules, Non-goals, Decisions D11 and D13; `research/interviews/2026-10-19-owner-trained-gardener.md` with the 2026-10-20 addenda (`[INTERVIEW]`, the only real account); `AGENTS.md` and `prototypes/konta-ogrody/README.md` (`[PRODUCT]`). Illustrative course notes were not used (they describe segments D11 dropped). Coverage: 50 persona lines — 22 sourced, 28 assumed.
Panel snapshot: `.ai/specs/research/walkthroughs/2026-11-02-rejestracja-potwierdzenie-e-maila-i-pierwszy-ogrod-session-001/personas.md`
Session: `.ai/specs/research/walkthroughs/2026-11-02-rejestracja-potwierdzenie-e-maila-i-pierwszy-ogrod-session-001/`; subject `packages/app/public/prototypes/konta-i-role/index.html` (local build of `prototypes/konta-ogrody/`, prototype "Konta i ogrody", E02-S01), served at `http://localhost:3000/prototypes/konta-i-role/index.html`; flow "rejestracja, potwierdzenie e-maila i pierwszy ogród", mapped with the user's confirmation to a precondition of brief Key flows → Future state (the planner sits behind login, AGENTS.md); the brief has no account flow of its own.
Composition: assumed (no data gives proportions). Seat A: the owner as grower of a mixed garden (central). Seat B: a family gardener whose garden the owner tracks (D11, Q08), the indifferent seat, an assumption persona. Homogeneous by material: both seats in both runs come from one informant; there is no other corner to resample from.
Saturation: not reached; about 6 of the 21 topics in the last three interviews were new.
Parity: skipped: the only real interview note (owner, 2026-10-19 with addenda) built the personas, so none could be held out.
Elapsed: browser walk and screen capture about 15 min; personas and prompts about 10 min; four persona runs in parallel about 3 min; consolidation and report about 20 min.
Not askable of this panel: A02 (build budget; a team question), A03 (catalogue licensing; provenance), A04 (trees on the grid; no grid in this flow), A05 (AI pruning answers; no AI in this flow). A01 (growers beyond the family) was touched only through Q1–Q6, and every persona answered "no basis" for an episode.

## 🎯 Scope and limits

- **Medium:** static prototype, clicked through by the main agent with `agent-browser` at a phone viewport (390×844). Personas received the observed screen states as text (`walk-states.md`); they had no browser or network access.
- **Path walked (happy path, observed):** S1 `/` → S2 `/register` → S3 `/check-inbox` → S4 demo inbox (review-bar SC15, "Otwórz link") → S5 `/confirm-email` → S6 `/login` → S7 `/gardens` (empty) → S8 `/gardens/new` → S9 `/gardens` (one garden) → S10 `/gardens/<id>`.
- **Data typed:** only fictitious values the prototype itself offers (`kasia-ogrod@example.test`, password `demo-haslo-2027`), with the user's approval. No real credentials or personal data.
- **Observed facts given to personas, verified in the DOM:** S2 password field has no show/hide control, its hint is "Od 10 do 128 znaków.", and a too-short password shows "Hasło musi mieć od 10 do 128 znaków." only after submit. S6 e-mail field is empty after confirmation. On 390×844 the review bar takes 400–470 px, so the S2 "Masz już konto?" link and the S6 "Zaloguj się" button fall below the fold. Part of that is the prototype's toolbar, not the product.
- **Priming risk:** the screen states named some absences (no show-password control, nothing on S2 says what happens next, no frost dates or plants on S8). Personas reacting to those absences may have been cued. Each such item is still an observed fact of the prototype.
- **Screenshots:** captured for every judged state. The agent could not view images (this model has no image input), so visual judgement rests on the DOM, the accessibility tree and element positions, not on the pictures.
- **Not walked:** error states (SC03–SC17), the resend path, an expired or used link, password reset, settings, English. The prototype ends at S10 by design ("Grządki, rośliny i zadania dojdą w kolejnych historiach").

## 🔍 Barriers that repeated (worst first, ties marked)

Items 1–3 are tied (weight 4, spread 0).

### 1. Second log-in right after "Twoje konto jest gotowe", with both fields empty (S5 → S6)

[SYNTHETIC]

Weight: 4; spread: ±0; personas: P03, P04 (run 1), P05, P06 (run 2). Tied with 2 and 3.
On S5 every persona expected to be inside already ("Gotowe, a jednak nie", P05, P06; "Czemu nie wpuszcza mnie od razu?", P03). On S6 every persona expected at least the e-mail to be filled and met two empty fields plus a button below the fold on a phone. Irritation was mild to moderate on S5 and moderate to strong on S6 (P06: strong). P04 and P06 named S5–S6 as where they would most likely have stopped. Screenshots `04-s15-potwierdzenie.png`, `05-s03-logowanie.png`.
Consequence: the step sits between the user and the first garden, so the user sees nothing for their garden until after it. The prototype records this as open: L22 "czy sesja przed potwierdzeniem". Touches the brief's Key flows (the planner behind login, AGENTS.md) and D13 (the owner's own test is the success check).
Real check: in the owner's own test (D13) on a phone, note the time and hesitation between tapping the e-mail link and seeing "Moje ogrody". The owner decides L22: log in automatically on confirmation, or pre-fill the e-mail on S6.

### 2. A late confirmation e-mail ends sign-up; S3 has no other way forward

[SYNTHETIC]

Weight: 4; spread: ±0; personas: P03, P04 (run 1), P05, P06 (run 2). Tied with 1 and 3.
Under pressure P1 (the e-mail does not arrive within the minute the person will wait), every persona would tap "Wyślij link ponownie" at most once and then leave the account unfinished. That is the only pressure that flipped every persona. On S3 itself P03 and P05 called it a dead end ("ślepy zaułek", P05). P04's own success line ("finish without calling for help") would fail here. Screenshot `03-s14-sprawdz-skrzynke.png`.
Consequence: an unfinished account, and the user does not come back to the product. Touches the Key flows precondition, and the brief has no e-mail delivery service yet (the prototype README: no real e-mail port, map §4a).
Real check: in the owner's own test, record how long the real confirmation e-mail takes to arrive on the phone (once e-mail sending exists). Ask the owner whether e-mail confirmation is required before first use at all (L22).

### 3. The flow ends on an empty garden with no next step (S8–S10)

[SYNTHETIC]

Weight: 4; spread: ±0; personas: P03, P04 (run 1), P05, P06 (run 2). Tied with 1 and 2.
Every persona reached S10 and asked some form of "I tyle?" / "To wszystko?". Seat A (P03, P05) expected tasks ("kiedy przyciąć", "jaki oprysk"), and the disappointment was strong in both. Seat B (P04, P06) did not know whether the job was done. On S8 seat A expected to add plants and frost dates, and both asked whether to type their plants into "Opis". Screenshots `07-s05-nowy-ogrod.png`, `09-s11-ogrod.png`.
Consequence: the prototype declares this end on purpose, so this is not a defect of E02-S01. The hypothesis is that, if this slice ships alone, a user who finishes sign-up would see no value and no pointer to what comes next. Touches D07 (Now item 1: calendar and task list first) and D13.
Real check: the owner's own test, run only once Now item 1 is reachable from S10. Until then, ask the owner whether S10 should say what comes next. The prototype text "Tu prototyp się kończy" is not product copy.

### 4. Password: 10+ characters, typed blind, then typed again (S2, S6)

[SYNTHETIC]

Weight: 4; spread: ±0; personas: P03, P04 (run 1), P05, P06 (run 2). Ranked below 1–3 only by consequence, not by weight. On weight alone it is tied with them.
Every persona noticed there is no way to see the password. P04 and P06 reacted to the length ("Dziesięć znaków?!", P06), and P05 to typing it outdoors on a phone. Typing it again on S6 made it worse. The prototype records password rules as open (L12: "wymagania hasła, „powtórz”, „pokaż”"). Possible priming: the screen state named the missing control.
Real check: the owner's own test on a phone, noting mistyped passwords. The owner decides L12.

### 5. Nothing on S2 says how many steps follow or what happens after "Załóż konto"

[SYNTHETIC]

Weight: 4; spread: ±0; personas: P03, P04 (run 1), P05, P06 (run 2). On weight, tied with 1–4.
All four said on S2 that they did not know what would happen next. Under pressure P2 (told in advance about the second log-in), three of four kept going, and P04 said "wiedza z góry raczej pomaga". P06 is the exception (see Outliers). Possible priming: the screen state named this absence.
Real check: in the owner's test, ask before S2 how many steps they expect before seeing their garden, then compare with what happens.

## 📋 Missing cases that repeated

The family-gardens case (P04, P06) is reported once, as Contradiction 1, because it has one check.

- **Plants, trees and frost dates cannot be entered when a garden is created (S8).**

  [SYNTHETIC]

  Weight 2, spread ±0; P03 (run 1), P05 (run 2). Both expected S8 to ask about plants (the *Prunus* tree) and frost dates, and both considered typing plants into "Opis". Declared out of scope for E02-S01. This is the same gap as Barrier 3, seen from the form.
  Real check: in the owner's test, see what they type into "Opis". If they list plants, that is a signal the description field is being used as a stand-in for the plant list.

## ⚠️ Contradictions with the brief

1. **The prototype models family members as separate account owners; the brief says the owner tracks the family gardens.**

   [SYNTHETIC]

   Weight 2, spread ±0; P04 (run 1), P06 (run 2). The brief's Target group: "the owner's own garden and the family gardens they know first-hand … the account of the family gardens is the owner's" (D11, Q08). The prototype's demo accounts give the mother (`ewa`) and the grandmother (`ola`) their own accounts, and the owner gets a 404 on the mother's garden (#23/AC2). Under N03 (no sharing), a family member who registers creates a garden the owner cannot see, which defeats the reason seat B registered. Both family-gardener personas asked how the person tracking their garden would see it (S1, S2, S8, S10), and P04 expected the garden to be on S7 already. Grounding: "doing it because asked" (assumption) and "gardens are not shared between accounts" (`[PRODUCT]` AGENTS.md, N03).
   Real check: an owner decision rather than an interview. Either the family gardens live in the owner's account (and the `ewa`/`ola` demo accounts only illustrate ownership checks), or family members register and N03 needs revisiting. This bears on D11 and N03.

2. **The landing headline promises a grid; the brief puts timing first.**

   [SYNTHETIC]

   Weight 2, spread ±0; P03 (run 1), P05 (run 2). Both grower personas read "Zaplanuj ogród, metr po metrze." as drawing beds and said it does not fit a tree ("brzmi jak rysowanie grządek, a nie jak terminy", P05). The brief's Problems and D07 put the calendar and task list first, with beds second. The sub-line "Wiedz, co i kiedy zrobić" did match what they expected. The prototype marks the landing copy as open (L17), and the real landing page is a separate design system.
   Real check: ask the owner which line their own test should start from. This bears on D07 and L17.

## 🔍 Outliers

**P06 (run 2, grandmother seat, assumption persona) would abandon under every pressure, including P2.** P2 told her in advance that a second log-in follows confirmation, and the other three personas said that warning helped. For P06 it only showed that the process was "dwa razy to samo", so she would wait until the grandchild visits. With nobody around to help (P3), she would not try at all ("Bez niego to ja się w to nie bawię"), whereas P04 in the same seat would try alone until something jammed. The panel cannot settle whether a family member would register without help, because both readings rest on assumption lines. It decides whether the family-gardens part of D11 can be served by self-registration at all (Contradiction 1).

**Seat A postpones under time pressure despite strong stated importance (P03, P05).** Both said the problem matters a lot. Under P3 (sowing season, ten minutes), both postponed sign-up, and P05 added "nic tu nie obiecuje, że zaraz zobaczę swoje zadania". The gap between stated importance and the pressured choice repeated in both runs (weight 2, spread 0). It is listed here, not as a barrier, because it is about timing of use, not about a screen.

## 🔍 Minor barriers that repeated

Each of these appeared in both runs, so each counts as a finding. Rows 9–11 of the table.

- **"Admin →" in the public header confuses.**

  [SYNTHETIC]

  Weight 3, spread ±1; P03, P04 (run 1), P06 (run 2). Tied with the weight-2 items. The prototype marks it open (L24).

- **Two "Nowy ogród" links on the empty list cause hesitation.**

  [SYNTHETIC]

  Weight 2, spread ±0; P03 (run 1), P06 (run 2). Screenshot `06-s04-pusta-lista.png`.

- **"Usuń" right next to the garden name, with no sign whether deleting can be undone.**

  [SYNTHETIC]

  Weight 2, spread ±0; P03 (run 1), P06 (run 2). The prototype has a confirm dialog (s07), which this walk did not open.

## 🔁 Seen once, not reported as a finding

- P04 (run 1): on S1, unsure whether to tap "Zaplanuj ogród" or "Zaloguj się" when they only came to make an account; the word "konto" is missing on S1.
- P04 (run 1): on S8, unsure how to name the garden so the child recognises it.
- P05 (run 2): on S7, briefly considered "Ustawienia" while looking for tasks.
- P05 (run 2): "nie potrzebuję kursu ogrodnictwa — potrzebuję pamięci za mnie" (Q5), grounded in "knows what they are doing".
- P05 (run 2): "good neighbours" raised as a topic. It does not bear on this flow.

## 🧪 To confirm with real users

D11 rules out interviews with other gardeners, so every check below is either the owner's own test (D13) or an owner decision. Rows 2 and 6 involve the owner's family only if the owner chooses to involve them.

| # | Hypothesis | Persona ids / runs | Settles | Who to recruit | How |
|---|---|---|---|---|---|
| 1 | The second log-in with empty fields after confirmation (S5→S6) is the most irritating step | P03, P04 / 1; P05, P06 / 2 | L22, D13 | the owner | Own test on a phone: time and note hesitation from tapping the e-mail link to seeing "Moje ogrody"; then decide L22 (auto-login or pre-filled e-mail) |
| 2 | A confirmation e-mail that does not arrive quickly ends sign-up | P03, P04 / 1; P05, P06 / 2 | L22, e-mail port (map §4a) | the owner; optionally a family member, by the owner's choice | Once e-mail sending exists, measure arrival time to a phone; decide whether confirmation is required before first use |
| 3 | Ending on an empty garden gives no value and no next step | P03, P04 / 1; P05, P06 / 2 | D07, D13 | the owner | Run the own test only once Now item 1 (tasks) is reachable from S10; until then decide whether S10 says what comes next |
| 4 | A 10+ character password typed blind, then again, causes mistakes | P03, P04 / 1; P05, P06 / 2 | L12 | the owner | Own test on a phone: count mistyped passwords; decide L12 ("pokaż", repeat field) |
| 5 | Users don't know how many steps follow "Załóż konto" | P03, P04 / 1; P05, P06 / 2 | S2 copy (SA:MSG-reg) | the owner | Before S2, ask how many steps they expect before seeing their garden; compare with reality |
| 6 | Family members who register can't be seen by the owner, which defeats why they registered | P04 / 1; P06 / 2 | D11, N03 | the owner (decision) | Decide: family gardens in the owner's account, or family accounts plus a revisit of N03 |
| 7 | Plants are typed into "Opis" because S8 offers nothing else | P03 / 1; P05 / 2 | D07 | the owner | In the own test, look at what goes into "Opis" |
| 8 | "Metr po metrze" signals beds, not timing | P03 / 1; P05 / 2 | D07, L17 | the owner (decision) | Decide the landing line before the own test |
| 9 | "Admin →" in the public header confuses | P03, P04 / 1; P06 / 2 | L24 | the owner (decision) | Decide whether the admin link is public |
| 10 | Two "Nowy ogród" links on the empty list cause hesitation | P03 / 1; P06 / 2 | s04.b layout | the owner | In the own test, note which link is tapped and any pause |
| 11 | "Usuń" next to the name worries careful users | P03 / 1; P06 / 2 | s04.a layout, s07 | the owner | In the own test, open "Usuń" and check that the confirm dialog (s07) settles the worry |

## 📝 Interviews

- `transcripts/run-1-P03.md`
- `transcripts/run-1-P04.md`
- `transcripts/run-2-P05.md`
- `transcripts/run-2-P06.md`

**Acquiescence:** 16 yes/no answers, all "brak podstaw". The yes share is undefined (0 answered). This is a gap in the material, not a measure of the panel: nothing real says what the owner or the family recorded, paid for or used last season. The YN set should be asked of the owner directly.

**Grounding flags:** P05 turned the owner's spraying example ("one spraying on, say, 30 plants") into "30 roślin" as a garden size (Q4, S8). The number is dropped and carries no finding. Every persona declined to invent an episode for Q1, Q2 and Q6, which is consistent with the source (no episode was ever described). No stated-preference question was asked.

**Bias check:** over-positivity was not present, since every walk ended in disappointment on S10. No modern tool was proposed. Every persona comes from the same family (one informant) — flagged as homogeneous by material. Engagement differs by seat (A central, B barely). Idealism: P06's wish for the grandchild to see her garden is an assumption line, kept as an outlier, not a finding.

## 📸 Evidence

`screenshots/`: `01-s01-start.png`, `02-s02-rejestracja.png`, `03-s14-sprawdz-skrzynke.png`, `04-s15-potwierdzenie.png`, `05-s03-logowanie.png`, `06-s04-pusta-lista.png`, `07-s05-nowy-ogrod.png`, `08-s04a-lista-z-ogrodem.png`, `09-s11-ogrod.png`. The screen states as given to the personas: `walk-states.md`. The screenshots were captured but not viewed by the agent (no image input); judgements rest on the DOM, the accessibility tree and measured positions.
