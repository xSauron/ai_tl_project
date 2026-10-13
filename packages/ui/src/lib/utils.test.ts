import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins conditional classes and resolves Tailwind conflicts", () => {
    const isActive = true;
    expect(cn("px-2 py-1", isActive && "bg-primary", { hidden: false }, "px-4")).toBe("py-1 bg-primary px-4");
  });
});
