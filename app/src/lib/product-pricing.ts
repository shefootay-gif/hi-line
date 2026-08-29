export function salePriceFromDiscount(
  priceValue: string,
  discountValue: string
): string {
  const price = Number(priceValue);
  const discount = Number(discountValue);

  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(discount) ||
    discount <= 0 ||
    discount >= 100
  ) {
    return "";
  }

  return (price * (1 - discount / 100)).toFixed(2);
}

export function discountFromSalePrice(
  priceValue: string,
  salePriceValue: string | null | undefined
): string {
  const price = Number(priceValue);
  const salePrice = Number(salePriceValue);

  if (
    !salePriceValue ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(salePrice) ||
    salePrice <= 0 ||
    salePrice >= price
  ) {
    return "";
  }

  return String(Math.round((1 - salePrice / price) * 100));
}
