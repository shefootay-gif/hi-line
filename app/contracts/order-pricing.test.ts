import { describe, expect, it } from "vitest";
import { calculateOrderPricing } from "./order-pricing";

describe("calculateOrderPricing", () => {
  it("does not apply an automatic discount based on item quantity", () => {
    expect(calculateOrderPricing({ subtotal: 150 })).toEqual({
      subtotal: 150,
      couponDiscount: 0,
      discountAmount: 0,
      shippingFee: 0,
      total: 150,
    });
  });

  it("caps coupons so the products total cannot become negative", () => {
    expect(calculateOrderPricing({
      subtotal: 100,
      couponDiscount: 100,
      shippingFee: 20,
    })).toMatchObject({
      couponDiscount: 100,
      discountAmount: 100,
      total: 20,
    });
  });
});
