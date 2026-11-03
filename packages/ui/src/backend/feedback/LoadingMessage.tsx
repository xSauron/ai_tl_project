import { LoaderCircle } from "lucide-react"
import { cn } from "cn"

export const DEFAULT_LOADING_LABEL = "Loading…"

export interface LoadingMessageProps {
  /** Announced politely by screen readers and shown next to the spinner. */
  label?: string
  className?: string
}

/** The only loading renderer (AGENTS.md "Reusable API & UI layer"). */
export function LoadingMessage({ label = DEFAULT_LOADING_LABEL, className }: LoadingMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loading-message"
      className={cn("flex items-center gap-in-group p-between-groups text-body text-muted-foreground", className)}
    >
      <LoaderCircle aria-hidden className="size-5 animate-spin motion-reduce:animate-none" />
      <span>{label}</span>
    </div>
  )
}
