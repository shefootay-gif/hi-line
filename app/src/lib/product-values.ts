export function listValue<T>(
  value: T[] | string | null | undefined
): T[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

export type RecentlyViewedProduct = {
  id: number;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  price: string;
  images: string[] | string | null;
  scentColor: string | null;
};

export function isRecentlyViewedProduct(
  value: unknown
): value is RecentlyViewedProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "number" &&
    typeof product.nameEn === "string" &&
    typeof product.slug === "string" &&
    typeof product.price === "string"
  );
}
