import { defineConfig } from "vitest/config";

const CONTAINER_START_TIMEOUT_MS = 180_000;
const BROWSER_TEST_TIMEOUT_MS = 60_000;

/**
 * Integration tests (`npm run test:integration`, needs `npm run build` first):
 * ephemeral PostgreSQL (Testcontainers) + migrated schema + `next start`, driven by agent-browser.
 */
export default defineConfig({
  test: {
    name: "integration",
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/integration/global-setup.ts"],
    // One app + database per run; files share them and mutate data, so run them sequentially.
    fileParallelism: false,
    hookTimeout: CONTAINER_START_TIMEOUT_MS,
    testTimeout: BROWSER_TEST_TIMEOUT_MS,
  },
});
