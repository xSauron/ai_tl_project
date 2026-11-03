import { User } from "./auth/user.entity.ts";
import { Garden } from "./gardens/garden.entity.ts";

export { Garden, User };

/** Every entity must be listed here — it is what MikroORM discovers. */
export const entities = [Garden, User];
