// Signed-in screens: s04 My gardens (+ overlays s05 New, s06 Rename, s07 Delete),
// s11 Garden, s16 Settings. Every request may come back 401 → session-expiry handling (L03).
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@plant-ai/ui/components/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@plant-ai/ui/components/card"
import { Separator } from "@plant-ai/ui/components/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@plant-ai/ui/components/table"
import { Plus } from "lucide-react"

import * as api from "../api"
import type { ApiFailure, ApiResult } from "../api"
import { type Garden, MAX_GARDEN_DESCRIPTION, MAX_GARDEN_NAME, MAX_GARDENS_PER_USER } from "../data"
import { ConfirmDialog, EmptyState, Field, LoadingMessage, Notice, PageHeader, Sheet, Textarea } from "../gaps"
import { focusFirstInvalid, genericError, validatePassword } from "../forms"
import { formatDate, type MessageKey, useT } from "../i18n"
import { href, navigate } from "../router"
import { goToLogin } from "../session"
import { useStore } from "../store"
import { AppShell } from "./shell"

/** Message with a link back to login, used inside open forms (s05.e, s06.e, s07.d, s16.f). */
function SessionExpiredNotice() {
  const t = useT()
  return (
    <Notice
      tone="error"
      action={
        <Button type="button" variant="outline" className="self-start" onClick={() => goToLogin("expired")}>
          {t("logInAgain")}
        </Button>
      }
    >
      {t("sessionExpiredInline")}
    </Notice>
  )
}

type Load<T> = { status: "loading" } | { status: "ok"; data: T } | { status: "error"; result: ApiFailure }

function useLoad<T>(fetcher: () => Promise<ApiResult<T>>, deps: unknown[]) {
  const [state, setLoad] = useState<Load<T>>({ status: "loading" })
  const reload = useCallback(() => {
    let isActive = true
    setLoad({ status: "loading" })
    fetcher().then((r) => {
      if (!isActive) return
      setLoad(r.ok ? { status: "ok", data: r.data } : { status: "error", result: r })
    })
    return () => {
      isActive = false
    }
  }, deps)
  useEffect(() => reload(), [reload])
  return [state, reload] as const
}

// ---------- s04 My gardens ----------

export type Overlay = { kind: "new" } | { kind: "rename"; id: string } | { kind: "delete"; id: string } | null

