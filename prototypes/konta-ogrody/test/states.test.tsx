// Etap 2: states from the screen map, demo accounts, gates, and "entered data stays after an error".
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { App } from "../src/App"
import { CLOCK_JUMP_MS, DEMO_PASSWORD } from "../src/data"
import { href } from "../src/router"
import { getState, resetState, setScenario, setState } from "../src/store"

function go(hash: string) {
  act(() => {
    location.hash = hash
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  })
}
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0))
  })
}
const shown = () => document.querySelector<HTMLElement>("[data-screen]")?.dataset.screen
const alertText = () => screen.getAllByRole("alert").map((a) => a.textContent).join(" ")
function loginAs(email: string) {
  setState((s) => ({ session: { email, issuedAt: Date.UTC(2027, 2, 1, 7) + s.clockOffsetMs } }))
}
function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}
function submit(name: string) {
  fireEvent.submit(screen.getByRole("button", { name }).closest("form")!)
}

beforeEach(() => {
  resetState()
  history.replaceState(null, "", "#/")
})
afterEach(cleanup)

describe("s02 Register", () => {
  it("s02.b validation keeps values and focuses the first invalid field", async () => {
    go("#/register")
    render(<App />)
    type("E-mail", "zly")
    type("Hasło", "krotkie")
    submit("Załóż konto")
    await flush()
    expect(screen.getByText("Wpisz poprawny adres e-mail.")).toBeTruthy()
    expect(screen.getByText("Hasło musi mieć od 10 do 128 znaków.")).toBeTruthy()
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("zly")
  })

  it("s02.d an existing email gets the same generic message as any refusal", async () => {
    go("#/register")
    render(<App />)
    type("E-mail", "ala@example.test")
    type("Hasło", "dowolne-haslo-1")
    submit("Załóż konto")
    await flush()
    expect(alertText()).toContain("Nie udało się założyć konta. Jeśli już je masz, zaloguj się.")
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).value).toBe("ala@example.test")
  })

  it.each([
    ["RATE_LIMITED", "Za dużo prób."],
    ["network", "Brak połączenia."],
    ["server", "Coś poszło nie tak"],
  ] as const)("SC03 %s keeps the entered data", async (scenario, text) => {
    setScenario("registration", scenario)
    go("#/register")
    render(<App />)
    type("E-mail", "nowa@example.test")
    type("Hasło", "dowolne-haslo-1")
    submit("Załóż konto")
    await flush()
    expect(alertText()).toContain(text)
    expect((screen.getByLabelText("Hasło") as HTMLInputElement).value).toBe("dowolne-haslo-1")
    expect(shown()).toBe("s02")
  })
})

describe("s03 Log in", () => {
  it("s03.d unknown email and wrong password give the same message (#23/AC3)", async () => {
    go("#/login")
    render(<App />)
    for (const [email, password] of [["nikt@example.test", DEMO_PASSWORD], ["ala@example.test", "zle-haslo-123"]]) {
      type("E-mail", email!)
      type("Hasło", password!)
      submit("Zaloguj się")
      await flush()
      expect(alertText()).toBe("Nieprawidłowy e-mail lub hasło.")
    }
  })

  it("s03.e rate limited (#23/AC4)", async () => {
    setScenario("login", "RATE_LIMITED")
    go("#/login")
    render(<App />)
    type("E-mail", "ala@example.test")
    type("Hasło", DEMO_PASSWORD)
    submit("Zaloguj się")
    await flush()
    expect(alertText()).toContain("Za dużo prób.")
  })

  it("s03.k / s04.i an unconfirmed account logs in, sees a reminder and can ask for a new link (L22)", async () => {
    go("#/login")
    render(<App />)
    type("E-mail", "nowy@example.test")
    type("Hasło", DEMO_PASSWORD)
    submit("Zaloguj się")
    await flush()
    await flush()
    expect(shown()).toBe("s04")
    expect(screen.getByText("Twój adres e-mail nie jest jeszcze potwierdzony.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Wyślij link ponownie" }))
    await flush()
    expect(screen.getByText("Wysłaliśmy link ponownie.")).toBeTruthy()
    expect(getState().outbox[0]).toMatchObject({ to: "nowy@example.test", kind: "verify" })
  })

  it("s15.a confirming while logged in keeps the session and removes the reminder", async () => {
    loginAs("nowy@example.test")
    go("#/gardens")
    render(<App />)
    await flush()
    fireEvent.click(screen.getByRole("button", { name: "Wyślij link ponownie" }))
    await flush()
    go(href({ screen: "s15", param: getState().outbox[0]!.token }))
    await flush()
    expect(screen.getByText("Twoje konto jest gotowe.")).toBeTruthy()
    go("#/gardens")
    await flush()
    expect(screen.queryByText("Twój adres e-mail nie jest jeszcze potwierdzony.")).toBeNull()
  })
})

