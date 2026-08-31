// Older imports and some MySQL drivers return JSON columns as strings.
// Normalize before constructing IN (...) so JSON text cannot become one SQL value.
export function relatedProductIds(value: unknown): number[] {
  let parsed: unknown = value;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return []; }
  }
  if (!Array.isArray(parsed)) return [];
  return [...new Set(parsed.filter((id): id is number =>
    typeof id === "number" && Number.isSafeInteger(id) && id > 0,
  ))];
}
