export function getAffectedRows(result: unknown): number {
  const packet = Array.isArray(result) ? result[0] : result;
  return Number(
    (packet as { affectedRows?: number } | undefined)?.affectedRows ?? 0
  );
}
