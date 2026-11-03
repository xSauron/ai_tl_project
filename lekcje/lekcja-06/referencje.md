# Referencje: Plant.AI

Data: 2026-10-20. Referencje wybrał: właściciel projektu (R01, R02, A01). Wszystko oznaczone „propozycja" dodał agent i czeka na decyzję właściciela.

**Słowa charakteru (propozycja, niepotwierdzone):** czytelny, spokojny, praktyczny (jak zeszyt przy grządce), konkretny.
**Antycharakter (propozycja, niepotwierdzony, wyprowadzony z antyreferencji A01–A04):** sklepowy, nachalny, generyczny-AI, drobny i zagęszczony.

Podstawa: `.ai/specs/product-brief.md` (D07: kalendarz i zadania, siatka z ostrzeżeniami, odpowiedzi AI; D09: dziennik ze zdjęciami i układ AI są na później; D14: operacje; N01 tylko siatka; N02 AI proponuje, użytkownik zatwierdza). Przeczytane: brief, wywiad z właścicielem, wyniki wyszukiwania po słowach kluczowych w wywiadach i walkthroughie. Nie otwierane w całości: ankieta, tablice Miro, benchmark Planter, pliki decyzji N01/N02. Materiały z wywiadów i ankiety są ilustracyjne (manifest źródeł), nie są prawdziwymi ludźmi.

**Brak zrzutów.** R01 i R02 to przedmioty fizyczne (zeszyt, torebka), bez zdjęć i linków. Obserwacje poniżej są parafrazą opisu właściciela, nie oglądanego obrazu. Kolejne kroki wymagają zdjęcia zeszytu i tyłu torebki.

## Referencje

| # | Referencja | Źródło | Kto wybrał | Obserwacja | Bierzemy | Nie bierzemy | Robimy zamiast tego | Dlaczego pasuje do produktu | Rodzina | Waga | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R01.1 | Zeszyt w kratkę | papierowy zeszyt ogrodniczy z planem grządek | właściciel | Papier w kratkę; jedna kratka papieru odpowiada jednej jednostce grządki, więc plan grządki rysuje się wprost na papierowej siatce. (parafraza opisu, bez zdjęcia) | Siatka kwadratowa jako główna powierzchnia ekranu grządki; jedna komórka = jedna jednostka siatki | — | — | Zgodne z N01 (tylko siatka) i siatką stopy kwadratowej w briefie; rozpoznawalne dla ogrodnika, który prowadzi zeszyt | komponenty | musi być | przyjęte (wybór właściciela) |
| R01.2 | Zeszyt w kratkę | j.w. | właściciel | Notatki ręczne zapisane przy konkretnym miejscu na planie, nie na osobnej stronie. (parafraza) | Opis przypięty do miejsca: informacja o roślinie lub operacji pokazuje się przy tej komórce lub grupie komórek | — | — | Odpowiada na problem „łatwo się pogubić, co gdzie i kiedy" (wywiad z właścicielem, 2026-10-19). Uwaga: notatki tekstowe na operacjach wykluczono w Q16/D14; tu chodzi o położenie informacji, nie o pole notatki | kompozycja | musi być | propozycja (zakres „notatki" do potwierdzenia, patrz Luki) |
| R01.3 | Zeszyt w kratkę | j.w. | właściciel | Kolejne sezony leżą obok siebie, widać zmianę układu rok do roku. (parafraza) | Możliwość porównania sezonów obok siebie | — | — | Brief: rotacja i historia są na później (D09); nie ma dowodu, że potrzeba jest dziś. Pasuje do produktu dopiero po D09 | kompozycja | musi być | propozycja: odłożone razem z D09 |
| R01.4 | Zeszyt w kratkę | j.w. | właściciel (odrzucone) | „Trudno coś znaleźć" — informacje są rozproszone po stronach bez indeksu. | — | Brak spisu i szukania | Jedna lista zadań i operacji (D12, D14) z grupowaniem „w tym tygodniu / później"; stałe miejsce na każdą rzecz | Lista zadań to rdzeń MVP (D07 pkt 1) | kompozycja | musi być | propozycja (rozwiązanie agenta) |
| R01.5 | Zeszyt w kratkę | j.w. | właściciel (odrzucone) | „Pismo nieczytelne." | — | Pismo odręczne jako styl | Druk, duży kontrast tekstu do tła, krótkie etykiety; minimalny rozmiar tekstu do ustalenia w tokenach, sprawdzony w słońcu na telefonie | Użytkownik pracuje na telefonie na działce w słońcu | typografia | musi być | propozycja (rozwiązanie agenta) |
| R01.6 | Zeszyt w kratkę | j.w. | właściciel (odrzucone) | „Wszystko jednym kolorem długopisu" — jeden kolor, więc nic się nie wyróżnia. | — | Jednobarwność | Kolor niesie znaczenie: osobny kolor dla rodzaju zadania lub stanu (patrz R02.2); kolor nigdy nie jest jedynym nośnikiem znaczenia (ikona lub etykieta obok) | Ostrzeżenia o sąsiedztwie i fazy kalendarza muszą się odróżniać na pierwszy rzut oka | kolor | musi być | propozycja (rozwiązanie agenta) |
| R02.1 | Tył torebki z nasionami | tył torebki z nasionami (kalendarz siewu i ikony) | właściciel | Kalendarz jako poziome paski rozciągnięte na 12 miesiącach, jeden pasek na czynność. Całość odczytuje się w kilka sekund. (parafraza, bez zdjęcia) | Poziomy pasek 12 miesięcy dla każdej rośliny jako widok kalendarza | — | — | Kalendarz z dat przymrozków to punkt 1 w D07; ten układ odpowiada na „kiedy co zrobić" | komponenty | warto | przyjęte (wybór właściciela) |
| R02.2 | Tył torebki z nasionami | j.w. | właściciel | Siew, wysadzanie i zbiór mają różne kolory na tym samym pasku. (parafraza) | Osobny kolor dla każdej fazy (siew, wysadzanie, zbiór; w naszym produkcie także cięcie). Konkretne barwy nie zostały podane | — | — | Zadania w briefie to siew, wysadzanie, cięcie; kolor rozróżnia je bez czytania | kolor | warto | przyjęte (wybór właściciela); wartości barw do ustalenia |
| R02.3 | Tył torebki z nasionami | j.w. | właściciel | Proste ikony słońca i rozstawu zamiast opisów. (parafraza) | Proste ikony dla nasłonecznienia i rozstawu | — | — | Odczyt bez tekstu w słońcu; rozstaw wynika z katalogu i siatki | komponenty | warto | przyjęte (wybór właściciela) |
| R02.4 | Tył torebki z nasionami | j.w. | właściciel (odrzucone) | Drobny druk i dużo tekstu. | — | Drobny druk, gęsty tekst | Jedna krótka etykieta na wierzchu; szczegóły po dotknięciu; minimalny rozmiar tekstu jak w R01.5 | Ekran telefonu, praca w terenie | typografia, gęstość | warto | propozycja (rozwiązanie agenta) |
| R02.5 | Tył torebki z nasionami | j.w. | właściciel (odrzucone) | Wyidealizowane zdjęcia warzyw. | — | Zdjęcia stockowe i „idealne" owoce | Bez zdjęć w katalogu i na liście; ikony lub proste rysunki; zdjęcia użytkownika dopiero z dziennikiem (D09) | Zdjęcia wyidealizowane nie pasują do realnych plonów ogrodnika | komponenty, ton wypowiedzi | warto | propozycja (rozwiązanie agenta) |

