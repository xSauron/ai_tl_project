# Plant.AI — tokeny designu

Status: **zatwierdzone** (właściciel, 2026-10-20 — zatwierdzenie draftu z poprzedniej sesji, plus wartości ciemnego motywu dodane po zatwierdzeniu ciemnego motywu w etapie 0 budowy design systemu).

Plik tokenów: `packages/ui/src/styles/tokens/raw.css` (warstwa surowa) i `packages/ui/src/styles/tokens/semantic.css` (warstwa znaczeniowa + token komponentu), importowane przez `packages/ui/src/styles/globals.css`, który jest motywem shadcn/ui dla `(auth)`/`(app)` — zob. `packages/ui/POSTEP.md`. `packages/app/.../(frontend)/frontend.css` ma osobną paletę `leaf-*`/`soil-*` dla stron marketingowych (inny system wg AGENTS.md) i nie jest tu zmieniany.

**Filtr „przyjęte”:** ze `lekcja-06/referencje.md` tylko R01.1, R02.1, R02.2, R02.3 mają status „przyjęte”. Tabela niżej tokenizuje wyłącznie te cztery.

## Tabela

| token | warstwa | wartość (jasny) | wartość (ciemny) | pochodzenie | gdzie używać | gdzie nie używać |
|---|---|---|---|---|---|---|
| `--raw-blue-50/300/900/950` | surowa | `#e3f2fd` / `#93c5fd` / `#0d47a1` / `#0d2847` | (ta sama paleta, dobór stopnia zależy od motywu) | `lekcja-06/ekran-bez-ds.html` (.sow) | tylko wewnątrz `tokens/semantic.css` | bezpośrednio w komponentach |
| `--raw-green-50/300/900/950` | surowa | `#e8f5e9` / `#86efac` / `#1b5e20` / `#0d2a12` | j.w. | ekran-bez-ds.html (.plant) | j.w. | j.w. |
| `--raw-orange-50/300/900/950` | surowa | `#fff3e0` / `#fdba74` / `#bf360c` (poprawka, pierwotne `#e65100` nie przechodziło kontrastu) / `#3a1507` | j.w. | ekran-bez-ds.html (.prune) | j.w. | j.w. |
| `--color-phase-sow` / `-foreground` | znaczeniowa | bg `--raw-blue-50`, tekst `--raw-blue-900` | bg `--raw-blue-950`, tekst `--raw-blue-300` | R02.2 | pasek kalendarza (R02.1) i odznaka fazy „siew” na liście zadań/operacji | tło strony/karty, stany siatki grządki, znacznik konfliktu sąsiedztwa (osobna decyzja, Stage 3) |
| `--color-phase-plant-out` / `-foreground` | znaczeniowa | bg `--raw-green-50`, tekst `--raw-green-900` | bg `--raw-green-950`, tekst `--raw-green-300` | R02.2 | pasek kalendarza i odznaka „wysadzanie” | j.w. |
| `--color-phase-prune` / `-foreground` | znaczeniowa | bg `--raw-orange-50`, tekst `--raw-orange-900` | bg `--raw-orange-950`, tekst `--raw-orange-300` | R02.2 | pasek kalendarza i odznaka „cięcie” | j.w. |
| `--radius-grid-cell` | komponentu (`BedGrid`, budowany w Etapie 3) | `0px` | `0px` (bez zmian wg motywu) | wyprowadzone z R01.1 (siatka kwadratowa → komórka bez zaokrąglenia) | róg komórki siatki grządki | karty, przyciski, dialogi, odznaki fazy (mają własny `--radius`) |

## Lista par kolorów z kontrastem

**Jasny motyw:**
- `#0d47a1` na `#e3f2fd` (siew) → **7,56 : 1** — OK
- `#1b5e20` na `#e8f5e9` (wysadzanie) → **7,00 : 1** — OK
- `#bf360c` na `#fff3e0` (cięcie, po poprawce) → **5,11 : 1** — OK (pierwotne `#e65100` dawało 3,46 : 1, za nisko)

**Ciemny motyw:**
- `#93c5fd` na `#0d2847` (siew) → **8,24 : 1** — OK
- `#86efac` na `#0d2a12` (wysadzanie) → **11,03 : 1** — OK
- `#fdba74` na `#3a1507` (cięcie) → **9,66 : 1** — OK

Wszystkie pary ≥ 4,5 : 1 (próg WCAG AA zatwierdzony w etapie 0 budowy design systemu — bez podnoszenia progu dla słońca). Pary pill-tła odznaki na białej/ciemnej karcie (np. `#e3f2fd` na `#fff` ≈ 1,14 : 1) nie są same w sobie wystarczające do odróżnienia granicy odznaki od karty — to nie para tekst/tło, tylko tło/tło; rekomendacja (cecha komponentu, nie token): odznaka fazy ma obramowanie w kolorze `-foreground`, budowane razem z komponentem odznaki w Etapie 3.

## Decyzje, które nie są tokenami

- **R01.1** — siatka grządki jako główna powierzchnia ekranu grządki, jedna komórka = jedna jednostka. Zasada/cecha komponentu `BedGrid`, nie wartość (poza wyprowadzonym promieniem komórki powyżej).
- **R02.1** — kalendarz jako poziomy pasek na 12 miesięcy, jeden pasek na roślinę. Cecha komponentu (`CalendarBar`, Etap 3), referencja nie podaje żadnej liczby.
- **R02.3** — proste ikony słońca i rozstawu zamiast opisu tekstowego. Cecha komponentu (`CropPicker`/karta rośliny, Etap 3).

## Propozycje niezatwierdzone

- R01.2–R01.6, R02.4–R02.5 (status „propozycja”).
- Cała tabela Konfliktów poza gęstością/odstępami, która została osobno zatwierdzona w etapie 0 budowy design systemu (zob. `packages/ui/POSTEP.md`).
- Antyreferencje A01–A04 jako konkretne listy rozpoznawcze (same słowa charakteru/antycharakteru zostały zatwierdzone osobno, w etapie 0).
- Luki: typografia (krój i skala), ton wypowiedzi, ruch, ogólna paleta neutralna, kompozycja/nawigacja — rozwiązywane wprost w Foundations Storybooka, oznaczone tam jako propozycje do potwierdzenia.
- Kolory stanów siatki (pusta/zajęta/zaznaczona/podgląd propozycji AI) i dobre/złe sąsiedztwo — brak wiersza w `referencje.md`; podgląd propozycji AI jest też poza zakresem obecnej budowy (D08/D09, Later — zob. `packages/ui/POSTEP.md`). Znacznik sąsiedztwa (dobre/złe) jest w zakresie (epik E03) i zostanie zgrounded wprost w R04 + `2026-10-20-garden-grid.md` przy budowie `CompanionBadge` w Etapie 3, nie tutaj.
- Faza „zbiór” z R02.2 — brak danych czasowych w katalogu/specyfikacji task-list; nie tokenizowana.
