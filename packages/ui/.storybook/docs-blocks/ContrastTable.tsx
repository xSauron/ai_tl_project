import * as React from "react"

import { measureContrast } from "./contrast"

export type ContrastRow = {
  label: string
  foreground: string
  background: string
  origin: string
  /** WCAG threshold for this pair: 4.5 for normal text, 3 for large text / UI elements. */
  threshold?: number
}

/**
 * Re-measures contrast live, in the browser, against the CSS custom
 * properties actually in force (so it reflects the current theme — render
 * this once per theme, or wrap the story in both to compare). Doc-only
 * helper (rule 5 exception): not exported from the package.
 */
export function ContrastTable({ rows }: { rows: ContrastRow[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [ratios, setRatios] = React.useState<number[] | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return
    setRatios(rows.map((row) => measureContrast(row.foreground, row.background, containerRef.current!)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rows)])

  return (
    <div ref={containerRef}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "6px 8px" }}>Pair</th>
            <th style={{ padding: "6px 8px" }}>Preview</th>
            <th style={{ padding: "6px 8px" }}>Origin</th>
            <th style={{ padding: "6px 8px" }}>Measured ratio</th>
            <th style={{ padding: "6px 8px" }}>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const ratio = ratios?.[i]
            const threshold = row.threshold ?? 4.5
            const pass = ratio !== undefined && ratio >= threshold
            return (
              <tr key={row.label} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "6px 8px" }}>{row.label}</td>
                <td style={{ padding: "6px 8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 4,
                      color: row.foreground,
                      background: row.background,
                      fontWeight: 600,
                    }}
                  >
                    Aa
                  </span>
                </td>
                <td style={{ padding: "6px 8px" }}>{row.origin}</td>
                <td style={{ padding: "6px 8px", fontVariantNumeric: "tabular-nums" }}>
                  {ratio === undefined ? "…" : `${ratio.toFixed(2)} : 1`}
                </td>
                <td style={{ padding: "6px 8px", color: ratio === undefined || pass ? "var(--foreground)" : "var(--destructive)" }}>
                  {ratio === undefined ? "" : pass ? `pass (≥ ${threshold})` : `FAIL (< ${threshold})`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
