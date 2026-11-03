import { afterAll, beforeAll, describe, expect, expectTypeOf, it, vi } from "vitest";
import { z } from "zod";

import type { RequestCradle } from "../container/cradle.ts";
import { createLogger } from "../logger.ts";
import { INVALID_UUID_MESSAGE } from "../validators/common/uuid.schema.ts";
import {
  createApiHandler,
  CSRF_HEADER,
  CSRF_HEADER_VALUE,
  type ApiHandler,
  type ApiRouteContext,
  type WithScope,
} from "./apiHandler.ts";
import type { Actor } from "./auth.ts";
import { NotFoundError } from "./errors.ts";
import { ITEM_ID_PARAM, makeCrudRoute, type CrudService, type CrudServiceKey } from "./makeCrudRoute.ts";

vi.mock("../container/scope.ts", () => ({
  withScope: vi.fn(async () => {
    throw new Error("the real withScope must not run in unit tests");
  }),
}));

// The default `apiHandler` logs through the process logger; keep test output clean.
beforeAll(() => {
  vi.stubEnv("LOG_LEVEL", "silent");
});

afterAll(() => {
  vi.unstubAllEnvs();
});

const ACTOR: Actor = { userId: "6f1c1a52-6a1e-4c1e-9a52-0d1c2b3a4f50" };
const ITEM_ID = "0b6e2f5e-3c1d-4a8b-9f7e-2d4c6b8a0e1f";
const PARENT_ID = "3a7d9c1e-5b2f-4e8a-8c6d-1f0e2b4a6c8d";
const URL_BASE = "http://localhost/api/things";
const CSRF = { [CSRF_HEADER]: CSRF_HEADER_VALUE };

interface ThingDto {
  id: string;
  name: string;
}
interface ThingCreate {
  name: string;
}
type ThingUpdate = Partial<ThingCreate>;

const thingCreateSchema = z.strictObject({ name: z.string().min(1) });
const thingUpdateSchema = thingCreateSchema.partial();

const THING: ThingDto = { id: ITEM_ID, name: "Tomato" };

function fakeService() {
  return {
    list: vi.fn<CrudService<ThingDto, ThingCreate, ThingUpdate>["list"]>(async () => [THING]),
    get: vi.fn<CrudService<ThingDto, ThingCreate, ThingUpdate>["get"]>(async () => THING),
    create: vi.fn<CrudService<ThingDto, ThingCreate, ThingUpdate>["create"]>(async (_actor, input) => ({
      id: ITEM_ID,
      ...input,
    })),
    update: vi.fn<CrudService<ThingDto, ThingCreate, ThingUpdate>["update"]>(async (_actor, id, input) => ({
      ...THING,
      id,
      ...input,
    })),
    remove: vi.fn<CrudService<ThingDto, ThingCreate, ThingUpdate>["remove"]>(async () => undefined),
  } satisfies CrudService<ThingDto, ThingCreate, ThingUpdate>;
}

/** A cradle with one CRUD service and one non-CRUD dependency. */
interface FakeCradle {
  thingService: CrudService<ThingDto, ThingCreate, ThingUpdate>;
  clock: { now(): Date };
}

function setup({ actor = ACTOR as Actor | null, parent }: { actor?: Actor | null; parent?: string } = {}) {
  const service = fakeService();
  const cradle = { thingService: service, clock: { now: () => new Date() } } satisfies FakeCradle;
  const withScope: WithScope = async (fn) => fn(cradle as unknown as RequestCradle);
  const apiHandler = createApiHandler({
    resolveActor: async () => actor,
    withScope,
    getLogger: () => createLogger({ level: "silent" }),
  });
  const routes = makeCrudRoute<FakeCradle>(
    { service: "thingService", createSchema: thingCreateSchema, updateSchema: thingUpdateSchema, parent },
    { apiHandler },
  );
  return { service, routes };
}

function ctx(params: Record<string, string>): ApiRouteContext {
  return { params: Promise.resolve(params) };
}

