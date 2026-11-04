import { randomUUID } from "node:crypto";

import { describe, expect, inject, it } from "vitest";

import { useBrowser } from "./support/use-browser.ts";

const CSRF = { "x-plantai-request": "1", "content-type": "application/json" };
const PASSWORD = "integration-pass-1";

const browser = useBrowser("gardens");

/** Registers a fresh account through the API and returns its session cookie. */
async function registerViaApi(): Promise<string> {
  const response = await fetch(new URL("/api/auth/register", inject("baseUrl")), {
    method: "POST",
    headers: CSRF,
    body: JSON.stringify({ email: `it-${randomUUID()}@example.com`, password: PASSWORD }),
  });
  expect(response.status).toBe(201);
  return response.headers.getSetCookie()[0]?.split(";")[0] ?? "";
}

async function api(path: string, cookie: string, init: { method?: string; body?: unknown } = {}) {
  return fetch(new URL(path, inject("baseUrl")), {
    method: init.method ?? "GET",
    headers: { ...CSRF, cookie },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

describe("Owned gardens", () => {
  it("sends a guest from /gardens to the login page", async () => {
    await browser().open("/gardens");
    await browser().waitForPath("/login");

    expect(await browser().headingText("Log in")).toBe("Log in");
  });

  it("lets a new user register, then create, rename and delete a garden", async () => {
    await browser().open("/register");
    await browser().fillLabel("E-mail", `it-${randomUUID()}@example.com`);
    await browser().fillLabel("Password", PASSWORD);
    await browser().clickRole("button", "Create account");
    await browser().waitForPath("/gardens");
    await browser().waitForText("No gardens yet");

    // Dialogs slide in: let the animation finish before typing or clicking inside them.
    await browser().clickRole("button", "New garden");
    await browser().waitForText("Name it the way you call it at home.");
    await browser().waitForAnimations();
    await browser().fillLabel("Name", "Raised bed A");
    await browser().fillLabel("Description", "Tomatoes and basil");
    await browser().clickRole("button", "Create garden");
    await browser().waitForNoDialog();
    await browser().waitForText("Tomatoes and basil");

    await browser().reload();
    expect(await browser().text("table")).toContain("Raised bed A");

    await browser().clickRole("button", "Rename Raised bed A");
    await browser().waitForText("Rename garden");
    await browser().waitForAnimations();
    await browser().fillLabel("Name", "Raised bed B");
    await browser().clickRole("button", "Save");
    await browser().waitForNoDialog();
    await browser().waitForText("Raised bed B");

    await browser().clickRole("button", "Delete Raised bed B");
    await browser().waitForText("The garden is removed for good.");
    await browser().waitForAnimations();
    await browser().clickRole("button", "Delete");
    await browser().waitForNoDialog();
    await browser().waitForText("No gardens yet");
  });

  it("hides one user's garden from another, through the API and the page", async () => {
    const owner = await registerViaApi();
    const stranger = await registerViaApi();
    const created = await api("/api/gardens", owner, { method: "POST", body: { name: "Private plot" } });
    expect(created.status).toBe(201);
    const { data } = (await created.json()) as { data: { id: string } };

    for (const method of ["GET", "DELETE"]) {
      const response = await api(`/api/gardens/${data.id}`, stranger, { method });
      expect(response.status).toBe(404);
    }
    const renamed = await api(`/api/gardens/${data.id}`, stranger, { method: "PATCH", body: { name: "Mine now" } });
    expect(renamed.status).toBe(404);
    const strangerList = (await (await api("/api/gardens", stranger)).json()) as { data: unknown[] };
    expect(strangerList.data).toEqual([]);

    const ownerView = (await (await api(`/api/gardens/${data.id}`, owner)).json()) as { data: { name: string } };
    expect(ownerView.data.name).toBe("Private plot");
  });
});
