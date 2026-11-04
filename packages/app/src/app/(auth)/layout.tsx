import { Apple, Bean, CalendarDays, Carrot, Cherry, Flower2, Grape, Grid3x3, Leaf, Salad, Sprout, Wheat } from "lucide-react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import "./auth.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Plant.AI", template: "%s · Plant.AI" },
  robots: { index: false, follow: false },
};

export const AUTH_TAGLINE = "Plan your vegetable beds, berry bushes and fruit trees in one place.";

/** What the app is for, in the MVP's own terms (AGENTS.md product scope). */
const HIGHLIGHTS = [
  { icon: Grid3x3, text: "Lay out beds on a square-foot grid" },
  { icon: Sprout, text: "See which plants grow well together" },
  { icon: CalendarDays, text: "Get a planting calendar from your frost dates" },
] as const;

/**
 * Planted cells of the decorative bed behind the form (1-based grid lines).
 * Kept to the edges, clear of the centered column, so they frame it on
 * every width; the ones that fall past the viewport are clipped.
 */
const PLANTED_CELLS = [
  { icon: Carrot, col: 1, row: 3 },
  { icon: Leaf, col: 2, row: 6 },
  { icon: Salad, col: 1, row: 9 },
  { icon: Bean, col: 3, row: 11 },
  { icon: Cherry, col: 3, row: 2, isPaired: true },
  { icon: Flower2, col: 4, row: 2, isPaired: true },
  { icon: Wheat, col: 2, row: 13 },
  { icon: Apple, col: -2, row: 2 },
  { icon: Grape, col: -3, row: 5 },
  { icon: Sprout, col: -2, row: 8, isPaired: true },
  { icon: Carrot, col: -2, row: 9, isPaired: true },
  { icon: Leaf, col: -4, row: 12 },
] as const;

/** A square-foot bed filling the page: the product's own grid as the backdrop. */
function BedBackdrop() {
  return (
    <div aria-hidden className="auth-bed">
      {PLANTED_CELLS.map(({ icon: Icon, col, row, ...cell }) => (
        <span
          key={`${col}:${row}`}
          className={`auth-bed-cell ${"isPaired" in cell ? "bg-brand-foreground/20" : "bg-brand-foreground/10"}`}
          style={{ gridColumn: col, gridRow: row }}
        >
          <Icon className="size-1/2" />
        </span>
      ))}
    </div>
  );
}

/**
 * Root layout for the sign-in pages: the form card sits in a green
 * square-foot bed, with green primary actions (`accent-brand`).
 */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="accent-brand relative min-h-svh overflow-x-hidden bg-brand font-sans text-brand-foreground antialiased">
        <BedBackdrop />
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-section px-panel py-section">
          <header className="flex flex-col items-center gap-in-group text-center">
            <p className="flex items-center gap-in-group text-section-heading font-bold">
              <Sprout aria-hidden className="size-7" />
              Plant.AI
            </p>
            <p className="max-w-sm text-body text-brand-muted-foreground">{AUTH_TAGLINE}</p>
          </header>
          <main className="w-full max-w-sm">
            <div className="relative flex flex-col gap-section rounded-xl bg-card px-panel pt-section pb-panel text-card-foreground shadow-2xl">
              <span className="absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground ring-4 ring-card">
                <Sprout aria-hidden className="size-6" />
              </span>
              {children}
            </div>
          </main>
          <ul className="flex max-w-2xl flex-wrap justify-center gap-in-group">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-in-group rounded-full bg-brand px-between-groups py-in-group text-label ring-1 ring-brand-foreground/20"
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </body>
    </html>
  );
}
