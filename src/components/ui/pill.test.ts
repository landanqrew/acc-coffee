import { describe, expect, it } from "vitest";
import { pillVariants } from "./pill";

describe("pillVariants", () => {
  it("is a pill-radius chip", () => {
    expect(pillVariants()).toContain("rounded-full");
  });

  it("defaults to a neutral tone", () => {
    const cls = pillVariants();
    expect(cls).toContain("bg-muted");
    expect(cls).toContain("text-muted-foreground");
  });

  it("supports an accent tone", () => {
    const cls = pillVariants({ tone: "accent" });
    expect(cls).toContain("bg-accent");
    expect(cls).toContain("text-accent-foreground");
  });

  it("supports a mono data-chip", () => {
    expect(pillVariants({ mono: true })).toContain("font-mono");
  });
});
