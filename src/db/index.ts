import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { requireEnv } from "@/lib/env";
import * as schema from "@/db/schema";

export const db = drizzle(neon(requireEnv("DATABASE_URL")), { schema });
