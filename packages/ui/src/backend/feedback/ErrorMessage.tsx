import { CircleAlert, RotateCw } from "lucide-react"
import { cn } from "cn"

import { Button } from "../../components/ui/button"
import type { ApiErrorBody } from "../api/apiCall"

export const DEFAULT_RETRY_LABEL = "Try again"

export interface ErrorMessageProps {
  /** The `error` of a failed `ApiResult`; `null` renders nothing. */
  error: ApiErrorBody | null
  /** Shows a retry button when given. */
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * The only error renderer. It shows the server's user-facing `message` and
 * nothing else: `code` is for code, `details` may carry internals, and
 * `fieldErrors` belong next to their fields (`CrudForm`).
 */
export function ErrorMessage({ error, onRetry, retryLabel = DEFAULT_RETRY_LABEL, className }: ErrorMessageProps) {
  if (error === null) return null

  return (
    <div
      role="alert"
      data-slot="error-message"
      className={cn(
        "flex flex-col gap-in-group rounded-md border border-destructive p-between-groups text-body text-destructive sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex flex-1 items-start gap-in-group">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        <p>{error.message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          <RotateCw aria-hidden />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
