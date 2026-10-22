import * as React from "react"

/** Renders children inside a fixed-width frame to show real reflow at a breakpoint, instead of describing it in prose. Doc-only helper (rule 5 exception). */
export function FrameViewport({ width, label, children }: { width: number; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "var(--spacing-panel)" }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
        {label} — {width}px
      </div>
      <div
        style={{
          width,
          maxWidth: "100%",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "auto",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
