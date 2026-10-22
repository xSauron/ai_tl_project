import * as React from "react"
import { addons, types } from "storybook/manager-api"
import { create } from "storybook/theming"

// Rule 10: the Storybook UI shows only the product name. The underlying
// toolchain (Storybook, shadcn/ui, Radix) is recorded in TECHNICAL-NOTE.md,
// not in the UI itself.
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Plant.AI",
    brandUrl: "/",
    brandTarget: "_self",
  }),
})

// Etap 1 krok 7: a link back to the app's home page, next to the toolbar,
// so "home page → design system → back" is a closed loop.
addons.register("plantai/back-to-app", () => {
  addons.add("plantai/back-to-app/tool", {
    type: types.TOOL,
    title: "Back to Plant.AI",
    match: () => true,
    render: () => (
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "0 8px",
          fontSize: 13,
          fontWeight: 600,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        ← Plant.AI
      </a>
    ),
  })
})
