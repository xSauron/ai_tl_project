# Personas — Plant.AI

Refreshed 2026-11-02: P03–P06 added for the prototype walk `walkthroughs/2026-11-02-rejestracja-potwierdzenie-e-maila-i-pierwszy-ogrod-session-001/` (built only on the owner's account, D11, AGENTS.md and the prototype README; no illustrative notes). P01 and P02 unchanged; P02's segment (balcony) is outside the D11 Target group.

Basis: `.ai/specs/product-brief.md` (Target group, Problems, Key flows, Scope, Business rules); `research/interviews/2026-10-19-owner-trained-gardener.md` (the only real account, from the project owner); illustrative course notes `2026-10-14-interview-allotment-beginner.md`, `2026-10-16-interview-balcony-grower.md`, `2026-10-18-survey-fb-group-planning.md` (all `[ASSUMPTION]` per `2026-10-18-source-manifest.md`); `AGENTS.md`. Held out, not used: `2026-10-15-interview-raised-beds-experienced.md`. · Built 2026-10-19 · Stance default: adversary
Panel composition: assumed. No data gives proportions. Two seats: one central (mixed garden that has outgrown memory), one indifferent (balcony boxes).
Coverage: P01–P02: 32 persona lines — 11 sourced, 21 assumed; P03–P06: 50 lines — 22 sourced, 28 assumed

Warning: P01's sourced lines all come from the account of the person building the product (confirmation-bias risk). P02 rests only on illustrative material.

## P01 — grower whose mixed garden (vegetables, berry bushes, a fruit tree) has outgrown what they can hold in their head, planning for spring

Runs: 1
- Segment and share of the panel: home grower with several plants, 1 of 2 seats; assumed.
- Situation the problem shows up in: as the number of plants grows, they lose track of what to do. `[INTERVIEW]` owner 2026-10-19
- Situation, plant mix: the garden has vegetables plus berry bushes and at least one *Prunus* (plum or cherry) tree. `[INTERVIEW]` owner named *Prunus*; berry bushes `[DOCUMENT]` D02 (scope choice, not a user fact)
- State of mind at entry: mildly overwhelmed but competent. They know what they're doing, the garden has simply grown. `[INTERVIEW]` owner 2026-10-19 ("Even if you most likely know what are you doing…")
- How much this topic matters to them: central. `[INTERVIEW]` owner 2026-10-19
- Goal, in their words: not to "get lost on what to do", and to know "when to do certain things". `[INTERVIEW]` owner 2026-10-19
- Success, as they would recognise it: no task missed or done at the wrong time, and no plant damaged by a wrong cut. `[INTERVIEW]` owner 2026-10-19 (pruning caution)
- Constraints (time, budget, switching cost): no basis. `[ASSUMPTION]`
- Tools they already use: a paper notebook, a seed-packet back, a Facebook group, ChatGPT. `[ASSUMPTION]` illustrative allotment-beginner note
- Words they use: "good neighbours", "when to do certain things", "get lost". `[INTERVIEW]` owner 2026-10-19
- Words they use: "after the last frost — which one?" `[ASSUMPTION]` illustrative allotment-beginner note
- Objections they will raise: companion ("good neighbours") advice is a problem area, so warnings are not trusted by default. `[INTERVIEW]` owner 2026-10-19
- Objections they will raise: generic pruning instructions are dangerous, because some plants don't grow back after a cut. `[INTERVIEW]` owner 2026-10-19
- Objections they will raise: AI chat gave wrong timing before ("it told me April was fine, it was not"). `[ASSUMPTION]` illustrative allotment-beginner note
- What they will not do: draw a pretty plan; they want a list. `[ASSUMPTION]` illustrative allotment-beginner note
- What they will not do: share the garden with others. `[ASSUMPTION]` illustrative allotment-beginner note
- Traits the material supports: careful about irreversible actions (cuts). `[INTERVIEW]` owner 2026-10-19
- The reason this person would not switch: they already know their garden and may not trust a tool over their own judgment. `[ASSUMPTION]`
- No basis for: time available, current record-keeping, device, how many plants, region and frost dates. Would be filled by: interviews with real gardeners other than the owner (brief collection plan, A01).

## P02 — balcony grower with boxes who plans by eye, second season — assumption persona (the indifferent seat)

Runs: 1
- Segment and share of the panel: balcony grower, 1 of 2 seats; candidate segment from illustrative material only. `[ASSUMPTION]` brief Target group
- Situation the problem shows up in: six boxes and two pots on an east-facing balcony, shade after 13:00; basil failed in the shade. `[ASSUMPTION]` illustrative balcony note
- State of mind at entry: casual and unhurried, sceptical of apps. `[ASSUMPTION]` illustrative balcony note ("jest za darmo milion apek")
- How much this topic matters to them: barely. Planning is "na oko" (by eye). `[ASSUMPTION]`; salience is assumed, the material holds no measured indifference
- Goal, in their words: the app should know "mam skrzynkę 80×20 a nie grządkę" (I have an 80×20 box, not a bed) and her sun hours. `[ASSUMPTION]` illustrative balcony note
- Success, as they would recognise it: knowing why the leaves turned yellow. `[ASSUMPTION]` illustrative balcony note
- Constraints: won't pay ("maks kawę raz", at most a coffee, once); short gaps of time between childcare. `[ASSUMPTION]` illustrative balcony note
- Tools they already use: the seed packet and ChatGPT ("zawsze mówi, że wszystko się da", it always says everything is possible). `[ASSUMPTION]` illustrative balcony note
- Words they use: centimetres, boxes, sun; never "square foot". `[ASSUMPTION]` illustrative balcony note
- Objections they will raise: "kratki metr na metr to nie dla mnie" (metre-by-metre grids aren't for me). `[ASSUMPTION]` illustrative balcony note
- Objections they will raise: fear of being told "it's a fungus" and sold a spray. `[ASSUMPTION]` illustrative balcony note
- What they will not do: create an account before seeing anything; tolerate ads. `[ASSUMPTION]` illustrative balcony note
- Product fact the persona would meet: the garden planner sits behind login, and only the crop catalogue is public. `[PRODUCT]` AGENTS.md, Pages & routing
- The reason this person would not switch: "a million free apps", and ChatGPT already answers. `[ASSUMPTION]` illustrative balcony note
- No basis for: any real balcony grower's behaviour, how often they return off-season. Would be filled by: an interview with a real balcony grower.

## P03 — owner-grower of a mixed garden (vegetables, berry bushes, a *Prunus* tree), at a desk in early March before the season starts

Runs: 1
- Segment and share of the panel: owner as grower, 1 of 2 seats; assumed.
- Situation the problem shows up in: as the number of plants grows, it gets easy to lose track of what to do and when. `[INTERVIEW]` owner 2026-10-19
- Situation, timing: early March, before sowing (the prototype's fixed "now" is 1 March 2027). `[PRODUCT]` prototype README ("Stałe teraz"); that the persona is planning at a desk is `[ASSUMPTION]`
- State of mind at entry: competent and mildly overwhelmed; knows the craft, the garden has outgrown memory. `[INTERVIEW]` owner 2026-10-19 ("Even if you most likely know what are you doing…")
- How much this topic matters to them: central. `[INTERVIEW]` owner 2026-10-19
- Goal, in their words: keep track of "kiedy wysiać, potem kiedy wsadzić, kiedy przyciąć i jaki oprysk zrobić". `[INTERVIEW]` owner 2026-10-20 addendum
- Success, as they would recognise it: seeing the tasks that need doing and when, for their own garden. `[DOCUMENT]` D13, brief User outcome
- Constraints — time, budget, switching cost: no basis. `[ASSUMPTION]`
- Tools they already use: no basis. `[ASSUMPTION]`
- Words they use: "dobre sąsiedztwo" / "good neighbours", "kiedy zrobić", "oprysk", "operacja". `[INTERVIEW]` owner 2026-10-19, 2026-10-20 addenda
- Objections they will raise: recording things one by one is wasteful; one operation for 30 plants, not 30 entries. `[INTERVIEW]` owner 2026-10-20 fifth-pass addendum
- Objections they will raise: generic pruning advice can harm a plant that does not grow back after a cut. `[INTERVIEW]` owner 2026-10-19
- What they will not do: no basis. `[ASSUMPTION]`
- Traits the material supports: careful about irreversible actions. `[INTERVIEW]` owner 2026-10-19
- Product fact the persona meets: the planner sits behind login; only the catalogue is public. `[PRODUCT]` AGENTS.md
- No basis for: device, time available, current record-keeping, past experience with app sign-ups. Would be filled by: the owner's own test (D13), with notes on where the sign-up slowed them down.

## P04 — family gardener (the owner's mother) with her own garden that the owner keeps track of — assumption persona (the indifferent seat)

Runs: 1
- Segment and share of the panel: family gardener, 1 of 2 seats; the segment exists in the owner's words. `[INTERVIEW]` owner 2026-10-20 third-pass addendum ("Mojego ogrodu, mamy, babci itp.")
- Situation the problem shows up in: her garden is one the owner keeps track of; what she herself tracks is unknown. `[INTERVIEW]` owner, same addendum; her own practice `[ASSUMPTION]`
- Situation, how she arrives: the owner asks her to set up her own account so her garden is in the app. `[ASSUMPTION]`
- State of mind at entry: willing but not invested; doing it because her child asked. `[ASSUMPTION]`
- How much this topic matters to them: barely. `[ASSUMPTION]`; the material holds no measured indifference
- Goal, in their words: no basis. `[ASSUMPTION]`
- Success, as they would recognise it: finishing the setup without having to call for help. `[ASSUMPTION]`
- Constraints: no payment is involved (hobby project). `[PRODUCT]` AGENTS.md; time and device `[ASSUMPTION]`
- Tools they already use: no basis. `[ASSUMPTION]`
- Words they use: no basis. `[ASSUMPTION]`
- Objections they will raise: why does she need her own login, if her child keeps track anyway. `[ASSUMPTION]`; sharing a garden between accounts is out of scope `[PRODUCT]` AGENTS.md (N03)
- What they will not do: no basis. `[ASSUMPTION]`
- The account of her garden is the owner's, not hers. `[DOCUMENT]` brief Target group
- No basis for: everything about her own behaviour. Would be filled by: the owner watching her register on her own device (D13 extended to the family garden, owner's decision).


## P05 — owner-grower of a mixed garden, outside by the plum tree after winter, phone in hand

Runs: 2
- Segment and share of the panel: owner as grower, 1 of 2 seats; assumed.
- Situation the problem shows up in: with many plants, losing track of what to do and when; pruning timing in particular. `[INTERVIEW]` owner 2026-10-19
- Situation, plant: a *Prunus* tree (plum or cherry). `[INTERVIEW]` owner 2026-10-19; being outside with a phone `[ASSUMPTION]`, mobile-first is `[PRODUCT]` AGENTS.md
- State of mind at entry: practical, wants to get to "when do I cut this" quickly. `[ASSUMPTION]` derived from the situation
- How much this topic matters to them: central. `[INTERVIEW]` owner 2026-10-19
- Goal, in their words: "Lista zadań tego co trzeba zrobić". `[INTERVIEW]` owner 2026-10-20 fourth-pass addendum
- Success, as they would recognise it: the tasks for their own garden and when. `[DOCUMENT]` D13
- Constraints: no payment. `[PRODUCT]` AGENTS.md; time `[ASSUMPTION]`
- Tools they already use: no basis. `[ASSUMPTION]`
- Words they use: "ogród", "drzewo", "przyciąć", "oprysk", "na 30 roślinach". `[INTERVIEW]` owner addenda
- Objections they will raise: some plants do not grow back after a wrong cut. `[INTERVIEW]` owner 2026-10-19
- Objections they will raise: companion ("good neighbours") advice is a problem area. `[INTERVIEW]` owner 2026-10-19
- What they will not do: no basis. `[ASSUMPTION]`
- Traits the material supports: knows what they are doing. `[INTERVIEW]` owner 2026-10-19
- Product fact the persona meets: the planner sits behind login. `[PRODUCT]` AGENTS.md
- No basis for: how they read e-mail on the phone, patience for setup steps. Would be filled by: the owner's own test on a phone (D13).

## P06 — family gardener (the owner's grandmother) whose garden the owner keeps track of — assumption persona (the indifferent seat)

Runs: 2
- Segment and share of the panel: family gardener, 1 of 2 seats. `[INTERVIEW]` owner 2026-10-20 third-pass addendum
- Situation the problem shows up in: her garden is among those the owner tracks. `[INTERVIEW]` owner, same addendum; her own practice `[ASSUMPTION]`
- Situation, how she arrives: the owner hands her the link to the app and asks her to make her own account. `[ASSUMPTION]`
- State of mind at entry: unhurried and doubtful that she needs it. `[ASSUMPTION]`
- How much this topic matters to them: barely. `[ASSUMPTION]`
- Goal, in their words: no basis. `[ASSUMPTION]`
- Success, as they would recognise it: a place her garden is written down that the grandchild can also look at. `[ASSUMPTION]`; the product has no sharing (N03) `[PRODUCT]`
- Constraints: no payment. `[PRODUCT]` AGENTS.md; device and e-mail habits `[ASSUMPTION]`
- Tools they already use: no basis. `[ASSUMPTION]`
- Words they use: no basis. `[ASSUMPTION]`
- Objections they will raise: passwords and confirmation e-mails are a chore. `[ASSUMPTION]`
- What they will not do: no basis. `[ASSUMPTION]`
- The account of her garden is the owner's, not hers. `[DOCUMENT]` brief Target group
- No basis for: everything about her own behaviour, her e-mail access, whether she would use the app herself at all. Would be filled by: the owner watching her try it (owner's decision).
