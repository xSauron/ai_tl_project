// Design-system gaps (screen map §5, DS01–DS17). Each piece below is the
// simplest version built ONLY from DS components and tokens (no new colors,
// spacing or radii). Every one is marked `DS-GAP DSxx` and listed in the README.
// Production code must replace them with the real DS components from spec A phase 3.
import type * as React from "react"
import { useEffect, useId, useRef } from "react"
import { cn } from "@plant-ai/ui/lib/utils"
import { Button } from "@plant-ai/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plant-ai/ui/components/card"
import { Input } from "@plant-ai/ui/components/input"
import { Label } from "@plant-ai/ui/components/label"

/** DS-GAP DS01 + DS02: a labelled field with hint and error text linked via aria-describedby. */
export function Field(props: {
  id: string
  label: string
  hint?: string
  error?: string
  children?: React.ReactNode
} & React.ComponentProps<"input">) {
  const { id, label, hint, error, children, ...inputProps } = props
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined
  return (
    <div className="flex flex-col gap-in-group">
      <Label htmlFor={id}>{label}</Label>
      {children ?? (
        <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} />
      )}
      {hint && (
        <p id={hintId} className="text-metadata text-muted-foreground">
          {hint}
        </p>
      )}
      {/* DS-GAP DS02: field error text */}
      {error && (
        <p id={errorId} className="text-label text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** DS-GAP DS06: textarea, styled with the same token classes as the DS Input. */
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-touch w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      rows={4}
      {...props}
    />
  )
}

/** DS-GAP DS15 (info) + DS03 (ErrorMessage): in-page message. */
export function Notice(props: { tone: "info" | "error"; children: React.ReactNode; action?: React.ReactNode; live?: boolean }) {
  const role = props.tone === "error" ? "alert" : "status"
  return (
    <div
      role={props.live === false ? undefined : role}
      className={cn(
        "flex flex-col gap-in-group rounded-md border px-4 py-3 text-label",
        props.tone === "error" ? "border-destructive text-destructive" : "border-border bg-muted text-foreground",
      )}
    >
      <div>{props.children}</div>
      {props.action}
    </div>
  )
}

/** DS-GAP DS03: LoadingMessage. */
export function LoadingMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="text-label text-muted-foreground">
      {children}
    </p>
  )
}

/** DS-GAP DS03: EmptyState. */
export function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-between-groups rounded-md border border-dashed p-panel">
      <p className="text-body text-muted-foreground">{children}</p>
      {action}
    </div>
  )
}

/** DS-GAP DS09 (auth layout) + DS14 (product mark): centred card with the wordmark. */
export function AuthLayout({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-between-groups px-4 py-section">
      {/* DS-GAP DS14: no product mark in the DS — plain wordmark, no emoji (anti-reference A01 is a proposal). */}
      <p className="text-section-heading font-semibold">Plant.AI</p>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-page-heading font-semibold" tabIndex={-1} data-screen-heading>
              {title}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-between-groups">{children}</CardContent>
      </Card>
      {footer}
    </div>
  )
}

/** DS-GAP DS10: error page pattern (404, 500). */
export function ErrorPage({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-between-groups px-4 py-section">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-page-heading font-semibold" tabIndex={-1} data-screen-heading>
              {title}
            </h1>
          </CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
        <CardContent>{action}</CardContent>
      </Card>
    </div>
  )
}

/** DS-GAP DS08: PageHeader. */
export function PageHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-between-groups">
      <h1 className="text-page-heading font-semibold" tabIndex={-1} data-screen-heading>
        {title}
      </h1>
      {action}
    </div>
  )
}

function useModalFocus(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  // Keep the latest onClose without re-running the focus setup (which would steal focus back).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const node = ref.current
    // After the screen's own heading focus has run.
    const first = node?.querySelector<HTMLElement>("input, textarea, button:not([data-close])")
    requestAnimationFrame(() => first?.focus())
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onCloseRef.current()
      }
      if (e.key !== "Tab" || !node) return
      const items = [...node.querySelectorAll<HTMLElement>("button, input, textarea, a[href]")].filter((el) => !el.hasAttribute("disabled"))
      if (items.length === 0) return
      const firstItem = items[0]!
      const lastItem = items[items.length - 1]!
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      // Return focus to the opener; if it is gone (e.g. its row was deleted), to the page heading.
      requestAnimationFrame(() => {
        const target = previous && previous.isConnected ? previous : document.querySelector<HTMLElement>("[data-screen-heading]")
        target?.focus()
      })
    }
  }, [])
  return ref
}

/** DS-GAP DS05: Sheet (side panel). Bottom sheet on phones, right panel from md. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useModalFocus(onClose)
  const titleId = useId()
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end md:items-stretch">
      <div className="absolute inset-0 bg-foreground/50" aria-hidden onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-full w-full flex-col gap-between-groups overflow-y-auto rounded-t-xl border bg-background p-panel shadow-sm md:max-w-md md:rounded-none"
      >
        <h2 id={titleId} className="text-section-heading font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

/** DS-GAP DS07: ConfirmDialog (Radix alert-dialog is not in the DS yet). */
export function ConfirmDialog(props: {
  title: string
  body: string
  confirmLabel: string
  pendingLabel: string
  isPending: boolean
  error?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  cancelLabel: string
  /** Shown when there is nothing left to confirm (e.g. the garden no longer exists). */
  isConfirmHidden?: boolean
}) {
  const ref = useModalFocus(props.onCancel)
  const titleId = useId()
  const bodyId = useId()
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50" aria-hidden />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="relative flex w-full max-w-md flex-col gap-between-groups rounded-xl border bg-background p-panel shadow-sm"
      >
        <h2 id={titleId} className="text-section-heading font-semibold">
          {props.title}
        </h2>
        <p id={bodyId} className="text-body">
          {props.body}
        </p>
        {props.error}
        <div className="flex flex-wrap justify-end gap-in-group">
          <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isPending}>
            {props.cancelLabel}
          </Button>
          {!props.isConfirmHidden && (
            <Button type="button" variant="destructive" onClick={props.onConfirm} disabled={props.isPending}>
              {props.isPending ? props.pendingLabel : props.confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
