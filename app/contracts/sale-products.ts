export const SINGLE_ROLL_ON_SALE_PRODUCTS = [
  {
    slug: "hi-line-candy-pop-single-sale-30",
    sku: "HL-CP-S30",
    scent: "Candy Pop",
    scentAr: "كاندي بوب",
    scentColor: "#C85BAA",
    image: "/products/hi-line-candy-pop-single-sale-30.jpeg",
  },
  {
    slug: "hi-line-tropical-breeze-single-sale-30",
    sku: "HL-TB-S30",
    scent: "Tropical Breeze",
    scentAr: "تروبيكال بريز",
    scentColor: "#159C73",
    image: "/products/hi-line-tropical-breeze-single-sale-30.jpeg",
  },
  {
    slug: "hi-line-voyage-single-sale-30",
    sku: "HL-VG-S30",
    scent: "Voyage",
    scentAr: "فوياج",
    scentColor: "#1E6D9E",
    image: "/products/hi-line-voyage-single-sale-30.jpeg",
  },
  {
    slug: "hi-line-sweet-mango-single-sale-30",
    sku: "HL-SM-S30",
    scent: "Sweet Mango",
    scentAr: "سويت مانجو",
    scentColor: "#F28A24",
    image: "/products/hi-line-sweet-mango-single-sale-30.jpeg",
  },
  {
    slug: "hi-line-fragrance-free-single-sale-30",
    sku: "HL-FF-S30",
    scent: "Fragrance Free",
    scentAr: "بدون عطر",
    scentColor: "#222222",
    image: "/products/hi-line-fragrance-free-single-sale-30.jpeg",
  },
] as const satisfies ReadonlyArray<{
  slug: string;
  sku: string;
  scent: string;
  scentAr: string;
  scentColor: string;
  image: string;
}>;

export const SINGLE_ROLL_ON_SALE_PRICE = {
  packQuantity: 1,
  price: "285.00",
  salePrice: "199.50",
  discountPercent: 30,
} as const;

export const SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE =
  SINGLE_ROLL_ON_SALE_PRODUCTS.map(product => ({
    ...product,
    ...SINGLE_ROLL_ON_SALE_PRICE,
  }));
