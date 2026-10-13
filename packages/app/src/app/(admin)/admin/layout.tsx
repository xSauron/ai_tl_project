import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { Separator } from "@plant-ai/ui/components/separator";

import "./admin.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Plant.AI Admin" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/gardens", label: "Gardens" },
];

/** Root layout for backend (admin) pages — built with shadcn/ui components. */
export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-svh bg-background font-sans text-foreground antialiased">
        <div className="flex min-h-svh">
          <aside className="w-56 shrink-0 border-r bg-sidebar p-4">
            <Link href="/admin" className="block px-2 text-lg font-semibold">
              Plant.AI <span className="text-muted-foreground">Admin</span>
            </Link>
            <Separator className="my-4" />
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
