// DS-GAP DS08: AppShell — bottom navigation on phones, sidebar from md (spec A).
// Built from DS Button + tokens only. Nav items (L23 open): My gardens, Settings, Log out.
import type * as React from "react"
import { useState } from "react"
import { Button } from "@plant-ai/ui/components/button"
import { Separator } from "@plant-ai/ui/components/separator"
import { LogOut, Settings, Sprout } from "lucide-react"

import * as api from "../api"
import { Notice } from "../gaps"
import { genericError } from "../forms"
import { type MessageKey, useT } from "../i18n"
import { href, navigate } from "../router"
import { useStore } from "../store"

export function AppShell({ active, children }: { active: "gardens" | "settings"; children: React.ReactNode }) {
  const t = useT()
  // The session's account even when expired: the shell stays until the next request
  // returns 401 (s04.h), so the page doesn't vanish when the demo clock moves.
  const email = useStore((s) => s.session?.email)
  const account = useStore((s) => s.accounts.find((a) => a.email === email))
  const [resendNote, setResendNote] = useState<MessageKey | null>(null)

  function logout() {
    api.logout()
    navigate({ screen: "s03" })
  }

  async function resend() {
    if (!account) return
    const r = await api.resendVerification(account.email)
    setResendNote(r.ok ? "s14.resent" : r.error.code === "EMAIL_UNAVAILABLE" ? "s14.emailDown" : genericError(r))
  }

  const items: { key: "gardens" | "settings"; label: string; to: string; icon: React.ReactNode }[] = [
    { key: "gardens", label: t("nav.gardens"), to: href({ screen: "s04" }), icon: <Sprout aria-hidden /> },
    { key: "settings", label: t("nav.settings"), to: href({ screen: "s16" }), icon: <Settings aria-hidden /> },
  ]

  const nav = (
    <>
      {items.map((item) => (
        <Button key={item.key} asChild variant={active === item.key ? "secondary" : "ghost"} className="justify-start">
          <a href={item.to} aria-current={active === item.key ? "page" : undefined}>
            {item.icon}
            {item.label}
          </a>
        </Button>
      ))}
      <Button type="button" variant="ghost" className="justify-start" onClick={logout}>
        <LogOut aria-hidden />
        {t("nav.logout")}
      </Button>
    </>
  )

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="hidden w-64 shrink-0 flex-col gap-in-group border-r bg-sidebar p-between-groups text-sidebar-foreground md:flex">
        <p className="px-4 py-2 text-section-heading font-semibold">Plant.AI</p>
        <p className="truncate px-4 text-metadata text-muted-foreground">{account?.email}</p>
        <Separator />
        <nav aria-label={t("nav.label")} className="flex flex-col gap-in-group">
          {nav}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col gap-between-groups p-between-groups pb-section md:p-panel">
        <p className="text-section-heading font-semibold md:hidden">Plant.AI</p>
        {/* s04.i: unconfirmed email with a reminder (L22 open; shown only when the "allowed" toggle lets them in). */}
        {account && !account.isConfirmed && (
          <Notice
            tone="info"
            action={
              <div className="flex flex-col gap-in-group">
                <Button type="button" variant="outline" onClick={resend} className="self-start">
                  {t("shell.resend")}
                </Button>
                {resendNote && <p role="status">{t(resendNote)}</p>}
              </div>
            }
          >
            {t("shell.unconfirmed")}
          </Notice>
        )}
        {children}
      </main>
      <nav aria-label={t("nav.label")} className="sticky bottom-0 z-30 grid grid-cols-3 border-t bg-background md:hidden">
        {nav}
      </nav>
    </div>
  )
}
