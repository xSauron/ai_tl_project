// Build config for the "Konta i ogrody" prototype (E02-S01).
// Source lives here; the build output goes to the Next.js public folder so the
// sandbox preview (port 3000) serves it at /prototypes/konta-i-role/index.html.
// The output folder is excluded from git via .git/info/exclude (never committed).
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/postcss"

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "../..")

export default {
  root: here,
  base: "./",
  resolve: {
    alias: {
      // Read-only use of the design system source; nothing is copied into it.
      "@plant-ai/ui": path.join(repo, "packages/ui/src"),
    },
  },
  oxc: { jsx: { runtime: "automatic" } },
  css: { postcss: { plugins: [tailwindcss()] } },
  build: {
    outDir: path.join(repo, "packages/app/public/prototypes/konta-i-role"),
    emptyOutDir: true,
  },
  server: { fs: { allow: [repo] } },
  logLevel: "warn",
}
