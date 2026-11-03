// Public screens: s01 Home (approximation), s08 Not found, s09 System status, s10 Server error.
import { useEffect, useState } from "react"
import { Badge } from "@plant-ai/ui/components/badge"
import { Button } from "@plant-ai/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@plant-ai/ui/components/card"

import * as api from "../api"
import { ErrorPage, Notice } from "../gaps"
import { useT } from "../i18n"
import { href } from "../router"
import { useStore } from "../store"

/**
 * s01 is outside the DS on purpose: the real (marketing) page has its own Tailwind
 * system (AGENTS.md). The owner approved an approximation from DS tokens here.
 * L05 (open, agent proposal accepted for the prototype): a "Log in" link for returning users.
 * L17 (open): copy follows the brief (D02: bushes and trees; D08: no AI layout claims).
 */
export function HomeScreen() {
  const t = useT()
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-section px-4 py-panel">
      <header className="flex flex-wrap items-center justify-between gap-in-group">
        <span className="text-section-heading font-semibold">Plant.AI</span>
        <div className="flex flex-wrap gap-in-group">
          <Button asChild variant="ghost">
            <a href={href({ screen: "s03" })}>{t("s01.login")}</a>
          </Button>
          {/* L24 (open): the Admin link stays as on today's page. */}
          <Button asChild variant="link">
            <a href={href({ screen: "s09" })}>{t("s01.admin")}</a>
          </Button>
        </div>
      </header>
      <section className="flex max-w-prose flex-col gap-between-groups">
        <h1 className="text-page-heading font-semibold" tabIndex={-1} data-screen-heading>
          {t("s01.title")}
        </h1>
        <p className="text-body text-muted-foreground">{t("s01.lead")}</p>
        <Button asChild size="lg" className="self-start">
          <a href={href({ screen: "s02" })}>{t("s01.cta")}</a>
        </Button>
      </section>
      <p className="text-metadata text-muted-foreground">{t("s01.approx")}</p>
    </div>
  )
}

export function NotFoundScreen() {
  const t = useT()
  // s08.b (guest) is handled by the access gate before this renders.
  return (
    <ErrorPage
      title={t("s08.title")}
      body={t("s08.body")}
      action={
        <Button asChild>
          <a href={href({ screen: "s04" })}>{t("s08.back")}</a>
        </Button>
      }
    />
  )
}

export function ServerErrorScreen({ retry }: { retry?: string }) {
  const t = useT()
  // Only an in-prototype hash is accepted as the retry target.
  const target = retry?.startsWith("#/") ? retry : href({ screen: "s04" })
  return (
    <ErrorPage
      title={t("s10.title")}
      body={t("s10.body")}
      action={
        <Button asChild>
          <a href={target}>{t("s10.retry")}</a>
        </Button>
      }
    />
  )
}

export function StatusScreen() {
  const t = useT()
  const database = useStore((s) => s.scenarios.database)
  const [status, setStatus] = useState<"up" | "down" | null>(null)
  useEffect(() => {
    api.health().then((r) => r.ok && setStatus(r.data.database))
  }, [database])
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-between-groups px-4 py-section">
      <Button asChild variant="link" className="self-start px-0">
        <a href={href({ screen: "s01" })}>{t("s09.home")}</a>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-page-heading font-semibold" tabIndex={-1} data-screen-heading>
              {t("s09.title")}
            </h1>
          </CardTitle>
          <CardDescription>/api/health</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-in-group">
          <span className="text-body">{t("s09.database")}:</span>
          {status && <Badge variant={status === "up" ? "secondary" : "destructive"}>{status === "up" ? t("s09.up") : t("s09.down")}</Badge>}
        </CardContent>
        {status === "down" && (
          <CardContent>
            <Notice tone="error" live={false}>
              {t("serverError")}
            </Notice>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
