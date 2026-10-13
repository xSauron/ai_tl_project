import type { EntityManager } from "@mikro-orm/postgresql";

import { Garden } from "../../entities/index.ts";

export interface CreateGardenInput {
  name: string;
  description?: string | null;
}

/** Garden use cases. Receives a request-scoped `em` from the DI container. */
export class GardenService {
  private readonly em: EntityManager;

  constructor({ em }: { em: EntityManager }) {
    this.em = em;
  }

  list(): Promise<Garden[]> {
    return this.em.findAll(Garden, { orderBy: { createdAt: "desc" } });
  }

  async create(input: CreateGardenInput): Promise<Garden> {
    const garden = this.em.create(Garden, {
      name: input.name,
      description: input.description ?? null,
    });
    await this.em.flush();
    return garden;
  }
}
