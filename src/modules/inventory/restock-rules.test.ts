import { describe, expect, it } from "vitest";
import { decideRestockAlert } from "./restock-rules";

const supply = { id: "s1", name: "Filters", minimumLevel: 5 };

describe("decideRestockAlert", () => {
  it("alerts when a count crosses from at/above the minimum to below it", () => {
    expect(decideRestockAlert({ supply, previousCount: 10, newCount: 2 })).toEqual({
      supplyId: "s1",
      supplyName: "Filters",
      count: 2,
      minimum: 5,
    });
  });

  it("treats exactly the minimum as not below (no alert)", () => {
    expect(decideRestockAlert({ supply, previousCount: 10, newCount: 5 })).toBeNull();
  });

  it("alerts as soon as a previously-at-minimum count drops below", () => {
    expect(decideRestockAlert({ supply, previousCount: 5, newCount: 4 })).not.toBeNull();
  });

  it("suppresses re-alerts while still below the minimum", () => {
    expect(decideRestockAlert({ supply, previousCount: 2, newCount: 1 })).toBeNull();
    expect(decideRestockAlert({ supply, previousCount: 2, newCount: 4 })).toBeNull();
  });

  it("alerts again after stock recovers to/above minimum and crosses anew", () => {
    // Recovery count: was below (1), now back above (6) — no alert on recovery.
    expect(decideRestockAlert({ supply, previousCount: 1, newCount: 6 })).toBeNull();
    // Next crossing from the recovered level fires again.
    expect(decideRestockAlert({ supply, previousCount: 6, newCount: 2 })).not.toBeNull();
  });

  it("alerts on a first-ever count that is below the minimum", () => {
    expect(decideRestockAlert({ supply, previousCount: null, newCount: 1 })).not.toBeNull();
  });

  it("does not alert on a first-ever count at/above the minimum", () => {
    expect(decideRestockAlert({ supply, previousCount: null, newCount: 9 })).toBeNull();
  });

  it("never alerts for a Supply with no minimum set", () => {
    expect(
      decideRestockAlert({
        supply: { id: "s2", name: "Stirrers", minimumLevel: null },
        previousCount: 10,
        newCount: 0,
      }),
    ).toBeNull();
  });
});
