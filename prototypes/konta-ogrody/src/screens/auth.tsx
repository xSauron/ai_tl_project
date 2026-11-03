// Guest screens: s02 Register, s03 Log in, s12 Forgot password, s13 New password,
// s14 Check inbox, s15 Email confirmed.
import { useEffect, useRef, useState } from "react"
import { Button } from "@plant-ai/ui/components/button"
import { Badge } from "@plant-ai/ui/components/badge"

import * as api from "../api"
import { DEMO_PASSWORD } from "../data"
import { AuthLayout, Field, LoadingMessage, Notice } from "../gaps"
import { focusFirstInvalid, genericError, validateEmail, validatePassword } from "../forms"
import { type MessageKey, useT } from "../i18n"
import { href, navigate, parse } from "../router"
import { getState, isSessionAlive, setState, useStore } from "../store"

function Link({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="link" className="h-auto px-0">
      <a href={to}>{children}</a>
    </Button>
  )
}

// ---------- s02 Register ----------

export function RegisterScreen() {
  const t = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: MessageKey; password?: MessageKey }>({})
  const [formError, setFormError] = useState<MessageKey | null>(null)
  const [isPending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = { email: validateEmail(email) ?? undefined, password: validatePassword(password) ?? undefined }
    setErrors(next)
    setFormError(null)
    if (next.email || next.password) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const result = await api.register(email.trim(), password)
    setPending(false)
    if (result.ok) {
      setState({ pendingEmail: result.data.email })
      navigate({ screen: "s14" })
      return
    }
    // Entered data stays in the form after any error (task rule).
    setFormError(genericError(result) ?? "s02.failed")
  }

  return (
    <AuthLayout
      title={t("s02.title")}
      footer={
        <p className="text-label">
          {t("s02.haveAccount")} <Link to={href({ screen: "s03" })}>{t("s02.toLogin")}</Link>
        </p>
      }
    >
      <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-between-groups" aria-busy={isPending}>
        {formError && (
          <Notice tone="error">
            {t(formError)}
            {formError === "s02.failed" && (
              <>
                {" "}
                <Link to={href({ screen: "s03" })}>{t("s02.toLogin")}</Link>
              </>
            )}
          </Notice>
        )}
        <Field id="reg-email" label={t("email")} type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email && t(errors.email)} />
        <Field
          id="reg-password"
          label={t("password")}
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={`${t("passwordHint")} ${t("simPassword")}`}
          error={errors.password && t(errors.password)}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? t("sending") : t("s02.submit")}
        </Button>
      </form>
    </AuthLayout>
  )
}

// ---------- s03 Log in ----------

export function LoginScreen() {
  const t = useT()
  const reason = useStore((s) => s.loginReason)
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: MessageKey; password?: MessageKey }>({})
  const [formError, setFormError] = useState<MessageKey | null>(null)
  const [isPending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = { email: validateEmail(email) ?? undefined, password: password ? undefined : ("required" as const) }
    setErrors(next)
    setFormError(null)
    if (next.email || next.password) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const result = await api.login(email.trim(), password)
    setPending(false)
    if (result.ok) {
      const back = getState().returnTo
      setState({ returnTo: null })
      if (back && parse(back).screen !== "s03") {
        history.replaceState(null, "", back)
        window.dispatchEvent(new HashChangeEvent("hashchange"))
      } else {
        navigate({ screen: "s04" })
      }
      return
    }
    setFormError(genericError(result) ?? "s03.invalid")
  }

  const reasonKey: Record<string, MessageKey> = {
    expired: "s03.reason.expired",
    loggedOut: "s03.reason.loggedOut",
    passwordReset: "s03.reason.passwordReset",
    emailConfirmed: "s03.reason.emailConfirmed",
  }

  return (
    <AuthLayout
      title={t("s03.title")}
      footer={
        <p className="text-label">
          {t("s03.noAccount")} <Link to={href({ screen: "s02" })}>{t("s03.toRegister")}</Link>
        </p>
      }
    >
      {reason !== "none" && reasonKey[reason] && <Notice tone="info">{t(reasonKey[reason]!)}</Notice>}
      <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-between-groups" aria-busy={isPending}>
        {formError && <Notice tone="error">{t(formError)}</Notice>}
        <Field id="login-email" label={t("email")} type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email && t(errors.email)} />
        <Field
          id="login-password"
          label={t("password")}
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={t("simPassword")}
          error={errors.password && t(errors.password)}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? t("sending") : t("s03.submit")}
        </Button>
        <Link to={href({ screen: "s12" })}>{t("s03.forgot")}</Link>
      </form>
      <p className="text-metadata text-muted-foreground">
        {t("s03.demoHint")} <Badge variant="outline">{DEMO_PASSWORD}</Badge>
      </p>
    </AuthLayout>
  )
}