function request(method: string, { body, headers = CSRF }: { body?: unknown; headers?: Record<string, string> } = {}) {
  return new Request(URL_BASE, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function json(response: Response): Promise<unknown> {
  return response.json();
}

describe("makeCrudRoute without a parent", () => {
  it("collection GET lists with the actor and no parentId", async () => {
    const { routes, service } = setup();

    const response = await routes.collection.GET(request("GET"), ctx({}));

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ ok: true, data: [THING] });
    expect(service.list).toHaveBeenCalledWith(ACTOR, {});
  });

  it("collection GET works when Next passes no route context", async () => {
    const { routes } = setup();

    const response = await routes.collection.GET(request("GET"));

    expect(response.status).toBe(200);
  });

  it("collection POST creates from the parsed body and returns 201", async () => {
    const { routes, service } = setup();

    const response = await routes.collection.POST(request("POST", { body: { name: "Basil" } }), ctx({}));

    expect(response.status).toBe(201);
    expect(await json(response)).toEqual({ ok: true, data: { id: ITEM_ID, name: "Basil" } });
    expect(service.create).toHaveBeenCalledWith(ACTOR, { name: "Basil" });
  });

  it("item GET returns the DTO for the id", async () => {
    const { routes, service } = setup();

    const response = await routes.item.GET(request("GET"), ctx({ id: ITEM_ID }));

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ ok: true, data: THING });
    expect(service.get).toHaveBeenCalledWith(ACTOR, ITEM_ID);
  });

  it("item PATCH updates with the parsed body and returns the DTO", async () => {
    const { routes, service } = setup();

    const response = await routes.item.PATCH(request("PATCH", { body: { name: "Pepper" } }), ctx({ id: ITEM_ID }));

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ ok: true, data: { id: ITEM_ID, name: "Pepper" } });
    expect(service.update).toHaveBeenCalledWith(ACTOR, ITEM_ID, { name: "Pepper" });
  });

  it("item DELETE removes and returns { id }", async () => {
    const { routes, service } = setup();

    const response = await routes.item.DELETE(request("DELETE"), ctx({ id: ITEM_ID }));

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ ok: true, data: { id: ITEM_ID } });
    expect(service.remove).toHaveBeenCalledWith(ACTOR, ITEM_ID);
  });

  it.each([
    ["GET", "not-a-uuid"],
    ["PATCH", "not-a-uuid"],
    ["DELETE", "42"],
  ] as const)("item %s with an invalid id → 422 with fieldErrors.id", async (method, id) => {
    const { routes, service } = setup();

    const response = await routes.item[method](request(method, { body: method === "PATCH" ? {} : undefined }), ctx({ id }));

    expect(response.status).toBe(422);
    expect(await json(response)).toMatchObject({
      ok: false,
      error: { code: "VALIDATION_FAILED", fieldErrors: { id: [INVALID_UUID_MESSAGE] } },
    });
    expect(service.get).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
    expect(service.remove).not.toHaveBeenCalled();
  });

  it("item routes reject an unexpected param key", async () => {
    const { routes, service } = setup();

    const response = await routes.item.GET(request("GET"), ctx({ id: ITEM_ID, gardenId: PARENT_ID }));

    expect(response.status).toBe(422);
    expect(service.get).not.toHaveBeenCalled();
  });

  it.each([
    ["POST", { name: "" }, "name"],
    ["POST", { name: "Basil", owner: "someone-else" }, "_root"],
    ["PATCH", { name: 7 }, "name"],
  ] as const)("%s with an invalid body %j → 422 with fieldErrors.%s", async (method, body, field) => {
    const { routes, service } = setup();
    const handler = method === "POST" ? routes.collection.POST : routes.item.PATCH;

    const response = await handler(request(method, { body }), ctx(method === "POST" ? {} : { id: ITEM_ID }));

    expect(response.status).toBe(422);
    const payload = (await json(response)) as { error: { code: string; fieldErrors: Record<string, string[]> } };
    expect(payload.error.code).toBe("VALIDATION_FAILED");
    expect(payload.error.fieldErrors[field]).toHaveLength(1);
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  it.each([
    ["collection", "GET"],
    ["collection", "POST"],
    ["item", "GET"],
    ["item", "PATCH"],
    ["item", "DELETE"],
  ] as const)("%s %s without an actor → 401", async (kind, method) => {
    const { routes, service } = setup({ actor: null });
    const handler = (routes[kind] as Record<string, (req: Request, c: ApiRouteContext) => Promise<Response>>)[method];

    const response = await handler!(
      request(method, { body: method === "GET" || method === "DELETE" ? undefined : { name: "x" } }),
      ctx(kind === "item" ? { id: ITEM_ID } : {}),
    );

    expect(response.status).toBe(401);
    expect(await json(response)).toMatchObject({ ok: false, error: { code: "UNAUTHORIZED" } });
    for (const method of Object.values(service)) expect(method).not.toHaveBeenCalled();
  });

  it.each([
    ["collection", "POST"],
    ["item", "PATCH"],
    ["item", "DELETE"],
  ] as const)("%s %s without the CSRF header → 403", async (kind, method) => {
    const { routes, service } = setup();
    const handler = (routes[kind] as Record<string, (req: Request, c: ApiRouteContext) => Promise<Response>>)[method];

    const response = await handler!(
      request(method, { body: method === "DELETE" ? undefined : { name: "x" }, headers: {} }),
      ctx(kind === "item" ? { id: ITEM_ID } : {}),
    );

    expect(response.status).toBe(403);
    expect(await json(response)).toMatchObject({ ok: false, error: { code: "CSRF_REJECTED" } });
    for (const method of Object.values(service)) expect(method).not.toHaveBeenCalled();
  });

  it.each(["get", "update", "remove"] as const)("a NotFoundError from service.%s → 404", async (method) => {
    const { routes, service } = setup();
    service[method].mockRejectedValueOnce(new NotFoundError());
    const verb = { get: "GET", update: "PATCH", remove: "DELETE" } as const;

    const response = await routes.item[verb[method]](
      request(verb[method], { body: method === "update" ? { name: "x" } : undefined }),
      ctx({ id: ITEM_ID }),
    );

    expect(response.status).toBe(404);
    expect(await json(response)).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
  });
});

