import { builtinModules } from "node:module";
import path from "node:path";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * One flat config for the whole monorepo. Every workspace's `lint` script runs
 * `eslint` from its own folder and picks this file up; the root `lint` script
 * covers `tests/`, `scripts/`, `tools/` and the root config files.
 *
 * Layer rules (AGENTS.md "Monorepo layout"): `app → core → db`, `ui` is
 * imported by `app` only, nothing imports `app`, only `db` imports
 * `@mikro-orm/*`, and `core`/`db`/`ui` stay free of `next`.
 */

const APP_DIR = path.join(import.meta.dirname, "packages/app");
const PACKAGES = ["app", "core", "db", "ui"];

// eslint-config-next applies its plugins to every file; switch a plugin's rules
// off where they don't belong (Next rules outside `app`, React hook rules
// outside the React packages, where `useX` helpers aren't hooks).
const rulesOff = (pluginName) => {
  const plugin = nextVitals.find((config) => config.plugins?.[pluginName])?.plugins[pluginName];
  return Object.fromEntries(Object.keys(plugin?.rules ?? {}).map((rule) => [`${pluginName}/${rule}`, "off"]));
};

const restrict = (packageNames, message) => ({
  group: packageNames.flatMap((name) => [name, `${name}/*`]),
  message,
});

const NO_APP = restrict(["@plantai/app"], "No package imports @plantai/app.");
const NO_UI = restrict(["@plantai/ui"], "@plantai/ui is imported by @plantai/app only.");
const NO_CORE = restrict(["@plantai/core"], "Dependency direction is app → core → db.");
const NO_DB_FROM_APP = restrict(["@plantai/db"], "app reaches the database through @plantai/core (app → core → db).");
const NO_DB_FROM_UI = restrict(["@plantai/db"], "@plantai/ui never imports @plantai/db.");
const NO_MIKRO_ORM = restrict(["@mikro-orm"], "Only @plantai/db imports @mikro-orm/*.");
const NO_NEXT = restrict(["next"], "Only @plantai/app imports next; core/db/ui stay framework-free.");
// Relative paths that climb out of one package's `src` into another's.
const NO_CROSS_PACKAGE_RELATIVE = {
  regex: `^(\\.\\./)+(${PACKAGES.join("|")})/(src|test)(/|$)`,
  message: "Import other packages by their @plantai/* name, never by relative path.",
};

const layerRules = (...patterns) => [
  "error",
  { patterns: [...patterns, NO_CROSS_PACKAGE_RELATIVE] },
];

// `core/src/validators/**` is the client-safe `@plantai/core/validators` entry:
// Client Components import it, so it must not pull in server-only code.
const CLIENT_SAFE = "validators are imported by Client Components; keep them free of server code.";
const NO_SERVER_CORE_RELATIVE = {
  regex: "^(\\.\\./)+(services|container|http|config|logger)(\\.ts)?(/|$)",
  message: `No core services/container/http/config/logger in validators: ${CLIENT_SAFE}`,
};
const NO_CORE_SELF_IMPORT = {
  regex: "^@plantai/core(/(?!validators$).*)?$",
  message: `Import sibling validators relatively; only @plantai/core/validators is client-safe. ${CLIENT_SAFE}`,
};
const NO_SERVER_PACKAGES = restrict(["@plantai/db", "server-only", "pino"], `Server-only package: ${CLIENT_SAFE}`);
// A regex, not a gitignore `group`: `http/*` would also match `../http/errors.ts`.
const BARE_BUILTINS = builtinModules.filter((name) => !name.startsWith("node:")).map((name) => name.split("/")[0]);
const NO_NODE_BUILTINS = {
  regex: `^(node:|(${[...new Set(BARE_BUILTINS)].join("|")})(/|$))`,
  message: `No Node.js built-ins: ${CLIENT_SAFE}`,
};
// Same file pattern as `plantai/layers/core`; flat config replaces a rule's
// options instead of merging them, so this repeats the core restrictions.
const CORE_LAYER = [NO_APP, NO_UI, NO_MIKRO_ORM, NO_NEXT];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "plantai/next-root",
    settings: { next: { rootDir: APP_DIR } },
  },
  {
    name: "plantai/next-rules-app-only",
    ignores: ["packages/app/**"],
    rules: rulesOff("@next/next"),
  },
  {
    name: "plantai/react-hooks-rules-react-packages-only",
    ignores: ["packages/app/**", "packages/ui/**"],
    rules: rulesOff("react-hooks"),
  },
  {
    name: "plantai/layers/app",
    files: ["packages/app/**"],
    rules: { "no-restricted-imports": layerRules(NO_APP, NO_DB_FROM_APP, NO_MIKRO_ORM) },
  },
  {
    name: "plantai/layers/core",
    files: ["packages/core/**"],
    rules: { "no-restricted-imports": layerRules(...CORE_LAYER) },
  },
  {
    name: "plantai/layers/core-validators-client-safe",
    files: ["packages/core/src/validators/**"],
    rules: {
      "no-restricted-imports": layerRules(
        ...CORE_LAYER,
        NO_SERVER_CORE_RELATIVE,
        NO_CORE_SELF_IMPORT,
        NO_SERVER_PACKAGES,
        NO_NODE_BUILTINS,
      ),
    },
  },
  {
    name: "plantai/layers/db",
    files: ["packages/db/**"],
    rules: { "no-restricted-imports": layerRules(NO_APP, NO_UI, NO_CORE, NO_NEXT) },
  },
  {
    name: "plantai/layers/ui",
    files: ["packages/ui/**"],
    rules: { "no-restricted-imports": layerRules(NO_APP, NO_CORE, NO_DB_FROM_UI, NO_MIKRO_ORM, NO_NEXT) },
  },
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "coverage/**",
    "**/storybook-static/**",
    // Static Storybook export from `npm run design-system:build` (gitignored).
    "packages/app/public/design-system/**",
  ]),
]);

export default eslintConfig;
