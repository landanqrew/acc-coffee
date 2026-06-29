import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/modules/auth/roles";
import {
  assertCanManageSupplies,
  isActive,
  selectActive,
  SupplyValidationError,
  validateSupplyInput,
} from "./supply-rules";

describe("validateSupplyInput", () => {
  it("trims the name and defaults designation off with no minimum", () => {
    expect(validateSupplyInput({ name: "  Oat Milk  " })).toEqual({
      name: "Oat Milk",
      designated: false,
      minimumLevel: null,
    });
  });

  it("keeps the designated flag and a valid minimum level", () => {
    expect(
      validateSupplyInput({ name: "Cups", designated: true, minimumLevel: 50 }),
    ).toEqual({ name: "Cups", designated: true, minimumLevel: 50 });
  });

  it("allows a zero minimum level", () => {
    expect(validateSupplyInput({ name: "Stirrers", minimumLevel: 0 }).minimumLevel).toBe(0);
  });

  it("treats a null/omitted minimum as no minimum", () => {
    expect(validateSupplyInput({ name: "Napkins", minimumLevel: null }).minimumLevel).toBeNull();
  });

  it("rejects an empty or whitespace-only name", () => {
    expect(() => validateSupplyInput({ name: "   " })).toThrow(SupplyValidationError);
  });

  it("accepts a fractional minimum level", () => {
    expect(validateSupplyInput({ name: "Beans", minimumLevel: 2.5 }).minimumLevel).toBe(2.5);
  });

  it("rejects a negative, infinite, or NaN minimum level", () => {
    expect(() => validateSupplyInput({ name: "Beans", minimumLevel: -1 })).toThrow(
      SupplyValidationError,
    );
    expect(() => validateSupplyInput({ name: "Beans", minimumLevel: Infinity })).toThrow(
      SupplyValidationError,
    );
    // The form parses an unparseable minimum to NaN — it must be rejected.
    expect(() => validateSupplyInput({ name: "Beans", minimumLevel: Number("x") })).toThrow(
      SupplyValidationError,
    );
  });

  it("accepts a 100-character name but rejects 101", () => {
    expect(validateSupplyInput({ name: "a".repeat(100) }).name).toHaveLength(100);
    expect(() => validateSupplyInput({ name: "a".repeat(101) })).toThrow(
      SupplyValidationError,
    );
  });
});

describe("assertCanManageSupplies", () => {
  it("permits a Lead", () => {
    expect(() => assertCanManageSupplies("lead")).not.toThrow();
  });

  it("denies a Volunteer", () => {
    expect(() => assertCanManageSupplies("volunteer")).toThrow(ForbiddenError);
  });

  it("denies an unauthenticated caller", () => {
    expect(() => assertCanManageSupplies(undefined)).toThrow(ForbiddenError);
  });
});

describe("active vs retired", () => {
  const active = { id: "1", name: "Cups", designated: true, minimumLevel: 10, retiredAt: null, createdAt: new Date() };
  const retired = { ...active, id: "2", name: "Old Syrup", retiredAt: new Date() };

  it("counts a Supply as active until it is retired", () => {
    expect(isActive(active)).toBe(true);
    expect(isActive(retired)).toBe(false);
  });

  it("filters retired Supplies out of active views while keeping them in history", () => {
    const all = [active, retired];
    expect(selectActive(all)).toEqual([active]);
    // history is preserved — the retired Supply still exists in the full list
    expect(all).toContain(retired);
  });
});
