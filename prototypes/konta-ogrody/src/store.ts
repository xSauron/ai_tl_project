// In-memory prototype state. No fetch, no storage, no cookies: a page reload
// is a full reset. One module-level store, read through useSyncExternalStore.
import { useSyncExternalStore } from "react"

import { type Account, type Garden, DEMO_NOW, SEED_ACCOUNTS, SESSION_TTL_MS, seedGardens } from "./data"

export type Lang = "pl" | "en"
export type Theme = "light" | "dark"

/** Why the login screen was opened (s03.i). */
export type LoginReason = "none" | "expired" | "loggedOut" | "passwordReset" | "emailConfirmed"

export type EmailKind = "verify" | "reset"
export type SentEmail = { id: number; to: string; kind: EmailKind; token: string; sentAt: number }

export type Session = { email: string; issuedAt: number }

// Scenario controls (screen map §2). Product navigation never changes these.
export type Scenarios = {
  registration: "success" | "REGISTRATION_FAILED" | "RATE_LIMITED" | "network" | "server"
  login: "success" | "INVALID_CREDENTIALS" | "RATE_LIMITED" | "network" | "server"
  gardenSave: "success" | "fieldErrors" | "LIMIT_REACHED" | "NOT_FOUND" | "unauthorized" | "network" | "server"
  gardenDelete: "success" | "NOT_FOUND" | "unauthorized" | "network" | "server"
  delay: "none" | "slow" | "never"
  database: "up" | "down"
  emailService: "up" | "down"
  emailLink: "valid" | "expired" | "used" | "invalid"
  passwordChange: "success" | "wrongCurrent" | "unauthorized" | "network" | "server"
  /**
   * "Next request fails" (task brief): one-shot failure for requests without a
   * scenario of their own (resend, reset request, link confirmation). Resets after use.
   */
  nextRequest: "normal" | "rateLimited" | "network" | "server"
}

export const DEFAULT_SCENARIOS: Scenarios = {
  registration: "success",
  login: "success",
  gardenSave: "success",
  gardenDelete: "success",
  delay: "none",
  database: "up",
  emailService: "up",
  emailLink: "valid",
  passwordChange: "success",
  nextRequest: "normal",
}

export type State = {
  lang: Lang
  theme: Theme
  clockOffsetMs: number
  accounts: Account[]
  gardens: Garden[]
  session: Session | null
  loginReason: LoginReason
  /** Route to return to after logging in again (L03, agent proposal). */
  returnTo: string | null
  outbox: SentEmail[]
  /** Email just registered, shown on s14. */
  pendingEmail: string | null
  /** Tokens already used by a click in the demo inbox. */
  usedTokens: string[]
  scenarios: Scenarios
  nextId: number
}

export function initialState(): State {
  return {
    lang: "pl",
    theme: "light",
    clockOffsetMs: 0,
    accounts: SEED_ACCOUNTS.map((a) => ({ ...a })),
    gardens: seedGardens(),
    session: null,
    loginReason: "none",
    returnTo: null,
    outbox: [],
    pendingEmail: null,
    usedTokens: [],
    scenarios: { ...DEFAULT_SCENARIOS },
    nextId: 1,
  }
}

let state: State = initialState()
const listeners = new Set<() => void>()

export function getState(): State {
  return state
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)): void {
  const next = typeof patch === "function" ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function resetState(): void {
  const { lang, theme } = state
  state = { ...initialState(), lang, theme }
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state))
}

export function now(s: State = state): number {
  return DEMO_NOW + s.clockOffsetMs
}

/** A session counts only while younger than 24 h on the demo clock (spec A, SC02). */
export function isSessionAlive(s: State = state): boolean {
  if (s.session === null) return false
  const age = now(s) - s.session.issuedAt
  // A session issued "in the future" (clock moved back after login) is not valid either.
  return age >= 0 && age < SESSION_TTL_MS
}

export function currentAccount(s: State = state): Account | null {
  if (!isSessionAlive(s) || !s.session) return null
  const email = s.session.email
  return s.accounts.find((a) => a.email === email) ?? null
}

export function setScenario<K extends keyof Scenarios>(key: K, value: Scenarios[K]): void {
  setState((s) => ({ scenarios: { ...s.scenarios, [key]: value } }))
}

export function newId(prefix: string): string {
  const id = `${prefix}-${state.nextId}`
  setState((s) => ({ nextId: s.nextId + 1 }))
  return id
}
