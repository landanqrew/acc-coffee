import { describe, expect, it } from "vitest";
import { fieldInputVariants } from "./field";

describe("fieldInputVariants", () => {
  it("uses text-base padding to avoid iOS zoom", () => {
    expect(fieldInputVariants()).toContain("text-base");
  });

  it("focuses to the primary ring", () => {
    const cls = fieldInputVariants();
    expect(cls).toContain("focus:border-primary");
    expect(cls).toContain("focus:ring-primary/20");
  });

  it("supports a mono-friendly numeric input", () => {
    expect(fieldInputVariants({ mono: true })).toContain("font-mono");
  });

  it("flags an invalid input with the danger token", () => {
    expect(fieldInputVariants({ invalid: true })).toContain("border-danger");
  });
});
