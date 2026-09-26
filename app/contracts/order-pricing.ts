export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateOrderPricing(input: {
  subtotal: number;
  couponDiscount?: number;
  shippingFee?: number;
}) {
  const subtotal = roundMoney(Math.max(0, input.subtotal));
  const couponDiscount = roundMoney(
    Math.min(Math.max(0, input.couponDiscount ?? 0), subtotal)
  );
  const shippingFee = roundMoney(Math.max(0, input.shippingFee ?? 0));
  const discountAmount = couponDiscount;
  const total = roundMoney(subtotal - discountAmount + shippingFee);

  return {
    subtotal,
    couponDiscount,
    discountAmount,
    shippingFee,
    total,
  };
}
