# Prototyp „Konta i ogrody” (E02-S01)

Klikalny prototyp przepływu kont i własnych ogrodów Plant.AI. Składa się z komponentów i tokenów design systemu `@plant-ai/ui`. Służy dwóm osobom:

- **właścicielowi produktu**, który klika i komentuje,
- **developerowi**, który buduje z niego prawdziwe ekrany.

To **symulacja**, nie aplikacja. Nie łączy się z serwerem ani bazą, nie wysyła e-maili i nie zapisuje niczego poza pamięcią karty przeglądarki.

## Źródła

| Co | Skąd |
|---|---|
| Ekrany, stany, scenariusze, konta demo, luki | `.ai/prototypes/konto-i-ogrody/mapa-ekranow.md` (zatwierdzona 2026-11-02) |
| Rejestracja → skrzynka → potwierdzenie, założenia | szary prototyp `.ai/prototypes/discovery/gardener-onboarding/revision-001/` (AS08; AS01 wycofane przez właściciela 2026-11-02) |
| Wygląd | `packages/ui` (komponenty i tokeny, tylko do odczytu) |
| Zachowanie | `.ai/specs/2026-10-20-app-primitives.md` (SA) fazy 3–5, `.ai/specs/product-brief.md` |
| Postęp prac i decyzje właściciela | `POSTEP.md` w tym katalogu |

## Jak uruchomić

Z katalogu głównego repo:

```bash
# 1. zbuduj (wynik trafia do packages/app/public/prototypes/konta-i-role/, nie jest commitowany)
npx vite build --config prototypes/konta-ogrody/vite.config.mjs

# 2. otwórz w podglądzie sandboxa (działający `npm run dev`, port 3000)
#    http://localhost:3000/prototypes/konta-i-role/index.html

# testy nawigacji i stanów (jsdom)
npx vitest run --config prototypes/konta-ogrody/vitest.config.mjs

# typy
npx tsc -p prototypes/konta-ogrody/tsconfig.json
```

- Prototyp nie dodaje zależności. Używa React 19, Vite 8, Tailwind v4 i Vitest, które repo już ma.
- Wynik budowania jest wykluczony z gita lokalnym wpisem w `.git/info/exclude` (`packages/app/public/prototypes/`).
- Przy `next start` zbuduj prototyp **przed** startem serwera, bo `next start` czyta `public/` przy uruchomieniu. `next dev` podaje nowe pliki od razu.

## Jak czytać prototyp

- **Pasek przeglądu** (u góry, przerywana krawędź) to narzędzie prototypu, nie część produktu. Zawiera:
  - oznaczenie „Prototyp · dane fikcyjne”,
  - wybór ekranu s01–s16,
  - motyw jasny/ciemny,
  - język PL/EN (SC11),
  - **„Notatka sXX”**: historie, co jest symulacją i czego prototyp nie rozstrzyga,
  - **„Scenariusze”**: konta, zegar, kontrolki SC, skrzynka demo, reset.
- **Identyfikatory ekranów** są takie jak w mapie (s01–s16). Ten, który widać, stoi w atrybucie `data-screen` i w tytule karty. Adresy są takie jak w aplikacji (`#/gardens/[id]`, `#/settings`…).
- **Luki design systemu** są w kodzie oznaczone `DS-GAP DSxx` (`src/gaps.tsx`, `src/review-bar.tsx`, `src/screens/*`). To najprostsze wersje z istniejących komponentów i tokenów. Nie dodano żadnego koloru, odstępu ani nowego komponentu do DS.
- **Otwarte luki specyfikacji** (L04–L24) są zbudowane według propozycji z mapy i opisane w notatce ekranu.

## Konta demo

Wszystkie dane są fikcyjne (mapa §3). Domena `example.test` jest zarezerwowana i nie istnieje. Hasło demo dla każdego konta to `demo-haslo-2027`; jest wypisane na ekranie logowania. Najszybciej zmienisz konto w pasku: „Scenariusze” → „Konto demo”.

