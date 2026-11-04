import type * as React from "react"
import { cn } from "cn"

export interface EmptyStateProps {
  title: string
  /** Decorative (rendered `aria-hidden`), e.g. the concept's nav icon. */
  icon?: React.ReactNode
  description?: React.ReactNode
  /** Usually one button that creates the first item. */
  action?: React.ReactNode
  className?: string
}

/** The only empty-list renderer. */
export function EmptyState({ title, icon, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-between-groups rounded-xl border border-dashed p-section text-center",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-in-group">
        <p className="text-section-heading font-semibold">{title}</p>
        {description && <p className="text-body text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
