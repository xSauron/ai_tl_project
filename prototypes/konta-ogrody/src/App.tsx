// Prototype root: access gates (screen map "Role" table), screen switch, focus
// management after navigation, theme on <html> (same as the DS Storybook).
import { useEffect, useLayoutEffect, useMemo } from "react"

import { ReviewBar } from "./review-bar"
import { parse, type Route, type ScreenId, useHash } from "./router"
import { CheckInboxScreen, ConfirmEmailScreen, ForgotPasswordScreen, LoginScreen, NewPasswordScreen, RegisterScreen } from "./screens/auth"
import { GardenScreen, GardensScreen, SettingsScreen } from "./screens/gardens"
import { HomeScreen, NotFoundScreen, ServerErrorScreen, StatusScreen } from "./screens/public"
import { getState, isSessionAlive, setState, useStore } from "./store"

/** Screens that need a session (s04–s08, s11, s16). s08 for a guest goes to login (s08.b). */
const PROTECTED: ScreenId[] = ["s04", "s05", "s06", "s07", "s08", "s11", "s16"]

/**
 * Access gate. A guest on a protected screen → s03.i (no message, or "Session expired"
 * if a session existed). Returns the route actually shown.
 */
export function gate(route: Route): Route {
  const s = getState()
  if (!PROTECTED.includes(route.screen)) return route
  if (isSessionAlive(s)) return route
  return { screen: "s03" }
}

function Screen({ route }: { route: Route }) {
  switch (route.screen) {
    case "s01": return <HomeScreen />
    case "s02": return <RegisterScreen />
    case "s03": return <LoginScreen />
    case "s04": return <GardensScreen overlay={null} />
    case "s05": return <GardensScreen overlay={{ kind: "new" }} />
    case "s06": return <GardensScreen overlay={{ kind: "rename", id: route.param! }} />
    case "s07": return <GardensScreen overlay={{ kind: "delete", id: route.param! }} />
    case "s08": return <NotFoundScreen />
    case "s09": return <StatusScreen />
    case "s10": return <ServerErrorScreen retry={route.param} />
    case "s11": return <GardenScreen id={route.param!} />
    case "s12": return <ForgotPasswordScreen />
    case "s13": return <NewPasswordScreen key={route.param} token={route.param} />
    case "s14": return <CheckInboxScreen />
    case "s15": return <ConfirmEmailScreen token={route.param} />
    case "s16": return <SettingsScreen />
  }
}

/** s05–s07 are overlays on s04: one mount, so the list and its messages survive the panel. */
function mountKey(route: Route): string {
  if (["s04", "s05", "s06", "s07"].includes(route.screen)) return "s04"
  return `${route.screen}-${route.param ?? ""}`
}

export function App() {
  const hash = useHash()
  const theme = useStore((s) => s.theme)
  const lang = useStore((s) => s.lang)
  // The gate runs on navigation and on account change, not on the clock: a session that
  // expires while a page is open is noticed by the next request (401), as on s04.h / s05.e.
  const sessionEmail = useStore((s) => s.session?.email ?? "")
  const requested = useMemo(() => parse(hash), [hash])
  // `sessionEmail` is the trigger: the gate reads the store itself.
  const route = useMemo(() => gate(requested), [requested, sessionEmail]) // eslint-disable-line react-hooks/exhaustive-deps
  const isRedirected = route.screen !== requested.screen

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.lang = lang
  }, [theme, lang])

  useEffect(() => {
    if (!isRedirected) return
    const s = getState()
    // s03.i: an expired session says so; a plain guest gets no message.
    setState({ loginReason: s.session ? "expired" : "none", returnTo: hash || null, session: null })
    history.replaceState(null, "", "#/login")
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  }, [isRedirected, hash, sessionEmail])

  const focusKey = mountKey(route)
  useEffect(() => {
    // Move focus to the screen heading after navigation (keyboard and screen-reader users).
    // Some headings appear only after a simulated load, so wait for the first one.
    const container = document.querySelector("[data-screen]")
    function focusHeading(): boolean {
      const heading = container?.querySelector<HTMLElement>("[data-screen-heading]")
      if (!heading) return false
      if (!container?.querySelector("[role=dialog],[role=alertdialog]")) heading.focus()
      document.title = `${route.screen} · ${heading.textContent ?? "Plant.AI"} — prototyp`
      return true
    }
    if (focusHeading() || !container) return
    const observer = new MutationObserver(() => focusHeading() && observer.disconnect())
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [focusKey])

  return (
    <div className="min-h-svh bg-background font-sans text-foreground">
      <ReviewBar screen={requested.screen === "s08" && route.screen === "s08" ? "s08" : route.screen} />
      <div data-screen={route.screen} key={`${mountKey(route)}-${sessionEmail}`}>
        <Screen route={route} />
      </div>
    </div>
  )
}
