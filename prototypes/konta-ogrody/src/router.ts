// Hash router. Screen ids are the screen map ids (s01–s16) and never change.
// The URL also mirrors the real app path so a developer can see where each screen lives.
import { useSyncExternalStore } from "react"

export type ScreenId =
  | "s01" | "s02" | "s03" | "s04" | "s05" | "s06" | "s07" | "s08"
  | "s09" | "s10" | "s11" | "s12" | "s13" | "s14" | "s15" | "s16"

export type Route = { screen: ScreenId; param?: string }

/** Screens reachable by URL. s05–s07 are overlays on s04 and open from there. */
export const PATHS: Record<string, ScreenId> = {
  "/": "s01",
  "/register": "s02",
  "/login": "s03",
  "/gardens": "s04",
  "/gardens/new": "s05",
  "/admin": "s09",
  "/error": "s10",
  "/forgot-password": "s12",
  "/reset-password": "s13",
  "/check-inbox": "s14",
  "/confirm-email": "s15",
  "/settings": "s16",
}

export function parse(hash: string): Route {
  const raw = hash.replace(/^#/, "") || "/"
  const [path = "/", query = ""] = raw.split("?")
  const params = new URLSearchParams(query)
  const garden = path.match(/^\/gardens\/([^/]+)(?:\/(rename|delete))?$/)
  if (garden && garden[1] !== "new") {
    if (garden[2] === "rename") return { screen: "s06", param: garden[1] }
    if (garden[2] === "delete") return { screen: "s07", param: garden[1] }
    return { screen: "s11", param: garden[1] }
  }
  const screen = PATHS[path]
  if (!screen) return { screen: "s08" }
  // s13/s15 carry the email-link token; s10 carries the address to retry.
  const param = params.get(screen === "s10" ? "from" : "token") ?? undefined
  return param ? { screen, param } : { screen }
}

export function href(route: Route): string {
  switch (route.screen) {
    case "s06": return `#/gardens/${route.param}/rename`
    case "s07": return `#/gardens/${route.param}/delete`
    case "s11": return `#/gardens/${route.param}`
    case "s08": return "#/not-found"
    default: {
      const path = Object.entries(PATHS).find(([, id]) => id === route.screen)?.[0] ?? "/"
      const key = route.screen === "s10" ? "from" : "token"
      return route.param ? `#${path}?${key}=${encodeURIComponent(route.param)}` : `#${path}`
    }
  }
}

export function navigate(route: Route, options: { replace?: boolean } = {}): void {
  const target = href(route)
  if (options.replace) {
    history.replaceState(null, "", target)
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  } else if (location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  } else {
    location.hash = target
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb)
  return () => window.removeEventListener("hashchange", cb)
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, () => location.hash)
}

export function currentPath(): string {
  return location.hash || "#/"
}
