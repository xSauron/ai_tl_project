// Simulated API. Shapes follow spec A's envelope ({ ok, data } / { ok: false, status, error })
// so the developer sees the same codes the real routes return. Nothing leaves the page.
import {
  type Garden,
  MAX_GARDENS_PER_USER,
  SLOW_RESPONSE_MS,
} from "./data"
import {
  type EmailKind,
  type State,
  currentAccount,
  getState,
  isSessionAlive,
  newId,
  now,
  setState,
} from "./store"

export type ApiError = { code: string; fieldErrors?: Record<string, string> }
export type ApiFailure = { ok: false; status: number; error: ApiError }
export type ApiResult<T> = { ok: true; data: T } | ApiFailure

const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data })
const fail = (status: number, code: string, fieldErrors?: Record<string, string>): ApiResult<never> => ({
  ok: false,
  status,
  error: fieldErrors ? { code, fieldErrors } : { code },
})

export const NETWORK = fail(0, "NETWORK")
export const SERVER = fail(500, "INTERNAL")
export const UNAUTHORIZED = fail(401, "UNAUTHORIZED")

/** SC07: applies the demo response delay. "never" leaves the request pending. */
function respond<T>(result: () => ApiResult<T>): Promise<ApiResult<T>> {
  const delay = getState().scenarios.delay
  if (delay === "never") return new Promise(() => {})
  if (delay === "slow") return new Promise((r) => setTimeout(() => r(result()), SLOW_RESPONSE_MS))
  return Promise.resolve(result())
}

/** SC17: one-shot failure of the next request that has no scenario of its own. */
function takeNextFailure(): ApiResult<never> | null {
  const next = getState().scenarios.nextRequest
  if (next === "normal") return null
  setState((s) => ({ scenarios: { ...s.scenarios, nextRequest: "normal" } }))
  if (next === "rateLimited") return fail(429, "RATE_LIMITED")
  if (next === "network") return NETWORK
  return SERVER
}

function requireSession(s: State): ApiResult<never> | null {
  return isSessionAlive(s) ? null : UNAUTHORIZED
}

function sendEmail(to: string, kind: EmailKind): void {
  const token = newId(`tok-${kind}`)
  setState((s) => ({ outbox: [{ id: s.outbox.length + 1, to, kind, token, sentAt: now(s) }, ...s.outbox] }))
}

// ---- Auth ----

export function register(email: string, password: string): Promise<ApiResult<{ email: string }>> {
  return respond(() => {
    const scenario = getState().scenarios.registration
    if (scenario === "RATE_LIMITED") return fail(429, "RATE_LIMITED")
    if (scenario === "network") return NETWORK
    if (scenario === "server") return SERVER
    const exists = getState().accounts.some((a) => a.email === email)
    if (scenario === "REGISTRATION_FAILED" || exists) return fail(422, "REGISTRATION_FAILED")
    setState((s) => ({ accounts: [...s.accounts, { email, password, isConfirmed: false, purposePl: "konto utworzone w prototypie", purposeEn: "account created in the prototype" }] }))
    if (getState().scenarios.emailService === "up") sendEmail(email, "verify")
    return ok({ email })
  })
}

export function login(email: string, password: string): Promise<ApiResult<{ email: string }>> {
  return respond(() => {
    const s = getState()
    const scenario = s.scenarios.login
    if (scenario === "RATE_LIMITED") return fail(429, "RATE_LIMITED")
    if (scenario === "network") return NETWORK
    if (scenario === "server") return SERVER
    if (scenario === "INVALID_CREDENTIALS") return fail(401, "INVALID_CREDENTIALS")
    const account = s.accounts.find((a) => a.email === email)
    if (!account || account.password !== password) return fail(401, "INVALID_CREDENTIALS")
    // L22 (owner, 2026-11-02): an unconfirmed account may log in and ask for a new link (s04.i).
    setState((st) => ({ session: { email, issuedAt: now(st) }, loginReason: "none" }))
    return ok({ email })
  })
}

export function logout(): void {
  setState({ session: null, loginReason: "loggedOut", returnTo: null })
}

export function resendVerification(email: string): Promise<ApiResult<null>> {
  return respond(() => {
    const failure = takeNextFailure()
    if (failure) return failure
    if (getState().scenarios.emailService === "down") return fail(503, "EMAIL_UNAVAILABLE")
    const account = getState().accounts.find((a) => a.email === email)
    if (account && !account.isConfirmed) sendEmail(email, "verify")
    return ok(null)
  })
}

export function requestPasswordReset(email: string): Promise<ApiResult<null>> {
  return respond(() => {
    const failure = takeNextFailure()
    if (failure) return failure
    if (getState().scenarios.emailService === "down") return fail(503, "EMAIL_UNAVAILABLE")
    // Same answer whether or not the account exists (AGENTS.md: no email enumeration).
    if (getState().accounts.some((a) => a.email === email)) sendEmail(email, "reset")
    return ok(null)
  })
}

type LinkCheck = { ok: true; email: string } | { ok: false; code: "LINK_EXPIRED" | "LINK_USED" | "LINK_INVALID" }

/** SC13 overrides the outcome; otherwise the token is looked up in the demo outbox. */
export function checkLink(token: string, kind: EmailKind): LinkCheck {
  const s = getState()
  const forced = s.scenarios.emailLink
  if (forced === "expired") return { ok: false, code: "LINK_EXPIRED" }
  if (forced === "invalid") return { ok: false, code: "LINK_INVALID" }
  const mail = s.outbox.find((m) => m.token === token && m.kind === kind)
  if (forced === "used" || (mail && s.usedTokens.includes(token))) return { ok: false, code: "LINK_USED" }
  if (!mail) return { ok: false, code: "LINK_INVALID" }
  return { ok: true, email: mail.to }
}