describe("s04–s07 gardens", () => {
  it("s04.a lists only the owner's gardens, newest first", async () => {
    loginAs("ala@example.test")
    go("#/gardens")
    render(<App />)
    await flush()
    const names = [...document.querySelectorAll("tbody tr td:first-child")].map((td) => td.textContent)
    expect(names).toEqual(["Działka", "Ogród za domem"])
    expect(document.body.textContent).not.toContain("Ogród mamy")
  })

  it("s04.d read error with retry (SC09)", async () => {
    loginAs("ala@example.test")
    setScenario("database", "down")
    go("#/gardens")
    render(<App />)
    await flush()
    expect(alertText()).toContain("Nie udało się wczytać ogrodów.")
  })

  it("s04.f at 20 gardens the button is disabled with the reason (L06)", async () => {
    loginAs("dar@example.test")
    go("#/gardens")
    render(<App />)
    await flush()
    const button = screen.getByRole("button", { name: "Nowy ogród" }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(document.getElementById(button.getAttribute("aria-describedby")!)?.textContent).toMatch(/Masz 20 ogrodów/)
  })

  it("s05.d LIMIT_REACHED from the server keeps the typed name", async () => {
    loginAs("ala@example.test")
    setScenario("gardenSave", "LIMIT_REACHED")
    go("#/gardens/new")
    render(<App />)
    await flush()
    type("Nazwa", "Ogród 21")
    submit("Utwórz ogród")
    await flush()
    expect(alertText()).toContain("Masz już 20 ogrodów.")
    expect((screen.getByLabelText("Nazwa") as HTMLInputElement).value).toBe("Ogród 21")
  })

  it("s05.e 401 in an open form keeps the data and links to login; after login returns to the form", async () => {
    loginAs("ala@example.test")
    setScenario("gardenSave", "unauthorized")
    go("#/gardens/new")
    render(<App />)
    await flush()
    type("Nazwa", "Sad")
    submit("Utwórz ogród")
    await flush()
    expect(alertText()).toContain("Sesja wygasła.")
    expect((screen.getByLabelText("Nazwa") as HTMLInputElement).value).toBe("Sad")
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się ponownie" }))
    await flush()
    expect(shown()).toBe("s03")
    expect(getState().returnTo).toBe("#/gardens/new")
  })

  it("s04.h session expires on an open page: next request → login with message", async () => {
    loginAs("ala@example.test")
    go("#/gardens")
    render(<App />)
    await flush()
    act(() => setState((s) => ({ clockOffsetMs: s.clockOffsetMs + CLOCK_JUMP_MS })))
    expect(shown()).toBe("s04")
    go("#/gardens/g-ala-1")
    await flush()
    expect(shown()).toBe("s03")
    expect(screen.getByText("Sesja wygasła, zaloguj się ponownie.")).toBeTruthy()
  })

  it("s06.a rename is prefilled; s06.d NOT_FOUND keeps the new name", async () => {
    loginAs("ala@example.test")
    go("#/gardens/g-ala-1/rename")
    render(<App />)
    await flush()
    expect((screen.getByLabelText("Nazwa") as HTMLInputElement).value).toBe("Ogród za domem")
    setScenario("gardenSave", "NOT_FOUND")
    type("Nazwa", "Ogród przy tarasie")
    submit("Zapisz zmiany")
    await flush()
    expect(alertText()).toContain("Ten ogród już nie istnieje.")
    expect((screen.getByLabelText("Nazwa") as HTMLInputElement).value).toBe("Ogród przy tarasie")
  })

  it("s07.a asks with the garden name; s07.f deleting the last garden shows the empty state", async () => {
    loginAs("ola@example.test")
    go("#/gardens/g-ola-1/delete")
    render(<App />)
    await flush()
    expect(screen.getByText("Ogród „Ogród babci” zostanie usunięty. Tego nie da się cofnąć.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Usuń ogród" }))
    await flush()
    await flush()
    expect(shown()).toBe("s04")
    expect(screen.getByText("Nie masz jeszcze ogrodów — utwórz pierwszy")).toBeTruthy()
  })

  it("regression: confirming a delete doesn't crash when the garden leaves the list", async () => {
    const errors: unknown[] = []
    const onError = (e: ErrorEvent) => errors.push(e.error)
    window.addEventListener("error", onError)
    loginAs("ala@example.test")
    go("#/gardens/g-ala-1/delete")
    render(<App />)
    await flush()
    fireEvent.click(screen.getByRole("button", { name: "Usuń ogród" }))
    await flush()
    await flush()
    window.removeEventListener("error", onError)
    expect(errors).toEqual([])
    expect(shown()).toBe("s04")
    expect(screen.getByText("Ogród usunięty.")).toBeTruthy()
  })
})

