import { describe, expect, it } from "vitest";
import { normalizeProductImages, productImage } from "./product-media";

describe("product media", () => {
  it("keeps each product's JSON-encoded image list independent", () => {
    expect(normalizeProductImages('["/products/one.webp"]')).toEqual([
      "/products/one.webp",
    ]);
    expect(normalizeProductImages('["/products/two.webp"]')).toEqual([
      "/products/two.webp",
    ]);
  });

  it("uses the fallback only when a product has no valid image", () => {
    expect(productImage(["/products/one.webp"])).toBe("/products/one.webp");
    expect(productImage(null)).toBe("/products/hero-product.jpg");
  });
});
