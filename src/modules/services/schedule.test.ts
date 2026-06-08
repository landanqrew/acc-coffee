import { describe, expect, it } from "vitest";
import {
  datesInRange,
  isValidDate,
  isValidTime,
  planRecurringServices,
  ServiceValidationError,
  servicesOn,
  validateAdHocService,
  validateScheduleEntry,
  weekdayOf,
  type ScheduleEntry,
} from "./schedule";

describe("weekdayOf", () => {
  it("returns 0 for a Sunday", () => {
    // 2026-06-07 is a Sunday.
    expect(weekdayOf("2026-06-07")).toBe(0);
    expect(weekdayOf("2026-06-08")).toBe(1);
  });
});

describe("datesInRange", () => {
  it("lists every Sunday in the range, inclusive of the endpoints", () => {
    expect(datesInRange("2026-06-07", "2026-06-28", 0)).toEqual([
      "2026-06-07",
      "2026-06-14",
      "2026-06-21",
      "2026-06-28",
    ]);
  });

  it("returns nothing when no day in range matches", () => {
    // No Sunday between Mon 2026-06-08 and Sat 2026-06-13.
    expect(datesInRange("2026-06-08", "2026-06-13", 0)).toEqual([]);
  });

  it("handles a from-date that is already the target weekday", () => {
    expect(datesInRange("2026-06-07", "2026-06-07", 0)).toEqual(["2026-06-07"]);
  });
});

describe("planRecurringServices", () => {
  const schedule: ScheduleEntry[] = [
    { id: "9am", name: "9am Gathering", weekday: 0, time: "09:00" },
    { id: "11am", name: "11am Gathering", weekday: 0, time: "11:00" },
  ];

  it("materializes each gathering for every Sunday — multiple per Sunday", () => {
    const planned = planRecurringServices(schedule, "2026-06-07", "2026-06-14");
    expect(planned).toHaveLength(4); // 2 gatherings × 2 Sundays
    const firstSunday = servicesOn(planned, "2026-06-07");
    expect(firstSunday.map((s) => s.name).sort()).toEqual([
      "11am Gathering",
      "9am Gathering",
    ]);
    expect(firstSunday.map((s) => s.time).sort()).toEqual(["09:00", "11:00"]);
  });

  it("produces no services when the schedule is empty", () => {
    expect(planRecurringServices([], "2026-06-01", "2026-12-31")).toEqual([]);
  });
});

describe("servicesOn (today's services)", () => {
  it("returns both recurring and ad-hoc services on the same day", () => {
    const services = [
      { id: "a", date: "2026-06-07", name: "9am Gathering" },
      { id: "b", date: "2026-06-07", name: "Easter Sunrise" },
      { id: "c", date: "2026-06-14", name: "9am Gathering" },
    ];
    const today = servicesOn(services, "2026-06-07");
    expect(today.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });
});

describe("validation", () => {
  it("accepts and rejects date/time formats", () => {
    expect(isValidDate("2026-06-07")).toBe(true);
    expect(isValidDate("2026-13-07")).toBe(false);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidTime("09:00")).toBe(true);
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("24:00")).toBe(false);
  });

  it("validates a schedule entry and trims the name", () => {
    expect(validateScheduleEntry({ name: "  9am  ", weekday: 0, time: "09:00" })).toEqual({
      name: "9am",
      weekday: 0,
      time: "09:00",
    });
    expect(() => validateScheduleEntry({ name: "", weekday: 0, time: "09:00" })).toThrow(
      ServiceValidationError,
    );
    expect(() => validateScheduleEntry({ name: "x", weekday: 9, time: "09:00" })).toThrow(
      ServiceValidationError,
    );
  });

  it("validates an ad-hoc service", () => {
    expect(
      validateAdHocService({ name: "Easter", date: "2026-04-05", time: "06:00" }),
    ).toEqual({ name: "Easter", date: "2026-04-05", time: "06:00" });
    expect(() =>
      validateAdHocService({ name: "Easter", date: "nope", time: "06:00" }),
    ).toThrow(ServiceValidationError);
  });
});
