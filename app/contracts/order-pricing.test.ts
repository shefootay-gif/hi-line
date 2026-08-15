import { describe, expect, it } from "vitest";
import { calculateOrderPricing } from "./order-pricing";

describe("calculateOrderPricing", () => {
  it("applies one 15% volume discount when the cart has at least three items", () => {
    expect(calculateOrderPricing({ subtotal: 150, itemCount: 3 })).toEqual({
      subtotal: 150,
      volumeDiscount: 22.5,
      couponDiscount: 0,
      discountAmount: 22.5,
      shippingFee: 0,
      total: 127.5,
    });
  });

  it("caps stacked coupons so the products total cannot become negative", () => {
    expect(calculateOrderPricing({
      subtotal: 100,
      itemCount: 3,
      couponDiscount: 100,
      shippingFee: 20,
    })).toMatchObject({
      volumeDiscount: 15,
      couponDiscount: 85,
      discountAmount: 100,
      total: 20,
    });
  });
});
