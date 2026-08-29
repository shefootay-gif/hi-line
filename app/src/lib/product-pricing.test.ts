import { describe, expect, it } from "vitest";
import { discountFromSalePrice, salePriceFromDiscount } from "./product-pricing";

describe("product pricing", () => {
  it("calculates the sale price from a percentage", () => {
    expect(salePriceFromDiscount("285", "30")).toBe("199.50");
  });

  it("restores the percentage while editing an existing product", () => {
    expect(discountFromSalePrice("285.00", "199.50")).toBe("30");
    expect(discountFromSalePrice("299.00", "224.00")).toBe("25");
  });

  it("does not create a sale price without a valid discount", () => {
    expect(salePriceFromDiscount("285", "0")).toBe("");
    expect(salePriceFromDiscount("285", "100")).toBe("");
  });
});
