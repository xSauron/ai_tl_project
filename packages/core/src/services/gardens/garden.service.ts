import { findForUpdate, Garden, ownedBy, User, type EntityManager } from "@plantai/db";

import type { RequestCradle } from "../../container/cradle.ts";
import type { Actor } from "../../http/auth.ts";
import { ConflictError, ERROR_CODES, UnauthorizedError } from "../../http/errors.ts";
import type { CrudService } from "../../http/makeCrudRoute.ts";
import { MAX_GARDENS_PER_USER } from "../../validators/limits.ts";
import { findOwnedOrFail } from "../shared/owned.ts";
import { toGardenDto, type GardenDto } from "./garden.dto.ts";

export interface CreateGardenInput {
  name: string;
  description?: string | null;
}

export type UpdateGardenInput = Partial<CreateGardenInput>;

export const GARDEN_LIMIT_MESSAGE = `You can have up to ${MAX_GARDENS_PER_USER} gardens. Delete one to add another.`;

/**
 * Garden use cases, always for one actor: every query carries the owner
 * filter, so another user's garden is a 404, never a 403. Returns DTOs.
 */
export class GardenService implements CrudService<GardenDto, CreateGardenInput, UpdateGardenInput> {
  private readonly em: EntityManager;

  constructor({ em }: Pick<RequestCradle, "em">) {
    this.em = em;
  }

  async list(actor: Actor): Promise<GardenDto[]> {
    const gardens = await this.em.find(Garden, ownedBy.garden(actor.userId), { orderBy: { createdAt: "desc" } });
    return gardens.map(toGardenDto);
  }

  async get(actor: Actor, id: string): Promise<GardenDto> {
    return toGardenDto(await this.findOwned(actor, id));
  }

  /**
   * Counts the actor's gardens while their user row is locked, so two
   * concurrent creates can't both pass the limit check.
   */
  async create(actor: Actor, input: CreateGardenInput): Promise<GardenDto> {
    const garden = await this.em.transactional(async (tx) => {
      if (!(await findForUpdate(tx, User, actor.userId))) throw new UnauthorizedError();
      if ((await tx.count(Garden, ownedBy.garden(actor.userId))) >= MAX_GARDENS_PER_USER) {
        throw new ConflictError({ code: ERROR_CODES.LIMIT_REACHED, message: GARDEN_LIMIT_MESSAGE });
      }
      return tx.create(Garden, {
        owner: actor.userId,
        name: input.name,
        description: input.description ?? null,
      });
    });
    return toGardenDto(garden);
  }

  async update(actor: Actor, id: string, input: UpdateGardenInput): Promise<GardenDto> {
    const garden = await this.findOwned(actor, id);
    this.em.assign(garden, input);
    await this.em.flush();
    return toGardenDto(garden);
  }

  async remove(actor: Actor, id: string): Promise<void> {
    const garden = await this.findOwned(actor, id);
    await this.em.remove(garden).flush();
  }

  private findOwned(actor: Actor, id: string): Promise<Garden> {
    return findOwnedOrFail(this.em, Garden, id, ownedBy.garden(actor.userId));
  }
}
