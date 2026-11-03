/**
 * Plain CRUD Route Handlers over a request-scoped `CrudService`, built on
 * `apiHandler` with `auth: "required"`. Workflow endpoints (grid placement,
 * calendar…) use `apiHandler` directly instead.
 *
 * Usage in `app/api/<concept>/route.ts` and `app/api/<concept>/[id]/route.ts`:
 *   const { collection } = makeCrudRoute({ service: "gardenService", createSchema, updateSchema });
 *   export const { GET, POST } = collection;
 */
import { z } from "zod";

import type { RequestCradle } from "../container/cradle.ts";
import { idParamsSchema } from "../validators/common/id-params.schema.ts";
import { uuidSchema } from "../validators/common/uuid.schema.ts";
import { apiHandler as defaultApiHandler, type ApiHandler, type RouteHandler } from "./apiHandler.ts";
import type { Actor } from "./auth.ts";

/** The param name of an item route's own id (`[id]`); a parent param can't reuse it. */
export const ITEM_ID_PARAM = "id";
const CREATED_STATUS = 201;

export interface CrudListOptions {
  parentId?: string;
}

/**
 * The contract `makeCrudRoute` drives. Every method takes the `Actor` first and
 * enforces ownership itself: a missing or foreign record is a `NotFoundError`.
 */
export interface CrudService<Dto, Create, Update> {
  list(actor: Actor, options: CrudListOptions): Promise<Dto[]>;
  get(actor: Actor, id: string): Promise<Dto>;
  create(actor: Actor, input: Create, parentId?: string): Promise<Dto>;
  update(actor: Actor, id: string, input: Update): Promise<Dto>;
  remove(actor: Actor, id: string): Promise<void>;
}

/** Any `CrudService`, whatever its DTO and inputs (`never` inputs accept every concrete input type). */
type AnyCrudService = CrudService<unknown, never, never>;

/** Cradle keys whose value implements `CrudService`. */
export type CrudServiceKey<Cradle = RequestCradle> = {
  [K in keyof Cradle]: Cradle[K] extends AnyCrudService ? K : never;
}[keyof Cradle] &
  string;

type CreateInputOf<S> = S extends CrudService<unknown, infer Create, never> ? Create : never;
type UpdateInputOf<S> = S extends CrudService<unknown, never, infer Update> ? Update : never;

export interface CrudRouteOptions<Cradle, K extends CrudServiceKey<Cradle>> {
  /** Cradle key of the request-scoped service, e.g. `"gardenService"`. */
  service: K;
  createSchema: z.ZodType<CreateInputOf<Cradle[K]>>;
  updateSchema: z.ZodType<UpdateInputOf<Cradle[K]>>;
  /** Name of a parent route param (`/api/gardens/[gardenId]/beds` → `"gardenId"`), passed as `parentId`. */
  parent?: string;
}

export interface CrudRouteDeps {
  apiHandler?: ApiHandler;
}

export interface CrudRoutes {
  collection: { GET: RouteHandler; POST: RouteHandler };
  item: { GET: RouteHandler; PATCH: RouteHandler; DELETE: RouteHandler };
}

type ParamsSchema = z.ZodType<Record<string, string>>;
type ItemParamsSchema = z.ZodType<{ id: string } & Record<string, string>>;

function collectionParamsSchema(parent: string | undefined): ParamsSchema | undefined {
  return parent === undefined ? undefined : z.strictObject({ [parent]: uuidSchema });
}

function itemParamsSchema(parent: string | undefined): ItemParamsSchema {
  if (parent === undefined) return idParamsSchema;
  // Zod widens a computed key to an index signature and loses `id` from the output type; the schema still requires it.
  return idParamsSchema.extend({ [parent]: uuidSchema }) as unknown as ItemParamsSchema;
}

/**
 * Builds the five CRUD handlers. Item routes only validate the parent param:
 * the service resolves ownership from the item id alone.
 */
export function makeCrudRoute<Cradle = RequestCradle, K extends CrudServiceKey<Cradle> = CrudServiceKey<Cradle>>(
  { service, createSchema, updateSchema, parent }: CrudRouteOptions<NoInfer<Cradle>, K>,
  { apiHandler = defaultApiHandler }: CrudRouteDeps = {},
): CrudRoutes {
  if (parent === ITEM_ID_PARAM) {
    throw new TypeError(`makeCrudRoute: the parent param can't be named "${ITEM_ID_PARAM}".`);
  }

  type Service = CrudService<unknown, CreateInputOf<Cradle[K]>, UpdateInputOf<Cradle[K]>>;
  // `K` only names CrudService keys of `Cradle`; `ctx.cradle` is typed as the app's RequestCradle.
  const serviceOf = (cradle: RequestCradle): Service => (cradle as unknown as Record<K, Service>)[service];
  const parentIdOf = (params: Record<string, string> | undefined): string | undefined =>
    parent === undefined ? undefined : params?.[parent];

  const collectionParams = collectionParamsSchema(parent);
  const itemParams = itemParamsSchema(parent);

  return {
    collection: {
      GET: apiHandler({ auth: "required", params: collectionParams }, async ({ actor, params, cradle }) => {
        const parentId = parentIdOf(params);
        return serviceOf(cradle).list(actor, parentId === undefined ? {} : { parentId });
      }),
      POST: apiHandler(
        { auth: "required", params: collectionParams, body: createSchema, successStatus: CREATED_STATUS },
        async ({ actor, params, body, cradle }) => {
          const parentId = parentIdOf(params);
          return parentId === undefined
            ? serviceOf(cradle).create(actor, body)
            : serviceOf(cradle).create(actor, body, parentId);
        },
      ),
    },
    item: {
      GET: apiHandler({ auth: "required", params: itemParams }, async ({ actor, params, cradle }) =>
        serviceOf(cradle).get(actor, params.id),
      ),
      PATCH: apiHandler({ auth: "required", params: itemParams, body: updateSchema }, async ({ actor, params, body, cradle }) =>
        serviceOf(cradle).update(actor, params.id, body),
      ),
      DELETE: apiHandler({ auth: "required", params: itemParams }, async ({ actor, params, cradle }) => {
        const { id } = params;
        await serviceOf(cradle).remove(actor, id);
        return { id };
      }),
    },
  };
}
