import { CalendarDays, Grid3x3, Sprout } from "lucide-react";
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

function Brand() {
  return (
    <p className="flex items-center gap-in-group text-section-heading font-bold">
      <Sprout aria-hidden className="size-7" />
      Plant.AI
    </p>
  );
}

/**
 * Root layout for the sign-in pages: a brand-green panel (a band on phones)
 * beside the form card, with green primary actions (`accent-brand`).
 */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="accent-brand min-h-svh bg-brand-surface font-sans text-foreground antialiased md:grid md:grid-cols-2">
        <aside className="flex flex-col gap-between-groups bg-brand p-panel text-brand-foreground md:p-section">
          <Brand />
          <p className="text-body text-brand-muted-foreground md:hidden">{AUTH_TAGLINE}</p>
          <div className="hidden flex-col gap-section md:my-auto md:flex">
            <p className="max-w-md text-page-heading font-bold">{AUTH_TAGLINE}</p>
            <ul className="flex flex-col gap-between-groups">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-in-group text-body">
                  <span className="flex size-touch shrink-0 items-center justify-center rounded-full bg-brand-foreground text-brand">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <main className="flex items-start justify-center p-panel md:items-center md:p-section">
          <div className="flex w-full max-w-sm flex-col gap-section rounded-xl border bg-card p-panel text-card-foreground shadow-sm">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
