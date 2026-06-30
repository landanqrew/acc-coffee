import { assertLead, type Role } from "@/modules/auth/roles";

/**
 * A Supply as stored. `retiredAt === null` means active; a non-null value is the
 * moment it was retired (history is preserved — the row is never deleted).
 */
export type Supply = {
  id: string;
  name: string;
  designated: boolean;
  minimumLevel: number | null;
  retiredAt: Date | null;
  createdAt: Date;
};

export type SupplyInput = {
  name: string;
  designated?: boolean;
  minimumLevel?: number | null;
};

/** The validated, normalized fields ready to persist. */
export type ValidatedSupply = {
  name: string;
  designated: boolean;
  minimumLevel: number | null;
};

const MAX_NAME_LENGTH = 100;

/** A caller-facing problem with Supply input (bad name, negative minimum, …). */
export class SupplyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupplyValidationError";
  }
}

/**
 * Normalizes and validates Supply input. A name is required; the minimum level,
 * when given, must be a number of zero or more (decimals allowed); designation
 * defaults off.
 */
export function validateSupplyInput(input: SupplyInput): ValidatedSupply {
  const name = input.name?.trim() ?? "";
  if (!name) {
    throw new SupplyValidationError("A supply needs a name.");
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new SupplyValidationError(
      `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
    );
  }

  let minimumLevel: number | null = null;
  if (input.minimumLevel != null) {
    if (!Number.isFinite(input.minimumLevel) || input.minimumLevel < 0) {
      throw new SupplyValidationError(
        "Minimum level must be zero or more.",
      );
    }
    minimumLevel = input.minimumLevel;
  }

  return { name, designated: input.designated ?? false, minimumLevel };
}

/** Only a Lead may manage the Supply catalog. Throws for anyone else. */
export function assertCanManageSupplies(role: Role | null | undefined): void {
  assertLead(role);
}

/** A Supply is active until it is retired. */
export function isActive(supply: Pick<Supply, "retiredAt">): boolean {
  return supply.retiredAt == null;
}

/** Active Supplies only — retired ones are kept for history but hidden here. */
export function selectActive<T extends { retiredAt: Date | null }>(
  supplies: readonly T[],
): T[] {
  return supplies.filter((s) => s.retiredAt == null);
}
