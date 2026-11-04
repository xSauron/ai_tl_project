"use client";

import { LogOut, Settings, Sprout } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@plantai/ui/components/ui/button";
import { apiCall } from "@plantai/ui/backend/api/apiCall";
import { useMutation } from "@plantai/ui/backend/api/useMutation";
import { AppShell } from "@plantai/ui/backend/layout/AppShell";

import { ROUTES } from "@/lib/routes";

const NAV = [
  { href: ROUTES.gardens, label: "Gardens", icon: <Sprout /> },
  { href: ROUTES.settings, label: "Settings", icon: <Settings /> },
] as const;

/** `AppShell` with the current page marked active and a log-out button. */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useMutation(() => apiCall<null>("/api/auth/logout", { method: "POST" }), {
    onSuccess: () => {
      router.push(ROUTES.login);
      router.refresh();
    },
  });

  const navItems = NAV.map((item) => ({ ...item, isActive: pathname.startsWith(item.href) }));

  return (
    <AppShell
      navItems={navItems}
      linkComponent={Link}
      brand={
        <span className="flex items-center gap-in-group">
          <Sprout aria-hidden className="size-6" />
          Plant.AI
        </span>
      }
      footer={
        <Button variant="outline" onClick={() => logout.run(undefined)} disabled={logout.isPending}>
          <LogOut aria-hidden />
          Log out
        </Button>
      }
    >
      {children}
    </AppShell>
  );
}