## Antyreferencje

| # | Wygląd | Dlaczego nie | Podpis do uniknięcia | Źródło |
|---|---|---|---|---|
| A01 | „Typowa strona" (karta właściciela nie ma więcej opisu) połączona z „generycznym wyglądem AI" | Właściciel podał tylko źródło „typowa strona", bez opisu i oceny. Antyreferencję „generyczny wygląd AI" i tak trzeba dodać; połączyłem je do czasu uzupełnienia | Fioletowo-niebieski gradient; białe karty z dużym zaokrągleniem i miękkim cieniem na szarym tle; ikona iskry lub różdżki przy funkcjach AI; sekcja „hero" z hasłem i dwoma przyciskami; emoji w nagłówkach; domyślny font systemowy bez wyboru; losowe ilustracje 3D | gust właściciela (niepełny opis) + propozycja |
| A02 | Sklep i reklama w aplikacji | Wywiad z mieszkanką balkonu: „nie chce żeby mi apka mówiła że to grzyb i sprzedawała oprysk"; wymieniła też reklamy. Spryski są w briefie Later (D09), a R06 każe AI oznaczać odpowiedzi jako sugestie | Baner „kup" lub „polecany produkt"; przycisk zakupu przy opisie choroby; promocja i etykieta „-20%"; kafelki produktów między zadaniami; diagnoza podana jako pewnik | badania (materiał ilustracyjny) + propozycja |
| A03 | Nachalność: liczniki i powiadomienia | Wywiad z ogrodnikiem grządek podwyższonych: nie chce częstych powiadomień ani częstego logowania; walkthrough: niechciane częste powiadomienia; mieszkanka balkonu: „maks kawe raz". Brief: cron i przypomnienia wymagają zatwierdzenia | Czerwona kropka lub licznik na ikonie; „masz 12 zaległych zadań" w kolorze alarmu; wyskakujące okna przy wejściu; powiadomienie push co kilka godzin; seria dni („streak") | badania (materiał ilustracyjny) + propozycja |
| A04 | Ściana drobnego tekstu | Z karty R02: drobny druk, za dużo tekstu; ekran telefonu w słońcu | Tekst w jednolitym małym rozmiarze; opisy dłuższe niż jedno zdanie na liście; jasnoszary tekst na białym; skróty bez wyjaśnienia | gust właściciela (z R02) + propozycja |

## Konflikty i rozstrzygnięcia

| Konflikt | Referencje | Rozstrzygnięcie | Kto zdecydował |
|---|---|---|---|
| Gęstość: pełna siatka z notatkami przy miejscach kontra widok „w kilka sekund", mało tekstu | R01.1, R01.2 (musi być) vs R02.1, R02.4 (warto) | Propozycja: dwa poziomy. Ekran grządki jest gęsty (siatka, informacja przypięta do komórki). Kalendarz i lista są rzadkie (jedna etykieta, szczegóły po dotknięciu). Pierwszeństwo przy wątpliwości: R01 (musi być) | do decyzji właściciela |
| Kolor: „wszystko jednym kolorem" (zeszyt, odrzucone) kontra wiele kolorów faz (torebka, przyjęte) | R01.6 vs R02.2 | Propozycja: kolory tylko tam, gdzie niosą znaczenie (fazy, stan, ostrzeżenie); reszta neutralna. Kolor zawsze z drugim nośnikiem | do decyzji właściciela |
| Siatka jako podstawa interfejsu kontra mieszkanka balkonu: „wszystkie te kratki metr na metr to nie dla mnie" | R01.1 vs badania (materiał ilustracyjny) | Nie rozstrzygam: N01 (tylko siatka) już zapadło, a właściciel buduje dla własnych ogrodów rodziny (D11). Uwaga na przyszłość: siatka nie może być jedynym wejściem do produktu. Lista zadań działa bez siatki (D10: roślina bez grządki) | N01, D10, D11 (właściciel) |
| Historia sezonów obok siebie kontra „na później" w briefie | R01.3 vs D09 | Propozycja: nie budować w MVP; wrócić po własnym teście właściciela (D13) | do decyzji właściciela |
| Referencje o dzienniku i układzie AI w treści zadania kontra brief (oba na później) | kontekst zadania vs D08, D09 | Pliki i tokeny dotyczą MVP z D07; dziennik i układ AI tylko oznaczone jako później | do potwierdzenia przez właściciela |

## Luki

Rodziny bez żadnej referencji właściciela:
- **Typografia:** poza „nieczytelne" (R01.5) i „drobny druk" (R02.4) brak wskazania kroju, proporcji ani stylu nagłówków. Do uzupełnienia przez właściciela albo propozycji do oceny.
- **Ton wypowiedzi:** brak referencji. Propozycja do oceny: krótko, po polsku, bez wykrzykników; odpowiedzi AI oznaczone jako sugestie (R06); bez sprzedawania (A02).
- **Ruch i reakcja:** brak referencji. Propozycja do oceny: ruch tylko jako informacja zwrotna po akcji; bez animacji tła i ozdobnych przejść; Cmd/Ctrl+Enter zapisuje, Escape anuluje (AGENTS.md).
- **Kolor:** brak konkretnych barw; nie wiadomo, czy paleta ma być ziemista, jasna czy zielona. Ustalić z obrazów.
- **Kompozycja:** brak referencji do nawigacji na telefonie i do ekranu głównego.

Pytania bez odpowiedzi (przyjęte założenia, żeby ruszyć dalej):
1. Karta A01 jest niepełna. Założenie: to ogólny „typowy" wygląd, więc połączono ją z „generycznym wyglądem AI". Wymaga uzupełnienia: co dokładnie nie podoba się i jak bardzo.
2. R01.3 „kolejne sezony obok siebie": dwie siatki obok siebie czy kolejne strony? Założenie: odłożone razem z D09.
3. R01.2: czy „notatki przy miejscu" to tylko położenie informacji, czy pole tekstowe? Założenie: tylko położenie informacji, bez pola notatki (Q16).
4. Propozycje własne agenta (R01.4–R01.6, R02.4, R02.5, A01–A04, słowa charakteru i antycharakteru, propozycje dla typografii, tonu i ruchu) czekają na przyjęcie lub odrzucenie każda osobno. Do tego czasu mają status „propozycja".
5. Wagi „musi być / warto" przepisane od właściciela. Dla odrzuconych cech (R01.4–R01.6, R02.4, R02.5) przyjąłem wagę referencji, z której pochodzą.

## Obrazy

Brak zrzutów i zdjęć. Oczekiwane nazwy plików obok tego dokumentu:
- `R01-zeszyt-w-kratke.png` (zdjęcie lub skan strony z planem grządek, najlepiej dwa sezony)
- `R02-torebka-kalendarz-siewu.png` (tył torebki z kalendarzem i ikonami)
- `A01-typowa-strona.png` (przykład „typowej strony", jeśli właściciel chce go wskazać)

Nic w tym pliku nie jest jeszcze regułą. Zasady i tokeny powstają w następnym kroku, z tego pliku, i każdą z nich zatwierdzam osobno.