describe("makeCrudRoute with a parent param", () => {
  const PARENT = "gardenId";

  it("collection GET validates the parent and passes it as parentId", async () => {
    const { routes, service } = setup({ parent: PARENT });

    const response = await routes.collection.GET(request("GET"), ctx({ [PARENT]: PARENT_ID }));

    expect(response.status).toBe(200);
    expect(service.list).toHaveBeenCalledWith(ACTOR, { parentId: PARENT_ID });
  });

  it("collection POST passes the parent as parentId and returns 201", async () => {
    const { routes, service } = setup({ parent: PARENT });

    const response = await routes.collection.POST(request("POST", { body: { name: "Bed A" } }), ctx({ [PARENT]: PARENT_ID }));

    expect(response.status).toBe(201);
    expect(service.create).toHaveBeenCalledWith(ACTOR, { name: "Bed A" }, PARENT_ID);
  });

  it.each([
    ["an invalid parent", { [PARENT]: "nope" }],
    ["a missing parent", {}],
    ["an unexpected extra key", { [PARENT]: PARENT_ID, other: PARENT_ID }],
  ])("collection routes reject %s with 422", async (_label, params) => {
    const { routes, service } = setup({ parent: PARENT });

    const list = await routes.collection.GET(request("GET"), ctx(params));
    const create = await routes.collection.POST(request("POST", { body: { name: "x" } }), ctx(params));

    expect(list.status).toBe(422);
    expect(create.status).toBe(422);
    expect(service.list).not.toHaveBeenCalled();
    expect(service.create).not.toHaveBeenCalled();
  });

  it("an invalid parent is reported under its param name", async () => {
    const { routes } = setup({ parent: PARENT });

    const response = await routes.collection.GET(request("GET"), ctx({ [PARENT]: "nope" }));

    expect(await json(response)).toMatchObject({ error: { fieldErrors: { [PARENT]: [INVALID_UUID_MESSAGE] } } });
  });

  it("item routes accept the parent param next to the id and use only the id", async () => {
    const { routes, service } = setup({ parent: PARENT });
    const params = ctx({ id: ITEM_ID, [PARENT]: PARENT_ID });

    expect((await routes.item.GET(request("GET"), params)).status).toBe(200);
    expect((await routes.item.PATCH(request("PATCH", { body: {} }), params)).status).toBe(200);
    expect((await routes.item.DELETE(request("DELETE"), params)).status).toBe(200);

    expect(service.get).toHaveBeenCalledWith(ACTOR, ITEM_ID);
    expect(service.update).toHaveBeenCalledWith(ACTOR, ITEM_ID, {});
    expect(service.remove).toHaveBeenCalledWith(ACTOR, ITEM_ID);
  });

  it.each([
    ["an invalid parent", { id: ITEM_ID, [PARENT]: "nope" }, PARENT],
    ["a missing parent", { id: ITEM_ID }, PARENT],
    ["an invalid id", { id: "nope", [PARENT]: PARENT_ID }, ITEM_ID_PARAM],
  ])("item routes reject %s with 422", async (_label, params, field) => {
    const { routes, service } = setup({ parent: PARENT });

    const response = await routes.item.GET(request("GET"), ctx(params));

    expect(response.status).toBe(422);
    expect(await json(response)).toMatchObject({ error: { fieldErrors: { [field]: [expect.any(String)] } } });
    expect(service.get).not.toHaveBeenCalled();
  });

  it("refuses a parent param named like the item id", () => {
    expect(() =>
      makeCrudRoute<FakeCradle>({
        service: "thingService",
        createSchema: thingCreateSchema,
        updateSchema: thingUpdateSchema,
        parent: ITEM_ID_PARAM,
      }),
    ).toThrow(TypeError);
  });
});

