import { describe, expect, it } from "vitest";
import { formatSellerOrderNotification } from "./order-notification";

describe("formatSellerOrderNotification", () => {
  it("includes the order, customer, products and totals", () => {
    const message = formatSellerOrderNotification({
      orderNumber: "HL123",
      customerName: "أحمد محمد",
      customerPhone: "01000000000",
      shippingAddress: "شارع النيل",
      governorate: "القاهرة",
      city: "مدينة نصر",
      subtotal: "448.00",
      shippingFee: "50.00",
      discountAmount: "0.00",
      total: "498.00",
      items: [{
        productName: "Body Mist",
        productNameAr: "بادي ميست",
        scent: "Candy Cloud",
        quantity: 2,
        totalPrice: "448.00",
      }],
    });

    expect(message).toContain("رقم الطلب: HL123");
    expect(message).toContain("العميل: أحمد محمد");
    expect(message).toContain("بادي ميست (Candy Cloud) × 2 = 448.00 ج.م");
    expect(message).toContain("الإجمالي: 498.00 ج.م");
    expect(message).not.toContain("الخصم:");
  });
});
