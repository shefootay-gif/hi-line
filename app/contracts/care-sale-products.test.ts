import { describe, expect, it } from "vitest";
import { CARE_SALE_PRICE, CARE_SALE_PRODUCTS } from "./care-sale-products";

describe("care sale products", () => {
  it("defines the four supplied products with unique SKUs and images", () => {
    expect(CARE_SALE_PRODUCTS).toHaveLength(4);
    expect(new Set(CARE_SALE_PRODUCTS.map(product => product.slug)).size).toBe(4);
    expect(new Set(CARE_SALE_PRODUCTS.map(product => product.sku)).size).toBe(4);
    expect(new Set(CARE_SALE_PRODUCTS.map(product => product.image)).size).toBe(4);
  });

  it("uses the requested public price and 25% sale label", () => {
    expect(CARE_SALE_PRICE.price).toBe("299.00");
    expect(CARE_SALE_PRICE.salePrice).toBe("224.00");
    expect(CARE_SALE_PRICE.discountPercent).toBe(25);
    expect(Math.round((1 - Number(CARE_SALE_PRICE.salePrice) / Number(CARE_SALE_PRICE.price)) * 100)).toBe(25);
  });
});