// ---------- s12 Forgot password ----------

export function ForgotPasswordScreen() {
  const t = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<MessageKey | null>(null)
  const [result, setResult] = useState<MessageKey | null>(null)
  const [isSent, setSent] = useState(false)
  const [isPending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = validateEmail(email)
    setError(v)
    setResult(null)
    setSent(false)
    if (v) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const r = await api.requestPasswordReset(email.trim())
    setPending(false)
    if (r.ok) {
      setSent(true)
      setResult("s12.sent")
      return
    }
    setResult(r.error.code === "EMAIL_UNAVAILABLE" ? "s12.emailDown" : genericError(r))
  }

  return (
    <AuthLayout title={t("s12.title")} footer={<Link to={href({ screen: "s03" })}>{t("s12.toLogin")}</Link>}>
      <p className="text-body">{t("s12.lead")}</p>
      <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-between-groups" aria-busy={isPending}>
        {result && <Notice tone={isSent ? "info" : "error"}>{t(result)}</Notice>}
        <Field id="forgot-email" label={t("email")} type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} error={error ? t(error) : undefined} hint={t("simEmail")} />
        <Button type="submit" disabled={isPending}>
          {isPending ? t("sending") : t("s12.submit")}
        </Button>
      </form>
    </AuthLayout>
  )
}

// ---------- s13 New password ----------

export function NewPasswordScreen({ token }: { token?: string }) {
  const t = useT()
  // Re-render on scenario changes so SC13 applies immediately.
  useStore((s) => s.scenarios.emailLink)
  const formRef = useRef<HTMLFormElement>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<MessageKey | null>(null)
  const [formError, setFormError] = useState<MessageKey | null>(null)
  const [isPending, setPending] = useState(false)
  const check = api.checkLink(token ?? "", "reset")

  if (!check.ok) {
    const key: MessageKey = check.code === "LINK_EXPIRED" ? "s13.expired" : check.code === "LINK_USED" ? "s13.used" : "s13.invalid"
    return (
      <AuthLayout title={t("s13.title")}>
        <Notice tone="error">{t(key)}</Notice>
        <Button asChild>
          <a href={href({ screen: "s12" })}>{t("s13.newLink")}</a>
        </Button>
      </AuthLayout>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = validatePassword(password)
    setError(v)
    setFormError(null)
    if (v) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const r = await api.resetPassword(token ?? "", password)
    setPending(false)
    if (r.ok) {
      setState({ loginReason: "passwordReset", session: null })
      navigate({ screen: "s03" })
      return
    }
    setFormError(genericError(r) ?? "s13.invalid")
  }

  return (
    <AuthLayout title={t("s13.title")}>
      <p className="text-label text-muted-foreground">{check.email}</p>
      <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-between-groups" aria-busy={isPending}>
        {formError && <Notice tone="error">{t(formError)}</Notice>}
        <Field
          id="new-password"
          label={t("s13.newPassword")}
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={`${t("passwordHint")} ${t("simPassword")}`}
          error={error ? t(error) : undefined}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : t("s13.submit")}
        </Button>
      </form>
    </AuthLayout>
  )
}

// ---------- s14 Check inbox ----------

