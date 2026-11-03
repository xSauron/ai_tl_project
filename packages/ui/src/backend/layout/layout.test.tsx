import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AppShell,
  type AppNavLinkProps,
  DEFAULT_MAIN_ID,
  DEFAULT_NAV_LABEL,
  DEFAULT_SKIP_LINK_LABEL,
} from "./AppShell";
import { PageHeader } from "./PageHeader";

const NAV_ITEMS = [
  { href: "/gardens", label: "Gardens", icon: <svg data-testid="icon" />, isActive: true },
  { href: "/calendar", label: "Calendar" },
];

describe("AppShell", () => {
  it("renders one labelled nav, a skip link and the main landmark", () => {
    render(
      <AppShell navItems={NAV_ITEMS}>
        <p>Page body</p>
      </AppShell>,
    );

    const nav = screen.getByRole("navigation", { name: DEFAULT_NAV_LABEL });
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    const main = screen.getByRole("main");
    expect(main.id).toBe(DEFAULT_MAIN_ID);
    expect(main.getAttribute("tabindex")).toBe("-1");
    expect(within(main).getByText("Page body")).toBeTruthy();

    const skip = screen.getByRole("link", { name: DEFAULT_SKIP_LINK_LABEL });
    expect(skip.getAttribute("href")).toBe(`#${DEFAULT_MAIN_ID}`);

    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/gardens", "/calendar"]);
  });

  it("marks only the active item as the current page and hides icons", () => {
    render(<AppShell navItems={NAV_ITEMS}>body</AppShell>);

    const gardens = screen.getByRole("link", { name: "Gardens" });
    const calendar = screen.getByRole("link", { name: "Calendar" });
    expect(gardens.getAttribute("aria-current")).toBe("page");
    expect(calendar.getAttribute("aria-current")).toBeNull();
    expect(screen.getByTestId("icon").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(calendar.querySelector("[aria-hidden]")).toBeNull();
  });

  it("renders the brand only when given", () => {
    const { rerender } = render(<AppShell navItems={NAV_ITEMS}>body</AppShell>);
    expect(screen.queryByText("Plant.AI")).toBeNull();

    rerender(
      <AppShell navItems={NAV_ITEMS} brand="Plant.AI">
        body
      </AppShell>,
    );
    expect(screen.getByText("Plant.AI")).toBeTruthy();
  });

  it("renders the footer in both layouts only when given", () => {
    const { rerender, container } = render(<AppShell navItems={NAV_ITEMS}>body</AppShell>);
    expect(container.querySelector(".mt-auto")).toBeNull();

    rerender(
      <AppShell navItems={NAV_ITEMS} footer={<button type="button">Log out</button>}>
        body
      </AppShell>,
    );
    const buttons = screen.getAllByRole("button", { name: "Log out" });
    expect(buttons).toHaveLength(2);
    expect(within(screen.getByRole("navigation")).getByRole("button").parentElement?.className).toContain("md:block");
    expect(within(screen.getByRole("main")).getByRole("button").parentElement?.className).toContain("md:hidden");
  });

  it("uses the injected link component and custom labels", () => {
    function TestLink({ children, ...props }: AppNavLinkProps) {
      return (
        <a data-router-link="" {...props}>
          {children}
        </a>
      );
    }

    render(
      <AppShell
        navItems={NAV_ITEMS}
        linkComponent={TestLink}
        navLabel="App"
        skipLinkLabel="Skip"
        mainId="content"
      >
        body
      </AppShell>,
    );

    const nav = screen.getByRole("navigation", { name: "App" });
    expect(within(nav).getAllByRole("link").every((link) => link.hasAttribute("data-router-link"))).toBe(true);
    expect(screen.getByRole("link", { name: "Skip" }).getAttribute("href")).toBe("#content");
    expect(screen.getByRole("main").id).toBe("content");
  });
});

describe("PageHeader", () => {
  it("renders the page's only heading", () => {
    const { container } = render(<PageHeader title="Gardens" />);

    expect(screen.getByRole("heading", { level: 1, name: "Gardens" })).toBeTruthy();
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.querySelector("[data-slot=page-header]")?.children).toHaveLength(1);
  });

  it("renders the description, actions and class", () => {
    const { container } = render(
      <PageHeader
        title="Gardens"
        description="Everything you grow."
        actions={<button type="button">New garden</button>}
        className="custom"
      />,
    );

    expect(screen.getByText("Everything you grow.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New garden" })).toBeTruthy();
    expect(container.querySelector("[data-slot=page-header]")?.className).toContain("custom");
  });
});
