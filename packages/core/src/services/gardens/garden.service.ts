import { Garden, type EntityManager } from "@plantai/db";

import type { RequestCradle } from "../../container/cradle.ts";
import { toGardenDto, type GardenDto } from "./garden.dto.ts";

export interface CreateGardenInput {
  name: string;
  description?: string | null;
}

/** Garden use cases. Receives a request-scoped `em` from the DI container; returns DTOs, never entities. */
export class GardenService {
  private readonly em: EntityManager;

  constructor({ em }: Pick<RequestCradle, "em">) {
    this.em = em;
  }

  async list(): Promise<GardenDto[]> {
    const gardens = await this.em.findAll(Garden, { orderBy: { createdAt: "desc" } });
    return gardens.map(toGardenDto);
  }

  async create(input: CreateGardenInput): Promise<GardenDto> {
    const garden = this.em.create(Garden, {
      name: input.name,
      description: input.description ?? null,
    });
    await this.em.flush();
    return toGardenDto(garden);
  }
}
