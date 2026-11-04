"use client"

import type * as React from "react"
import { useEffect, useRef, useState } from "react"
import { LoaderCircle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import type { ApiErrorBody } from "../api/apiCall"
import { ErrorMessage } from "../feedback/ErrorMessage"

export const DEFAULT_CONFIRM_LABEL = "Confirm"
export const DEFAULT_CANCEL_LABEL = "Cancel"
export const DEFAULT_PENDING_LABEL = "Working…"

export type ConfirmTone = "destructive" | "default"

export interface ConfirmDialogProps {
  /** Controlled open state; leave unset and pass `trigger` for an uncontrolled dialog. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the dialog (rendered with `asChild`, so pass a single button). */
  trigger?: React.ReactElement
  title: string
  /** What happens on confirm (e.g. "Beds and plantings are removed too."). */
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Replaces `confirmLabel` while `onConfirm`'s promise is pending. */
  pendingLabel?: string
  tone?: ConfirmTone
  /**
   * Runs on confirm. A returned promise keeps the dialog open and the buttons
   * disabled until it settles; it closes on resolve and stays open on reject
   * or on a resolved failed `ApiResult` (`{ ok: false }`).
   */
  onConfirm: () => Promise<unknown> | void
  /** Shown inside the dialog, e.g. `useMutation().error` after a failed confirm. */
  error?: ApiErrorBody | null
}

/** `useMutation().run` resolves (never rejects) with `{ ok: false }` on failure. */
function isFailedResult(value: unknown): boolean {
  return typeof value === "object" && value !== null && "ok" in value && value.ok === false
}

/** The confirmation step for every destructive action (spec A, `ConfirmDialog`). */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  pendingLabel = DEFAULT_PENDING_LABEL,
  tone = "default",
  onConfirm,
  error = null,
}: ConfirmDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isMountedRef = useRef(false)
  const isOpen = open ?? uncontrolledOpen

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  function setOpen(next: boolean) {
    if (open === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  function handleOpenChange(next: boolean) {
    // Escape and Cancel must not hide a write that is still running.
    if (!next && isPending) return
    setOpen(next)
  }

  async function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    // Radix's Action closes the dialog on click; we close only after onConfirm succeeds.
    event.preventDefault()
    setIsPending(true)
    let isConfirmed: boolean
    try {
      isConfirmed = !isFailedResult(await onConfirm())
    } catch {
      // A rejection means the action failed: keep the dialog open so the user
      // sees the caller's `error` and can retry or cancel.
      isConfirmed = false
    }
    if (!isMountedRef.current) return
    setIsPending(false)
    if (isConfirmed) setOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent data-tone={tone}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <ErrorMessage error={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={tone === "destructive" ? "destructive" : "default"}
            disabled={isPending}
            aria-busy={isPending}
            onClick={handleConfirm}
          >
            {isPending && <LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-none" />}
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