export function GardensScreen({ overlay }: { overlay: Overlay }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  // Reload when the account or demo database changes from the review bar.
  const accountEmail = useStore((s) => s.session?.email)
  const database = useStore((s) => s.scenarios.database)
  const [list, reload] = useLoad(api.listGardens, [accountEmail, database])
  const [flash, setFlash] = useState<MessageKey | null>(null)

  useEffect(() => {
    if (list.status === "error" && list.result.status === 401) goToLogin("expired")
  }, [list])

  const close = useCallback(() => navigate({ screen: "s04" }), [])
  const done = useCallback(
    (message: MessageKey) => {
      setFlash(message)
      reload()
      navigate({ screen: "s04" })
    },
    [reload],
  )

  const gardens = list.status === "ok" ? list.data : []
  const isAtLimit = gardens.length >= MAX_GARDENS_PER_USER
  const selected = overlay && overlay.kind !== "new" ? gardens.find((g) => g.id === overlay.id) : undefined

  return (
    <AppShell active="gardens">
      <PageHeader
        title={t("s04.title")}
        action={
          // s04.f / L06 (owner, 2026-11-02): at the limit the button is disabled and the reason is linked to it.
          isAtLimit ? (
            <Button type="button" disabled aria-describedby="garden-limit">
              <Plus aria-hidden />
              {t("s04.new")}
            </Button>
          ) : (
            <Button asChild>
              <a href={href({ screen: "s05" })}>
                <Plus aria-hidden />
                {t("s04.new")}
              </a>
            </Button>
          )
        }
      />
      {/* L07 (open): success confirmation shown as an in-page message (DS12 toast not in DS). */}
      {flash && (
        <Notice tone="info">
          <span>{t(flash)}</span>
        </Notice>
      )}
      {isAtLimit && (
        <p id="garden-limit" className="text-label text-muted-foreground">
          {t("s04.limit")}
        </p>
      )}

      {list.status === "loading" && <LoadingMessage>{t("loading")}</LoadingMessage>}
      {list.status === "error" && list.result.status !== 401 && (
        <Notice
          tone="error"
          action={
            <Button type="button" variant="outline" className="self-start" onClick={reload}>
              {t("tryAgain")}
            </Button>
          }
        >
          {t("s04.loadError")} {t(genericError(list.result) ?? "serverError")}
        </Notice>
      )}
      {list.status === "ok" && gardens.length === 0 && (
        <EmptyState
          action={
            <Button asChild>
              <a href={href({ screen: "s05" })}>
                <Plus aria-hidden />
                {t("s04.new")}
              </a>
            </Button>
          }
        >
          {t("s04.empty")}
        </EmptyState>
      )}
      {list.status === "ok" && gardens.length > 0 && (
        <>
          {/* DS-GAP DS04: DataTable with card mode below md — built from DS Table and Card. */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("s04.col.name")}</TableHead>
                  <TableHead>{t("s04.col.description")}</TableHead>
                  <TableHead>{t("s04.col.created")}</TableHead>
                  <TableHead className="text-right">{t("s04.col.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gardens.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Button asChild variant="link" className="h-auto px-0">
                        <a href={href({ screen: "s11", param: g.id })}>{g.name}</a>
                      </Button>
                    </TableCell>
                    <TableCell className="max-w-64 truncate">{g.description ?? t("s04.noDescription")}</TableCell>
                    <TableCell>{formatDate(lang, g.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <RowActions garden={g} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="flex flex-col gap-in-group md:hidden">
            {gardens.map((g) => (
              <li key={g.id}>
                <Card className="gap-between-groups py-between-groups">
                  <CardHeader className="px-between-groups">
                    <CardTitle>
                      <Button asChild variant="link" className="h-auto px-0 text-body">
                        <a href={href({ screen: "s11", param: g.id })}>{g.name}</a>
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {g.description ? `${g.description} · ` : ""}
                      {formatDate(lang, g.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <div className="px-between-groups">
                    <RowActions garden={g} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {overlay?.kind === "new" && <GardenFormSheet mode="new" onClose={close} onDone={done} />}
      {overlay?.kind === "rename" && (
        list.status === "ok" && <GardenFormSheet key={overlay.id} mode="rename" garden={selected} gardenId={overlay.id} onClose={close} onDone={done} />
      )}
      {overlay?.kind === "delete" && <DeleteDialog garden={selected} gardenId={overlay.id} isListReady={list.status === "ok"} onClose={close} onDone={done} />}
    </AppShell>
  )
}

/** DS-GAP DS11: row actions as two 44 px buttons (no dropdown-menu in the DS). */
function RowActions({ garden }: { garden: Garden }) {
  const t = useT()
  return (
    <div className="flex flex-wrap justify-end gap-in-group">
      <Button asChild variant="outline">
        <a href={href({ screen: "s06", param: garden.id })} aria-label={`${t("s04.rename")}: ${garden.name}`}>
          {t("s04.rename")}
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={href({ screen: "s07", param: garden.id })} aria-label={`${t("s04.delete")}: ${garden.name}`}>
          {t("s04.delete")}
        </a>
      </Button>
    </div>
  )
}

// ---------- s05 New garden / s06 Rename ----------

function GardenFormSheet(props: {
  mode: "new" | "rename"
  garden?: Garden
  gardenId?: string
  onClose: () => void
  onDone: (message: MessageKey) => void
}) {
  const t = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [name, setName] = useState(props.garden?.name ?? "")
  const [description, setDescription] = useState(props.garden?.description ?? "")
  const [errors, setErrors] = useState<{ name?: MessageKey; description?: MessageKey }>({})
  const [formError, setFormError] = useState<MessageKey | null>(null)
  const [isExpired, setExpired] = useState(false)
  const [isPending, setPending] = useState(false)

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    if (isPending) return
    const trimmed = name.trim()
    const next = {
      name: !trimmed ? ("required" as const) : trimmed.length > MAX_GARDEN_NAME ? ("s05.nameTooLong" as const) : undefined,
      description: description.length > MAX_GARDEN_DESCRIPTION ? ("s05.descriptionTooLong" as const) : undefined,
    }
    setErrors(next)
    setFormError(null)
    setExpired(false)
    if (next.name || next.description) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const input = { name: trimmed, description: description.trim() || null }
    const r = props.mode === "new" ? await api.createGarden(input) : await api.renameGarden(props.gardenId!, input)
    setPending(false)
    if (r.ok) return props.onDone(props.mode === "new" ? "s05.created" : "s06.saved")
    // Entered values stay in the form after every error (task rule).
    if (r.status === 401) return setExpired(true)
    if (r.error.fieldErrors?.name) {
      setErrors({ name: "s05.serverName" })
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    if (r.error.code === "LIMIT_REACHED") return setFormError("s05.limit")
    if (r.error.code === "NOT_FOUND") return setFormError("s05.notFound")
    setFormError(genericError(r) ?? "serverError")
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // Cmd/Ctrl+Enter saves (spec A, CrudForm).
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
  }

  if (props.mode === "rename" && !props.garden) {
    return (
      <Sheet title={t("s06.title")} onClose={props.onClose}>
        <Notice tone="error">{t("s05.notFound")}</Notice>
        <Button type="button" variant="outline" onClick={props.onClose}>
          {t("back")}
        </Button>
      </Sheet>
    )
  }

  return (
    <Sheet title={props.mode === "new" ? t("s05.title") : t("s06.title")} onClose={props.onClose}>
      <form ref={formRef} noValidate onSubmit={submit} onKeyDown={onKeyDown} className="flex flex-col gap-between-groups" aria-busy={isPending}>
        {isExpired && <SessionExpiredNotice />}
        {formError && <Notice tone="error">{t(formError)}</Notice>}
        <Field id="garden-name" label={t("s05.name")} value={name} onChange={(e) => setName(e.target.value)} hint={t("s05.nameHint")} error={errors.name && t(errors.name)} />
        {/* L15 (open): rename edits name and description, like the spec A update schema. */}
        <Field id="garden-description" label={t("s05.description")} hint={t("s05.descriptionHint")} error={errors.description && t(errors.description)}>
          <Textarea
            id="garden-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={`garden-description-hint${errors.description ? " garden-description-error" : ""}`}
          />
        </Field>
        <div className="flex flex-wrap justify-end gap-in-group">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("saving") : props.mode === "new" ? t("s05.submit") : t("s06.submit")}
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

// ---------- s07 Delete ----------

type DeleteProps = { garden?: Garden; gardenId: string; isListReady: boolean; onClose: () => void; onDone: (m: MessageKey) => void }

function DeleteDialog(props: DeleteProps) {
  // Missing or foreign id in the URL: nothing to confirm (same as s06 with an unknown id).
  // A separate component, so hooks never change between renders when the garden disappears.
  if (props.isListReady && !props.garden) return <GardenGoneDialog onClose={props.onClose} />
  return <ConfirmDeleteDialog {...props} />
}

function GardenGoneDialog({ onClose }: { onClose: () => void }) {
  const t = useT()
  return (
    <ConfirmDialog
      title={t("s07.title")}
      body={t("s05.notFound")}
      confirmLabel={t("s07.confirm")}
      pendingLabel={t("s07.deleting")}
      cancelLabel={t("back")}
      isPending={false}
      isConfirmHidden
      onConfirm={onClose}
      onCancel={onClose}
    />
  )
}

function ConfirmDeleteDialog(props: DeleteProps) {
  const t = useT()
  const [isPending, setPending] = useState(false)
  const [error, setError] = useState<MessageKey | "expired" | null>(null)

  async function confirm() {
    setPending(true)
    setError(null)
    const r = await api.deleteGarden(props.gardenId)
    setPending(false)
    if (r.ok) return props.onDone("s07.deleted")
    if (r.status === 401) return setError("expired")
    setError(r.error.code === "NOT_FOUND" ? "s05.notFound" : genericError(r) ?? "serverError")
  }

  return (
    <ConfirmDialog
      title={t("s07.title")}
      body={t("s07.body", { name: props.garden?.name ?? "" })}
      confirmLabel={t("s07.confirm")}
      pendingLabel={t("s07.deleting")}
      cancelLabel={t("cancel")}
      isPending={isPending}
      error={error === "expired" ? <SessionExpiredNotice /> : error ? <Notice tone="error">{t(error)}</Notice> : undefined}
      onConfirm={confirm}
      onCancel={props.onClose}
    />
  )
}

// ---------- s11 Garden ----------

export function GardenScreen({ id }: { id: string }) {
  const t = useT()
  const lang = useStore((s) => s.lang)
  const accountEmail = useStore((s) => s.session?.email)
  const database = useStore((s) => s.scenarios.database)
  const [garden] = useLoad(() => api.getGarden(id), [id, accountEmail, database])

  useEffect(() => {
    if (garden.status !== "error") return
    if (garden.result.status === 401) goToLogin("expired")
    else if (garden.result.status === 404) navigate({ screen: "s08" }, { replace: true })
    // s11.d / L09 (open): read error goes to s10, the agent's candidate screen.
    // The failed address is kept so "Try again" retries it.
    else navigate({ screen: "s10", param: location.hash }, { replace: true })
  }, [garden])

  return (
    <AppShell active="gardens">
      <Button asChild variant="link" className="self-start px-0">
        <a href={href({ screen: "s04" })}>{t("s11.back")}</a>
      </Button>
      {garden.status === "loading" && <LoadingMessage>{t("loading")}</LoadingMessage>}
      {garden.status === "ok" && (
        <>
          <PageHeader title={garden.data.name} />
          {garden.data.description && <p className="max-w-prose text-body">{garden.data.description}</p>}
          <p className="text-metadata text-muted-foreground">{t("s11.created", { date: formatDate(lang, garden.data.createdAt) })}</p>
          <Separator />
          <Card>
            <CardHeader>
              <CardDescription>{t("s11.later")}</CardDescription>
            </CardHeader>
          </Card>
        </>
      )}
    </AppShell>
  )
}

// ---------- s16 Settings ----------

export function SettingsScreen() {
  const t = useT()
  const email = useStore((s) => s.session?.email ?? "")
  const formRef = useRef<HTMLFormElement>(null)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [errors, setErrors] = useState<{ current?: MessageKey; next?: MessageKey }>({})
  const [result, setResult] = useState<MessageKey | "expired" | null>(null)
  const [isPending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const v = { current: current ? undefined : ("required" as const), next: validatePassword(next) ?? undefined }
    setErrors(v)
    setResult(null)
    if (v.current || v.next) {
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setPending(true)
    const r = await api.changePassword(current, next)
    setPending(false)
    if (r.ok) {
      setCurrent("")
      setNext("")
      return setResult("s16.changed")
    }
    if (r.status === 401) return setResult("expired")
    if (r.error.code === "WRONG_PASSWORD") {
      setErrors({ current: "s16.wrongCurrent" })
      requestAnimationFrame(() => focusFirstInvalid(formRef.current))
      return
    }
    setResult(genericError(r) ?? "serverError")
  }

  return (
    <AppShell active="settings">
      <PageHeader title={t("s16.title")} />
      <section className="flex max-w-md flex-col gap-between-groups">
        <h2 className="text-section-heading font-semibold">{t("s16.account")}</h2>
        <Field id="settings-email" label={t("email")} value={email} readOnly />
      </section>
      <Separator className="max-w-md" />
      <section className="flex max-w-md flex-col gap-between-groups">
        <h2 className="text-section-heading font-semibold">{t("s16.changePassword")}</h2>
        <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-between-groups" aria-busy={isPending}>
          {result === "expired" && <SessionExpiredNotice />}
          {result && result !== "expired" && <Notice tone={result === "s16.changed" ? "info" : "error"}>{t(result)}</Notice>}
          <Field id="settings-current" label={t("s16.current")} type="password" autoComplete="off" value={current} onChange={(e) => setCurrent(e.target.value)} hint={t("simPassword")} error={errors.current && t(errors.current)} />
          <Field id="settings-new" label={t("s16.new")} type="password" autoComplete="off" value={next} onChange={(e) => setNext(e.target.value)} hint={t("passwordHint")} error={errors.next && t(errors.next)} />
          <Button type="submit" disabled={isPending} className="self-start">
            {isPending ? t("saving") : t("s16.submit")}
          </Button>
        </form>
      </section>
      <p className="max-w-md text-metadata text-muted-foreground">{t("s16.languageNote")}</p>
    </AppShell>
  )
}

