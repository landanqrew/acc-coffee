import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { requireEnv } from "@/lib/env";

export const db = drizzle(neon(requireEnv("DATABASE_URL")));
