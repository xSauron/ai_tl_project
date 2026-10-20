import * as React from "react"

/** One typography role, rendered with its real token — not a static screenshot. Doc-only helper (rule 5 exception). */
export function TypeSpecimen({
  role,
  weightClass,
  sample,
  note,
}: {
  role: string
  weightClass: string
  sample: string
  note?: string
}) {
  return (
    <div style={{ padding: "var(--spacing-in-group) 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
        <code>{`text-${role} ${weightClass}`}</code>
        {note ? ` — ${note}` : null}
      </div>
      <p className={`text-${role} ${weightClass}`} style={{ margin: 0 }}>
        {sample}
      </p>
    </div>
  )
}