| Konto | Do czego |
|---|---|
| `ala@example.test` | właścicielka projektu, 2 ogrody („Ogród za domem”, „Działka”), główna ścieżka |
| `ewa@example.test` | mama, osobne konto; jej „Ogród mamy” pokazuje 404 dla `ala` (#23/AC2) |
| `ola@example.test` | babcia, „Ogród babci” |
| `cel@example.test` | świeże konto, pusta lista (s04.b) |
| `dar@example.test` | 20 ogrodów, limit (s04.f, s05.d) |
| `nowy@example.test` | e-mail niepotwierdzony (s03.k, s04.i) |
| `nikt@example.test` | nie istnieje: ten sam błąd co złe hasło (s03.d), ten sam komunikat przy resecie (s12.d) |

**Stałe „teraz”:** 1 marca 2027, 08:00, Europe/Warsaw. Sesja żyje 24 h na tym zegarze.

**Role.** Produkt ma jedną rolę `user` (N03, AGENTS.md). Zamiast ról prototyp przełącza trzy sytuacje z mapy:
- **gość:** „— gość —” w pasku,
- **właściciel ogrodu:** dowolne konto,
- **nie-właściciel:** „Otwórz cudzy ogród (ewa)”.

## Scenariusze (panel „Scenariusze”)

| ID | Kontrolka | Wartości |
|---|---|---|
| SC01 | Konto demo / sesja | gość, każde konto; „Wygaś sesję” |
| SC02 | Zegar | „+25 h” (sesja wygasa przy następnym żądaniu), „Wróć do teraz” |
| SC03 | Wynik rejestracji | sukces, `REGISTRATION_FAILED`, 429, brak sieci, 500 |
| SC04 | Wynik logowania | wg danych konta, `INVALID_CREDENTIALS`, 429, brak sieci, 500 |
| SC05 | Zapis ogrodu (nowy, zmiana nazwy) | sukces, błąd pól, `LIMIT_REACHED`, `NOT_FOUND`, 401, brak sieci, 500 |
| SC06 | Usunięcie ogrodu | sukces, `NOT_FOUND`, 401, brak sieci, 500 |
| SC07 | Opóźnienie odpowiedzi | 0 s, 3 s, bez odpowiedzi |
| SC08 | Liczba ogrodów | przez konta `cel` (0), `ala` (2), `dar` (20) |
| SC09 | Baza danych | osiągalna, nieosiągalna |
| SC10 | Cudzy ogród | przycisk „Otwórz cudzy ogród (ewa)” |
| SC11 | Język | polski, angielski |
| SC12 | Wysyłka e-maili | działa, niedostępna |
| SC13 | Link z maila | ważny, wygasł, użyty, nieprawidłowy |
| SC14 | Stan e-maila konta | przez konto `nowy` (niepotwierdzony) albo nowe konto przed kliknięciem linku |
| SC15 | Skrzynka demo | maile „wysłane” w prototypie z przyciskiem „Otwórz link” |
| SC16 | Zmiana hasła w ustawieniach | wg danych konta, złe obecne hasło, 401, brak sieci, 500 |
| SC17 | Błąd następnego żądania | 429, brak sieci, 500. Działa raz, dla wysyłki maila i linków |

SC17 nie pochodzi z mapy; dodano go na prośbę z zadania.

Tabela „stan → jak go wywołać” dla wszystkich 91 stanów jest w `POSTEP.md` (Etap 2).

## Ograniczenia symulacji

- **Nic nie jest prawdziwe.** Logowanie, sesja, e-mail i baza to kod w przeglądarce. Hasła nie wychodzą z karty, a pola mają dopisek „Symulacja: nie wpisuj prawdziwego hasła”. Nie wpisuj prawdziwych danych.
- **E-maile** trafiają tylko do skrzynki demo w pasku. Nie ma prawdziwej usługi wysyłki ani portu dla niej (por. mapa §4a).
- **Przeładowanie strony = reset** wszystkiego poza adresem. Dane żyją tylko w pamięci karty.
- **Błędy pochodzą z przełączników**, a nie z prawdziwego serwera. Kody i kształt odpowiedzi (`{ ok, data }` / `{ ok:false, status, error:{ code, fieldErrors } }`) są jak w SA, ale treści komunikatów to propozycje (L10, L11).
- **Wygaśnięcie sesji** przy otwartej stronie zauważa dopiero następne żądanie (s04.h). Przesunięcie zegara wstecz nie wskrzesza sesji.
- **Teksty PL** to tłumaczenie prototypu. Teksty EN cytowane w SA są dosłowne. Mechanizm i18n produktu nie jest wybrany (L13).
- **Brak CSRF, limitów prób i ochrony przed wyliczaniem kont po stronie serwera.** Pokazane jest tylko to, co widzi użytkownik.
- **Czego prototyp nie rozstrzyga:**
  - L04: zalogowany na s01/s02/s03; stan s02.i nie jest zbudowany,
  - L06, L07, L08, L09: propozycje,
  - L10: limity,
  - L12: zasady hasła,
  - L14: tabela czy karty,
  - L15: opis edytowalny przy zmianie nazwy (propozycja),
  - L17: tekst s01,
  - L18: brak udostępniania (zgodnie z N03),
  - L20, L22: czasy ważności linków,
  - L21: pełna treść ustawień,
  - L23: pozycje menu,
  - L24: s09 w przepływie.
- **s01** to przybliżenie strony marketingowej z tokenów DS. Prawdziwa strona ma osobny system (AGENTS.md).
- **Prototyp nie dowodzi**, że użytkownicy chcą tego przepływu. Pokazuje tylko, jak działa.

## Pliki

```
prototypes/konta-ogrody/
├── index.html, vite.config.mjs, vitest.config.mjs, tsconfig.json
├── src/
│   ├── App.tsx          bramki dostępu, wybór ekranu, fokus po nawigacji, motyw
│   ├── router.ts        adresy ↔ s01–s16
│   ├── store.ts         stan w pamięci, sesja, scenariusze
│   ├── api.ts           symulowane API (kody z SA)
│   ├── data.ts          konta i ogrody demo, stałe „teraz”, limity
│   ├── i18n.ts          teksty PL/EN
│   ├── notes.ts         notatki przy ekranach
│   ├── gaps.tsx         luki DS (DS-GAP)
│   ├── forms.ts, session.ts
│   ├── review-bar.tsx   pasek przeglądu
│   └── screens/         auth, gardens, public, shell
├── test/                navigation.test.tsx, states.test.tsx
├── evidence/            zrzuty z przeglądarki (e1, e2, e3)
├── POSTEP.md            postęp i decyzje
└── README.md
```

Prototypu nie importuje aplikacja ani design system. Można go usunąć bez skutków dla reszty repo.
