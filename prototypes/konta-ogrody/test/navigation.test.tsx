// Navigation between screens: the success path, access gates and screen ids.
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { App } from "../src/App"
import { DEMO_PASSWORD } from "../src/data"
import { href, parse } from "../src/router"
import { getState, resetState, setState } from "../src/store"

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

/** Click a link and let jsdom deliver the async hashchange. */
async function follow(name: string) {
  fireEvent.click(screen.getAllByRole("link", { name })[0]!)
  await flush()
}

function shown(): string | undefined {
  return document.querySelector<HTMLElement>("[data-screen]")?.dataset.screen
}

function login(email: string) {
  setState({ session: { email, issuedAt: Date.UTC(2027, 2, 1, 7) } })
}

beforeEach(() => {
  resetState()
  history.replaceState(null, "", "#/")
})
afterEach(cleanup)

describe("router", () => {
  it("keeps the screen-map ids for every path", () => {
    expect(parse("#/").screen).toBe("s01")
    expect(parse("#/register").screen).toBe("s02")
    expect(parse("#/login").screen).toBe("s03")
    expect(parse("#/gardens").screen).toBe("s04")
    expect(parse("#/gardens/new").screen).toBe("s05")
    expect(parse("#/gardens/g-1/rename")).toEqual({ screen: "s06", param: "g-1" })
    expect(parse("#/gardens/g-1/delete")).toEqual({ screen: "s07", param: "g-1" })
    expect(parse("#/nope").screen).toBe("s08")
    expect(parse("#/admin").screen).toBe("s09")
    expect(parse("#/error").screen).toBe("s10")
    expect(parse("#/gardens/g-1")).toEqual({ screen: "s11", param: "g-1" })
    expect(parse("#/forgot-password").screen).toBe("s12")
    expect(parse("#/reset-password?token=t1")).toEqual({ screen: "s13", param: "t1" })
    expect(parse("#/check-inbox").screen).toBe("s14")
    expect(parse("#/confirm-email?token=t2")).toEqual({ screen: "s15", param: "t2" })
    expect(parse("#/settings").screen).toBe("s16")
  })

  it("round-trips href and parse", () => {
    for (const route of [{ screen: "s11" as const, param: "g-ala-1" }, { screen: "s13" as const, param: "tok" }, { screen: "s04" as const }]) {
      expect(parse(href(route))).toEqual(route)
    }
  })
})

describe("access gates", () => {
  it.each(["#/gardens", "#/gardens/new", "#/gardens/g-ala-1", "#/settings", "#/nope"])("guest on %s goes to login without a message", (hash) => {
    go(hash)
    render(<App />)
    expect(shown()).toBe("s03")
    expect(getState().loginReason).toBe("none")
    expect(getState().returnTo).toBe(hash)
  })

  it("expired session goes to login with 'session expired'", () => {
    setState({ session: { email: "ala@example.test", issuedAt: Date.UTC(2027, 1, 27) } })
    go("#/gardens")
    render(<App />)
    expect(shown()).toBe("s03")
    expect(screen.getByText("Sesja wygasła, zaloguj się ponownie.")).toBeTruthy()
  })

  it("public screens stay public", () => {
    for (const [hash, id] of [["#/", "s01"], ["#/admin", "s09"], ["#/forgot-password", "s12"]] as const) {
      cleanup()
      go(hash)
      render(<App />)
      expect(shown()).toBe(id)
    }
  })

  it("a foreign garden looks like a missing one (#23/AC2)", async () => {
    login("ala@example.test")
    go("#/gardens/g-ewa-1")
    render(<App />)
    await flush()
    expect(shown()).toBe("s08")
    expect(screen.queryByText("Ogród mamy")).toBeNull()
  })
})

describe("success path", () => {
  it("register → check inbox → confirm → my gardens → new garden → garden → settings → log out → log in", async () => {
    go("#/")
    render(<App />)
    await follow("Zaplanuj ogród")
    expect(shown()).toBe("s02")

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "nowa@example.test" } })
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: "prototyp-haslo-1" } })
    fireEvent.submit(screen.getByRole("button", { name: "Załóż konto" }).closest("form")!)
    await flush()
    expect(shown()).toBe("s14")

    const mail = getState().outbox[0]!
    expect(mail.kind).toBe("verify")
    go(href({ screen: "s15", param: mail.token }))
    await flush()
    // Confirming does not sign in (owner, 2026-11-02): log in next.
    expect(screen.getByText("Twoje konto jest gotowe. Zaloguj się, aby zacząć.")).toBeTruthy()
    expect(getState().session).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Zaloguj się" }))
    await flush()
    expect(shown()).toBe("s03")
    expect(screen.getByText("Adres potwierdzony. Możesz się zalogować.")).toBeTruthy()
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "nowa@example.test" } })
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: "prototyp-haslo-1" } })
    fireEvent.submit(screen.getByRole("button", { name: "Zaloguj się" }).closest("form")!)
    await flush()
    expect(shown()).toBe("s04")
    expect(screen.getByText("Nie masz jeszcze ogrodów — utwórz pierwszy")).toBeTruthy()

    go("#/gardens/new")
    expect(shown()).toBe("s05")
    fireEvent.change(screen.getByLabelText("Nazwa"), { target: { value: "Ogród przy bloku" } })
    fireEvent.submit(screen.getByRole("button", { name: "Utwórz ogród" }).closest("form")!)
    await flush()
    expect(shown()).toBe("s04")
    expect(screen.getByText("Ogród utworzony.")).toBeTruthy()

    const created = getState().gardens[0]!
    go(href({ screen: "s11", param: created.id }))
    await flush()
    expect(shown()).toBe("s11")
    expect(screen.getByRole("heading", { level: 1, name: "Ogród przy bloku" })).toBeTruthy()

    go("#/settings")
    expect(shown()).toBe("s16")

    fireEvent.click(screen.getAllByRole("button", { name: "Wyloguj" })[0]!)
    await flush()
    expect(shown()).toBe("s03")
    expect(screen.getByText("Wylogowano.")).toBeTruthy()

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ala@example.test" } })
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: DEMO_PASSWORD } })
    fireEvent.submit(screen.getByRole("button", { name: "Zaloguj się" }).closest("form")!)
    await flush()
    expect(shown()).toBe("s04")
  })

  it("after login returns to the page the guest was sent away from", async () => {
    go("#/gardens/g-ala-1")
    render(<App />)
    expect(shown()).toBe("s03")
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ala@example.test" } })
    fireEvent.change(screen.getByLabelText("Hasło"), { target: { value: DEMO_PASSWORD } })
    fireEvent.submit(screen.getByRole("button", { name: "Zaloguj się" }).closest("form")!)
    await flush()
    await flush()
    expect(shown()).toBe("s11")
  })
})
