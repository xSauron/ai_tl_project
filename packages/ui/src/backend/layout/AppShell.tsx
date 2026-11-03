import type * as React from "react"

export const DEFAULT_MAIN_ID = "main-content"
export const DEFAULT_NAV_LABEL = "Main"
export const DEFAULT_SKIP_LINK_LABEL = "Skip to content"

export interface AppNavItem {
  href: string
  label: string
  /** Decorative: rendered `aria-hidden`, the label names the link. */
  icon?: React.ReactNode
  isActive?: boolean
}

/** The props `AppShell` passes to a nav link; `next/link`'s `Link` accepts them. */
export interface AppNavLinkProps {
  href: string
  className?: string
  "aria-current"?: "page"
  children: React.ReactNode
}

export type AppNavLinkComponent = React.ComponentType<AppNavLinkProps>

export interface AppShellProps {
  navItems: readonly AppNavItem[]
  /** `ui` can't import `next/*`: the app passes `next/link` here. Defaults to a plain `<a>`. */
  linkComponent?: AppNavLinkComponent
  /** Shown at the top of the sidebar on `md+`. */
  brand?: React.ReactNode
  /** Account controls (e.g. a log-out button): bottom of the sidebar on `md+`, a slim top row below `md`. */
  footer?: React.ReactNode
  navLabel?: string
  skipLinkLabel?: string
  /** `id` of the `<main>` landmark, the skip link's target. */
  mainId?: string
  children: React.ReactNode
}

function PlainLink(props: AppNavLinkProps) {
  return <a {...props} />
}

/**
 * Signed-in app shell, mobile first: one `<nav>` that is a bottom bar below
 * `md` and a sidebar from `md` up (one landmark, so screen readers never meet
 * a duplicate), plus a skip link and the `<main>` landmark.
 */
export function AppShell({
  navItems,
  linkComponent: Link = PlainLink,
  brand,
  footer,
  navLabel = DEFAULT_NAV_LABEL,
  skipLinkLabel = DEFAULT_SKIP_LINK_LABEL,
  mainId = DEFAULT_MAIN_ID,
  children,
}: AppShellProps) {
  return (
    <div data-slot="app-shell" className="min-h-dvh bg-background text-foreground md:flex">
      <a
        href={`#${mainId}`}
        className="sr-only rounded-md bg-background p-in-group text-body font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:ring-3 focus:ring-ring/50"
      >
        {skipLinkLabel}
      </a>
      <nav
        aria-label={navLabel}
        data-slot="app-shell-nav"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:gap-between-groups md:border-t-0 md:border-r md:p-between-groups"
      >
        {brand && <div className="hidden px-in-group text-section-heading font-semibold md:block">{brand}</div>}
        <ul className="grid auto-cols-fr grid-flow-col md:flex md:flex-col md:gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={item.isActive ? "page" : undefined}
                className="flex min-h-touch flex-col items-center justify-center gap-1 px-in-group py-1 text-metadata font-medium outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground md:flex-row md:justify-start md:gap-in-group md:rounded-md md:text-label [&_svg]:size-5 [&_svg]:shrink-0"
              >
                {item.icon && <span aria-hidden className="contents">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {footer && <div className="mt-auto hidden md:block">{footer}</div>}
      </nav>
      {/* tabIndex -1: the skip link moves focus here, not only the scroll position. */}
      <main id={mainId} tabIndex={-1} className="min-w-0 flex-1 p-panel pb-24 outline-none md:pb-panel">
        {footer && <div className="mb-between-groups flex justify-end md:hidden">{footer}</div>}
        {children}
      </main>
    </div>
  )
}
