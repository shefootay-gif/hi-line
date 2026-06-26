export type CatalogProduct = {
  id: number;
  brand: "Hi Line";
  section: "Roll On" | "Body Lotion" | "Body Mist" | "Wash / Cleanser";
  category: string;
  nameEn: string;
  nameAr: string;
  scent: string;
  scentColor: string;
  slug: string;
  price: string;
  salePrice: string;
  originalPrice: string;
  discountLabel: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  descriptionEn: string;
  images: string[];
};

export const rollOnProducts: CatalogProduct[] = [
  {
    id: 1,
    brand: "Hi Line",
    section: "Roll On",
    category: "Roll On",
    nameEn: "Hi Line roll on whiting deodorant",
    nameAr: "هاي لاين رول أون مبيض مزيل عرق",
    scent: "Sweet mango",
    scentColor: "#F28A24",
    slug: "hi-line-deodorant-roll-on-sweet-mango",
    price: "570.00",
    salePrice: "285.00",
    originalPrice: "570.00",
    discountLabel: "50% OFF",
    shortDescriptionEn: "Whiting deodorant roll on with Sweet mango scent.",
    shortDescriptionAr: "رول أون مبيض مزيل عرق برائحة سويت مانجو.",
    descriptionEn: "Hi Line Roll On whiting deodorant with 48-hour freshness.",
    images: ["/products/hi-line-sweet-mango.webp"],
  },
  {
    id: 2,
    brand: "Hi Line",
    section: "Roll On",
    category: "Roll On",
    nameEn: "Hi Line roll on whiting deodorant",
    nameAr: "هاي لاين رول أون مبيض مزيل عرق",
    scent: "Tropical Breeze",
    scentColor: "#159C73",
    slug: "hi-line-deodorant-roll-on-tropical-breeze",
    price: "570.00",
    salePrice: "285.00",
    originalPrice: "570.00",
    discountLabel: "50% OFF",
    shortDescriptionEn: "Whiting deodorant roll on with Tropical Breeze scent.",
    shortDescriptionAr: "رول أون مبيض مزيل عرق برائحة تروبيكال بريز.",
    descriptionEn: "Hi Line Roll On whiting deodorant with 48-hour freshness.",
    images: ["/products/hi-line-tropical-breeze.webp"],
  },
  {
    id: 3,
    brand: "Hi Line",
    section: "Roll On",
    category: "Roll On",
    nameEn: "Hi Line roll on whiting deodorant",
    nameAr: "هاي لاين رول أون مبيض مزيل عرق",
    scent: "Voyage",
    scentColor: "#1E6D9E",
    slug: "hi-line-deodorant-roll-on-voyage",
    price: "570.00",
    salePrice: "285.00",
    originalPrice: "570.00",
    discountLabel: "50% OFF",
    shortDescriptionEn: "Whiting deodorant roll on with Voyage scent.",
    shortDescriptionAr: "رول أون مبيض مزيل عرق برائحة فوياج.",
    descriptionEn: "Hi Line Roll On whiting deodorant with 48-hour freshness.",
    images: ["/products/hi-line-voyage.webp"],
  },
  {
    id: 4,
    brand: "Hi Line",
    section: "Roll On",
    category: "Roll On",
    nameEn: "Hi Line roll on whiting deodorant",
    nameAr: "هاي لاين رول أون مبيض مزيل عرق",
    scent: "Candy pop",
    scentColor: "#C85BAA",
    slug: "hi-line-deodorant-roll-on-candy-pop",
    price: "570.00",
    salePrice: "285.00",
    originalPrice: "570.00",
    discountLabel: "50% OFF",
    shortDescriptionEn: "Whiting deodorant roll on with Candy pop scent.",
    shortDescriptionAr: "رول أون مبيض مزيل عرق برائحة كاندي بوب.",
    descriptionEn: "Hi Line Roll On whiting deodorant with 48-hour freshness.",
    images: ["/products/hi-line-candy-pop.webp"],
  },
  {
    id: 5,
    brand: "Hi Line",
    section: "Roll On",
    category: "Roll On",
    nameEn: "Hi Line roll on whiting deodorant",
    nameAr: "هاي لاين رول أون مبيض مزيل عرق",
    scent: "Fragrance free",
    scentColor: "#222222",
    slug: "hi-line-deodorant-roll-on-fragrance-free",
    price: "570.00",
    salePrice: "285.00",
    originalPrice: "570.00",
    discountLabel: "50% OFF",
    shortDescriptionEn: "Whiting deodorant roll on with Fragrance free formula.",
    shortDescriptionAr: "رول أون مبيض مزيل عرق بدون عطر.",
    descriptionEn: "Hi Line Roll On whiting deodorant with 48-hour freshness.",
    images: ["/products/hi-line-fragrance-free.webp"],
  },
];

export const catalogProducts = [...rollOnProducts];

export function findCatalogProductBySlug(slug?: string) {
  return catalogProducts.find((product) => product.slug === slug) ?? null;
}
