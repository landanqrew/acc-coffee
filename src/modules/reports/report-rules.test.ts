import { describe, expect, it } from "vitest";
import {
  answerText,
  planReport,
  REPORT_QUESTIONS,
  ReportValidationError,
  validateAnswers,
  validateReportCounts,
} from "./report-rules";

describe("answerText", () => {
  it("renders scalar answers verbatim", () => {
    expect(answerText(4)).toBe("4");
    expect(answerText(0)).toBe("0");
    expect(answerText("burner flaky")).toBe("burner flaky");
  });

  it("shows an em dash for blank or absent answers", () => {
    expect(answerText(undefined)).toBe("—");
    expect(answerText(null)).toBe("—");
    expect(answerText("")).toBe("—");
    expect(answerText("   ")).toBe("—");
  });

  it("never hands a raw object/array to the view — coerces to text", () => {
    // A non-scalar stored answer (legacy/hand-edited row) must not crash the
    // Service page with "Objects are not valid as a React child".
    expect(answerText({ note: "x" })).toBe('{"note":"x"}');
    expect(answerText([1, 2])).toBe("[1,2]");
  });
});

describe("validateAnswers", () => {
  const valid = { mediumPots: "3", darkPots: "1", leftoverPots: "0", issues: "  burner flaky " };

  it("normalizes numbers and trims free text", () => {
    expect(validateAnswers(valid)).toEqual({
      mediumPots: 3,
      darkPots: 1,
      leftoverPots: 0,
      issues: "burner flaky",
    });
  });

  it("omits blank optional free text", () => {
    const a = validateAnswers({ ...valid, issues: "   " });
    expect(a).not.toHaveProperty("issues");
  });

  it("rejects a missing required number", () => {
    expect(() => validateAnswers({ ...valid, mediumPots: "" })).toThrow(ReportValidationError);
  });

  it("rejects a non-whole or negative number", () => {
    expect(() => validateAnswers({ ...valid, darkPots: "2.5" })).toThrow(ReportValidationError);
    expect(() => validateAnswers({ ...valid, leftoverPots: "-1" })).toThrow(ReportValidationError);
  });

  it("covers brew amounts, leftovers, and free-text issues", () => {
    const ids = REPORT_QUESTIONS.map((q) => q.id);
    expect(ids).toEqual(expect.arrayContaining(["mediumPots", "darkPots", "leftoverPots", "issues"]));
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

  it("accepts a fractional count", () => {
    expect(validateReportCounts(["a"], { a: "1.5" })).toEqual([{ supplyId: "a", count: 1.5 }]);
  });

  it("rejects a negative count", () => {
    expect(() => validateReportCounts(["a"], { a: "-2" })).toThrow(ReportValidationError);
  });

  it("allows no designated supplies (empty list)", () => {
    expect(validateReportCounts([], {})).toEqual([]);
  });
});

describe("planReport", () => {
  const base = {
    existingReport: null,
    designatedSupplyIds: ["a"],
    answers: { mediumPots: "2", darkPots: "0", leftoverPots: "1" },
    counts: { a: "4" },
  };

  it("returns answers and the counts to record", () => {
    expect(planReport(base)).toEqual({
      answers: { mediumPots: 2, darkPots: 0, leftoverPots: 1 },
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
