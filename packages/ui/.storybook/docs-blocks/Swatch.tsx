import * as React from "react"

import { resolveColor } from "./contrast"

/** A labeled color swatch that renders the real `var(--token)` value — not a hardcoded hex copy of it. Doc-only helper (rule 5 exception). */
export function Swatch({ token, label, origin }: { token: string; label: string; origin: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [resolved, setResolved] = React.useState("")

  React.useEffect(() => {
    if (ref.current) setResolved(resolveColor(`var(${token})`, ref.current))
  }, [token])

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: `var(${token})`,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          <code>{token}</code> → {resolved || "…"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{origin}</div>
      </div>
    </div>
  )
}