describe("email links and password reset", () => {
  it("s12.d same message whether or not the account exists; only a real account gets mail", async () => {
    go("#/forgot-password")
    render(<App />)
    for (const email of ["nikt@example.test", "ala@example.test"]) {
      type("E-mail", email)
      submit("Wyślij link")
      await flush()
      expect(screen.getByText("Jeśli konto istnieje, wysłaliśmy link do zmiany hasła.")).toBeTruthy()
    }
    expect(getState().outbox.map((m) => m.to)).toEqual(["ala@example.test"])
  })

  it("s13 reset with a real link, then the link is used (s13.f)", async () => {
    go("#/forgot-password")
    render(<App />)
    type("E-mail", "ala@example.test")
    submit("Wyślij link")
    await flush()
    const token = getState().outbox[0]!.token
    go(href({ screen: "s13", param: token }))
    type("Nowe hasło", "nowe-haslo-2027")
    submit("Ustaw hasło")
    await flush()
    expect(shown()).toBe("s03")
    expect(screen.getByText("Hasło zmienione. Zaloguj się nowym hasłem.")).toBeTruthy()
    go(href({ screen: "s13", param: token }))
    expect(screen.getByText("Ten link został już użyty.")).toBeTruthy()
  })

  it.each([
    ["expired", "Ten link wygasł."],
    ["used", "Ten adres jest już potwierdzony."],
    ["invalid", "Ten link jest nieprawidłowy."],
  ] as const)("SC13 %s on s15", async (scenario, text) => {
    setScenario("emailLink", scenario)
    go("#/confirm-email?token=x")
    render(<App />)
    await flush()
    expect(screen.getByText(text)).toBeTruthy()
  })
})

describe("roles and other screens", () => {
  it("s11 → s08 for a foreign garden; s08 for a guest goes to login first (s08.b)", async () => {
    loginAs("ala@example.test")
    go("#/gardens/g-ewa-1")
    render(<App />)
    await flush()
    expect(shown()).toBe("s08")
    cleanup()
    act(() => setState({ session: null }))
    go("#/gardens/g-ewa-1")
    render(<App />)
    expect(shown()).toBe("s03")
  })

  it("s11.d read error goes to s10, and retry returns to the garden", async () => {
    loginAs("ala@example.test")
    setScenario("database", "down")
    go("#/gardens/g-ala-1")
    render(<App />)
    await flush()
    expect(shown()).toBe("s10")
    act(() => setScenario("database", "up"))
    expect(screen.getByRole("link", { name: "Spróbuj ponownie" }).getAttribute("href")).toBe("#/gardens/g-ala-1")
  })

  it("s09 shows the database state", async () => {
    setScenario("database", "down")
    go("#/admin")
    render(<App />)
    await flush()
    expect(screen.getByText("nieosiągalna")).toBeTruthy()
  })

  it("s16.d wrong current password keeps both fields", async () => {
    loginAs("ala@example.test")
    go("#/settings")
    render(<App />)
    type("Obecne hasło", "zle-haslo-xx")
    type("Nowe hasło", "nowe-haslo-2027")
    submit("Zmień hasło")
    await flush()
    expect(screen.getByText("Obecne hasło jest nieprawidłowe.")).toBeTruthy()
    expect((screen.getByLabelText("Nowe hasło") as HTMLInputElement).value).toBe("nowe-haslo-2027")
  })

  it("SC11 switches the interface to English", async () => {
    setState({ lang: "en" })
    go("#/login")
    render(<App />)
    expect(screen.getByRole("heading", { level: 1, name: "Log in" })).toBeTruthy()
  })
})
