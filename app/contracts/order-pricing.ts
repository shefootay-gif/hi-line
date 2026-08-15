export const VOLUME_DISCOUNT_MIN_ITEMS = 3;
export const VOLUME_DISCOUNT_RATE = 0.15;

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateVolumeDiscount(subtotal: number, itemCount: number) {
  if (itemCount < VOLUME_DISCOUNT_MIN_ITEMS) return 0;
  return roundMoney(Math.max(0, subtotal) * VOLUME_DISCOUNT_RATE);
}

export function calculateOrderPricing(input: {
  subtotal: number;
  itemCount: number;
  couponDiscount?: number;
  shippingFee?: number;
}) {
  const subtotal = roundMoney(Math.max(0, input.subtotal));
  const volumeDiscount = calculateVolumeDiscount(subtotal, input.itemCount);
  const couponDiscount = roundMoney(
    Math.min(
      Math.max(0, input.couponDiscount ?? 0),
      Math.max(0, subtotal - volumeDiscount)
    )
  );
  const shippingFee = roundMoney(Math.max(0, input.shippingFee ?? 0));
  const discountAmount = roundMoney(volumeDiscount + couponDiscount);
  const total = roundMoney(subtotal - discountAmount + shippingFee);

  return {
    subtotal,
    volumeDiscount,
    couponDiscount,
    discountAmount,
    shippingFee,
    total,
  };
}