export function confirmEmail(token: string): Promise<ApiResult<{ email: string }>> {
  return respond(() => {
    const failure = takeNextFailure()
    if (failure) return failure
    const check = checkLink(token, "verify")
    if (!check.ok) return fail(410, check.code)
    setState((s) => ({
      usedTokens: [...s.usedTokens, token],
      accounts: s.accounts.map((a) => (a.email === check.email ? { ...a, isConfirmed: true } : a)),
    }))
    // s15.a: confirming does NOT sign in (owner, 2026-11-02, AS01 withdrawn). A session that
    // already exists (unconfirmed user logged in, L22) simply stays.
    return ok({ email: check.email })
  })
}

export function resetPassword(token: string, password: string): Promise<ApiResult<null>> {
  return respond(() => {
    const failure = takeNextFailure()
    if (failure) return failure
    const check = checkLink(token, "reset")
    if (!check.ok) return fail(410, check.code)
    setState((s) => ({
      usedTokens: [...s.usedTokens, token],
      accounts: s.accounts.map((a) => (a.email === check.email ? { ...a, password } : a)),
    }))
    return ok(null)
  })
}

export function changePassword(current: string, next: string): Promise<ApiResult<null>> {
  return respond(() => {
    const s = getState()
    const scenario = s.scenarios.passwordChange
    if (scenario === "unauthorized") return UNAUTHORIZED
    const noSession = requireSession(s)
    if (noSession) return noSession
    if (scenario === "network") return NETWORK
    if (scenario === "server") return SERVER
    const account = currentAccount(s)
    if (scenario === "wrongCurrent" || !account || account.password !== current) {
      return fail(422, "WRONG_PASSWORD", { currentPassword: "WRONG_PASSWORD" })
    }
    setState((st) => ({ accounts: st.accounts.map((a) => (a.email === account.email ? { ...a, password: next } : a)) }))
    return ok(null)
  })
}

// ---- Gardens (owner's only, newest first: spec A) ----

export type GardenInput = { name: string; description: string | null }

function ownGardens(s: State): Garden[] {
  const email = currentAccount(s)?.email
  return s.gardens.filter((g) => g.owner === email).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listGardens(): Promise<ApiResult<Garden[]>> {
  return respond(() => {
    const s = getState()
    const noSession = requireSession(s)
    if (noSession) return noSession
    if (s.scenarios.database === "down") return SERVER
    return ok(ownGardens(s))
  })
}

export function getGarden(id: string): Promise<ApiResult<Garden>> {
  return respond(() => {
    const s = getState()
    const noSession = requireSession(s)
    if (noSession) return noSession
    if (s.scenarios.database === "down") return SERVER
    // Missing and foreign gardens look the same (#23/AC2).
    const garden = ownGardens(s).find((g) => g.id === id)
    return garden ? ok(garden) : fail(404, "NOT_FOUND")
  })
}

function saveScenarioFailure(s: State): ApiResult<never> | null {
  const scenario = s.scenarios.gardenSave
  if (scenario === "unauthorized") return UNAUTHORIZED
  const noSession = requireSession(s)
  if (noSession) return noSession
  if (scenario === "network") return NETWORK
  if (scenario === "server" || s.scenarios.database === "down") return SERVER
  if (scenario === "fieldErrors") return fail(422, "VALIDATION_FAILED", { name: "SERVER_NAME_REJECTED" })
  return null
}

function todayIso(s: State): string {
  return new Date(now(s)).toISOString().slice(0, 10)
}

export function createGarden(input: GardenInput): Promise<ApiResult<Garden>> {
  return respond(() => {
    const s = getState()
    const failure = saveScenarioFailure(s)
    if (failure) return failure
    if (s.scenarios.gardenSave === "NOT_FOUND") return fail(404, "NOT_FOUND")
    if (s.scenarios.gardenSave === "LIMIT_REACHED" || ownGardens(s).length >= MAX_GARDENS_PER_USER) {
      return fail(409, "LIMIT_REACHED")
    }
    const garden: Garden = { id: newId("g-new"), owner: currentAccount(s)!.email, ...input, createdAt: todayIso(s) }
    setState((st) => ({ gardens: [garden, ...st.gardens] }))
    return ok(garden)
  })
}

export function renameGarden(id: string, input: GardenInput): Promise<ApiResult<Garden>> {
  return respond(() => {
    const s = getState()
    const failure = saveScenarioFailure(s)
    if (failure) return failure
    const garden = ownGardens(s).find((g) => g.id === id)
    if (s.scenarios.gardenSave === "NOT_FOUND" || !garden) return fail(404, "NOT_FOUND")
    if (s.scenarios.gardenSave === "LIMIT_REACHED") return fail(409, "LIMIT_REACHED")
    const updated = { ...garden, ...input }
    setState((st) => ({ gardens: st.gardens.map((g) => (g.id === id ? updated : g)) }))
    return ok(updated)
  })
}

export function deleteGarden(id: string): Promise<ApiResult<{ id: string }>> {
  return respond(() => {
    const s = getState()
    const scenario = s.scenarios.gardenDelete
    if (scenario === "unauthorized") return UNAUTHORIZED
    const noSession = requireSession(s)
    if (noSession) return noSession
    if (scenario === "network") return NETWORK
    if (scenario === "server" || s.scenarios.database === "down") return SERVER
    const garden = ownGardens(s).find((g) => g.id === id)
    if (scenario === "NOT_FOUND" || !garden) return fail(404, "NOT_FOUND")
    setState((st) => ({ gardens: st.gardens.filter((g) => g.id !== id) }))
    return ok({ id })
  })
}

export function health(): Promise<ApiResult<{ database: "up" | "down" }>> {
  return respond(() => ok({ database: getState().scenarios.database }))
}
