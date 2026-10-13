import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import "./frontend.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Plant.AI", template: "%s · Plant.AI" },
  description: "Plan your garden beds, track your plants and get AI-powered growing advice.",
};

/** Root layout for the public frontend (Tailwind only). */
export default function FrontendLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-svh bg-soil-50 font-sans text-soil-900 antialiased">{children}</body>
    </html>
  );
}
