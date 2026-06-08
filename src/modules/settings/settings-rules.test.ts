import { describe, expect, it } from "vitest";
import {
  SettingsValidationError,
  validateChurchAdminEmail,
} from "./settings-rules";

describe("validateChurchAdminEmail", () => {
  it("trims and lowercases a valid address", () => {
    expect(validateChurchAdminEmail("  Admin@Church.ORG ")).toBe("admin@church.org");
  });

  it("rejects an empty value", () => {
    expect(() => validateChurchAdminEmail("   ")).toThrow(SettingsValidationError);
  });

  it("rejects an address with no @", () => {
    expect(() => validateChurchAdminEmail("admin.church.org")).toThrow(
      SettingsValidationError,
    );
  });

  it("rejects an address with no dotted domain", () => {
    expect(() => validateChurchAdminEmail("admin@church")).toThrow(
      SettingsValidationError,
    );
  });
});
