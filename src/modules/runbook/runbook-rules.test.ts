import { describe, expect, it } from "vitest";
import {
  CONTENT_MAX,
  isRunbookSectionId,
  parseSectionId,
  RUNBOOK_SECTIONS,
  RunbookValidationError,
  validateContent,
} from "./runbook-rules";

describe("RUNBOOK_SECTIONS", () => {
  it("covers exactly checklist, equipment, and supply locations, in order", () => {
    expect(RUNBOOK_SECTIONS.map((s) => s.id)).toEqual([
      "checklist",
      "equipment",
      "supply_locations",
    ]);
  });
});

describe("parseSectionId / isRunbookSectionId", () => {
  it("accepts a known section id", () => {
    expect(parseSectionId("checklist")).toBe("checklist");
    expect(isRunbookSectionId("supply_locations")).toBe(true);
  });

  it("rejects an unknown section id", () => {
    expect(() => parseSectionId("brew_guidance")).toThrow(RunbookValidationError);
    expect(isRunbookSectionId("brew_guidance")).toBe(false);
    expect(isRunbookSectionId(42)).toBe(false);
  });
});

describe("validateContent", () => {
  it("normalizes CRLF to LF and trims trailing whitespace", () => {
    expect(validateContent("- step one\r\n- step two\n\n  ")).toBe(
      "- step one\n- step two",
    );
  });

  it("allows empty content — a blank section is valid", () => {
    expect(validateContent("   \n  ")).toBe("");
  });

  it("rejects content past the maximum length", () => {
    expect(() => validateContent("x".repeat(CONTENT_MAX + 1))).toThrow(
      RunbookValidationError,
    );
  });

  it("accepts content exactly at the maximum length", () => {
    const atMax = "x".repeat(CONTENT_MAX);
    expect(validateContent(atMax)).toBe(atMax);
  });
});
