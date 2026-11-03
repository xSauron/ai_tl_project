// Per-screen honesty notes (Etap 3): stories/criteria, what is simulated, what the
// prototype does not decide. Sources: screen map §0–§5 and grey prototype README.
import type { ScreenId } from "./router"

export type ScreenNote = {
  /** Stories, acceptance criteria and decisions behind the screen. */
  refs: string
  simulated: { pl: string; en: string }
  undecided: { pl: string; en: string }
}

export const NOTES: Record<ScreenId, ScreenNote> = {
  s01: {
    refs: "LP:CTA · L05 · L17 · L24",
    simulated: { pl: "Przybliżenie strony głównej z tokenów DS; prawdziwa strona ma osobny system (marketing).", en: "Home page approximated with DS tokens; the real page has its own (marketing) system." },
    undecided: { pl: "L05 link „Zaloguj się” (propozycja). L17 opis produktu. L24 link „Admin”. L04 co widzi zalogowany.", en: "L05 “Log in” link (proposal). L17 product copy. L24 “Admin” link. L04 what a signed-in user sees." },
  },
  s02: {
    refs: "#32 · SA:API-reg · SA:MSG-reg · SA:UI-auth · WŁ:L22",
    simulated: { pl: "Konto powstaje tylko w pamięci karty. Hasło nie jest nigdzie wysyłane.", en: "The account exists only in this tab’s memory. The password is not sent anywhere." },
    undecided: { pl: "L10 limit prób i czas oczekiwania. L11 tekst braku sieci. L12 wymagania hasła, „powtórz”, „pokaż”. L04 wejście z sesją (s02.i niezbudowany). L22 czy sesja przed potwierdzeniem.", en: "L10 attempt limit and wait time. L11 offline copy. L12 password rules, repeat/show. L04 entry with a session (s02.i not built). L22 session before confirmation." },
  },
  s03: {
    refs: "#23/AC1 · AC3 · AC4 · #32 · SA:API-login · WŁ:L02 · L03 · L20 · L22",
    simulated: { pl: "Logowanie sprawdza konta demo w pamięci. Hasło demo jest wypisane, bo to dane prototypu.", en: "Login checks demo accounts in memory. The demo password is shown because it is prototype data." },
    undecided: { pl: "L10 limit prób. (L22 rozstrzygnięte: niepotwierdzone konto loguje się i prosi o nowy link.) L03 teksty komunikatów (propozycja). L05 link do rejestracji (propozycja).", en: "L10 attempt limit. (L22 decided: an unconfirmed account logs in and can ask for a new link.) L03 message copy (proposal). L05 link to register (proposal)." },
  },
  s04: {
    refs: "#23/AC1 · AC2 · #33 · SA:API-gardens · SA:UI-gardens · SA:SHELL · WŁ:L01 · L02 · L03",
    simulated: { pl: "Lista z pamięci, tylko ogrody bieżącego konta. Wyniki zapisu i odczytu ustawia pasek (SC05, SC07, SC09).", en: "List from memory, only the current account’s gardens. Read/save outcomes come from the bar (SC05, SC07, SC09)." },
    undecided: { pl: "(L06 rozstrzygnięte: przy 20 ogrodach przycisk wyłączony z wyjaśnieniem.) L07 potwierdzenie sukcesu (propozycja: komunikat, nie toast). L08 pierwsze wczytanie. L09 błąd odczytu. L14 tabela czy karty, liczniki. L23 pozycje menu.", en: "(L06 decided: at 20 gardens the button is disabled with the reason.) L07 success confirmation (proposal: notice, not toast). L08 first load. L09 read error. L14 table vs cards, counters. L23 menu items." },
  },
  s05: {
    refs: "SA:UI-gardens · SA:API-gardens · SA:CF · WŁ:L03",
    simulated: { pl: "Zapis w pamięci; błędy z paska SC05. Ctrl/Cmd+Enter zapisuje, Escape anuluje.", en: "Saved in memory; errors from SC05. Ctrl/Cmd+Enter saves, Escape cancels." },
    undecided: { pl: "L06 limit. L07 potwierdzenie. L03 czy dane przetrwają ponowne logowanie (prototyp: nie).", en: "L06 limit. L07 confirmation. L03 whether data survives re-login (prototype: no)." },
  },
  s06: {
    refs: "SA:UI-gardens · SA:API-gardens · WŁ:L03",
    simulated: { pl: "Jak s05; `NOT_FOUND` z paska udaje ogród usunięty w innej karcie.", en: "Like s05; `NOT_FOUND` from the bar stands in for a garden deleted in another tab." },
    undecided: { pl: "L15 czy edytuje się też opis (prototyp: tak). L07 treść po sukcesie i po konflikcie.", en: "L15 whether description is editable too (prototype: yes). L07 copy after success and conflict." },
  },
  s07: {
    refs: "SA:UI-gardens · SA:API-gardens · WŁ:L03",
    simulated: { pl: "Usunięcie z pamięci; błędy z paska SC06.", en: "Deletion in memory; errors from SC06." },
    undecided: { pl: "L07 treść pytania i skutków, cofnięcie usunięcia.", en: "L07 question and consequence copy, undo." },
  },
  s08: {
    refs: "#23/AC2 · #33 · SA krok 21 · WŁ:L01",
    simulated: { pl: "Cudzy i nieistniejący ogród dają ten sam widok.", en: "Foreign and missing gardens show the same view." },
    undecided: { pl: "Wygląd strony błędu (DS10).", en: "Error page design (DS10)." },
  },
  s09: {
    refs: "SA:UI-admin · L24",
    simulated: { pl: "Stan bazy z paska SC09, nie z prawdziwego /api/health.", en: "Database state from SC09, not the real /api/health." },
    undecided: { pl: "L24 czy ekran należy do przepływu.", en: "L24 whether this screen belongs to the flow." },
  },
  s10: {
    refs: "SA:EDGE · L09",
    simulated: { pl: "Pojawia się przy SC09 = nieosiągalna na stronie ogrodu.", en: "Shown when SC09 = unreachable on a garden page." },
    undecided: { pl: "L09 osobny ekran czy błąd w powłoce (ekran-kandydat).", en: "L09 separate screen or in-shell error (candidate screen)." },
  },
  s11: {
    refs: "WŁ:L01 · #23/AC2 · SA:API-gardens",
    simulated: { pl: "Szczegóły ogrodu z pamięci.", en: "Garden details from memory." },
    undecided: { pl: "L01 co jeszcze jest na stronie ogrodu i czy są tu zmiana nazwy i usunięcie.", en: "L01 what else is on the garden page and whether rename/delete live here." },
  },
  s12: {
    refs: "WŁ:L20 · AGENTS.md (no account enumeration)",
    simulated: { pl: "E-mail trafia do skrzynki demo w pasku, nie do prawdziwej skrzynki.", en: "The email lands in the demo inbox in the bar, not a real mailbox." },
    undecided: { pl: "L20 co pokazać przy awarii wysyłki bez ujawnienia konta (prototyp: komunikat ogólny). L10 limit.", en: "L20 what to show when sending fails without revealing the account (prototype: generic notice). L10 limit." },
  },
  s13: {
    refs: "WŁ:L20 · SA:API-reg (hasło 10–128)",
    simulated: { pl: "Link ze skrzynki demo; wygasły i nieprawidłowy z paska SC13.", en: "Link from the demo inbox; expired and invalid from SC13." },
    undecided: { pl: "L20 czas ważności linku, czy logować od razu po zmianie (prototyp: nie).", en: "L20 link lifetime, auto-login after reset (prototype: no)." },
  },
  s14: {
    refs: "WŁ:L22",
    simulated: { pl: "Żaden e-mail nie wychodzi; link czeka w skrzynce demo. Można też od razu się zalogować bez potwierdzenia (L22).", en: "No email is sent; the link waits in the demo inbox." },
    undecided: { pl: "L22 co jeśli użytkownik pomylił adres. L10 limit ponownych wysyłek.", en: "L22 what if the address was mistyped. L10 resend limit." },
  },
  s15: {
    refs: "WŁ:L22 · właściciel 2026-11-02 (AS01 wycofane)",
    simulated: { pl: "Potwierdzenie nie loguje. Bez sesji prowadzi do logowania; zalogowanemu zostaje jego sesja.", en: "Confirming does not sign in. Without a session it leads to log in; a signed-in user keeps the session." },
    undecided: { pl: "L22 czas ważności linku.", en: "L22 link lifetime." },
  },
  s16: {
    refs: "WŁ:L21 · AGENTS.md (settings) · SA:API-reg",
    simulated: { pl: "Zmiana hasła w pamięci; błędy z paska SC16.", en: "Password change in memory; errors from SC16." },
    undecided: { pl: "L21 zmiana e-maila, usunięcie konta, wybór języka (L13). Zawartość ekranu to propozycja.", en: "L21 change email, delete account, language choice (L13). Screen content is a proposal." },
  },
}
