// Session-expiry handling shared by screens (WŁ:L03, agent proposal in the map):
// pages redirect to login with "Session expired"; an open form shows a message with a link.
import { navigate } from "./router"
import { getState, setState } from "./store"

/** Send the user to s03.i, remembering where to return after logging in. */
export function goToLogin(reason: "none" | "expired"): void {
  setState({ session: reason === "expired" ? null : getState().session, loginReason: reason, returnTo: location.hash || null })
  navigate({ screen: "s03" }, { replace: true })
}
