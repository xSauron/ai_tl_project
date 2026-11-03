// Navigation tests for the prototype. Separate from the repo's vitest.config.ts
// (the prototype is not part of the 100 % coverage gate over packages/*/src).
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

export default {
  root: here,
  resolve: { alias: { "@plant-ai/ui": path.resolve(here, "../../packages/ui/src") } },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,tsx}"],
    css: false,
  },
}
