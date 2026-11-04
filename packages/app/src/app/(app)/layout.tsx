import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { AppFrame } from "./app-frame";

import "./app.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Plant.AI", template: "%s · Plant.AI" },
  robots: { index: false, follow: false },
};

/**
 * Root layout of the signed-in app, with the brand-green accent (green
 * sidebar and primary actions, `accent-brand`). It holds no session check on purpose:
 * layouts don't re-run on client navigation, so every page calls
 * `requireActor()` next to its data (Next 16 auth guide).
 */
export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="accent-brand min-h-svh bg-background font-sans text-foreground antialiased">
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
