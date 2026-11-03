/** App paths shared by server and client code. */
export const ROUTES = {
  login: "/login",
  register: "/register",
  /** Where a successful sign-in lands (spec A: "Moje ogrody"; the page ships in Phase 5). */
  afterSignIn: "/gardens",
} as const;
