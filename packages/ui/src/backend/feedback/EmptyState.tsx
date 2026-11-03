import type * as React from "react"
import { cn } from "cn"

export interface EmptyStateProps {
  title: string
  description?: React.ReactNode
  /** Usually one button that creates the first item. */
  action?: React.ReactNode
  className?: string
}

/** The only empty-list renderer. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-between-groups rounded-md border border-dashed p-panel text-center",
        className,
      )}
    >
      <div className="flex flex-col gap-in-group">
        <p className="text-section-heading font-semibold">{title}</p>
        {description && <p className="text-body text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
