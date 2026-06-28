import { describe, expect, it } from "vitest";
import { cardVariants } from "./card";

describe("cardVariants", () => {
  it("is a lifted white surface with no border (depth, not borders)", () => {
    const cls = cardVariants();
    expect(cls).toContain("bg-white");
    expect(cls).toContain("rounded-2xl");
    expect(cls).not.toContain("border ");
  });

  it("defaults to a soft shadow", () => {
    expect(cardVariants()).toContain("shadow-soft");
  });

  it("supports a lifted shadow", () => {
    expect(cardVariants({ elevation: "lift" })).toContain("shadow-lift");
  });
});