export function CheckInboxScreen() {
  const t = useT()
  const email = useStore((s) => s.pendingEmail)
  const isEmailDown = useStore((s) => s.scenarios.emailService === "down")
  const [note, setNote] = useState<MessageKey | null>(null)
  const [isPending, setPending] = useState(false)
  useEffect(() => setNote(null), [isEmailDown])

  if (!email) {
    // Only reachable right after registering (screen map "Role" table).
    navigate({ screen: "s02" }, { replace: true })
    return null
  }

  async function resend() {
    setPending(true)
    const r = await api.resendVerification(email!)
    setPending(false)
    setNote(r.ok ? "s14.resent" : r.error.code === "EMAIL_UNAVAILABLE" ? "s14.emailDown" : genericError(r))
  }

  return (
    <AuthLayout title={t("s14.title")}>
      <p className="text-body">{t("s14.body", { email })}</p>
      {isEmailDown && !note && <Notice tone="error">{t("s14.emailDown")}</Notice>}
      {note && <Notice tone={note === "s14.resent" ? "info" : "error"}>{t(note)}</Notice>}
      <Button type="button" variant="outline" onClick={resend} disabled={isPending}>
        {isPending ? t("sending") : t("s14.resend")}
      </Button>
      <p className="text-metadata text-muted-foreground">{t("simEmail")}</p>
    </AuthLayout>
  )
}

// ---------- s15 Email confirmed ----------

// Opening the link sends one request per visit. React StrictMode mounts effects
// twice in development, and a second request would see the token as already used.
const confirmations = new Map<string, ReturnType<typeof api.confirmEmail>>()
function confirmOnce(token: string) {
  // Reuse only a request started in the same tick (StrictMode's double effect).
  const pending = confirmations.get(token) ?? api.confirmEmail(token)
  confirmations.set(token, pending)
  setTimeout(() => confirmations.delete(token), 0)
  return pending
}

export function ConfirmEmailScreen({ token }: { token?: string }) {
  const t = useT()
  const linkScenario = useStore((s) => s.scenarios.emailLink)
  const hasSession = useStore(isSessionAlive)
  const [result, setResult] = useState<"pending" | "ok" | MessageKey>("pending")

  useEffect(() => {
    let isActive = true
    setResult("pending")
    confirmOnce(token ?? "").then((r) => {
      if (!isActive) return
      if (r.ok) return setResult("ok")
      const code = r.error.code
      setResult(code === "LINK_EXPIRED" ? "s13.expired" : code === "LINK_USED" ? "s15.used" : code === "LINK_INVALID" ? "s13.invalid" : genericError(r) ?? "serverError")
    })
    return () => {
      isActive = false
    }
  }, [token, linkScenario])

  if (result === "pending") {
    return (
      <AuthLayout title={t("s15.title")}>
        <LoadingMessage>{t("s15.confirming")}</LoadingMessage>
      </AuthLayout>
    )
  }
  if (result === "ok") {
    // s15.a: with a session (unconfirmed user already logged in) → gardens; without → log in.
    return (
      <AuthLayout title={t("s15.title")}>
        <p className="text-body">{t(hasSession ? "s15.body" : "s15.bodyLogin")}</p>
        {hasSession ? (
          <Button asChild>
            <a href={href({ screen: "s04" })}>{t("s15.toGardens")}</a>
          </Button>
        ) : (
          <Button type="button" onClick={() => { setState({ loginReason: "emailConfirmed" }); navigate({ screen: "s03" }) }}>
            {t("s15.toLogin")}
          </Button>
        )}
      </AuthLayout>
    )
  }
  // s15.b–d: a new verification link is requested from the login screen (s03.k),
  // because a guest with a dead link has no session and the map gives no other place.
  return (
    <AuthLayout title={t("s15.title")}>
      <Notice tone={result === "s15.used" ? "info" : "error"}>{t(result)}</Notice>
      <Button asChild>
        <a href={href({ screen: "s03" })}>{t("s15.toLogin")}</a>
      </Button>
    </AuthLayout>
  )
}
