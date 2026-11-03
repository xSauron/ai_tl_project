// Review bar: a prototype tool, NOT part of the product. Kept apart from product
// navigation (task rule 5). Holds the "Prototype" label, screen picker, theme and
// language switches, demo accounts, scenario controls (SC01–SC17) and the demo inbox.
// Built from DS Button/Badge/Label/Separator + tokens; native <select> styled like DS Input
// (DS-GAP: no Select component in the DS).
import { useId, useState } from "react"
import { Badge } from "@plant-ai/ui/components/badge"
import { Button } from "@plant-ai/ui/components/button"
import { Label } from "@plant-ai/ui/components/label"
import { Separator } from "@plant-ai/ui/components/separator"
import { ChevronDown, ChevronUp, Inbox, Moon, Sun } from "lucide-react"

import { CLOCK_JUMP_MS, FOREIGN_GARDEN_ID } from "./data"
import { NOTES } from "./notes"
import { href, navigate, type ScreenId } from "./router"
import {
  type Lang,
  type Scenarios,
  type State,
  getState,
  isSessionAlive,
  now,
  resetState,
  setScenario,
  setState,
  useStore,
} from "./store"

const SCREENS: { id: ScreenId; pl: string; en: string; to?: string }[] = [
  { id: "s01", pl: "Strona główna", en: "Home" },
  { id: "s02", pl: "Rejestracja", en: "Register" },
  { id: "s03", pl: "Logowanie", en: "Log in" },
  { id: "s04", pl: "Moje ogrody", en: "My gardens" },
  { id: "s05", pl: "Nowy ogród (panel)", en: "New garden (sheet)" },
  { id: "s06", pl: "Zmiana nazwy (panel)", en: "Rename (sheet)", to: href({ screen: "s06", param: "g-ala-1" }) },
  { id: "s07", pl: "Usuń ogród (okno)", en: "Delete garden (dialog)", to: href({ screen: "s07", param: "g-ala-1" }) },
  { id: "s08", pl: "Nie znaleziono (404)", en: "Not found (404)" },
  { id: "s09", pl: "Status systemu", en: "System status" },
  { id: "s10", pl: "Błąd serwera (500)", en: "Server error (500)" },
  { id: "s11", pl: "Ogród", en: "Garden", to: href({ screen: "s11", param: "g-ala-1" }) },
  { id: "s12", pl: "Nie pamiętam hasła", en: "Forgot password" },
  { id: "s13", pl: "Nowe hasło", en: "New password" },
  { id: "s14", pl: "Sprawdź skrzynkę (tylko po rejestracji)", en: "Check inbox (after registering only)" },
  { id: "s15", pl: "Potwierdzenie e-maila", en: "Confirm email" },
  { id: "s16", pl: "Ustawienia konta", en: "Account settings" },
]

const copy = {
  pl: {
    prototype: "Prototyp",
    fictitious: "dane fikcyjne",
    screen: "Ekran",
    theme: "Motyw",
    light: "Jasny",
    dark: "Ciemny",
    lang: "Język",
    account: "Konto demo",
    guest: "— gość (bez sesji) —",
    scenarios: "Scenariusze",
    inbox: "Skrzynka demo",
    inboxEmpty: "Brak maili. Zarejestruj się albo poproś o reset hasła.",
    inboxNote: "Symulacja: żaden e-mail nie wychodzi z przeglądarki.",
    verify: "Potwierdź adres",
    reset: "Zresetuj hasło",
    open: "Otwórz link",
    reset_all: "Resetuj prototyp",
    clock: "Teraz",
    expire: "Wygaś sesję",
    foreign: "Otwórz cudzy ogród (ewa)",
    jump: "+25 h",
    clockReset: "Wróć do „teraz”",
    clockNote: "Powrót zegara nie wskrzesza wygasłej sesji. Zaloguj się ponownie albo wybierz konto.",
    screenPicker: "Wybierz ekran",
    prototypeNote: "Pasek przeglądu nie jest częścią produktu.",
    note: "Notatka",
    refs: "Historie i decyzje",
    simulated: "Symulacja",
    undecided: "Nierozstrzygnięte",
  },
  en: {
    prototype: "Prototype",
    fictitious: "fictitious data",
    screen: "Screen",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    lang: "Language",
    account: "Demo account",
    guest: "— guest (no session) —",
    scenarios: "Scenarios",
    inbox: "Demo inbox",
    inboxEmpty: "No emails. Register or request a password reset.",
    inboxNote: "Simulation: no email leaves the browser.",
    verify: "Confirm address",
    reset: "Reset password",
    open: "Open link",
    reset_all: "Reset prototype",
    clock: "Now",
    expire: "Expire session",
    foreign: "Open someone else’s garden (ewa)",
    jump: "+25 h",
    clockReset: "Back to “now”",
    clockNote: "Moving the clock back doesn’t revive an expired session. Log in again or pick an account.",
    screenPicker: "Pick a screen",
    prototypeNote: "The review bar is not part of the product.",
    note: "Note",
    refs: "Stories and decisions",
    simulated: "Simulated",
    undecided: "Undecided",
  },
}

