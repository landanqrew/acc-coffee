import { describe, expect, it } from "vitest";
import { supplyCardView } from "./supply-display";

describe("supplyCardView", () => {
  it("shows the minimum level as a bare mono number when one is set", () => {
    const view = supplyCardView({ minimumLevel: 12, designated: false });
    expect(view.minimum).toBe("12");
    expect(view.hasMinimum).toBe(true);
  });

  it("keeps a zero minimum (a real, intentional floor)", () => {
    const view = supplyCardView({ minimumLevel: 0, designated: false });
    expect(view.minimum).toBe("0");
    expect(view.hasMinimum).toBe(true);
  });

  it("reads as no minimum when none is set", () => {
    const view = supplyCardView({ minimumLevel: null, designated: false });
    expect(view.minimum).toBe("—");
    expect(view.hasMinimum).toBe(false);
  });

  it("flags a designated Supply as counted on every Service Report", () => {
    expect(supplyCardView({ minimumLevel: null, designated: true }).designated).toBe(
      true,
    );
    expect(
      supplyCardView({ minimumLevel: null, designated: false }).designated,
    ).toBe(false);
  });
});
