import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import {
  apiCall,
  CLIENT_ERROR_CODES,
  CLIENT_ERROR_MESSAGES,
  CSRF_HEADER,
  CSRF_HEADER_VALUE,
  NO_RESPONSE_STATUS,
} from "./apiCall";

const PATH = "/api/gardens";

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });

let fetchMock: Mock<typeof fetch>;

const lastInit = (): RequestInit => {
  const init = fetchMock.mock.lastCall?.[1];
  if (init === undefined) throw new Error("fetch was not called with init");
  return init;
};
const lastHeaders = () => lastInit().headers as Record<string, string>;

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiCall request", () => {
  it("GET by default: CSRF + accept headers, same-origin credentials, no body or content-type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: [] }));

    await apiCall(PATH);

    expect(fetchMock).toHaveBeenCalledWith(PATH, expect.objectContaining({ method: "GET", credentials: "same-origin" }));
    expect(lastInit().body).toBeUndefined();
    expect(lastHeaders()).toEqual({ accept: "application/json", [CSRF_HEADER]: CSRF_HEADER_VALUE });
  });

  it("serializes the body as JSON, defaults to POST and sets content-type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: null }, 201));
    const body = { name: "Back yard", tags: ["a"] };

    await apiCall(PATH, { body });

    expect(lastInit().method).toBe("POST");
    expect(lastInit().body).toBe(JSON.stringify(body));
    expect(lastHeaders()).toEqual({
      accept: "application/json",
      "content-type": "application/json",
      [CSRF_HEADER]: CSRF_HEADER_VALUE,
    });
  });

  it.each(["PATCH", "PUT", "DELETE"] as const)("honours an explicit %s and always sends the CSRF header", async (method) => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: null }));

    await apiCall(PATH, { method });

    expect(lastInit().method).toBe(method);
    expect(lastHeaders()[CSRF_HEADER]).toBe(CSRF_HEADER_VALUE);
    expect(lastHeaders()).not.toHaveProperty("content-type");
  });

  it("passes the abort signal through", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: null }));
    const controller = new AbortController();

    await apiCall(PATH, { signal: controller.signal });

    expect(lastInit().signal).toBe(controller.signal);
  });

  it("returns INVALID_BODY without calling fetch when the body can't be serialized", async () => {
    const result = await apiCall(PATH, { body: { big: BigInt(1) } });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      status: NO_RESPONSE_STATUS,
      error: { code: CLIENT_ERROR_CODES.INVALID_BODY, message: CLIENT_ERROR_MESSAGES.INVALID_BODY },
    });
  });
});

describe("apiCall response parsing", () => {
  it("returns data from a success envelope", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: { id: "g1" } }, 201));

    expect(await apiCall<{ id: string }>(PATH)).toEqual({ ok: true, data: { id: "g1" } });
  });

  it("returns null data as-is", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, data: null }));

    expect(await apiCall(PATH)).toEqual({ ok: true, data: null });
  });

  it("passes an error envelope through with status, fieldErrors and details", async () => {
    const error = {
      code: "VALIDATION_FAILED",
      message: "Check the highlighted fields.",
      fieldErrors: { name: ["Required"], "beds.0.rows": ["Too big", "Not an integer"] },
      details: { currentVersion: 3 },
    };
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error }, 422));

    expect(await apiCall(PATH, { body: {} })).toEqual({ ok: false, status: 422, error });
  });

  it("accepts an error envelope with only code and message", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error: { code: "NOT_FOUND", message: "Not found." } }, 404));

    expect(await apiCall(PATH)).toEqual({ ok: false, status: 404, error: { code: "NOT_FOUND", message: "Not found." } });
  });

  const badResponse = (status: number) => ({
    ok: false,
    status,
    error: { code: CLIENT_ERROR_CODES.BAD_RESPONSE, message: CLIENT_ERROR_MESSAGES.BAD_RESPONSE },
  });

  it("maps a non-JSON body (an HTML 502 from a proxy) to BAD_RESPONSE", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502 }));

    expect(await apiCall(PATH)).toEqual(badResponse(502));
  });

  it("maps an empty body to BAD_RESPONSE", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    expect(await apiCall(PATH)).toEqual(badResponse(204));
  });

  it.each([
    ["a JSON array", [], 200],
    ["a JSON string", "ok", 200],
    ["null", null, 200],
    ["no ok flag", { data: 1 }, 200],
    ["ok: true without data", { ok: true }, 200],
    ["ok: true on an error status", { ok: true, data: 1 }, 500],
    ["ok: false on a success status", { ok: false, error: { code: "X", message: "x" } }, 200],
    ["ok: false without error", { ok: false }, 500],
    ["error as an array", { ok: false, error: [] }, 500],
    ["error without code", { ok: false, error: { message: "x" } }, 500],
    ["error with a numeric message", { ok: false, error: { code: "X", message: 1 } }, 500],
    ["fieldErrors not an object", { ok: false, error: { code: "X", message: "x", fieldErrors: "bad" } }, 422],
    ["fieldErrors value not an array", { ok: false, error: { code: "X", message: "x", fieldErrors: { a: "bad" } } }, 422],
    ["fieldErrors with a non-string message", { ok: false, error: { code: "X", message: "x", fieldErrors: { a: [1] } } }, 422],
    ["details not an object", { ok: false, error: { code: "X", message: "x", details: [1] } }, 409],
  ])("maps JSON that doesn't match the envelope (%s) to BAD_RESPONSE", async (_label, payload, status) => {
    fetchMock.mockResolvedValue(jsonResponse(payload, status));

    expect(await apiCall(PATH)).toEqual(badResponse(status));
  });
});

describe("apiCall transport failures", () => {
  const noResponse = (code: "NETWORK" | "ABORTED") => ({
    ok: false,
    status: NO_RESPONSE_STATUS,
    error: { code: CLIENT_ERROR_CODES[code], message: CLIENT_ERROR_MESSAGES[code] },
  });

  it("maps a fetch rejection to NETWORK and never throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    expect(await apiCall(PATH)).toEqual(noResponse("NETWORK"));
  });

  it("maps a non-Error rejection to NETWORK", async () => {
    fetchMock.mockRejectedValue("boom");

    expect(await apiCall(PATH)).toEqual(noResponse("NETWORK"));
  });

  it("maps a body read failure to NETWORK", async () => {
    const response = jsonResponse({ ok: true, data: 1 });
    vi.spyOn(response, "text").mockRejectedValue(new TypeError("network error"));
    fetchMock.mockResolvedValue(response);

    expect(await apiCall(PATH)).toEqual(noResponse("NETWORK"));
  });

  it("maps an AbortError to ABORTED", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation was aborted.", "AbortError"));

    expect(await apiCall(PATH)).toEqual(noResponse("ABORTED"));
  });

  it("maps any failure after the caller aborted to ABORTED (custom abort reason)", async () => {
    const controller = new AbortController();
    controller.abort(new Error("navigated away"));
    fetchMock.mockImplementation((_input, init) => Promise.reject(init?.signal?.reason));

    expect(await apiCall(PATH, { signal: controller.signal })).toEqual(noResponse("ABORTED"));
  });
});
