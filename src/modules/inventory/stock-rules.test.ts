import { describe, expect, it } from "vitest";
import type { Supply } from "./supply-rules";
import {
  buildStockLevels,
  isLow,
  latestCount,
  stockStatus,
  StockCountValidationError,
  validateStockCount,
  type StockCount,
} from "./stock-rules";

function supply(over: Partial<Supply> = {}): Supply {
  return {
    id: "s1",
    name: "Cups",
    designated: true,
    minimumLevel: 10,
    retiredAt: null,
    createdAt: new Date("2026-01-01"),
    ...over,
  };
}

function count(over: Partial<StockCount> = {}): StockCount {
  return {
    id: "c1",
    supplyId: "s1",
    count: 5,
    countedAt: new Date("2026-06-01T10:00:00Z"),
    ...over,
  };
}

describe("validateStockCount", () => {
  it("accepts zero, whole, and fractional numbers", () => {
    expect(validateStockCount(0)).toBe(0);
    expect(validateStockCount(42)).toBe(42);
    expect(validateStockCount(3.5)).toBe(3.5);
  });

  it("rejects negative, infinite, or NaN counts", () => {
    expect(() => validateStockCount(-1)).toThrow(StockCountValidationError);
    expect(() => validateStockCount(-0.5)).toThrow(StockCountValidationError);
    expect(() => validateStockCount(Infinity)).toThrow(StockCountValidationError);
    expect(() => validateStockCount(Number("x"))).toThrow(StockCountValidationError);
  });
});

describe("latestCount (last-count-wins)", () => {
  it("returns null when a Supply has never been counted", () => {
    expect(latestCount([])).toBeNull();
  });

  it("picks the most recent count regardless of insertion order", () => {
    const older = count({ id: "a", count: 20, countedAt: new Date("2026-06-01T10:00:00Z") });
    const newer = count({ id: "b", count: 8, countedAt: new Date("2026-06-03T09:00:00Z") });
    expect(latestCount([newer, older])?.count).toBe(8);
    expect(latestCount([older, newer])?.count).toBe(8);
  });

  it("a newer count replaces an older one as the current level", () => {
    const counts = [count({ id: "a", count: 50, countedAt: new Date("2026-06-01") })];
    expect(latestCount(counts)?.count).toBe(50);
    counts.push(count({ id: "b", count: 12, countedAt: new Date("2026-06-05") }));
    expect(latestCount(counts)?.count).toBe(12);
  });
});

describe("isLow", () => {
  it("flags a count at or below the minimum", () => {
    expect(isLow(10, 10)).toBe(true); // at minimum
    expect(isLow(3, 10)).toBe(true); // below minimum
  });

  it("does not flag a count above the minimum", () => {
    expect(isLow(11, 10)).toBe(false);
  });

  it("does not flag when there is no minimum or no count", () => {
    expect(isLow(0, null)).toBe(false);
    expect(isLow(null, 10)).toBe(false);
  });
});

describe("buildStockLevels", () => {
  it("resolves current level per Supply and flags low stock", () => {
    const cups = supply({ id: "cups", name: "Cups", minimumLevel: 10 });
    const beans = supply({ id: "beans", name: "Beans", minimumLevel: 5 });
    const counts: StockCount[] = [
      count({ id: "1", supplyId: "cups", count: 40, countedAt: new Date("2026-06-01") }),
      count({ id: "2", supplyId: "cups", count: 8, countedAt: new Date("2026-06-04") }),
      count({ id: "3", supplyId: "beans", count: 50, countedAt: new Date("2026-06-02") }),
    ];

    const levels = buildStockLevels([cups, beans], counts);

    const cupsLevel = levels.find((l) => l.supply.id === "cups")!;
    expect(cupsLevel.currentCount).toBe(8); // last-count-wins
    expect(cupsLevel.lastCountedAt).toEqual(new Date("2026-06-04"));
    expect(cupsLevel.isLow).toBe(true); // 8 <= 10

    const beansLevel = levels.find((l) => l.supply.id === "beans")!;
    expect(beansLevel.currentCount).toBe(50);
    expect(beansLevel.isLow).toBe(false);
  });

  it("reports an uncounted Supply as having no current level", () => {
    const cups = supply({ id: "cups" });
    const [level] = buildStockLevels([cups], []);
    expect(level.currentCount).toBeNull();
    expect(level.lastCountedAt).toBeNull();
    expect(level.isLow).toBe(false);
  });
});

describe("stockStatus", () => {
  it("is null for a Supply that has never been counted", () => {
    expect(stockStatus({ currentCount: null, isLow: false })).toBeNull();
  });

  it("is out whenever nothing is on hand, even with no minimum set", () => {
    expect(stockStatus({ currentCount: 0, isLow: false })).toBe("out");
    expect(stockStatus({ currentCount: 0, isLow: true })).toBe("out");
  });

  it("is low when at/below minimum but still has some on hand", () => {
    expect(stockStatus({ currentCount: 8, isLow: true })).toBe("low");
  });

  it("is ok when above minimum", () => {
    expect(stockStatus({ currentCount: 50, isLow: false })).toBe("ok");
  });
});
