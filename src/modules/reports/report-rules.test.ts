import { describe, expect, it } from "vitest";
import {
  planReport,
  REPORT_QUESTIONS,
  ReportValidationError,
  validateAnswers,
  validateReportCounts,
} from "./report-rules";

describe("validateAnswers", () => {
  const valid = { regularPots: "3", decafPots: "1", leftoverPots: "0", issues: "  burner flaky " };

  it("normalizes numbers and trims free text", () => {
    expect(validateAnswers(valid)).toEqual({
      regularPots: 3,
      decafPots: 1,
      leftoverPots: 0,
      issues: "burner flaky",
    });
  });

  it("omits blank optional free text", () => {
    const a = validateAnswers({ ...valid, issues: "   " });
    expect(a).not.toHaveProperty("issues");
  });

  it("rejects a missing required number", () => {
    expect(() => validateAnswers({ ...valid, regularPots: "" })).toThrow(ReportValidationError);
  });

  it("rejects a non-whole or negative number", () => {
    expect(() => validateAnswers({ ...valid, decafPots: "2.5" })).toThrow(ReportValidationError);
    expect(() => validateAnswers({ ...valid, leftoverPots: "-1" })).toThrow(ReportValidationError);
  });

  it("covers brew amounts, leftovers, and free-text issues", () => {
    const ids = REPORT_QUESTIONS.map((q) => q.id);
    expect(ids).toEqual(expect.arrayContaining(["regularPots", "decafPots", "leftoverPots", "issues"]));
  });
});

describe("validateReportCounts", () => {
  it("returns a count for every designated supply", () => {
    expect(validateReportCounts(["a", "b"], { a: "5", b: 0 })).toEqual([
      { supplyId: "a", count: 5 },
      { supplyId: "b", count: 0 },
    ]);
  });

  it("rejects when any designated supply is uncounted", () => {
    expect(() => validateReportCounts(["a", "b"], { a: "5" })).toThrow(ReportValidationError);
    expect(() => validateReportCounts(["a", "b"], { a: "5", b: "" })).toThrow(ReportValidationError);
  });

  it("rejects a non-whole or negative count", () => {
    expect(() => validateReportCounts(["a"], { a: "-2" })).toThrow(ReportValidationError);
    expect(() => validateReportCounts(["a"], { a: "1.5" })).toThrow(ReportValidationError);
  });

  it("allows no designated supplies (empty list)", () => {
    expect(validateReportCounts([], {})).toEqual([]);
  });
});

describe("planReport", () => {
  const base = {
    existingReport: null,
    designatedSupplyIds: ["a"],
    answers: { regularPots: "2", decafPots: "0", leftoverPots: "1" },
    counts: { a: "4" },
  };

  it("returns answers and the counts to record", () => {
    expect(planReport(base)).toEqual({
      answers: { regularPots: 2, decafPots: 0, leftoverPots: 1 },
      counts: [{ supplyId: "a", count: 4 }],
    });
  });

  it("enforces at most one report per service", () => {
    expect(() => planReport({ ...base, existingReport: { id: "r1" } })).toThrow(
      ReportValidationError,
    );
  });

  it("rejects the whole submission when a designated supply is uncounted", () => {
    expect(() => planReport({ ...base, counts: {} })).toThrow(ReportValidationError);
  });
});
