import { describe, expect, it } from "vitest";
import { NeonDbError } from "@neondatabase/serverless";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { failureMessage } from "./db-errors";

const CHECK_VIOLATION =
  'new row for relation "stock_count" violates check constraint "stock_count_quarter_step"';

function postgresError(message: string, code: string | undefined) {
  const err = new NeonDbError(message);
  err.code = code;
  return err;
}

describe("failureMessage", () => {
  it("renders a Postgres error thrown directly (db.batch)", () => {
    const err = postgresError(CHECK_VIOLATION, "23514");
    expect(failureMessage(err, "Couldn't file the report")).toBe(
      `Couldn't file the report: ${CHECK_VIOLATION}`,
    );
  });

  it("renders a Postgres error wrapped by drizzle (single queries)", () => {
    const err = new DrizzleQueryError("insert ...", [], postgresError(CHECK_VIOLATION, "23514"));
    expect(failureMessage(err, "Couldn't record the count")).toBe(
      `Couldn't record the count: ${CHECK_VIOLATION}`,
    );
  });

  it("renders non-constraint Postgres errors too", () => {
    const err = postgresError('invalid input syntax for type numeric: "abc"', "22P02");
    expect(failureMessage(err, "Couldn't save the supply")).toBe(
      'Couldn\'t save the supply: invalid input syntax for type numeric: "abc"',
    );
  });

  it("falls back to the generic message for driver errors without a SQLSTATE", () => {
    const err = postgresError("Error connecting to database: fetch failed", undefined);
    expect(failureMessage(err, "Couldn't file the report")).toBe(
      "Couldn't file the report. Please try again.",
    );
  });

  it("falls back to the generic message for non-database errors", () => {
    expect(failureMessage(new Error("Resend is down"), "Couldn't save")).toBe(
      "Couldn't save. Please try again.",
    );
    expect(failureMessage("boom", "Couldn't save")).toBe("Couldn't save. Please try again.");
  });
});
