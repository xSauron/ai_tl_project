import type * as React from "react"
import { cn } from "cn"

export interface PageHeaderProps {
  /** The page's only `<h1>`. */
  title: string
  description?: React.ReactNode
  /** Page-level actions, e.g. a "New garden" button. */
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "mb-section flex flex-col gap-between-groups sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-in-group">
        <h1 className="text-page-heading font-bold">{title}</h1>
        {description && <p className="text-body text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-in-group">{actions}</div>}
    </header>
  )
}
