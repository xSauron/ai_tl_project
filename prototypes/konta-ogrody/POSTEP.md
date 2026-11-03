# Prototyp „Konta i ogrody” (E02-S01) — postęp

Przeczytaj ten plik na początku nowej sesji i kontynuuj od „Następny krok”.
Etapy 0 → 3. Po każdym etapie czekamy na „dalej” od właściciela.

## Etapy

- [x] Etap 0 — Plan (2026-11-02, zatwierdzony)
- [x] Etap 1 — Szkielet i ścieżka bez błędów (2026-11-02, zatwierdzony)
- [x] Etap 2 — Stany, role i scenariusze (2026-11-02, zatwierdzony)
- [x] Etap 3 — Uczciwość i sprawdzenie (2026-11-02, raport końcowy)

## Materiały (ustalone w Etapie 0)

| Materiał | Plik | Uwagi |
|---|---|---|
| Mapa ekranów | `.ai/prototypes/konto-i-ogrody/mapa-ekranow.md` | Zatwierdzona 2026-11-02. W poleceniu ścieżka była pusta; to jedyna mapa w repo |
| Szary prototyp | `.ai/prototypes/discovery/gardener-onboarding/revision-001/` (`index.html`, `README.md`) | Jedyna rewizja. Biorę z niego tylko rejestrację → „Sprawdź skrzynkę” → potwierdzenie e-maila oraz reguły i założenia (AS01, AS08, Spec A). Zaproszeń w nim nie ma (N03) |
| Design system | `packages/ui/src` (7 komponentów, tokeny w `styles/tokens/`), `packages/ui/POSTEP.md` | Storybook działa pod `/design-system/index.html` na porcie 3000 |
| Brief | `.ai/specs/product-brief.md` | |
| Specyfikacja „Epiku 01” | `.ai/specs/2026-10-20-app-primitives.md` (SA), fazy 3–5 | W backlogu E01 to „Discovery” (bez ekranów). Mapa obejmuje E02-S01 (#23), a ta historia opiera się na SA. Dlatego wybrałem SA |
| Silnik przeglądu | **brak** | W poleceniu ścieżka jest pusta, w repo nie ma silnika ani jego README (pytanie P1) |

## Etap 0 — plan

### Technologia i uruchomienie

- **React 19 + Vite 8** z `node_modules` repo, bez nowych zależności. Vite 8 kompiluje JSX sam (oxc), więc `@vitejs/plugin-react` nie jest potrzebny. Sprawdzone próbnym buildem w `/tmp`: `Button` z DS zbudował się ze stylami.
- **Źródło:** `prototypes/konta-ogrody/` (`index.html`, `src/`, `vite.config.mjs`, testy). Komponenty DS importowane aliasem `@plant-ai/ui` → `packages/ui/src` (tylko odczyt). Style: `@import "tailwindcss"` + `packages/ui/src/styles/globals.css` przez `@tailwindcss/postcss`, tak jak w `.storybook/storybook.css`.
- **Wynik budowania:** `base: "./"`, `outDir` = `packages/app/public/prototypes/konta-i-role/`. Podgląd na porcie 3000 to `next dev` z `packages/app`, który serwuje `packages/app/public/` (tam leży już Storybook `/design-system/`). Folder `packages/ui/.storybook/public` z ćwiczenia 2a tu nie istnieje (P2).
- **Bez commitu wyniku:** dopisuję `packages/app/public/prototypes/` do `.git/info/exclude`. To lokalny plik gita, więc nie zmienia kodu repo (P2).
- **Polecenia** (bez zmian w `package.json` repo):
  - `npx vite build --config prototypes/konta-ogrody/vite.config.mjs`, potem otwórz `http://localhost:3000/prototypes/konta-i-role/index.html`
  - `npx vitest run --config prototypes/konta-ogrody/vitest.config.mjs` (jsdom), czyli testy nawigacji z Etapu 3
- **Routing:** hash (`#/s04`, `#/s11/g-ala-1`), bo podgląd to pliki statyczne. Ekrany mają identyfikatory z mapy (`s01`–`s16`), a stany są oznaczone `data-state="s04.b"`.
- **Dane:** w pamięci, z ustalonym „teraz” = `2027-03-01 08:00 Europe/Warsaw` (mapa §3). Bez fetch i localStorage. Przeładowanie strony = reset.

### Kolejność budowy ekranów

1. Etap 1, ścieżka bez błędów: s01 → s02 → s14 → (skrzynka demo SC15) → s15 → s04 (pusta, s04.b) → s05 → s04.a → s11 → s16 → wyloguj → s03 (s03.i „Wylogowano”) → logowanie → s04.
2. Etap 2: s06, s07, s12, s13, s08, s10, s09, potem wszystkie stany a–k z mapy (91) przez kontrolki SC01–SC16.
3. Etap 3: notatki przy ekranach, README, testy, sprawdzenie w przeglądarce.

### Kontrolki scenariuszy (pasek przeglądu, osobno od nawigacji produktu)

Pasek: oznaczenie „Prototyp · dane fikcyjne”, wybór ekranu (s01–s16), przełącznik motywu, panel „Scenariusze”:

| ID | Kontrolka | Wartości |
|---|---|---|
| SC01 | Sesja | brak / aktywna / wygasła |
| SC02 | Zegar demo | „teraz” / +25 h |
| SC03 | Wynik rejestracji | sukces / `REGISTRATION_FAILED` / `RATE_LIMITED` / sieć / 500 |
| SC04 | Wynik logowania | sukces / `INVALID_CREDENTIALS` / `RATE_LIMITED` / niepotwierdzony / sieć / 500 |
| SC05 | Zapis ogrodu | sukces / błąd pól / `LIMIT_REACHED` / `NOT_FOUND` / 401 / sieć / 500 |
| SC06 | Usunięcie | sukces / `NOT_FOUND` / 401 / sieć / 500 |
| SC07 | Opóźnienie | 0 s / 3 s / bez odpowiedzi |
| SC08 | Liczba ogrodów | 0 / 2 / 20 (skrót do kont `cel`, `ala`, `dar`) |
| SC09 | Baza danych | osiągalna / nieosiągalna |
| SC10 | Otwórz cudzy ogród | przycisk: skok do ogrodu `ewa` |
| SC11 | Język | polski / angielski |
| SC12 | Wysyłka e-maili | działa / niedostępna |
| SC13 | Link z maila | ważny / wygasł / użyty / nieprawidłowy |
| SC14 | Stan e-maila konta | potwierdzony / niepotwierdzony |
| SC15 | Skrzynka demo | lista maili „wysłanych” w prototypie z klikalnym linkiem |
| SC16 | Zmiana hasła w ustawieniach | sukces / złe obecne / 401 / sieć / 500 |
| — | Zmiana konta | lista kont demo, zalogowanie jednym kliknięciem |

Z polecenia odpadają „wynik płatności” (brak płatności, N03) i „role” (jedna rola `user`). Zamiast ról przełączamy konta i sytuacje z tabeli „Role” w mapie: gość, właściciel, nie-właściciel.

### Konta demo (mapa §3, wszystkie fikcyjne, domena `example.test`)

`ala` (właściciel, 2 ogrody), `ewa` (mama, „Ogród mamy”: do 404), `ola` (babcia), `cel` (pusta lista), `dar` (20 ogrodów, limit), `nowy` (niepotwierdzony), `nikt` (nie istnieje). Hasło demo `demo-haslo-2027` jest wypisane na ekranie logowania jako dane prototypu. Żadne pole nie zbiera prawdziwego hasła: wartości nie wychodzą poza pamięć karty, a na formularzach jest dopisek „Symulacja: nie wpisuj prawdziwego hasła”.

### Komponenty DS na ekranach

DS ma: `Badge`, `Button`, `Card`, `Input`, `Label`, `Separator`, `Table` + tokeny (kolory shadcn, `in-group`/`between-groups`/`panel`/`section`, `touch`).

| Ekran | Komponenty DS | Luki (budowa z tokenów, oznaczona `// DS-GAP DSxx`) |
|---|---|---|
| s01 Strona główna | Button | poza DS (marketing ma osobny system); prototyp pokazuje przybliżenie z tokenów DS, oznaczone |
| s02 Rejestracja | Card, Label, Input, Button | DS01 formularz, DS02 błąd pola, DS03 ErrorMessage, DS09 układ auth, DS14 znak |
| s03 Logowanie | jak s02 | + DS15 komunikat informacyjny |
| s04 Moje ogrody | Table, Card (karty < md), Button, Separator | DS04 DataTable, DS03 Empty/Loading/Error, DS08 AppShell + PageHeader, DS11 akcje wiersza |
| s05 / s06 panel | Label, Input, Button | DS05 Sheet, DS06 Textarea, DS01 |
| s07 usuń | Button `destructive`/`outline`, Card | DS07 ConfirmDialog (Radix `alert-dialog` jest w `radix-ui`, ale nie ma go w DS, więc buduję prosty dialog z tokenów) |
| s08 / s10 błąd | Card, Button `link` | DS10 strona błędu |
| s09 Status | Card, Badge, Button | — |
| s11 Ogród | Card, Button | DS08 |
| s12 / s13 / s14 / s15 | Card, Label, Input, Button | DS09, DS15 |
| s16 Ustawienia | Label, Input, Button, Separator | DS08, DS01, DS15 |
| Pasek przeglądu | Button, Badge, Separator | nie należy do produktu; własny prosty układ z tokenów, oznaczony jako narzędzie prototypu |

Wszystkie 17 luk DS01–DS17 z mapy §5 obowiązują. Nowych komponentów w `packages/ui` nie dodaję. Najprostsze wersje powstają w `prototypes/konta-ogrody/src/gaps/`, każda z komentarzem `DS-GAP` i wpisem do raportu.

### Ryzyka i rozjazdy polecenia z tym repo

- Polecenie wspomina zaproszenia, role mentee/mentor, płatności, terminy i DevMentora. Tu jest jedna rola, nie ma zaproszeń (N03, #23/AC5, L18) ani płatności. Nie buduję ich, nawet jako zaślepek.
- „Prototyp” w poleceniu ma dwie nazwy: źródło trafia do `prototypes/konta-ogrody/`, a wynik do `/prototypes/konta-i-role/`. Zostawiam obie, tak jak napisano.
- Otwarte luki mapy (L04–L12, L14, L15, L17, L18, L23, L24) budowane są wg mapy: SA albo propozycja agenta, oznaczona na ekranie notatką „nierozstrzygnięte: Lxx”.

### Pytania (P1–P7) — potrzebne przed Etapem 1

- **P1 Silnik przeglądu:** gdzie jest (ścieżka/paczka i README)? Bez niego nie podłączę trybu komentarzy, mapy ekranów, prezentacji ani „Back”. Propozycja: podasz ścieżkę. Inaczej Etap 1 bez silnika, z miejscem na niego w pasku.
- **P2 Miejsce wyniku:** `packages/app/public/prototypes/konta-i-role/` + wpis w `.git/info/exclude`, czy wolisz wpis w `.gitignore` (zmiana pliku repo)?
- **P3 Język:** mapa ma SC11 (PL/EN). Domyślnie polski z przełącznikiem EN w pasku? To podwaja teksty. Alternatywa: tylko polski, EN jako ograniczenie.
- **P4 s01:** przybliżenie strony głównej z tokenów DS czy tylko ekran przejściowy z linkami „Plan your garden” i „Admin →”?
- **P5 Otwarte luki:** budować je wg propozycji z mapy z notatką „nierozstrzygnięte” (np. L05 link „Zaloguj się” na s01 i s02/s03), czy pokazywać tylko to, co ma źródło?
- **P6 Szary prototyp:** po potwierdzeniu e-maila wchodzimy na s04 z sesją (AS01, s15.a) — zostaje?
- **P7 s09/s10:** budować (L24, L09 otwarte)?

### Odpowiedzi właściciela (2026-11-02)

- P1: silnik przeglądu pomijamy, nie dotyczy tej aplikacji. Bez trybu komentarzy, mapy, prezentacji i „Back” z silnika.
- P2: wynik nie jest commitowany; wystarczy wpis w `.git/info/exclude` (dodany: `packages/app/public/prototypes/`).
- P3: z przełącznikiem PL/EN (domyślnie PL).
- P4: przybliżenie strony głównej z tokenów DS.
- P5: otwarte luki według propozycji z mapy, z oznaczeniem.
- P6: „chyba tak”: po potwierdzeniu e-maila jest sesja i wejście na s04 (AS01). Do potwierdzenia przy L22.
- P7: s09 i s10 budujemy.

## Etap 1 — co zbudowane

- **Uruchomienie:** `npx vite build --config prototypes/konta-ogrody/vite.config.mjs` → `packages/app/public/prototypes/konta-i-role/` → `http://localhost:3000/prototypes/konta-i-role/index.html` (działający `next dev`). Testy: `npx vitest run --config prototypes/konta-ogrody/vitest.config.mjs`. Typy: `npx tsc -p prototypes/konta-ogrody/tsconfig.json`.
- **Pliki źródłowe (`src/`):**
  - `data.ts`: konta i ogrody demo z mapy §3, stałe „teraz”, limity z SA
  - `store.ts`: stan w pamięci, sesja 24 h na zegarze demo
  - `api.ts`: symulowane API, kody błędów z SA
  - `router.ts`: hash, ścieżki jak w aplikacji, identyfikatory s01–s16
  - `i18n.ts`: teksty PL/EN; angielskie cytaty ze SA dosłownie
  - `gaps.tsx`: luki DS, każda oznaczona `DS-GAP DSxx`
  - `forms.ts`, `session.ts`
  - `screens/{auth,gardens,public,shell}.tsx`
  - `review-bar.tsx`
  - `App.tsx`: bramki dostępu, fokus na nagłówku po nawigacji, motyw na `<html>`
- **Pasek przeglądu:** oznaczenie „Prototyp · dane fikcyjne”, wybór ekranu s01–s16, motyw jasny/ciemny, język, panel „Scenariusze” z kontami demo, zegarem, SC03–SC17 i skrzynką demo, przycisk „Resetuj prototyp”. Nie jest przyklejony: otwarty panel zasłaniał formularze, więc pasek przewija się ze stroną.
- **Ekrany:** wszystkie 16 są już osiągalne, a ścieżka bez błędów jest pełna. Stany błędów działają w kodzie (SC w pasku), ale ich przejście i sprawdzenie to Etap 2.
- **Dwie kontrolki spoza mapy** (z polecenia, oznaczone w pasku):
  - SC17 „Błąd następnego żądania” dla wysyłki maila i linków
  - przełącznik „niepotwierdzony e-mail przy logowaniu: wpuść/zablokuj”, bo L22 jest otwarte
- **Token check:** reguły z `scripts/check-design-tokens.mjs` uruchomione na `src/` prototypu: 0 naruszeń.

### Etap 1 — co sprawdzone

- `tsc` bez błędów; `vite build` OK.
- 12 testów nawigacji (jsdom), wszystkie zielone:
  - mapowanie ścieżek na s01–s16
  - bramki dla gościa i wygasłej sesji
  - cudzy ogród → s08
  - cała ścieżka bez błędów
  - powrót po zalogowaniu na stronę, z której przekierowano
- Przeglądarka (agent-browser, port 3000), dowody w `evidence/e1-*.png`:
  - ścieżka s01 → s02 → s14 → skrzynka → s15 → s04 (pusta) → s05 → s04 (lista + komunikat) → s11 → s16 (zmiana hasła) → wyloguj → s03 „Wylogowano” → logowanie `ala` → s04 → s11
  - 320 px i 1440 px bez poziomego przewijania, motyw ciemny
  - wszystkie widoczne kontrolki na s04 przy 320 px mają ≥ 44 px
  - Ctrl+Enter zapisuje panel
  - fokus po nawigacji na nagłówku h1
- **Naprawione w trakcie:**
  - s15 pokazywał „już potwierdzony”, bo StrictMode wywołał potwierdzenie dwa razy
  - komunikat sukcesu znikał po zamknięciu panelu (s05–s07 mają teraz jedno zamontowanie z s04)
  - fokus nie trafiał na nagłówek ładowany asynchronicznie
  - przyklejony pasek zasłaniał formularz

### Etap 1 — czego nie sprawdzono

- Stany błędów i kontrolki scenariuszy w przeglądarce (Etap 2).
- Pełna obsługa klawiaturą i czytnik ekranu (Etap 3).
- Nie obejrzałem zrzutów: narzędzie agenta nie czyta obrazów. Sprawdziłem DOM, wymiary i obecność plików.

## Etap 2 — stany, role, scenariusze

Wszystkie 91 stanów z mapy są osiągalne kliknięciem w produkcie albo kontrolką z paska. „Pasek” = panel „Scenariusze”. „Sprawdzone” = przejście w przeglądarce (agent-browser, port 3000) i/lub test jsdom (`test/states.test.tsx`). Zrzuty: `evidence/e2-*.png`.

| Stan | Jak wywołać | Sprawdzone |
|---|---|---|
| s01.a | `/` | przeglądarka |
| s02.a | „Zaplanuj ogród” | przeglądarka |
| s02.b | wyślij zły e-mail / krótkie hasło | przeglądarka, test (fokus na 1. polu, wartości zostają) |
| s02.c | pasek SC07 = 3 s, wyślij | przeglądarka |
| s02.d | e-mail istniejącego konta albo SC03 = `REGISTRATION_FAILED` | przeglądarka, test |
| s02.e / f / g | SC03 = 429 / brak sieci / 500 | przeglądarka, test (dane zostają) |
| s02.h | poprawne dane → s14 | przeglądarka, test |
| s02.i | **niezbudowany jako osobny stan**: L04 otwarte, zalogowany widzi formularz jak gość | — |
| s03.a | `/login` | przeglądarka |
| s03.b | wyślij puste | przeglądarka |
| s03.c | SC07 = 3 s | przeglądarka |
| s03.d | `nikt@example.test` albo złe hasło (ten sam tekst) | przeglądarka, test |
| s03.e / f / g | SC04 = 429 / sieć / 500 | przeglądarka, test (429) |
| s03.h | zaloguj → strona z przekierowania albo s04 | przeglądarka, test |
| s03.i | gość na stronie chronionej (bez komunikatu), wygasła sesja („Sesja wygasła…”), „Wyloguj” („Wylogowano.”) | przeglądarka, test |
| s03.j | „Nie pamiętasz hasła?” → s12 | przeglądarka |
| s03.k | `nowy@example.test` + pasek „Niepotwierdzony e-mail” = zablokuj | przeglądarka, test |
| s04.a | `ala` (2 ogrody, od najnowszego), karty < md | przeglądarka, test |
| s04.b | `cel` albo usunięcie ostatniego ogrodu | przeglądarka, test |
| s04.c | SC07 = 3 s i wejście na s04 | przeglądarka |
| s04.d | SC09 = nieosiągalna; „Spróbuj ponownie” | przeglądarka, test |
| s04.e | gość na `/gardens` | przeglądarka, test |
| s04.f | konto `dar` (20 ogrodów): komunikat nad listą, przycisk aktywny (L06, propozycja) | przeglądarka, test |
| s04.g | „Wyloguj” w powłoce | przeglądarka, test |
| s04.h | pasek „+25 h” albo „Wygaś sesję”, potem dowolna akcja | przeglądarka, test |
| s04.i | `nowy` + „Niepotwierdzony e-mail” = wpuść: przypomnienie w powłoce | przeglądarka, test |
| s05.a–h | panel „Nowy ogród”; SC05 (błąd pól, `LIMIT_REACHED`, 401, sieć, 500), SC07, Escape/Anuluj, zapis | przeglądarka (każdy), test (d, e) |
| s06.a–g | „Zmień nazwę”; jak s05, `NOT_FOUND` = SC05 | przeglądarka (każdy), test (a, d) |
| s07.a–f | „Usuń”; SC06 (`NOT_FOUND`, 401, sieć, 500), SC07 | przeglądarka (każdy), test (a, f) |
| s08.a | pasek „Otwórz cudzy ogród (ewa)” albo nieistniejący adres | przeglądarka, test |
| s08.b | gość pod adresem ogrodu → s03 | przeglądarka, test |
| s09.a / b | „Admin →”; SC09 | przeglądarka, test |
| s10.a | SC09 = nieosiągalna i wejście na s11; „Spróbuj ponownie” wraca na ogród | przeglądarka, test |
| s11.a–d | klik w ogród; cudzy → s08; gość → s03; SC09 → s10 | przeglądarka, test |
| s12.a–g | „Nie pamiętasz hasła?”; SC17 (429, sieć), SC12 = niedostępna, SC07 | przeglądarka, test (d) |
| s13.a–g | link „Zresetuj hasło” ze skrzynki demo; SC13 (wygasł, nieprawidłowy); drugie otwarcie = użyty; SC17 = 500 | przeglądarka, test (a, d, f) |
| s14.a–d | po rejestracji; „Wyślij link ponownie”; SC17 = 429; SC12 = niedostępna | przeglądarka |
| s15.a–e | link „Potwierdź adres” ze skrzynki demo; drugie otwarcie = już potwierdzony; SC13; SC17 = 500 | przeglądarka, test |
| s16.a–h | „Ustawienia”; złe obecne hasło (prawdziwe sprawdzenie albo SC16); SC16 (401, sieć, 500); SC07; gość → s03 | przeglądarka, test (d) |

**Konta i role.** Produkt ma jedną rolę `user` (N03), więc „role” to sytuacje z tabeli „Role” w mapie:
- **Gość:** pasek „— gość —”.
- **Właściciel:** dowolne konto demo.
- **Nie-właściciel:** `ala` otwiera ogród `ewa`.

Zmiana konta w pasku loguje jednym kliknięciem. Na stronie logowania zachowuje się jak zalogowanie: wraca na stronę, z której przekierowano.

**Bramki:**
- „Zaloguj się”: gość na s04–s08, s11, s16 trafia na s03, a po zalogowaniu wraca na tę stronę.
- „Ta strona wymaga innej roli”: przy jednej roli w tej formie nie istnieje. Jej odpowiednikiem jest cudzy ogród → s08, ten sam widok co dla nieistniejącego (#23/AC2).

**Dane po błędzie.** Wpisane wartości zostają po każdym błędzie serwera, sieci i 401 (s02, s03, s05, s06, s12, s13, s16). Sprawdzone w przeglądarce i testami. Odpowiednik „terminu po nieudanej płatności” w tym produkcie nie istnieje (brak płatności).

### Etap 2 — naprawione w trakcie

1. Kontrolki SC13/SC12 nie odświeżały otwartego s15/s14: stary komunikat zostawał.
2. Na s12 komunikat sukcesu zostawał zielony przy kolejnym błędzie.
3. Przesunięcie zegara (+25 h) od razu wyrzucało z otwartej strony. Wbrew mapie (s04.h): ma to zrobić następne żądanie. Teraz bramka liczy się przy nawigacji i zmianie konta, a nie przy każdym tyknięciu zegara.
4. „Wróć do teraz” po „+25 h” wskrzeszało wygasłą sesję. Teraz nie wskrzesza, a pasek to wyjaśnia.
5. s10 „Spróbuj ponownie” wracało przez `history.back()` i lądowało na s08. Teraz wraca pod zapisany adres (`#/error?from=…`).
6. Zmiana konta na stronie logowania zostawiała użytkownika na s03.
7. s07 z nieistniejącym id pytało o usunięcie ogrodu „”. Teraz pokazuje „Ten ogród już nie istnieje” i tylko „Wróć”.
8. s06 otwarte bezpośrednio z adresu przy wolnej odpowiedzi miało puste pola. Teraz panel czeka na listę.

### Etap 2 — czego nie sprawdzono

- s02.i (zalogowany na s02/s03) nie jest zbudowany jako osobny stan, bo L04 jest otwarte.
- „Pierwsze wczytanie” s04.c jest pokazane jako „Wczytywanie…” (L08, propozycja).
- Czytnik ekranu i pełna obsługa klawiaturą: Etap 3.
- Zrzutów nie oglądałem (narzędzie nie czyta obrazów). Sprawdzałem treść DOM, fokus, wymiary i to, czy mieści się w 320 px.
- Pomiar: przy 320 px na 13 ekranach nic nie wychodzi poza ekran, a każda kontrolka poza linkami w tekście ma ≥ 44 px.

## Etap 3 — uczciwość i sprawdzenie

### Zbudowane

- **Notatki przy ekranach** (`src/notes.ts`), pokazywane w pasku przeglądu jako „Notatka sXX”, PL/EN. Notatka ma trzy części: historie i decyzje, co jest symulacją, czego prototyp nie rozstrzyga. Jest poza obszarem produktu, więc nie podpowiada odpowiedzi osobie, która klika.
- **README.md:** uruchomienie, konta demo, scenariusze, „Ograniczenia symulacji”, pliki.
- **Testy:** 38 testów jsdom (12 nawigacji i 26 stanów), w tym test regresji crashu s07.

### Sprawdzone

- **Każdy przycisk i link produktu** na s01–s04 oraz s05–s12 i s16 kliknięty automatycznie, ze świeżym stanem przed każdym kliknięciem.
  - Każdy coś robi albo jest bieżącą pozycją nawigacji: „Moje ogrody” na s04, „Ustawienia” na s16, „Nowy ogród”, gdy panel jest już otwarty.
  - Martwych kliknięć nie ma, więc dopisek „W prototypie nie działa” okazał się niepotrzebny.
  - Linki w s11 sprawdzone osobno.
- **Pasek przeglądu:**
  - wybór ekranu dla wszystkich 16 ekranów (s14 bez rejestracji wraca na s02, zgodnie z mapą; opisane na liście),
  - motyw, notatka i język,
  - każda kontrolka SC (w Etapie 2),
  - obsługa z klawiatury: Enter otwiera panel, strzałki zmieniają wartość w liście.
- **Klawiatura:**
  - kolejność Tab na s03,
  - Enter wysyła formularz,
  - po błędzie fokus trafia na pierwsze błędne pole, a błąd jest powiązany przez `aria-describedby`,
  - panel s05 łapie fokus (Tab krąży w panelu), Escape zamyka panel i fokus wraca na „Nowy ogród”,
  - s06 i s07: fokus wraca na przycisk wiersza,
  - po usunięciu wiersza fokus trafia na nagłówek strony,
  - dolna nawigacja na 320 px działa z klawiatury („Wyloguj”),
  - każdy element z fokusem ma widoczny pierścień.
- **Dostępność:** axe-core 4 (lokalna kopia z `node_modules`, wstrzyknięta tymczasowo i usunięta po teście), reguły WCAG 2.1 A/AA.
  - 0 naruszeń na 12 ekranach w motywie jasnym i ciemnym, z otwartym panelem scenariuszy,
  - 0 naruszeń w stanach błędów (s02.b, s02.g, s04.d, s04.i, s09.b) w obu motywach.
- **Szerokości 320 px i 1440 px × motyw jasny i ciemny:** wszystkie 16 ekranów bez przewijania w poziomie, także z otwartym panelem przy 320 px. Wynik to 64 zrzuty `evidence/e3-*`.
- **Budowa i jakość:** `tsc` czysty, token check 0 naruszeń, `vite build` OK.
- **Repo poza prototypem bez zmian.** Jedyny zmieniony plik, `package.json` (cline, opencode-ai), był zmieniony już przed tą sesją.

### Naprawione w Etapie 3

1. **Crash:** potwierdzenie usunięcia wywracało całą aplikację (biały ekran), gdy ogród znikał z listy. Przyczyna: hooki po wczesnym `return` w `DeleteDialog`. Poprawka: osobne komponenty. Test regresji przechodzi po poprawce i nie przechodzi na starym wzorcu.
2. **Kontrast:** tekst `text-muted-foreground` na tle `bg-muted` w pasku miał za mały kontrast w jasnym motywie. Teraz używa `text-foreground`.
3. **Fokus po zamknięciu okna:** po usunięciu wiersza fokus trafiał na `body`. Teraz trafia na nagłówek.
4. **Fokus przy otwieraniu panelu:** fokus nagłówka ekranu nadpisywał fokus panelu, a ponowne podpięcie Escape kradło fokus z powrotem.
5. **Przyciski:** przyciski poza formularzami mają teraz `type="button"`.

### Czego nie sprawdzono

- **Czytnik ekranu** (NVDA, VoiceOver). Zamiast tego są tylko reguły axe i kontrola ról, etykiet i `aria-live`.
- **Zrzuty** nie zostały obejrzane (narzędzie agenta nie czyta obrazów). Wygląd jest sprawdzony tylko przez DOM, wymiary, kontrast z axe i overflow.
- **Prawdziwe telefony, Safari i Firefox:** sprawdzone tylko w Chromium (headless).
- **Pomiar kontrastu ręcznie:** nie wykonany, jest tylko pomiar axe.

## Raport końcowy

### Luki w design systemie (do zbudowania w `packages/ui`)

Wszystkie z mapy §5 obowiązują. W prototypie są zastąpione wersjami z tokenów, z oznaczeniem `DS-GAP`:

- DS01 `CrudForm`
- DS02 tekst błędu pola
- DS03 `ErrorMessage` / `EmptyState` / `LoadingMessage`
- DS04 `DataTable` z kartami
- DS05 `Sheet`
- DS06 `Textarea`
- DS07 `ConfirmDialog`
- DS08 `AppShell` i `PageHeader`
- DS09 układ `(auth)`
- DS10 strona błędu
- DS11 akcje wiersza (dwa przyciski 44 px, bez `dropdown-menu`)
- DS14 znak produktu (zwykły napis, bez emoji)
- DS15 komunikat informacyjny

Nowe przy budowie:

- **DS18 `Select`:** brak w DS. Pasek używa natywnego `<select>` w klasach `Input`. Produkt będzie go potrzebował przy wyborze języka (L13).
- **DS19 wzorzec fokusu w oknach modalnych:** łapanie fokusu i powrót do otwierającego lub do nagłówka. Radix to daje, jeśli DS05 i DS07 zostaną zbudowane na Radix.
- **DS20 `Notice` bez koloru „info” i „success”:** DS ma tylko `destructive`. Komunikaty sukcesu i informacji używają `bg-muted`, więc nie da się ich odróżnić kolorem. Potrzebny token albo wariant `alert`.

Niezbudowane: DS12 toast (L07: komunikat na stronie), DS16 przełącznik języka w produkcie, DS17 tłumaczenia tekstów komponentów.

### Pytania do specyfikacji, które wyszły przy budowie

1. **Odnowienie sesji:** co dzieje się z danymi formularza po ponownym zalogowaniu (L03)? Prototyp wraca na stronę, ale wpisane dane giną.
2. **L22:** czy niepotwierdzone konto może się logować? Prototyp ma przełącznik. Gdzie użytkownik z martwym linkiem prosi o nowy, skoro nie ma sesji? Prototyp: przez s03.k po zalogowaniu.
3. **s15 po potwierdzeniu daje sesję (AS01):** czy w innej przeglądarce niż ta, w której się rejestrował, też? SA nie ma takiego endpointu.
4. **s10 „Spróbuj ponownie”:** czy błąd odczytu ma osobny adres (prototyp: `#/error?from=…`), czy zostaje na stronie (L09)?
5. **Bezpośredni adres do zmiany nazwy lub usunięcia** (`/gardens/[id]/rename`): czy w produkcie panel ma własny adres? SA mówi tylko o sheet i dialogu na `/gardens`.
6. **s07 dla nieistniejącego ogrodu:** pokazać okno „już nie istnieje” czy od razu 404?
7. **L06:** przy 20 ogrodach przycisk „Nowy ogród” aktywny z wyjaśnieniem czy wyłączony?
8. **Komunikat przy 429:** bez czasu oczekiwania, bo L10 nie podaje okna.
9. **Hasło demo na ekranie logowania:** w produkcie oczywiście nie. W prototypie jest dla klikających. Właściciel potwierdza?
10. **Przełącznik języka:** nie ma go w produkcie, więc ustawienia (s16) mówią tylko „nierozstrzygnięte”. Domyślny język i format dat (L13)?

## Decyzje właściciela po raporcie (2026-11-02)

| Pytanie | Decyzja | Zmiana w prototypie |
|---|---|---|
| 1. Dane formularza po ponownym zalogowaniu | Nie muszą przetrwać (to tylko prototyp) | bez zmian |
| 2. L22: niepotwierdzone konto | Może się logować i prosić o nowy link | usunięty przełącznik SC14 „zablokuj”; zawsze wpuszcza z przypomnieniem w powłoce i przyciskiem „Wyślij link ponownie” (s04.i). Stan s03.k nie istnieje jako blokada |
| 3. s15: czy potwierdzenie daje sesję | Wycofujemy (AS01 wycofane) | s15 bez sesji pokazuje „Zaloguj się, aby zacząć” → s03 z „Adres potwierdzony”; z sesją zostaje i prowadzi do ogrodów |
| 4. Osobne adresy paneli | Według agenta | zostają (`/gardens/[id]/rename`, `/delete`, `/gardens/new`): da się linkować, „Wstecz” zamyka panel |
| 7. L06: limit 20 | Przycisk wyłączony | „Nowy ogród” `disabled` z wyjaśnieniem powiązanym przez `aria-describedby`. Wejście wprost pod `/gardens/new` dalej kończy się `LIMIT_REACHED` z serwera |
| 9. Hasło demo na ekranie logowania | Ma zostać | bez zmian |

Testy po zmianach: 40/40, `tsc` czysty, build OK, w przeglądarce sprawdzone s15 bez sesji → s03 i limit u `dar`.

## Następny krok

Brak zaplanowanego. Prototyp jest gotowy do klikania i komentowania. Kolejna praca to decyzje dla otwartych luk L i budowa DS01–DS20 w `packages/ui` przy implementacji #31–#33.