describe("makeCrudRoute defaults", () => {
  it("uses the real apiHandler, whose resolver has no actor yet → 401", async () => {
    const routes = makeCrudRoute<FakeCradle>({
      service: "thingService",
      createSchema: thingCreateSchema,
      updateSchema: thingUpdateSchema,
    });

    const response = await routes.collection.GET(request("GET"), ctx({}));

    expect(response.status).toBe(401);
  });
});

describe("makeCrudRoute types", () => {
  it("only accepts cradle keys whose value implements CrudService", () => {
    expectTypeOf<CrudServiceKey<FakeCradle>>().toEqualTypeOf<"thingService">();

    const assertCompileErrors = (apiHandler: ApiHandler) => {
      // @ts-expect-error `clock` is not a CrudService.
      makeCrudRoute<FakeCradle>({ service: "clock", createSchema: thingCreateSchema, updateSchema: thingUpdateSchema }, { apiHandler });
      // @ts-expect-error `nothing` is not a cradle key.
      makeCrudRoute<FakeCradle>({ service: "nothing", createSchema: thingCreateSchema, updateSchema: thingUpdateSchema }, { apiHandler });
      makeCrudRoute<FakeCradle>(
        // @ts-expect-error the create schema's output must match the service's create input.
        { service: "thingService", createSchema: z.object({ title: z.string() }), updateSchema: thingUpdateSchema },
        { apiHandler },
      );
    };
    expect(assertCompileErrors).toBeTypeOf("function");
  });

  it("returns handlers assignable to Next 16 Route Handler exports", () => {
    type NextRouteHandler<Params> = (req: Request, ctx: { params: Promise<Params> }) => Promise<Response>;
    const { routes } = setup();

    expectTypeOf(routes.collection.GET).toExtend<NextRouteHandler<Record<string, never>>>();
    expectTypeOf(routes.collection.POST).toExtend<NextRouteHandler<{ gardenId: string }>>();
    expectTypeOf(routes.item.GET).toExtend<NextRouteHandler<{ id: string }>>();
    expectTypeOf(routes.item.PATCH).toExtend<NextRouteHandler<{ id: string }>>();
    expectTypeOf(routes.item.DELETE).toExtend<NextRouteHandler<{ gardenId: string; id: string }>>();
  });
});
