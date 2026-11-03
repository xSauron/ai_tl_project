/** App paths shared by server and client code. */
export const ROUTES = {
  login: "/login",
  register: "/register",
  gardens: "/gardens",
  /** Where a successful sign-in lands (spec A: "Moje ogrody"). */
  afterSignIn: "/gardens",
} as const;
