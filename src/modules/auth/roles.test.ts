import { describe, expect, it } from "vitest";
import { assertLead, ForbiddenError, isLead } from "./roles";

describe("isLead", () => {
  it("is true only for the lead role", () => {
    expect(isLead("lead")).toBe(true);
    expect(isLead("volunteer")).toBe(false);
    expect(isLead(null)).toBe(false);
    expect(isLead(undefined)).toBe(false);
  });
});

describe("assertLead", () => {
  it("permits a Lead to proceed", () => {
    expect(() => assertLead("lead")).not.toThrow();
  });

  it("denies a Volunteer a Lead-only action", () => {
    expect(() => assertLead("volunteer")).toThrow(ForbiddenError);
  });

  it("denies an unauthenticated caller", () => {
    expect(() => assertLead(undefined)).toThrow(ForbiddenError);
    expect(() => assertLead(null)).toThrow(ForbiddenError);
  });
});
