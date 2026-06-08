import { describe, expect, it } from "vitest";
import {
  BrewValidationError,
  buildLeftoverHistory,
  comparableKey,
  selectDefaultQuantities,
  validateBrewQuantities,
  type PriorQuantities,
  type ReportRow,
  type ServiceIdentity,
} from "./brew-rules";

const recurring = (over: Partial<ServiceIdentity> = {}): ServiceIdentity => ({
  id: "svc",
  name: "9am Gathering",
  date: "2026-06-07",
  kind: "recurring",
  scheduleId: "sch-9am",
  ...over,
});

describe("validateBrewQuantities", () => {
  it("accepts whole, zero-or-more pots", () => {
    expect(validateBrewQuantities({ regularPots: "6", decafPots: "2" })).toEqual({
      regularPots: 6,
      decafPots: 2,
    });
  });

  it("accepts zero", () => {
    expect(validateBrewQuantities({ regularPots: 0, decafPots: 0 })).toEqual({
      regularPots: 0,
      decafPots: 0,
    });
  });

  it("rejects a blank field rather than reading it as 0", () => {
    expect(() => validateBrewQuantities({ regularPots: "", decafPots: "2" })).toThrow(
      BrewValidationError,
    );
  });

  it("rejects negative pots", () => {
    expect(() => validateBrewQuantities({ regularPots: "6", decafPots: "-1" })).toThrow(
      BrewValidationError,
    );
  });

  it("rejects fractional pots", () => {
    expect(() => validateBrewQuantities({ regularPots: "1.5", decafPots: "2" })).toThrow(
      BrewValidationError,
    );
  });
});

describe("comparableKey", () => {
  it("groups recurring Services by their schedule", () => {
    expect(comparableKey(recurring({ scheduleId: "sch-9am" }))).toBe(
      comparableKey(recurring({ id: "other", date: "2026-05-31", scheduleId: "sch-9am" })),
    );
  });

  it("separates recurring Services on different schedules", () => {
    expect(comparableKey(recurring({ scheduleId: "sch-9am" }))).not.toBe(
      comparableKey(recurring({ scheduleId: "sch-11am" })),
    );
  });

  it("groups ad-hoc Services by name, case-insensitively", () => {
    const a = recurring({ kind: "ad_hoc", scheduleId: null, name: "Easter Sunrise" });
    const b = recurring({ kind: "ad_hoc", scheduleId: null, name: "easter sunrise" });
    expect(comparableKey(a)).toBe(comparableKey(b));
  });
});

describe("selectDefaultQuantities", () => {
  const prior = (date: string, q: { regularPots: number; decafPots: number }): PriorQuantities => ({
    service: recurring({ id: `svc-${date}`, date, scheduleId: "sch-9am" }),
    quantities: q,
  });

  it("inherits the most recent comparable past Service's quantities", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const result = selectDefaultQuantities(target, [
      prior("2026-05-24", { regularPots: 4, decafPots: 1 }),
      prior("2026-05-31", { regularPots: 6, decafPots: 2 }),
    ]);
    expect(result).toEqual({ regularPots: 6, decafPots: 2 });
  });

  it("ignores Services on a different schedule", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const result = selectDefaultQuantities(target, [
      {
        service: recurring({ id: "x", date: "2026-05-31", scheduleId: "sch-11am" }),
        quantities: { regularPots: 9, decafPots: 9 },
      },
    ]);
    expect(result).toBeNull();
  });

  it("ignores the target's own date and future Services", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const result = selectDefaultQuantities(target, [
      prior("2026-06-07", { regularPots: 3, decafPots: 3 }),
      prior("2026-06-14", { regularPots: 8, decafPots: 8 }),
    ]);
    expect(result).toBeNull();
  });

  it("returns null when there is nothing comparable to inherit", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    expect(selectDefaultQuantities(target, [])).toBeNull();
  });
});

describe("buildLeftoverHistory", () => {
  const reportRow = (
    date: string,
    answers: Record<string, number | string>,
    over: Partial<ServiceIdentity> = {},
  ): ReportRow => ({
    service: recurring({ id: `svc-${date}`, date, scheduleId: "sch-9am", ...over }),
    answers,
  });

  it("returns comparable past reports, newest first, with brewed/leftover numbers", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const history = buildLeftoverHistory(target, [
      reportRow("2026-05-24", { regularPots: 4, decafPots: 1, leftoverPots: 0 }),
      reportRow("2026-05-31", { regularPots: 6, decafPots: 2, leftoverPots: 1 }),
    ]);
    expect(history.map((h) => h.date)).toEqual(["2026-05-31", "2026-05-24"]);
    expect(history[0]).toMatchObject({
      regularPots: 6,
      decafPots: 2,
      leftoverPots: 1,
    });
  });

  it("excludes the target's own date, future, and non-comparable Services", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const history = buildLeftoverHistory(target, [
      reportRow("2026-06-07", { leftoverPots: 9 }),
      reportRow("2026-06-14", { leftoverPots: 9 }),
      reportRow("2026-05-31", { leftoverPots: 1 }, { scheduleId: "sch-11am" }),
    ]);
    expect(history).toEqual([]);
  });

  it("caps the history at the requested limit", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const rows = [
      reportRow("2026-05-03", { leftoverPots: 1 }),
      reportRow("2026-05-10", { leftoverPots: 1 }),
      reportRow("2026-05-17", { leftoverPots: 1 }),
      reportRow("2026-05-24", { leftoverPots: 1 }),
      reportRow("2026-05-31", { leftoverPots: 1 }),
    ];
    expect(buildLeftoverHistory(target, rows, 3)).toHaveLength(3);
  });

  it("reports a missing numeric answer as null rather than guessing", () => {
    const target = recurring({ date: "2026-06-07", scheduleId: "sch-9am" });
    const history = buildLeftoverHistory(target, [
      reportRow("2026-05-31", { issues: "ran out early" }),
    ]);
    expect(history[0]).toMatchObject({
      regularPots: null,
      decafPots: null,
      leftoverPots: null,
    });
  });
});
