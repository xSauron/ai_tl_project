// Fictitious demo data — screen map §3 (.ai/prototypes/konto-i-ogrody/mapa-ekranow.md).
// The `example.test` domain is reserved and does not exist. Nothing here is a real person.

/** Fixed demo "now": 2027-03-01 08:00 Europe/Warsaw (CET, UTC+1). Screen map §3. */
export const DEMO_NOW = Date.UTC(2027, 2, 1, 7, 0, 0)
export const HOUR_MS = 60 * 60 * 1000
/** Session lifetime from spec A (`SESSION_TTL_SECONDS`, 24 h, no refresh). */
export const SESSION_TTL_MS = 24 * HOUR_MS
/** SC02 "+25 h" jump: past the 24 h session lifetime. */
export const CLOCK_JUMP_MS = 25 * HOUR_MS

/** Shared demo password (screen map §3). Valid only inside this prototype. */
export const DEMO_PASSWORD = "demo-haslo-2027"

// Limits from spec A (API Contracts).
export const MAX_EMAIL = 254
export const MIN_PASSWORD = 10
export const MAX_PASSWORD = 128
export const MAX_GARDEN_NAME = 120
export const MAX_GARDEN_DESCRIPTION = 2000
export const MAX_GARDENS_PER_USER = 20

/** SC07 "3 s" delay. */
export const SLOW_RESPONSE_MS = 3000

export type Garden = {
  id: string
  owner: string
  name: string
  description: string | null
  /** ISO date-only, as the screen map gives it. */
  createdAt: string
}

export type Account = {
  email: string
  password: string
  isConfirmed: boolean
  purposePl: string
  purposeEn: string
}

export const SEED_ACCOUNTS: Account[] = [
  { email: "ala@example.test", password: DEMO_PASSWORD, isConfirmed: true, purposePl: "właścicielka projektu, główna ścieżka", purposeEn: "project owner, main path" },
  { email: "ewa@example.test", password: DEMO_PASSWORD, isConfirmed: true, purposePl: "mama, osobne konto (cudzy ogród → 404)", purposeEn: "mother, own account (foreign garden → 404)" },
  { email: "ola@example.test", password: DEMO_PASSWORD, isConfirmed: true, purposePl: "babcia, osobne konto", purposeEn: "grandmother, own account" },
  { email: "cel@example.test", password: DEMO_PASSWORD, isConfirmed: true, purposePl: "świeże konto, pusta lista", purposeEn: "fresh account, empty list" },
  { email: "dar@example.test", password: DEMO_PASSWORD, isConfirmed: true, purposePl: "limit 20 ogrodów", purposeEn: "20-garden limit" },
  { email: "nowy@example.test", password: DEMO_PASSWORD, isConfirmed: false, purposePl: "e-mail niepotwierdzony", purposeEn: "email not confirmed" },
]

/** Exists only as a login attempt: same error as a wrong password (s03.d). */
export const NONEXISTENT_EMAIL = "nikt@example.test"

function darGardens(): Garden[] {
  return Array.from({ length: MAX_GARDENS_PER_USER }, (_, i) => {
    const n = String(i + 1).padStart(2, "0")
    return { id: `g-dar-${n}`, owner: "dar@example.test", name: `Ogród testowy ${n}`, description: null, createdAt: `2027-02-${n}` }
  })
}

export function seedGardens(): Garden[] {
  return [
    { id: "g-ala-1", owner: "ala@example.test", name: "Ogród za domem", description: "Grządki podwyższone przy tarasie", createdAt: "2027-02-10" },
    { id: "g-ala-2", owner: "ala@example.test", name: "Działka", description: null, createdAt: "2027-02-20" },
    { id: "g-ewa-1", owner: "ewa@example.test", name: "Ogród mamy", description: null, createdAt: "2027-01-15" },
    { id: "g-ola-1", owner: "ola@example.test", name: "Ogród babci", description: "Śliwa, porzeczki, agrest", createdAt: "2027-02-28" },
    ...darGardens(),
  ]
}

/** SC10: the garden of another account, used to show the 404 (#23/AC2). */
export const FOREIGN_GARDEN_ID = "g-ewa-1"
