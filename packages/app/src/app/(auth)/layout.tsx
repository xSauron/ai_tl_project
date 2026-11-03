import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import "./auth.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Plant.AI", template: "%s · Plant.AI" },
  robots: { index: false, follow: false },
};

/** Root layout for the sign-in pages: one centred column, shadcn/ui theme. */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-section p-panel">
          {children}
        </main>
      </body>
    </html>
  );
}
