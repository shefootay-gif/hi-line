import { describe, expect, it } from "vitest";
import { SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE } from "./sale-products";

describe("single roll-on sale products", () => {
  it("defines five distinct single-item products at exactly 30% off", () => {
    expect(SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE).toHaveLength(5);
    expect(new Set(SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE.map(product => product.slug)).size).toBe(5);
    expect(new Set(SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE.map(product => product.sku)).size).toBe(5);

    for (const product of SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE) {
      expect(product.packQuantity).toBe(1);
      expect(product.price).toBe("285.00");
      expect(product.salePrice).toBe("199.50");
      expect(Math.round((1 - Number(product.salePrice) / Number(product.price)) * 100)).toBe(30);
    }
  });
});
