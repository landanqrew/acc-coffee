import type { Supply } from "@/modules/inventory/supply";

/** The presentational read of a Supply for its card — numbers as bare strings
 * so the card can render them in mono, with an em-dash standing in for "unset". */
export type SupplyCardView = {
  /** Minimum level as a bare number, or "—" when none is set. */
  minimum: string;
  /** Whether a minimum level is set (a zero floor still counts). */
  hasMinimum: boolean;
  /** Designated Supplies are counted on every Service Report. */
  designated: boolean;
};

/** Derives the card view from a Supply. A null minimum reads as no minimum; a
 * zero minimum is a real, intentional floor and is kept. */
export function supplyCardView(
  supply: Pick<Supply, "minimumLevel" | "designated">,
): SupplyCardView {
  const hasMinimum = supply.minimumLevel != null;
  return {
    minimum: hasMinimum ? String(supply.minimumLevel) : "—",
    hasMinimum,
    designated: supply.designated,
  };
}
