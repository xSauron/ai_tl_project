import type { TestProject } from "vitest/node";

import { migrate, startAppServer } from "./support/app-server.ts";
import { startDatabase } from "./support/database.ts";

declare module "vitest" {
  export interface ProvidedContext {
    baseUrl: string;
  }
}

/** Boots an ephemeral PostgreSQL, migrates it and starts the built app against it. */
export default async function setup(project: TestProject) {
  const database = await startDatabase();
  try {
    await migrate(database.url);
    const app = await startAppServer(database.url);
    project.provide("baseUrl", app.baseUrl);

    return async () => {
      await app.stop();
      await database.stop();
    };
  } catch (error) {
    await database.stop();
    throw error;
  }
}
