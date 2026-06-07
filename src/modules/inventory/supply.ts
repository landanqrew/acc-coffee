import { asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { supplies } from "@/db/schema";
import type { Role } from "@/modules/auth/roles";
import {
  assertCanManageSupplies,
  SupplyValidationError,
  validateSupplyInput,
  type Supply,
  type SupplyInput,
} from "./supply-rules";

export type { Supply, SupplyInput } from "./supply-rules";
export { SupplyValidationError } from "./supply-rules";

/** Creates a Supply. Lead-only. */
export async function createSupply(
  actorRole: Role | null | undefined,
  input: SupplyInput,
): Promise<Supply> {
  assertCanManageSupplies(actorRole);
  const values = validateSupplyInput(input);
  const [row] = await db.insert(supplies).values(values).returning();
  return row;
}

/** Edits an existing Supply's name, designation, and minimum level. Lead-only. */
export async function updateSupply(
  actorRole: Role | null | undefined,
  id: string,
  input: SupplyInput,
): Promise<Supply> {
  assertCanManageSupplies(actorRole);
  const values = validateSupplyInput(input);
  const [row] = await db
    .update(supplies)
    .set(values)
    .where(eq(supplies.id, id))
    .returning();
  if (!row) {
    throw new SupplyValidationError("That supply no longer exists.");
  }
  return row;
}

/** Retires a Supply (soft delete) — it leaves active views but its history stays. */
export async function retireSupply(
  actorRole: Role | null | undefined,
  id: string,
): Promise<void> {
  assertCanManageSupplies(actorRole);
  await db
    .update(supplies)
    .set({ retiredAt: new Date() })
    .where(eq(supplies.id, id));
}

/** Active (non-retired) Supplies, alphabetized. Readable by the whole team. */
export async function listActiveSupplies(): Promise<Supply[]> {
  return db.query.supplies.findMany({
    where: isNull(supplies.retiredAt),
    orderBy: [asc(supplies.name)],
  });
}

/** A single Supply by id, or null. */
export async function getSupply(id: string): Promise<Supply | null> {
  const row = await db.query.supplies.findFirst({ where: eq(supplies.id, id) });
  return row ?? null;
}
