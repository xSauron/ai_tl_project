# Run: mapa ekranów do prototypu — konto i własne ogrody (E02-S01)

- **Date:** 2026-11-02
- **Goal:** rozpisać mapę ekranów, stanów, scenariuszy, danych demo i luk dla klikalnego prototypu przepływu E02-S01. Bez budowania.
- **Related:** issue #23 (#31–#33), `.ai/specs/2026-10-20-app-primitives.md`, `.ai/specs/product-brief.md`, `.ai/specs/research/personas.md`, `packages/ui/POSTEP.md`, `lekcja-06/{tokeny,referencje}.md`.
- **Output:** `.ai/prototypes/konto-i-ogrody/mapa-ekranow.md` (ścieżka z `.ai/agentic.config.json` → `paths.prototypes`).

## Decisions
- Przepływ i lokalizację pliku wybrał właściciel (pytanie na starcie): E02-S01, `.ai/prototypes/`.
- Produkt ma jedną rolę (`user`, N03); role w mapie to gość / właściciel / nie-właściciel.
- Brak usług zewnętrznych w przepływie (bez GitHuba, maili, AI); jedyny wynik „zewnętrzny” to baza danych.
- Luki zapisane jako pytania, bez rozstrzygnięć.

## Results
- 10 ekranów, 53 stany, 10 scenariuszy, 5 kont demo, 24 luki w specyfikacji, 14 luk w DS.

## Owner answers (2026-11-02) and map update
- Mapa zatwierdzona z odpowiedziami na L01–L03, L13/L14, L16, L19, L20–L22. Decyzje wpisane przy każdej luce, ze statusem: właściciel / odczyt agenta / propozycja agenta / otwarte.
- Nowe ekrany: s11 (strona ogrodu), s12–s13 (reset hasła), s14–s15 (weryfikacja e-maila), s16 (ustawienia). Nowe kontrolki SC11–SC16, konta demo rozdzielone per członek rodziny.
- Po zmianach: 16 ekranów, 91 stanów, 16 scenariuszy, 7 kont, 24 luki (9 rozstrzygniętych w całości lub części, 15 otwartych), 17 luk DS.
- Spec, backlog i DS nie zmienione (polecenie właściciela). Rozjazdy wypisane w sekcji 4a mapy.

## Open issues
- Reset hasła i weryfikacja e-maila wymagają portu wysyłki e-maili, którego nie ma w AGENTS.md; i18n nie jest przewidziany. Oba wymagają zmiany zasad projektu przed budową produktu.
- Następny krok: prototyp (`om-mockup-prototype`) po potwierdzeniu odczytów i propozycji agenta (L01, L02, L03, L16, L21).
