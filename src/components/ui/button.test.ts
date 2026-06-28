import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("defaults to the primary, default-size button", () => {
    const cls = buttonVariants();
    // royal-blue fill + deep-blue hover, pill radius
    expect(cls).toContain("bg-primary");
    expect(cls).toContain("text-primary-foreground");
    expect(cls).toContain("hover:bg-brand-deep");
    expect(cls).toContain("rounded-full");
  });

  it("lifts the shadow on hover (soft → lift)", () => {
    const cls = buttonVariants({ variant: "primary" });
    expect(cls).toContain("shadow-soft");
    expect(cls).toContain("hover:shadow-lift");
  });

  it("renders a deep-blue text link variant", () => {
    const cls = buttonVariants({ variant: "link" });
    expect(cls).toContain("text-brand-deep");
    expect(cls).toContain("hover:underline");
  });

  it("renders a ghost variant with no fill", () => {
    const cls = buttonVariants({ variant: "ghost" });
    expect(cls).toContain("hover:bg-muted");
    expect(cls).not.toContain("bg-primary");
  });

  it("keeps the default size at a >=44px tap target", () => {
    expect(buttonVariants({ size: "default" })).toContain("min-h-11");
  });

  it("uses a 44px square for the icon size", () => {
    const cls = buttonVariants({ size: "icon" });
    expect(cls).toContain("h-11");
    expect(cls).toContain("w-11");
  });
});
