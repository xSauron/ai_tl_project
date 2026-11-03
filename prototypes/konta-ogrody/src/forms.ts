// Client-side validation that mirrors spec A's Zod bounds, and mapping of
// simulated API errors to on-screen messages.
import type { ApiResult } from "./api"
import { MAX_EMAIL, MAX_PASSWORD, MIN_PASSWORD } from "./data"
import type { MessageKey } from "./i18n"

export function validateEmail(value: string): MessageKey | null {
  const v = value.trim()
  if (!v) return "required"
  if (v.length > MAX_EMAIL) return "emailTooLong"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "emailInvalid"
  return null
}

export function validatePassword(value: string): MessageKey | null {
  if (!value) return "required"
  if (value.length < MIN_PASSWORD || value.length > MAX_PASSWORD) return "passwordLength"
  return null
}

/** Generic failures shared by every form: network, 5xx, 429. */
export function genericError(result: ApiResult<unknown>): MessageKey | null {
  if (result.ok) return null
  if (result.error.code === "NETWORK") return "networkError"
  if (result.error.code === "RATE_LIMITED") return "rateLimited"
  if (result.status >= 500) return "serverError"
  return null
}

/** Focus the first invalid field after a failed submit (spec A, CrudForm). */
export function focusFirstInvalid(form: HTMLFormElement | null): void {
  form?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus()
}
