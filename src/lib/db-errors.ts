import { NeonDbError } from "@neondatabase/serverless";

/**
 * The message Postgres rejected a query with, or undefined when the failure
 * didn't come from Postgres (network, email, bugs). Single queries arrive
 * wrapped in drizzle's DrizzleQueryError with the original as `cause`;
 * `db.batch` throws the Neon error directly. Only Postgres errors carry a
 * SQLSTATE `code` — the driver's own connection failures don't.
 */
function databaseErrorMessage(err: unknown): string | undefined {
  const candidates = [err, err instanceof Error ? err.cause : undefined];
  const pgError = candidates.find(
    (c): c is NeonDbError => c instanceof NeonDbError && Boolean(c.code),
  );
  return pgError?.message;
}

/**
 * A user-facing message for an unexpected action failure: the database's own
 * reason when Postgres rejected the change, otherwise a generic retry prompt.
 */
export function failureMessage(err: unknown, summary: string): string {
  const reason = databaseErrorMessage(err);
  return reason ? `${summary}: ${reason}` : `${summary}. Please try again.`;
}
