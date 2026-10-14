#!/usr/bin/env node
import { defaultIo, main } from "./setup.mjs";

try {
  await main(defaultIo);
} catch (error) {
  console.error(`\n✗ Setup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
