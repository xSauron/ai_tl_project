import type { Garden } from "@plantai/db";

/** Plain, serializable view of a garden: the only garden shape that leaves a service. */
export type GardenDto = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export function toGardenDto(garden: Garden): GardenDto {
  return {
    id: garden.id,
    name: garden.name,
    description: garden.description ?? null,
    createdAt: garden.createdAt.toISOString(),
  };
}
