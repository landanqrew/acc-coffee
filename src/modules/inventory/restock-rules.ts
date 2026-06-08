/**
 * A Restock Alert to dispatch: a Supply has just crossed below its minimum. The
 * email names the Supply, its current count, and its minimum.
 */
export type RestockAlert = {
  supplyId: string;
  supplyName: string;
  count: number;
  minimum: number;
};

/**
 * Decides whether recording `newCount` for a Supply should fire a Restock Alert.
 * Alerts fire on the crossing only: the new count is strictly below the minimum
 * AND the previous count was not already below it (a null previous count — never
 * counted — counts as "not below", so a first count below minimum alerts). A
 * Supply with no minimum never alerts.
 */
export function decideRestockAlert(input: {
  supply: { id: string; name: string; minimumLevel: number | null };
  previousCount: number | null;
  newCount: number;
}): RestockAlert | null {
  const { supply, previousCount, newCount } = input;
  if (supply.minimumLevel === null) return null;

  const min = supply.minimumLevel;
  const nowBelow = newCount < min;
  if (!nowBelow) return null;

  const wasBelow = previousCount !== null && previousCount < min;
  if (wasBelow) return null;

  return { supplyId: supply.id, supplyName: supply.name, count: newCount, minimum: min };
}
