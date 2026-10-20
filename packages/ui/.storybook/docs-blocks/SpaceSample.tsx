import * as React from "react"

/** A row showing one spacing token as an actual rendered gap, not a number in a table. Doc-only helper (rule 5 exception). */
export function SpaceSample({ token, label }: { token: string; label: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [px, setPx] = React.useState("")

  React.useEffect(() => {
    if (ref.current) setPx(getComputedStyle(ref.current).getPropertyValue(token).trim())
  }, [token])

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "6px 0" }}>
      <div style={{ width: 170, fontSize: 13 }}>
        <code>{token}</code>
      </div>
      <div style={{ width: 50, fontSize: 13, color: "var(--muted-foreground)" }}>{px || "…"}</div>
      <div ref={ref} style={{ display: "flex", alignItems: "center" }}>
        <div style={{ width: 16, height: 16, background: "var(--phase-plant-out-foreground)", borderRadius: 3 }} />
        <div style={{ width: `var(${token})`, height: 1 }} />
        <div style={{ width: 16, height: 16, background: "var(--phase-plant-out-foreground)", borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{label}</div>
    </div>
  )
}