/** DS-GAP: native select styled with the DS Input token classes (no Select in the DS). */
function Select(props: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; id?: string }) {
  const autoId = useId()
  const id = props.id ?? autoId
  return (
    <div className="flex min-w-0 flex-col gap-in-group">
      <Label htmlFor={id} className="text-metadata">
        {props.label}
      </Label>
      <select
        id={id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-touch w-full min-w-0 rounded-md border border-input bg-background px-3 text-label text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

type ScenarioDef<K extends keyof Scenarios> = { key: K; id: string; pl: string; en: string; values: { value: Scenarios[K]; pl: string; en: string }[] }

const SCENARIOS: ScenarioDef<keyof Scenarios>[] = [
  { key: "registration", id: "SC03", pl: "Wynik rejestracji", en: "Registration result", values: [
    { value: "success", pl: "sukces", en: "success" },
    { value: "REGISTRATION_FAILED", pl: "REGISTRATION_FAILED", en: "REGISTRATION_FAILED" },
    { value: "RATE_LIMITED", pl: "RATE_LIMITED (429)", en: "RATE_LIMITED (429)" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "login", id: "SC04", pl: "Wynik logowania", en: "Login result", values: [
    { value: "success", pl: "wg danych konta", en: "from account data" },
    { value: "INVALID_CREDENTIALS", pl: "INVALID_CREDENTIALS", en: "INVALID_CREDENTIALS" },
    { value: "RATE_LIMITED", pl: "RATE_LIMITED (429)", en: "RATE_LIMITED (429)" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "gardenSave", id: "SC05", pl: "Zapis ogrodu", en: "Garden save", values: [
    { value: "success", pl: "sukces", en: "success" },
    { value: "fieldErrors", pl: "błąd pól z serwera", en: "server field errors" },
    { value: "LIMIT_REACHED", pl: "LIMIT_REACHED", en: "LIMIT_REACHED" },
    { value: "NOT_FOUND", pl: "NOT_FOUND", en: "NOT_FOUND" },
    { value: "unauthorized", pl: "401", en: "401" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "gardenDelete", id: "SC06", pl: "Usunięcie ogrodu", en: "Garden delete", values: [
    { value: "success", pl: "sukces", en: "success" },
    { value: "NOT_FOUND", pl: "NOT_FOUND", en: "NOT_FOUND" },
    { value: "unauthorized", pl: "401", en: "401" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "passwordChange", id: "SC16", pl: "Zmiana hasła (ustawienia)", en: "Password change (settings)", values: [
    { value: "success", pl: "wg danych konta", en: "from account data" },
    { value: "wrongCurrent", pl: "złe obecne hasło", en: "wrong current password" },
    { value: "unauthorized", pl: "401", en: "401" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "nextRequest", id: "SC17", pl: "Błąd następnego żądania (wysyłka, link)", en: "Next request fails (send, link)", values: [
    { value: "normal", pl: "bez błędu", en: "no failure" },
    { value: "rateLimited", pl: "RATE_LIMITED (429)", en: "RATE_LIMITED (429)" },
    { value: "network", pl: "brak sieci", en: "network down" },
    { value: "server", pl: "błąd 500", en: "error 500" },
  ] },
  { key: "delay", id: "SC07", pl: "Opóźnienie odpowiedzi", en: "Response delay", values: [
    { value: "none", pl: "0 s", en: "0 s" },
    { value: "slow", pl: "3 s", en: "3 s" },
    { value: "never", pl: "bez odpowiedzi", en: "no response" },
  ] },
  { key: "database", id: "SC09", pl: "Baza danych", en: "Database", values: [
    { value: "up", pl: "osiągalna", en: "reachable" },
    { value: "down", pl: "nieosiągalna", en: "unreachable" },
  ] },
  { key: "emailService", id: "SC12", pl: "Wysyłka e-maili", en: "Email sending", values: [
    { value: "up", pl: "działa", en: "works" },
    { value: "down", pl: "niedostępna", en: "unavailable" },
  ] },
  { key: "emailLink", id: "SC13", pl: "Link z maila", en: "Email link", values: [
    { value: "valid", pl: "ważny", en: "valid" },
    { value: "expired", pl: "wygasł", en: "expired" },
    { value: "used", pl: "użyty", en: "used" },
    { value: "invalid", pl: "nieprawidłowy", en: "invalid" },
  ] },
]

function formatClock(s: State): string {
  return new Intl.DateTimeFormat(s.lang === "pl" ? "pl-PL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(now(s)))
}

/** SC01 + "account switch": log in as a demo account in one click, or become a guest. */
function switchAccount(email: string) {
  if (!email) {
    setState({ session: null, loginReason: "none" })
    return
  }
  const { returnTo } = getState()
  setState((s) => ({ session: { email, issuedAt: now(s) }, loginReason: "none", returnTo: null }))
  // Switching account on the login page acts like logging in: go back to the gated page, else s04.
  if (location.hash === "#/login" || location.hash === "") {
    location.hash = returnTo && returnTo !== "#/login" ? returnTo : "#/gardens"
  }
}

export function ReviewBar({ screen }: { screen: ScreenId }) {
  const lang = useStore((s) => s.lang)
  const theme = useStore((s) => s.theme)
  const accounts = useStore((s) => s.accounts)
  const scenarios = useStore((s) => s.scenarios)
  const outbox = useStore((s) => s.outbox)
  const clock = useStore(formatClock)
  const isAlive = useStore(isSessionAlive)
  const sessionEmail = useStore((s) => s.session?.email ?? "")
  const isClockMoved = useStore((s) => s.clockOffsetMs !== 0)
  const [isOpen, setOpen] = useState(false)
  const [isNoteOpen, setNoteOpen] = useState(true)
  const note = NOTES[screen]
  const c = copy[lang]

  const sessionLabel = !sessionEmail ? (lang === "pl" ? "brak" : "none") : isAlive ? (lang === "pl" ? "aktywna" : "active") : lang === "pl" ? "wygasła" : "expired"

  return (
    <div role="region" aria-label={`${c.prototype} — ${c.prototypeNote}`} className="relative z-50 border-b-2 border-dashed border-ring bg-muted text-foreground">
      <div className="flex flex-wrap items-end gap-in-group px-4 py-2">
        <div className="flex items-center gap-in-group self-center">
          <Badge>{c.prototype}</Badge>
          <span className="text-metadata text-foreground">{c.fictitious}</span>
        </div>
        <div className="w-56 max-w-full">
          <Select
            id="review-screen"
            label={`${c.screen} (${screen})`}
            value={screen}
            onChange={(v) => {
              const def = SCREENS.find((d) => d.id === v)!
              location.hash = def.to ?? href({ screen: def.id })
            }}
            options={SCREENS.map((d) => ({ value: d.id, label: `${d.id} · ${d[lang]}` }))}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          aria-label={`${c.theme}: ${theme === "light" ? c.light : c.dark}`}
          onClick={() => setState({ theme: theme === "light" ? "dark" : "light" })}
        >
          {theme === "light" ? <Sun aria-hidden /> : <Moon aria-hidden />}
          {theme === "light" ? c.light : c.dark}
        </Button>
        <div className="w-28">
          <Select
            id="review-lang"
            label={`${c.lang} (SC11)`}
            value={lang}
            onChange={(v) => setState({ lang: v as Lang })}
            options={[
              { value: "pl", label: "Polski" },
              { value: "en", label: "English" },
            ]}
          />
        </div>
        <Button type="button" variant="outline" aria-expanded={isNoteOpen} aria-controls="review-note" onClick={() => setNoteOpen(!isNoteOpen)}>
          {c.note} {screen}
        </Button>
        <Button type="button" variant="outline" aria-expanded={isOpen} aria-controls="review-panel" onClick={() => setOpen(!isOpen)}>
          {isOpen ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
          {c.scenarios}
          {outbox.length > 0 && (
            <Badge variant="secondary">
              <Inbox aria-hidden />
              {outbox.length}
            </Badge>
          )}
        </Button>
      </div>

      {isNoteOpen && (
        <dl id="review-note" className="grid gap-in-group border-t px-4 py-2 text-metadata md:grid-cols-3">
          <div>
            <dt className="font-semibold">{c.refs}</dt>
            <dd>{note.refs}</dd>
          </div>
          <div>
            <dt className="font-semibold">{c.simulated}</dt>
            <dd>{note.simulated[lang]}</dd>
          </div>
          <div>
            <dt className="font-semibold">{c.undecided}</dt>
            <dd>{note.undecided[lang]}</dd>
          </div>
        </dl>
      )}

      {isOpen && (
        <div id="review-panel" className="border-t px-4 py-between-groups">
          <p className="mb-between-groups text-metadata text-foreground">{c.prototypeNote}</p>
          <div className="grid gap-between-groups md:grid-cols-3">
            <section className="flex flex-col gap-in-group" aria-labelledby="rb-session">
              <h2 id="rb-session" className="text-label font-semibold">
                SC01 · SC02 · SC08 · SC10
              </h2>
              <Select
                id="review-account"
                label={`${c.account} — ${sessionLabel}`}
                value={sessionEmail}
                onChange={switchAccount}
                options={[{ value: "", label: c.guest }, ...accounts.map((a) => ({ value: a.email, label: `${a.email} (${lang === "pl" ? a.purposePl : a.purposeEn})` }))]}
              />
              <div className="flex flex-wrap gap-in-group">
                <Button type="button" variant="outline" disabled={!sessionEmail || !isAlive} onClick={() => setState((s) => ({ session: s.session && { ...s.session, issuedAt: now(s) - CLOCK_JUMP_MS } }))}>
                  {c.expire}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate({ screen: "s11", param: FOREIGN_GARDEN_ID })}>
                  {c.foreign}
                </Button>
              </div>
              <p className="text-metadata">
                {c.clock}: <span className="font-medium">{clock}</span>
              </p>
              <p className="text-metadata text-foreground">{c.clockNote}</p>
              <div className="flex flex-wrap gap-in-group">
                <Button type="button" variant="outline" onClick={() => setState((s) => ({ clockOffsetMs: s.clockOffsetMs + CLOCK_JUMP_MS }))}>
                  {c.jump}
                </Button>
                <Button type="button" variant="outline" disabled={!isClockMoved} onClick={() => setState({ clockOffsetMs: 0 })}>
                  {c.clockReset}
                </Button>
              </div>
            </section>

            <section className="flex flex-col gap-in-group md:col-span-1" aria-labelledby="rb-scenarios">
              <h2 id="rb-scenarios" className="text-label font-semibold">
                {c.scenarios}
              </h2>
              {SCENARIOS.map((def) => (
                <Select
                  key={def.key}
                  id={`review-${def.key}`}
                  label={`${def.id} · ${def[lang]}`}
                  value={String(scenarios[def.key])}
                  onChange={(v) => setScenario(def.key, v as never)}
                  options={def.values.map((o) => ({ value: String(o.value), label: o[lang] }))}
                />
              ))}
            </section>

            <section className="flex flex-col gap-in-group" aria-labelledby="rb-inbox">
              <h2 id="rb-inbox" className="text-label font-semibold">
                SC15 · {c.inbox}
              </h2>
              <p className="text-metadata text-foreground">{c.inboxNote}</p>
              {outbox.length === 0 && <p className="text-label">{c.inboxEmpty}</p>}
              <ul className="flex flex-col gap-in-group">
                {outbox.map((mail) => (
                  <li key={mail.id} className="flex flex-col gap-in-group rounded-md border bg-background p-between-groups">
                    <span className="text-label font-medium">{mail.kind === "verify" ? c.verify : c.reset}</span>
                    <span className="text-metadata text-foreground">{mail.to}</span>
                    <Button
                      type="button"
                      variant="outline"
                      className="self-start"
                      onClick={() => navigate({ screen: mail.kind === "verify" ? "s15" : "s13", param: mail.token })}
                    >
                      {c.open}
                    </Button>
                  </li>
                ))}
              </ul>
              <Separator />
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  resetState()
                  navigate({ screen: "s01" })
                }}
              >
                {c.reset_all}
              </Button>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

