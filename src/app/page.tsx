import { sql } from "drizzle-orm";
import { db } from "@/db";

// Health-proof page: always read from the database at request time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await db.execute<{ now: string }>(sql`select now() as now`);
  const serverTime = new Date(result.rows[0].now).toISOString();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">acc-coffee</h1>
      <p className="text-neutral-600">
        Coffee operations for Antioch Community Church · College Station
      </p>
      <p className="text-sm text-neutral-400">
        Database connected — server time {serverTime}
      </p>
    </main>
  );
}
