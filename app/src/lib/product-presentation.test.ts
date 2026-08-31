import { expect, it } from "vitest";
import { rollOnProducts } from "./hiLineCatalog";
import { CARE_SALE_PRODUCTS } from "@contracts/care-sale-products";
import { isBundleOffer, productScentLabel, packshotBounds } from "./product-presentation";

it("marks only the five original two-piece offers as 1+1", () => {
  expect(rollOnProducts.filter(p => isBundleOffer(p.slug))).toHaveLength(5);
  for (const p of rollOnProducts.slice(5)) expect(isBundleOffer(p.slug)).toBe(false);
  for (const p of CARE_SALE_PRODUCTS) expect(isBundleOffer(p.slug)).toBe(false);
});
it("does not describe the cleanser's Cica ingredient as a fragrance in either language", () => {
  for (const lang of ["ar", "en"] as const) expect(productScentLabel("hi-line-cica-facial-cleanser", "Cica", lang)).toBeNull();
  expect(CARE_SALE_PRODUCTS.find(p => p.categorySlug === "facial-care")?.scent).toBe("Fragrance Free");
});
it("keeps framed artwork inside the stage without stretching and falls back for custom images", () => {
  expect(Object.keys(packshotBounds)).toHaveLength(14);
  for (const [width, height, x, y, cropWidth, cropHeight] of Object.values(packshotBounds)) {
    expect(x).toBeGreaterThanOrEqual(0); expect(y).toBeGreaterThanOrEqual(0);
    expect(x + cropWidth).toBeLessThanOrEqual(width); expect(y + cropHeight).toBeLessThanOrEqual(height);
    expect(72 * cropWidth / cropHeight).toBeLessThan(96);
  }
  expect(packshotBounds["/uploads/custom.jpg"]).toBeUndefined();
});
