export const PRIMARY_PRODUCT_CATEGORY = {
  slug: "deodorant-roll-on",
  nameEn: "Deodorant Roll On",
  nameAr: "رول أون مزيل عرق",
} as const;

export const LEGACY_MARKETING_CATEGORY_SLUGS = [
  "all-products",
  "fresh-scents",
  "fruity-scents",
  "fragrance-free",
  "summer-collection",
  "best-sellers",
  "offers",
] as const;

export function isPrimaryProductCategory(slug: string) {
  return slug === PRIMARY_PRODUCT_CATEGORY.slug;
}
