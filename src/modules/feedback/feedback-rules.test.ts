import { describe, expect, it } from "vitest";
import {
  aggregateFeedback,
  FEEDBACK_RATINGS,
  FeedbackValidationError,
  validateFeedback,
  type FeedbackRow,
} from "./feedback-rules";

const goodRatings = { taste: "5", temperature: "4", variety: "3" };

describe("validateFeedback — attribution", () => {
  it("accepts a response attributed to one of today's Services", () => {
    const result = validateFeedback({
      serviceId: "svc-9am",
      ratings: goodRatings,
      comment: "  Great coffee  ",
      todaysServiceIds: ["svc-9am", "svc-11am"],
    });
    expect(result).toEqual({
      serviceId: "svc-9am",
      taste: 5,
      temperature: 4,
      variety: 3,
      comment: "Great coffee",
    });
  });

  it("rejects a Service that isn't happening today", () => {
    expect(() =>
      validateFeedback({
        serviceId: "svc-last-week",
        ratings: goodRatings,
        comment: "",
        todaysServiceIds: ["svc-9am"],
      }),
    ).toThrow(FeedbackValidationError);
  });

  it("requires a Service to be picked", () => {
    expect(() =>
      validateFeedback({
        serviceId: "",
        ratings: goodRatings,
        comment: "",
        todaysServiceIds: ["svc-9am"],
      }),
    ).toThrow(FeedbackValidationError);
  });

  it("declines all submissions when there are no Services today", () => {
    expect(() =>
      validateFeedback({
        serviceId: "svc-9am",
        ratings: goodRatings,
        comment: "",
        todaysServiceIds: [],
      }),
    ).toThrow(FeedbackValidationError);
  });
});

describe("validateFeedback — ratings and comment", () => {
  it("drops a blank comment to null", () => {
    const result = validateFeedback({
      serviceId: "svc-9am",
      ratings: goodRatings,
      comment: "   ",
      todaysServiceIds: ["svc-9am"],
    });
    expect(result.comment).toBeNull();
  });

  it("rejects a rating outside 1–5", () => {
    expect(() =>
      validateFeedback({
        serviceId: "svc-9am",
        ratings: { ...goodRatings, taste: "6" },
        todaysServiceIds: ["svc-9am"],
      }),
    ).toThrow(FeedbackValidationError);
  });

  it("rejects a missing rating", () => {
    expect(() =>
      validateFeedback({
        serviceId: "svc-9am",
        ratings: { taste: "5", temperature: "4" },
        todaysServiceIds: ["svc-9am"],
      }),
    ).toThrow(FeedbackValidationError);
  });

  it("rejects a non-integer rating", () => {
    expect(() =>
      validateFeedback({
        serviceId: "svc-9am",
        ratings: { ...goodRatings, variety: "3.5" },
        todaysServiceIds: ["svc-9am"],
      }),
    ).toThrow(FeedbackValidationError);
  });

  it("covers exactly taste, temperature, and variety", () => {
    expect(FEEDBACK_RATINGS.map((r) => r.id)).toEqual([
      "taste",
      "temperature",
      "variety",
    ]);
  });
});

describe("aggregateFeedback — per-Service aggregation", () => {
  const row = (
    taste: number,
    temperature: number,
    variety: number,
    comment: string | null = null,
  ): FeedbackRow => ({ taste, temperature, variety, comment });

  it("averages each rating, counts responses, and collects non-empty comments", () => {
    const summary = aggregateFeedback([
      row(5, 4, 3, "Loved it"),
      row(4, 4, 5, null),
      row(3, 1, 4, "Too weak"),
    ]);
    expect(summary.responseCount).toBe(3);
    expect(summary.averages).toEqual({ taste: 4, temperature: 3, variety: 4 });
    expect(summary.comments).toEqual(["Loved it", "Too weak"]);
  });

  it("rounds averages to one decimal place", () => {
    const summary = aggregateFeedback([row(5, 5, 5), row(4, 4, 4)]);
    expect(summary.averages).toEqual({ taste: 4.5, temperature: 4.5, variety: 4.5 });
  });

  it("reports an empty summary when there are no responses", () => {
    const summary = aggregateFeedback([]);
    expect(summary).toEqual({
      responseCount: 0,
      averages: null,
      comments: [],
    });
  });
});
