import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectIfSignedIn } = vi.hoisted(() => ({ redirectIfSignedIn: vi.fn() }));

vi.mock("@/server/session", () => ({ redirectIfSignedIn }));
vi.mock("./credentials-form", () => ({ CredentialsForm: ({ mode }: { mode: string }) => <form data-mode={mode} /> }));

const { default: LoginPage, metadata: loginMetadata } = await import("./login/page");
const { default: RegisterPage, metadata: registerMetadata } = await import("./register/page");

beforeEach(() => {
  redirectIfSignedIn.mockReset().mockResolvedValue(undefined);
});

describe.each([
  { Page: LoginPage, metadata: loginMetadata, title: "Log in", mode: "login", link: ["/register", "Create one"] },
  { Page: RegisterPage, metadata: registerMetadata, title: "Create account", mode: "register", link: ["/login", "Log in"] },
])("$title page", ({ Page, metadata, title, mode, link }) => {
  it("renders the heading, the form in its mode and the link to the other page", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(metadata.title).toBe(title);
    expect(html).toContain(`<h1 class="text-page-heading font-bold">${title}</h1>`);
    expect(html).toContain(`<form data-mode="${mode}">`);
    expect(html).toMatch(new RegExp(`<a[^>]*href="${link[0]}"[^>]*>${link[1]}</a>`));
  });

  it("checks the session before rendering", async () => {
    redirectIfSignedIn.mockRejectedValue(new Error("NEXT_REDIRECT:/gardens"));

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT:/gardens");
  });
});
