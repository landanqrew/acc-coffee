import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "font-bold")).toBe("px-2 font-bold");
  });

  it("drops falsy and conditional values", () => {
    expect(cn("a", false, null, undefined, 0 && "x", "b")).toBe("a b");
  });

  it("supports conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("merges conflicting Tailwind utilities, last wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-muted-foreground", "text-foreground")).toBe(
      "text-foreground",
    );
  });
});
