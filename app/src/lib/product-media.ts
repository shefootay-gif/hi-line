export const PRODUCT_IMAGE_FALLBACK = "/products/hero-product.jpg";

export function normalizeProductImages(
  value: string[] | string | null | undefined,
): string[] {
  let candidates: unknown = value;

  if (typeof value === "string") {
    try {
      candidates = JSON.parse(value);
    } catch {
      candidates = [value];
    }
  }

  if (!Array.isArray(candidates)) return [];

  return candidates.filter(
    (image): image is string => typeof image === "string" && image.trim().length > 0,
  );
}

export function productImage(
  value: string[] | string | null | undefined,
): string {
  return normalizeProductImages(value)[0] ?? PRODUCT_IMAGE_FALLBACK;
}
