import { getArabicScentName } from "./translations";

const bundleSlugs = new Set(["tropical-breeze", "voyage", "candy-pop", "sweet-mango", "fragrance-free"].map(scent => `hi-line-deodorant-roll-on-${scent}`));
export const isBundleOffer = (slug: string) => bundleSlugs.has(slug);
export function productScentLabel(slug: string, scent: string, lang: "ar" | "en") {
  if (slug === "hi-line-cica-facial-cleanser" || !scent.trim()) return null;
  if (lang === "en") return scent;
  const translated = getArabicScentName(scent);
  return /fragrance.?free/i.test(scent) ? translated : `برائحة ${translated}`;
}

// Verified artwork bounds: source width/height, x/y, artwork width/height.
// Presentation only: original files, labels and aspect ratios remain untouched.
export const packshotBounds: Record<string, readonly [number, number, number, number, number, number]> = {
  "/products/hi-line-candy-pop.webp": [1200,1110,100,165,1070,840],
  "/products/hi-line-tropical-breeze.webp": [1200,1110,100,165,1070,840],
  "/products/hi-line-voyage.webp": [1200,1110,100,165,1070,840],
  "/products/hi-line-sweet-mango.webp": [1200,1110,100,165,1070,840],
  "/products/hi-line-fragrance-free.webp": [1200,1110,100,165,1070,840],
  "/products/hi-line-candy-pop-single-sale-30.jpeg": [506,1600,22,330,484,1040],
  "/products/hi-line-tropical-breeze-single-sale-30.jpeg": [506,1600,22,330,484,1040],
  "/products/hi-line-voyage-single-sale-30.jpeg": [516,1600,23,330,493,1040],
  "/products/hi-line-sweet-mango-single-sale-30.jpeg": [546,1600,28,330,518,1040],
  "/products/hi-line-fragrance-free-single-sale-30.jpeg": [498,1600,17,330,481,1040],
  "/products/hi-line-body-mist-candy-cloud.webp": [898,1751,255,44,383,1619],
  "/products/hi-line-body-mist-starry-night.webp": [1024,1536,338,57,348,1423],
  "/products/hi-line-body-mist-secret-touch.webp": [887,1774,282,200,327,1390],
  "/products/hi-line-cica-facial-cleanser.webp": [1086,1448,375,93,330,1225],
};
