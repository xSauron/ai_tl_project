# Mapa ekranów: konto i własne ogrody (E02-S01)

- **Data:** 2026-11-02
- **Status:** zatwierdzona przez właściciela 2026-11-02, razem z jego odpowiedziami na luki L01–L03, L13, L14, L16 i L19–L22 (sekcja 4). Pozostałe luki są nadal otwarte. Prototyp jeszcze nie istnieje.
- **Przepływ:** wejście ze strony głównej, rejestracja z potwierdzeniem e-maila, logowanie, reset hasła, wylogowanie, wygasła sesja, lista własnych ogrodów (dodanie, zmiana nazwy, usunięcie), strona ogrodu, brak dostępu do cudzego ogrodu, ustawienia konta.
- **Materiały:**
  - Brief: `.ai/specs/product-brief.md` (D11, N03, Target group)
  - Backlog: `.ai/specs/backlog.md` → E02-S01 [#23](https://github.com/xSauron/ai_tl_project/issues/23), zadania #31, #32, #33
  - Specyfikacja: `.ai/specs/2026-10-20-app-primitives.md` (dalej **SA**), fazy 3–5
  - Strona główna: `.ai/specs/2026-10-14-landing-page.md` (wdrożona) i `packages/app/src/app/(frontend)/page.tsx`
  - Persony: `.ai/specs/research/personas.md` (P01, P02: syntetyczne, oparte głównie na materiale ilustracyjnym) i walkthrough `research/walkthroughs/2026-10-19-plan-a-bed-for-spring-mvp-session-001/report.md` (H01)
  - Design system: `@plant-ai/ui` (`packages/ui/src/components/*`, Storybook w `packages/ui/.storybook`), `packages/ui/POSTEP.md`, `lekcja-06/tokeny.md`, `lekcja-06/referencje.md`
  - Odpowiedzi właściciela na luki z 2026-11-02 (sekcja 4, odnośniki **WŁ:Lxx**)
- **Czego ta mapa nie robi:** nie zmienia specyfikacji, backlogu ani design systemu. Decyzje właściciela, które się z nimi rozjeżdżają, są wypisane w sekcji 4a jako praca do wykonania później.

## 0. Historie, kryteria akceptacji i decyzje objęte przepływem

| Ref | Źródło | Treść (skrót) |
|---|---|---|
| #23/AC1 | E02-S01 | Bez sesji: strona aplikacji przekierowuje do logowania, niepubliczne `/api` zwraca 401. |
| #23/AC2 | E02-S01 | Zalogowany A prosi o ogród B, dostaje 404 i żadnych danych. |
| #23/AC3 | E02-S01 | Złe hasło i nieznany e-mail dają ten sam ogólny błąd. |
| #23/AC4 | E02-S01 | Po przekroczeniu limitu prób logowania: 429. |
| #23/AC5 | E02-S01 | Negatywne: żaden ekran ani endpoint nie udostępnia ogrodu i nie zaprasza innych (N03). |
| #31 | E02-S01-T01 | SA fazy 0–3: prymitywy klienta (`apiCall`, `useMutation`, `CrudForm`, `DataTable`, `ConfirmDialog`, `AppShell`, feedback). |
| #32 | E02-S01-T02 | SA faza 4: rejestracja, logowanie, sesja; AC1, AC3 i AC4 w testach integracyjnych. |
| #33 | E02-S01-T03 | SA faza 5: ogrody należą do użytkownika; AC2 w teście integracyjnym. |
| SA:API-reg | SA, API Contracts | `POST /api/auth/register`: e-mail ≤ 254, hasło 10–128; 201 + cookie; `VALIDATION_FAILED`, `REGISTRATION_FAILED` (ogólny, także dla zajętego e-maila), `RATE_LIMITED`. |
| SA:API-login | SA, API Contracts | `POST /api/auth/login`: `INVALID_CREDENTIALS` (ogólny), `RATE_LIMITED`. |
| SA:API-logout | SA, API Contracts | `POST /api/auth/logout`: cookie wyczyszczone. |
| SA:API-gardens | SA, API Contracts | Lista tylko własnych ogrodów, od najnowszego; tworzenie: nazwa ≤ 120, opis ≤ 2000 (opcjonalny); `LIMIT_REACHED` powyżej 20 ogrodów; `GET/PATCH/DELETE /api/gardens/[id]` → `NOT_FOUND` dla brakującego **i** cudzego. |
| SA:MSG-reg | SA, API Contracts | Tekst dla nieudanej rejestracji: „Could not create the account. If you already have one, log in.” |
| SA:UI-auth | SA, UI/UX | `/login`, `/register`: `CrudForm` (e-mail, hasło); sukces → `/gardens`; błędy w formularzu; hasło nigdy nie wraca w odpowiedzi. |
| SA:UI-gardens | SA, UI/UX | `/gardens`: `PageHeader` z przyciskiem „New garden” → `CrudForm` w panelu bocznym (sheet); `DataTable` (nazwa, opis, data utworzenia); akcje wiersza: zmiana nazwy, usunięcie z `ConfirmDialog`; pusty stan „No gardens yet — create your first one”; stany: ładowanie (trwająca mutacja), pusty, błąd, walidacja. |
| SA:UI-admin | SA, UI/UX | `/admin` zostaje publiczny (tylko status bazy, bez danych użytkowników); link „Manage gardens” i `/admin/gardens` znikają. |
| SA:EDGE | SA, Edge Cases | Wygasłe lub podrobione cookie → strona przekierowuje do `/login`, API zwraca 401; nieoczekiwany wyjątek → 500 z ogólnym komunikatem; brak `JWT_SECRET` → 500. |
| SA:CF | SA, Client primitives | `apiCall`: awaria sieci → `NETWORK`, zła odpowiedź → `BAD_RESPONSE`; `CrudForm`: przycisk wyłączony w trakcie, fokus na pierwszym błędnym polu, Cmd/Ctrl+Enter zapisuje, Escape anuluje; `ErrorMessage` pokazuje `message`. |
| SA:SHELL | SA, Client primitives | `AppShell`: dolna nawigacja na telefonie, panel boczny od `md`; pozycje menu przekazywane w propsach. |
| LP:CTA | landing spec | Strona główna: przycisk „Plan your garden” → `/register`. |
| WŁ:L01 | właściciel, 2026-11-02 | „Ok” na lukę o stronie ogrodu. Odczyt agenta: strona ogrodu jest w przepływie (s11). |
| WŁ:L02 | właściciel, 2026-11-02 | Wylogowanie ma mieć miejsce w interfejsie. |
| WŁ:L03 | właściciel, 2026-11-02 | Wygasła sesja ma mieć opisane zachowanie. |
| WŁ:L13 | właściciel, 2026-11-02 | Interfejs po polsku i po angielsku; wewnętrznie (kod, klucze, teksty źródłowe) po angielsku. |
| WŁ:L19 | właściciel, 2026-11-02 | Każdy użytkownik (także mama i babcia) ma własne konto z własnym ogrodem. |
| WŁ:L20 | właściciel, 2026-11-02 | Reset hasła jest w zakresie. |
| WŁ:L21 | właściciel, 2026-11-02 | Ustawienia konta są w zakresie. |
| WŁ:L22 | właściciel, 2026-11-02 | Weryfikacja e-maila jest w zakresie. |

## 1. Ekrany

Identyfikatory ekranów (`s01`…), stanów (`s02.c`…), scenariuszy (`SC01`…) i luk (`L01`…, `DS01`…) są stałe. Nowe ekrany dostają kolejne numery, a usunięte zostawiają lukę w numeracji.

| ID | Ekran | Rola | Stany | Historia lub kryterium | Komponenty DS |
|---|---|---|---|---|---|
| s01 | Strona główna `/` (wejście) | wszyscy | a | LP:CTA | poza DS: strona marketingowa ma osobny system (AGENTS.md, Tailwind `leaf-*`/`soil-*`) |
| s02 | Rejestracja `/register` | gość | a–i | #32, SA:API-reg, SA:MSG-reg, SA:UI-auth, WŁ:L22 | Card, Label, Input, Button · brak: CrudForm, tekst błędu pola, ErrorMessage |
| s03 | Logowanie `/login` | gość | a–k | #23/AC1, AC3, AC4, #32, SA:API-login, SA:UI-auth, WŁ:L03, WŁ:L20, WŁ:L22 | jak s02 · brak: komunikat informacyjny (Alert) |
| s04 | Moje ogrody `/gardens` | zalogowany (właściciel) | a–i | #23/AC1, #33, SA:API-gardens, SA:UI-gardens, SA:SHELL, SA:API-logout, WŁ:L02, WŁ:L03 | Button, Table (pod DataTable), Card (tryb kart), Separator · brak: AppShell, PageHeader, DataTable, EmptyState, LoadingMessage, ErrorMessage |
| s05 | Nowy ogród (panel na s04) | zalogowany | a–h | SA:UI-gardens, SA:API-gardens, SA:CF, WŁ:L03 | Label, Input, Button · brak: Sheet, Textarea, CrudForm |
| s06 | Zmiana nazwy ogrodu (panel na s04) | zalogowany, właściciel ogrodu | a–g | SA:UI-gardens, SA:API-gardens, WŁ:L03 | jak s05 |
| s07 | Usuń ogród (okno potwierdzenia na s04) | zalogowany, właściciel ogrodu | a–f | SA:UI-gardens, SA:API-gardens, WŁ:L03 | Button (`destructive`, `outline`) · brak: ConfirmDialog / alert-dialog |
| s08 | Nie znaleziono (404) | zalogowany nie-właściciel; każdy przy nieistniejącym id | a–b | #23/AC2, #33, SA krok 21 („404 through the page”), WŁ:L01 | Card, Button (`link`) · brak: wzorzec strony błędu |
| s09 | Status systemu `/admin` | wszyscy (publiczny) | a–b | SA:UI-admin | Card, Badge, Button (używane dziś w `(admin)/admin/page.tsx`) |
| s10 | Błąd serwera (500) | wszyscy | a | SA:EDGE (tylko kod 500; ekranu nie opisano) | brak wzorca strony błędu. Ekran-kandydat (L09): wynika z potrzeby przepływu, nie z kryterium |
| s11 | Ogród `/gardens/[id]` | zalogowany, właściciel ogrodu | a–d | WŁ:L01, #23/AC2, SA:API-gardens (`GET /api/gardens/[id]`) | Card, Button · brak: PageHeader, AppShell |
| s12 | Nie pamiętam hasła | gość | a–g | WŁ:L20, AGENTS.md (ogólne błędy uwierzytelniania, limity) | Card, Label, Input, Button · brak: CrudForm, Alert, układ `(auth)` |
| s13 | Nowe hasło (z linku w mailu) | gość z ważnym linkiem | a–g | WŁ:L20, SA:API-reg (zasady hasła 10–128) | jak s12 |
| s14 | Sprawdź skrzynkę (po rejestracji) | świeżo zarejestrowany | a–d | WŁ:L22 | Card, Button · brak: Alert, układ `(auth)` |
| s15 | Potwierdzenie e-maila (z linku w mailu) | każdy z linkiem | a–e | WŁ:L22 | Card, Button · brak: Alert, wzorzec strony wyniku |
| s16 | Ustawienia konta `/settings` | zalogowany | a–h | WŁ:L21, AGENTS.md (`settings` w `(app)`) | Label, Input, Button, Separator · brak: AppShell, PageHeader, CrudForm, Alert |

### Stany ekranów (ze źródłem)

**s01 Strona główna**
- s01.a domyślny: nagłówek, „Plan your garden” → s02, link „Admin →” → s09. Źródło: LP:CTA, obecny kod. Brak linku do logowania (L05, otwarte). Zalogowany widzi to samo: brak źródła (L04, otwarte).

**s02 Rejestracja**
- s02.a domyślny (pusty formularz: e-mail, hasło). SA:UI-auth
- s02.b błąd walidacji przed wysłaniem (format e-maila, hasło krótsze niż 10 lub dłuższe niż 128 znaków), fokus na pierwszym błędnym polu. SA:API-reg, SA:CF
- s02.c wysyłanie (przycisk wyłączony). SA:CF
- s02.d konflikt lub inna odmowa: `REGISTRATION_FAILED`, ten sam tekst niezależnie od tego, czy e-mail już istnieje (SA:MSG-reg). SA:API-reg, AGENTS.md (błędy uwierzytelniania są ogólne)
- s02.e za dużo prób: `RATE_LIMITED` (429). SA:API-reg. Treść i czas oczekiwania: L10 (otwarte)
- s02.f błąd sieci (`NETWORK`/`BAD_RESPONSE`). SA:CF. Treść: L11 (otwarte)
- s02.g błąd serwera (`INTERNAL`). SA:EDGE
- s02.h sukces → s14 (sprawdź skrzynkę). WŁ:L22. Czy konto ma już sesję przed potwierdzeniem: L22 (otwarte)
- s02.i wejście z aktywną sesją: brak źródła (L04, otwarte)

**s03 Logowanie**
- s03.a domyślny. SA:UI-auth
- s03.b błąd walidacji przed wysłaniem. SA:CF
- s03.c wysyłanie. SA:CF
- s03.d `INVALID_CREDENTIALS`, identyczny dla złego hasła i nieznanego e-maila. #23/AC3, SA:API-login
- s03.e `RATE_LIMITED` (429). #23/AC4, SA:API-login. Treść i liczba prób: L10 (otwarte)
- s03.f błąd sieci. SA:CF (L11, otwarte)
- s03.g błąd serwera. SA:EDGE
- s03.h sukces → strona, z której przekierowano, a bez niej s04. SA:UI-auth, WŁ:L03 (szczegół: propozycja agenta)
- s03.i wejście po przekierowaniu: brak sesji (bez komunikatu) albo wygasła sesja (komunikat „Sesja wygasła, zaloguj się ponownie”), albo wylogowanie (komunikat „Wylogowano”). #23/AC1, SA:EDGE, WŁ:L02, WŁ:L03 (teksty: propozycja agenta)
- s03.j link „Nie pamiętasz hasła?” → s12. WŁ:L20
- s03.k poprawne hasło, ale e-mail niepotwierdzony. WŁ:L22. Czy logowanie jest wtedy blokowane: L22 (otwarte)

**s04 Moje ogrody**
- s04.a lista (≥ 1 ogród, od najnowszego): nazwa, opis, data utworzenia; na telefonie tryb kart; dotknięcie ogrodu → s11. SA:API-gardens, SA:UI-gardens, SA:CF (DataTable), WŁ:L01
- s04.b pusty: „No gardens yet — create your first one”. SA:UI-gardens
- s04.c ładowanie: tylko trwająca mutacja jest opisana. SA:UI-gardens. Pierwsze wczytanie strony: L08 (otwarte)
- s04.d błąd odczytu listy (np. baza nieosiągalna). SA:UI-gardens wymienia „error”, ale nie opisuje go dla odczytu: L09 (otwarte)
- s04.e brak dostępu: gość → przekierowanie na s03.i. #23/AC1, SA:EDGE
- s04.f osiągnięty limit 20 ogrodów. SA:API-gardens (`LIMIT_REACHED`). Jak to pokazać: L06 (otwarte)
- s04.g wylogowanie: „Wyloguj” w menu powłoki → s03.i z komunikatem „Wylogowano”. SA:API-logout, WŁ:L02 (miejsce i cel: propozycja agenta)
- s04.h sesja wygasła przy otwartej stronie: następna akcja dostaje 401 → s03.i, po zalogowaniu powrót na s04. SA:EDGE, WŁ:L03 (szczegół: propozycja agenta)
- s04.i zalogowany z niepotwierdzonym e-mailem. WŁ:L22. Czy taki stan w ogóle istnieje (blokada vs. wejście z przypomnieniem): L22 (otwarte)

**s05 Nowy ogród**
- s05.a domyślny (nazwa wymagana, opis opcjonalny). SA:API-gardens
- s05.b błąd walidacji (pusta nazwa, nazwa > 120, opis > 2000), także błędy pól z serwera dołączone do formularza. SA:API-gardens, SA:CF
- s05.c wysyłanie. SA:CF
- s05.d `LIMIT_REACHED`. SA:API-gardens (L06, otwarte)
- s05.e sesja wygasła (401): komunikat w panelu z linkiem do s03.i. WŁ:L03 (propozycja agenta; czy wpisane dane przetrwają: otwarte)
- s05.f błąd sieci lub serwera. SA:CF, SA:EDGE
- s05.g anulowanie (Escape, przycisk). SA:CF
- s05.h sukces → panel zamknięty, lista odświeżona. SA:CF (`useMutation` `onSuccess`). Potwierdzenie sukcesu: L07 (otwarte)

**s06 Zmiana nazwy ogrodu**
- s06.a domyślny (pola wypełnione aktualnymi wartościami). SA:UI-gardens. Czy edytuje się też opis: L15 (otwarte)
- s06.b błąd walidacji. SA:API-gardens
- s06.c wysyłanie. SA:CF
- s06.d `NOT_FOUND` (ogród usunięty w innej karcie). SA:API-gardens. Treść: L07 (otwarte)
- s06.e sesja wygasła (401): jak s05.e. WŁ:L03
- s06.f błąd sieci lub serwera. SA:CF
- s06.g sukces → lista odświeżona. SA:CF (L07, otwarte)

**s07 Usuń ogród**
- s07.a pytanie z nazwą ogrodu. SA:UI-gardens. Treść i opis skutków: L07 (otwarte)
- s07.b usuwanie (trwa). SA:CF
- s07.c `NOT_FOUND` (już usunięty). SA:API-gardens (L07, otwarte)
- s07.d sesja wygasła (401): jak s05.e. WŁ:L03
- s07.e błąd sieci lub serwera. SA:CF
- s07.f sukces → s04.a albo s04.b, gdy był to ostatni ogród. SA:UI-gardens

**s08 Nie znaleziono**
- s08.a ten sam widok dla cudzego i nieistniejącego ogrodu (bez nazwy, bez danych), osiągany z s11. #23/AC2, #33, SA:API-gardens, WŁ:L01
- s08.b gość pod tym adresem → s03.i (najpierw logowanie, nie 404). #23/AC1

**s09 Status systemu**
- s09.a baza osiągalna. SA:UI-admin
- s09.b baza nieosiągalna. SA:UI-admin. Czy ten ekran należy do prototypu: L24 (otwarte)

**s10 Błąd serwera**
- s10.a ogólny komunikat bez szczegółów technicznych. SA:EDGE (L09, otwarte)

**s11 Ogród**
- s11.a domyślny: nazwa, opis, data utworzenia, powrót do s04. WŁ:L01, SA:API-gardens. Co jeszcze tu jest przed grządkami i roślinami (E02-S03, E03): L01 (otwarte). Czy zmiana nazwy i usunięcie są też tutaj: L01 (otwarte)
- s11.b cudzy lub nieistniejący ogród → s08.a. #23/AC2
- s11.c gość → s03.i. #23/AC1
- s11.d błąd odczytu → s10 (L09, otwarte)

**s12 Nie pamiętam hasła**
- s12.a domyślny (pole e-mail). WŁ:L20
- s12.b błąd walidacji (format e-maila). SA:CF
- s12.c wysyłanie. SA:CF
- s12.d wysłano: ten sam komunikat niezależnie od tego, czy konto istnieje („Jeśli konto istnieje, wysłaliśmy link”). WŁ:L20, AGENTS.md (auth errors never reveal whether an email exists)
- s12.e za dużo prób (429). AGENTS.md (limity na uwierzytelnianiu; wartość: L10, otwarte)
- s12.f błąd sieci lub serwera. SA:CF, SA:EDGE
- s12.g usługa wysyłki e-maili niedostępna. WŁ:L20. Czy pokazywać to użytkownikowi bez ujawnienia, że konto istnieje: L20 (otwarte)

**s13 Nowe hasło**
- s13.a domyślny (nowe hasło). WŁ:L20
- s13.b błąd walidacji (10–128 znaków). SA:API-reg (te same zasady hasła)
- s13.c zapisywanie. SA:CF
- s13.d sukces → s03 z komunikatem „Hasło zmienione”. WŁ:L20 (propozycja agenta; automatyczne zalogowanie: L20, otwarte)
- s13.e link wygasł → przycisk „Wyślij nowy link” (s12). WŁ:L20. Czas ważności linku: L20 (otwarte)
- s13.f link już użyty lub nieprawidłowy. WŁ:L20
- s13.g błąd sieci lub serwera. SA:CF, SA:EDGE

**s14 Sprawdź skrzynkę**
- s14.a domyślny: „Wysłaliśmy link na adres …”. WŁ:L22
- s14.b „Wyślij ponownie” (trwa, wysłano). WŁ:L22
- s14.c za dużo ponownych wysyłek (429). AGENTS.md (limity; wartość: L10, otwarte)
- s14.d usługa wysyłki e-maili niedostępna. WŁ:L22

**s15 Potwierdzenie e-maila**
- s15.a sukces → s04 (z sesją) albo s03 z komunikatem „Adres potwierdzony” (bez sesji). WŁ:L22
- s15.b link wygasł → „Wyślij nowy link”. WŁ:L22. Czas ważności: L22 (otwarte)
- s15.c link już użyty (adres był potwierdzony). WŁ:L22
- s15.d link nieprawidłowy. WŁ:L22
- s15.e błąd serwera. SA:EDGE

**s16 Ustawienia konta**
- s16.a domyślny: e-mail (tylko do odczytu), formularz zmiany hasła (obecne + nowe). WŁ:L21 (zawartość: propozycja agenta, reszta otwarta w L21)
- s16.b błąd walidacji (nowe hasło 10–128). SA:API-reg
- s16.c zapisywanie. SA:CF
- s16.d złe obecne hasło. WŁ:L21
- s16.e sukces: komunikat „Hasło zmienione”. WŁ:L21
- s16.f sesja wygasła (401): jak s05.e. WŁ:L03
- s16.g gość → s03.i. #23/AC1
- s16.h błąd sieci lub serwera. SA:CF, SA:EDGE

### Role

Produkt ma jedną rolę, `user` (N03, AGENTS.md: brak RBAC). Nie ma ról mentee/mentor/operator ani ich połączeń. Każdy członek rodziny ma własne konto (WŁ:L19). Rozróżniam trzy sytuacje:

| Ekran | Gość (bez sesji) | Zalogowany, właściciel | Zalogowany, nie-właściciel danego ogrodu |
|---|---|---|---|
| s01 | widzi | widzi to samo (L04, otwarte) | — |
| s02, s03 | widzi | brak źródła (L04, otwarte) | — |
| s04 | → s03.i | swoja lista | widzi tylko własne ogrody; cudzych nie ma na liście |
| s05 | → s03.i | widzi | — |
| s06, s07 | → s03.i | widzi dla swoich ogrodów | nie może wywołać: cudzy ogród → 404 (s06.d / s07.c) |
| s08 | → s03.i | (nieistniejący id) s08.a | s08.a |
| s09 | widzi | widzi | widzi |
| s10 | widzi | widzi | widzi |
| s11 | → s03.i | widzi swój ogród | → s08.a |
| s12, s13 | widzi | brak źródła (L04, otwarte) | — |
| s14 | tylko po rejestracji | — | — |
| s15 | widzi (link z maila) | widzi | — |
| s16 | → s03.i | widzi swoje konto | — |

Nie ma ekranu udostępniania ani zapraszania (#23/AC5). Prototyp nie może go mieć, także jako zaślepki (L18, otwarte do potwierdzenia).

## 2. Scenariusze do przełączania (kontrolki prototypu, nie funkcje produktu)

| ID | Kontrolka | Wartości | Wywołuje stany |
|---|---|---|---|
| SC01 | Sesja | brak / aktywna (konto z listy) / wygasła | s03.i, s04.e, s04.h, s05.e, s06.e, s07.d, s08.b, s11.c, s16.f, s16.g |
| SC02 | Zegar demo | „teraz” stałe / +25 h (sesja żyje 24 h, potem wygasa) | to samo co SC01 „wygasła”, naturalną drogą |
| SC03 | Wynik rejestracji | sukces / `REGISTRATION_FAILED` / `RATE_LIMITED` / sieć / 500 | s02.d–h |
| SC04 | Wynik logowania | sukces / `INVALID_CREDENTIALS` / `RATE_LIMITED` / e-mail niepotwierdzony / sieć / 500 | s03.d–h, s03.k |
| SC05 | Wynik zapisu ogrodu (tworzenie, zmiana nazwy) | sukces / błąd pól z serwera / `LIMIT_REACHED` / `NOT_FOUND` / 401 / sieć / 500 | s05.b–h, s06.b–g |
| SC06 | Wynik usunięcia | sukces / `NOT_FOUND` / 401 / sieć / 500 | s07.b–f |
| SC07 | Opóźnienie odpowiedzi | 0 s / 3 s / bez odpowiedzi | stany „wysyłanie”, „zapisywanie”, s04.c |
| SC08 | Liczba ogrodów konta | 0 / 2 / 20 | s04.a, s04.b, s04.f |
| SC09 | Baza danych | osiągalna / nieosiągalna | s09.a/b, s04.d, s10.a, s11.d |
| SC10 | Otwórz cudzy ogród | skok pod adres ogrodu konta `ewa@example.test` | s11.b → s08.a |
| SC11 | Język interfejsu | polski / angielski | wszystkie ekrany poza s01 (WŁ:L13) |
| SC12 | Usługa wysyłki e-maili | działa / niedostępna | s12.g, s14.d |
| SC13 | Link z maila (weryfikacja, reset) | ważny / wygasł / użyty / nieprawidłowy | s13.a, s13.e, s13.f, s15.a–d |
| SC14 | Stan e-maila konta | potwierdzony / niepotwierdzony | s03.k, s04.i |
| SC15 | Skrzynka demo | podgląd maili wysłanych w prototypie (link do kliknięcia) | wejście na s13 i s15 |
| SC16 | Wynik zmiany hasła w ustawieniach | sukces / złe obecne hasło / 401 / sieć / 500 | s16.d–f, s16.h |

Usługi zewnętrzne w tym przepływie: baza danych i wysyłka e-maili (WŁ:L20, WŁ:L22). Nie ma logowania przez GitHub ani innego dostawcę (social login jest w AGENTS.md na liście „Ask First”) i nie ma AI. Zapytania bez nagłówka CSRF (403) nie da się wywołać z interfejsu, więc nie ma kontrolki.

## 3. Konta i dane demo (wszystko fikcyjne)

**Stałe „teraz” zegara demo:** `2027-03-01 08:00`, strefa `Europe/Warsaw`. Uzasadnienie: cel z briefu to zaplanowanie grządek na 2027 rok, a P01 planuje na wiosnę. To propozycja; data wpływa w tym przepływie tylko na wygasanie sesji i linków z maili.

Domena `example.test` jest zarezerwowana i nie istnieje. Hasło demo dla wszystkich kont to `demo-haslo-2027` (14 znaków, mieści się w 10–128). Działa tylko w prototypie.

Zgodnie z WŁ:L19 każdy członek rodziny ma własne konto i własny ogród.

| Konto | Po co | E-mail potwierdzony | Ogrody (nazwa · opis · utworzony) |
|---|---|---|---|
| `ala@example.test` | właściciel projektu, główna ścieżka | tak | „Ogród za domem” · „Grządki podwyższone przy tarasie” · 2027-02-10; „Działka” · brak opisu · 2027-02-20 |
| `ewa@example.test` | mama, osobne konto; jej ogród służy do 404 przy cudzym ogrodzie (#23/AC2) | tak | „Ogród mamy” · brak opisu · 2027-01-15 |
| `ola@example.test` | babcia, osobne konto | tak | „Ogród babci” · „Śliwa, porzeczki, agrest” · 2027-02-28 |
| `cel@example.test` | świeże konto, pusta lista (s04.b) | tak | — |
| `dar@example.test` | konto z limitem 20 ogrodów (s04.f, s05.d) | tak | „Ogród testowy 01” … „Ogród testowy 20”, brak opisu, co dzień od 2027-02-01 |
| `nowy@example.test` | konto zarejestrowane, e-mail niepotwierdzony (s03.k, s04.i, s14) | nie | — |
| `nikt@example.test` | nie istnieje; ten sam błąd co złe hasło (s03.d) i ten sam komunikat przy resecie (s12.d) | — | — |

Nazwy ogrodów pochodzą z D11 (ogród właściciela, mamy i babci) i z przykładu `GardenList` w design systemie („Ogród za domem”, „Działka”). Opisy są wymyślone; śliwa i porzeczki nawiązują do *Prunus* i krzewów owocowych z briefu (D02).

**Liczby z materiałów, których używa prototyp:** sesja 24 h bez odświeżania; maks. 20 ogrodów na konto; nazwa ogrodu ≤ 120 znaków, opis ≤ 2000; hasło 10–128; e-mail ≤ 254. Bez wartości w materiałach: limit prób (L10) i czas ważności linków z maili (L20, L22). W prototypie wywołują je tylko kontrolki SC04 i SC13. Cen nie ma: brak płatności (N03).

## 4. Luki w specyfikacji

Każda luka ma pytanie i decyzję z 2026-11-02. Statusy decyzji:
- **właściciel**: odpowiedź właściciela.
- **odczyt agenta**: właściciel odpowiedział krótko; agent zapisał, jak to rozumie. Do potwierdzenia.
- **propozycja agenta**: właściciel przekazał decyzję agentowi albo rozstrzygnął tylko „czy”, a nie „jak”. Szczegóły są propozycją do potwierdzenia.
- **otwarte**: brak odpowiedzi.

### Kryterium bez ekranu albo stanu

- **L01 — strona pojedynczego ogrodu nie istnieje, a kryterium jej wymaga.** #23/AC2 i krok 21 SA wymagają, żeby użytkownik B dostał 404 dla ogrodu A „przez stronę i przez API”. SA definiuje tylko stronę `/gardens` i API `/api/gardens/[id]`.
  *Pytanie:* Czy w tym przepływie ma być strona ogrodu? Co na niej jest, zanim powstaną grządki i rośliny?
  **Decyzja (odczyt agenta):** odpowiedź „Ok”, czytana jako zgoda na stronę ogrodu. Dodany ekran s11 `/gardens/[id]` (nazwa, opis, data), a 404 z AC2 jest widoczne na s08 po wejściu na s11. Otwarte: co jeszcze jest na s11 i czy zmiana nazwy i usunięcie są także tam.
- **L02 — wylogowanie nie ma miejsca w interfejsie.** Endpoint istnieje, przycisku brak.
  *Pytanie:* Gdzie jest „Wyloguj” i dokąd prowadzi?
  **Decyzja (właściciel + propozycja agenta):** właściciel: wylogowanie ma być w interfejsie. Propozycja: „Wyloguj” w menu powłoki (`AppShell`), po wylogowaniu s03 z komunikatem „Wylogowano” (s04.g, s03.i).

### Stan potrzebny przepływowi, którego nie opisuje żadne kryterium

- **L03 — wygasła sesja.** SA mówi tylko „przekierowanie do `/login`” i „401”.
  *Pytanie:* Co widzi użytkownik na s03, dokąd wraca po zalogowaniu i co dzieje się z otwartym formularzem?
  **Decyzja (właściciel + propozycja agenta):** właściciel: zachowanie ma być opisane. Propozycja: s03 pokazuje „Sesja wygasła, zaloguj się ponownie”; po zalogowaniu powrót na stronę, z której przekierowano; otwarty formularz pokazuje komunikat z linkiem do logowania (s03.h, s03.i, s04.h, s05.e, s06.e, s07.d, s16.f). Otwarte: czy wpisane dane mają przetrwać ponowne logowanie.
- **L04 — zalogowany użytkownik na s01, s02, s03, s12 lub s13.** Brak opisu.
  *Pytanie:* Czy ma trafić od razu na `/gardens`? Czy s01 pokazuje mu coś innego?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L05 — powracający użytkownik nie ma drogi do logowania.** s01 ma tylko „Plan your garden” → `/register` i „Admin →”.
  *Pytanie:* Czy s01 ma mieć link „Zaloguj się”? Czy s02 i s03 linkują do siebie?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L06 — limit 20 ogrodów.** Jest kod `LIMIT_REACHED`, nie ma treści ani zachowania.
  *Pytanie:* Przycisk wyłączony z wyjaśnieniem czy błąd po zapisie? Jaki tekst?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L07 — informacja po sukcesie i po konflikcie.** Potwierdzenie po zapisie, treść okna usuwania, cofnięcie usunięcia, ogród usunięty w innej karcie.
  *Pytanie:* Jakie mają być te cztery zachowania?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L08 — pierwsze wczytanie listy.**
  *Pytanie:* Widok ładowania przy wejściu na `/gardens` czy nie?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L09 — błąd odczytu i strona 500.**
  *Pytanie:* Osobny ekran s10 czy błąd wewnątrz powłoki s04 i s11?
  **Decyzja (otwarte):** brak odpowiedzi. s10 zostaje kandydatem.
- **L10 — 429 przy logowaniu, rejestracji, resecie hasła i ponownej wysyłce maila.**
  *Pytanie:* Ile prób w jakim oknie? Czy komunikat mówi, ile trzeba poczekać?
  **Decyzja (otwarte):** brak odpowiedzi. Zakres luki urósł o s12.e i s14.c.
- **L11 — brak sieci.**
  *Pytanie:* Jaki tekst? Czy ma być „Spróbuj ponownie”?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L12 — zasady hasła w formularzu.** Dotyczy teraz s02, s13 i s16.
  *Pytanie:* Czy wymagania hasła są widoczne przed wpisaniem? Czy potrzebne są pola „powtórz hasło” i „pokaż hasło”?
  **Decyzja (otwarte):** brak odpowiedzi.

### Sprzeczności między specyfikacją, briefem i design systemem

- **L13 — język interfejsu.** Teksty w SA i na s01 są po angielsku, przykład w DS po polsku.
  *Pytanie:* W jakim języku jest aplikacja?
  **Decyzja (właściciel):** interfejs po polsku i po angielsku; wewnętrznie (kod, klucze tłumaczeń, teksty źródłowe) po angielsku. Prototyp: przełącznik SC11. Otwarte: język domyślny, czy produkt ma przełącznik języka i gdzie (np. s16), format daty w każdym języku.
- **L14 — wygląd listy ogrodów.** SA: `DataTable`, przycisk w `PageHeader`, formularz w panelu. Przykład w DS: karty, formularz na stronie, liczniki grządek i nasadzeń, których `GardenDto` nie zwraca.
  *Pytanie:* Który wzorzec obowiązuje? Czy pokazywać liczniki?
  **Decyzja (otwarte):** odpowiedź właściciela przy L13/L14 dotyczyła języka, nie wzorca listy. Do czasu decyzji mapa trzyma się SA (s04.a bez liczników).
- **L15 — „zmiana nazwy” a schemat zmiany.**
  *Pytanie:* Czy s06 edytuje nazwę i opis, czy tylko nazwę?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L16 — czy gość może coś zobaczyć przed rejestracją.** AGENTS.md i SA (tabela potrzeb: katalog „public read”) mówią o publicznym katalogu. Spec katalogu robi przeglądanie tylko w zalogowanej aplikacji i mówi „no marketing catalogue in this spec”.
  *Pytanie:* Czy w tym przepływie gość ma dostęp do czegoś poza s01?
  **Decyzja (propozycja agenta, właściciel przekazał decyzję):** to nie jest prawdziwa sprzeczność. AGENTS.md (wiążący) i SA zapowiadają publiczny katalog, a spec katalogu tylko go nie obejmuje. Publiczny katalog to więc osobny, jeszcze nieopisany przepływ, a nie część E02-S01. W tym przepływie gość widzi tylko s01, s02, s03, s12–s15 i s09. Na s01 nie ma linku do katalogu, dopóki katalog nie istnieje. Do potwierdzenia przez właściciela.
- **L17 — opis produktu na s01.** s01 mówi „vegetable garden” i „AI suggestions you can accept or ignore”, brief obejmuje krzewy i drzewa (D02), a AI tylko odpowiada na pytania (D08).
  *Pytanie:* Poprawić s01 przed prototypem czy zostawić?
  **Decyzja (otwarte):** brak odpowiedzi.
- **L18 — specyfikacja udostępniania ogrodów.** Szkielet `2026-10-20-garden-sharing.md` jest sprzeczny z N03, D11 i #23/AC5.
  *Pytanie:* Czy prototyp nie ma żadnego śladu udostępniania?
  **Decyzja (otwarte):** brak wprost. WŁ:L19 (każdy ma osobne konto i ogród) jest z tym zgodne, ale nie jest potwierdzeniem.

### Decyzje, których nikt nie podjął

- **L19 — czyje są ogrody rodziny.**
  *Pytanie:* Kto zakłada konta?
  **Decyzja (właściciel):** każdy użytkownik ma własne konto i własny ogród. Dane demo rozdzielone na `ala`, `ewa` i `ola`. Agent rozumie „ogród” jako „swoje ogrody”, bez zmiany limitu 20 z SA. Do potwierdzenia, jeśli miał to być dokładnie jeden ogród na konto.
- **L20 — zapomniane hasło.**
  *Pytanie:* Czy w MVP jest reset hasła?
  **Decyzja (właściciel):** tak. Dodane ekrany s12 i s13. Otwarte: czas ważności linku, czy po ustawieniu hasła użytkownik jest od razu zalogowany, co pokazać przy awarii wysyłki bez ujawnienia, że konto istnieje (s12.g).
- **L21 — ustawienia konta.**
  *Pytanie:* Co jest na stronie ustawień?
  **Decyzja (właściciel + propozycja agenta):** właściciel: ustawienia konta są w zakresie. Propozycja zawartości: e-mail tylko do odczytu i zmiana hasła (s16). Otwarte: zmiana e-maila, usunięcie konta, wybór języka (L13).
- **L22 — potwierdzenie e-maila.**
  *Pytanie:* Czy brak potwierdzenia e-maila jest świadomą decyzją MVP?
  **Decyzja (właściciel):** weryfikacja e-maila jest w zakresie. Dodane ekrany s14 i s15 oraz stany s02.h, s03.k i s04.i. Otwarte: czy niepotwierdzone konto może się zalogować i korzystać z aplikacji, czas ważności linku, co jeśli użytkownik pomylił adres.
- **L23 — nawigacja w powłoce.**
  *Pytanie:* Jakie pozycje ma nawigacja? Czy pokazywać przyszłe funkcje?
  **Decyzja (otwarte):** brak odpowiedzi. Po L02 i L21 w przepływie istnieją „Moje ogrody”, „Ustawienia” i „Wyloguj”.
- **L24 — `/admin` w prototypie.**
  *Pytanie:* Czy s09 należy do prototypu? Czy link „Admin →” zostaje na s01?
  **Decyzja (otwarte):** brak odpowiedzi.

### 4a. Gdzie decyzje rozjeżdżają się z materiałami (do zrobienia później, nie w tej mapie)

Zgodnie z poleceniem nie zmieniam specyfikacji, backlogu ani design systemu. Przed zbudowaniem produktu (nie prototypu) trzeba:

| Decyzja | Z czym się rozjeżdża | Co trzeba będzie zrobić |
|---|---|---|
| WŁ:L22, WŁ:L20 | SA: rejestracja od razu daje 201 + cookie; brak tabel na tokeny, brak endpointów resetu i weryfikacji. #23 nie ma takich kryteriów | dopisać do SA kontrakty, model danych i przypadki brzegowe; dodać kryteria do #23 albo nowe historie w backlogu |
| WŁ:L20, WŁ:L22 | AGENTS.md: zewnętrzne systemy tylko przez porty, lista portów MVP nie ma wysyłki e-maili; testy i CI tylko na mock adapterach | nowy port (np. `EmailSender`) z mock adapterem, nowe zmienne w `env.ts` i `.env.example`, wybór dostawcy. Zmiana zasad projektu wymaga zgody właściciela |
| WŁ:L21 | AGENTS.md wymienia `settings` bez treści; SA nie ma endpointu zmiany hasła | dopisać do SA; uwaga: przy bezstanowym JWT zmiana hasła nie unieważni już wydanych sesji (SA, Risks) |
| WŁ:L13 | AGENTS.md i SA nie przewidują tłumaczeń; teksty w SA są angielskie | decyzja o mechanizmie i18n (biblioteka czy własne słowniki: AGENTS.md „nie dodawaj zależności na 20 linii kodu”), zmiana SA i DS |
| WŁ:L01 | SA ma tylko stronę `/gardens` | dopisać stronę `/gardens/[id]` do SA (krok 21 już jej wymaga) |
| WŁ:L19 | brief D11 mówi o ogrodach rodziny, nie mówi o kontach | dopisać do briefu przy następnym odświeżeniu |
| WŁ:L20–L22, WŁ:L13 | brief D06 (25 h), A02 (Now może się nie zmieścić) | oszacować dodatkowy koszt przed planowaniem; według D07 nadmiar tnie się od dołu (najpierw AI) |

## 5. Luki w design systemie

Dziś DS ma tylko: `Badge`, `Button` (warianty `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; rozmiary 44 px), `Card`, `Input`, `Label`, `Separator`, `Table`, tokeny faz kalendarza i przykład `Examples/Garden list`. SA planuje resztę na fazę 3 (#31), ale jej jeszcze nie ma.

| ID | Brakuje | Potrzebne na | Uwagi |
|---|---|---|---|
| DS01 | `CrudForm` (`backend/forms`) | s02, s03, s05, s06, s12, s13, s16 | SA faza 3 |
| DS02 | Tekst błędu pola (powiązany przez `aria-describedby`) | s02, s03, s05, s06, s12, s13, s16 | `Input` ma tylko styl `aria-invalid`, bez komponentu na treść błędu |
| DS03 | `ErrorMessage`, `EmptyState`, `LoadingMessage` (`backend/feedback`) | s02–s07, s11–s16 | SA faza 3 |
| DS04 | `DataTable` z trybem kart poniżej `md` | s04 | Jest tylko prymityw `Table` |
| DS05 | `Sheet` (shadcn) | s05, s06 | SA krok 11 |
| DS06 | `Textarea` (shadcn) | s05, s06 (opis ≤ 2000) | SA krok 11 |
| DS07 | `ConfirmDialog` + `alert-dialog` | s07 | SA krok 11, 13 |
| DS08 | `AppShell` (dolna nawigacja / panel boczny) + `PageHeader` | s04, s11, s16 | SA krok 13; pozycje menu: L23 |
| DS09 | Układ ekranów `(auth)` (formularz na środku, znak produktu) | s02, s03, s12–s15 | Brak wzorca i historii w Storybooku; da się złożyć z `Card` |
| DS10 | Wzorzec strony błędu (404, 500) | s08, s10 | Brak |
| DS11 | Akcje wiersza (zmień nazwę, usuń) przy 44 px na telefonie | s04 | `DataTable.rowActions` bez wzorca; nie ma `dropdown-menu`. Zależy od L14 |
| DS12 | Potwierdzenie sukcesu (toast `sonner`) | s05–s07 | Tylko jeśli L07 tego wymaga; SA odkłada `sonner` do spec B |
| DS13 | Przykład `Examples/Garden list` niezgodny ze spec A | s04 | Zob. L14 |
| DS14 | Znak produktu w powłoce aplikacji | s02–s04, s11–s16 | Strona główna używa „🌱 Plant.AI”; antyreferencja A01 (emoji w nagłówkach) ma status propozycji. Do decyzji przy DS09 |
| DS15 | Komunikat informacyjny w treści strony (shadcn `alert`) | s03.i, s12.d, s13.d, s14, s15, s16.e | Nowe po WŁ:L02, L03, L20–L22 |
| DS16 | Przełącznik języka | s16 albo powłoka | Tylko jeśli produkt ma przełącznik (L13, otwarte) |
| DS17 | Teksty komponentów do tłumaczenia | wszystkie komponenty z wbudowanym tekstem (np. `ConfirmDialog`, `EmptyState`) | Po WŁ:L13 komponenty nie mogą mieć zaszytych tekstów w jednym języku |

s01 celowo jest poza DS: `(marketing)` ma własny system (AGENTS.md). To nie jest luka.

## 6. Liczby

- **Ekrany:** 16 (s01–s16), w tym 3 nakładki na s04 (s05–s07) i 1 kandydat bez kryterium (s10). Nowe po decyzjach: s11 (L01), s12–s13 (L20), s14–s15 (L22), s16 (L21).
- **Stany:** 91 (s01: 1, s02: 9, s03: 11, s04: 9, s05: 8, s06: 7, s07: 6, s08: 2, s09: 2, s10: 1, s11: 4, s12: 7, s13: 7, s14: 4, s15: 5, s16: 8). Przed decyzjami było ich 53.
- **Kryteria, odwołania i decyzje w sekcji 0:** 28 (5 kryteriów #23, 3 zadania, 12 odwołań do SA i specyfikacji strony głównej, 8 decyzji właściciela).
- **Scenariusze do przełączania:** 16 (SC01–SC16). Przed decyzjami było ich 10.
- **Konta demo:** 7 (6 istniejących + 1 nieistniejący e-mail).
- **Luki w specyfikacji:** 24 (L01–L24): 2 kryteria bez ekranu (L01–L02), 10 stanów bez kryterium (L03–L12), 6 sprzeczności (L13–L18), 6 nierozstrzygniętych decyzji (L19–L24).
  - Według statusu decyzji:
    - 4 decyzje właściciela: L13, L19, L20, L22.
    - 3 decyzje właściciela uzupełnione propozycją agenta: L02, L03, L21.
    - 1 odczyt agenta: L01.
    - 1 propozycja agenta z delegacji: L16.
    - 15 otwartych: L04–L12, L14, L15, L17, L18, L23, L24.
  - Rozstrzygnięte w całości lub w części: 9. Do potwierdzenia przez właściciela (odczyt lub propozycja): 5 (L01, L02, L03, L16, L21). Przy L01, L03, L13 i L19–L22 zostają otwarte szczegóły, opisane przy każdej luce.
- **Luki w design systemie:** 17 (DS01–DS17). Przed decyzjami było ich 14.
- **Rozjazdy decyzji z materiałami (sekcja 4a):** 7.
