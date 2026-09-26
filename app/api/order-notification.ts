type SellerOrderItem = {
  productName: string;
  productNameAr?: string | null;
  scent?: string | null;
  quantity: number;
  totalPrice: string;
};

export function formatSellerOrderNotification(input: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  governorate?: string;
  city?: string;
  notes?: string;
  subtotal: string;
  shippingFee: string;
  discountAmount: string;
  total: string;
  items: SellerOrderItem[];
}) {
  const address = [input.shippingAddress, input.city, input.governorate]
    .filter(Boolean)
    .join("، ");
  const items = input.items
    .map((item) => {
      const name = item.productNameAr || item.productName;
      const scent = item.scent ? ` (${item.scent})` : "";
      return `- ${name}${scent} × ${item.quantity} = ${item.totalPrice} ج.م`;
    })
    .join("\n");
  const discount = Number.parseFloat(input.discountAmount);

  return [
    "طلب جديد من الموقع 🛍️",
    `رقم الطلب: ${input.orderNumber}`,
    `العميل: ${input.customerName}`,
    `الهاتف: ${input.customerPhone}`,
    `العنوان: ${address}`,
    "",
    "المنتجات:",
    items,
    "",
    `الإجمالي الفرعي: ${input.subtotal} ج.م`,
    ...(discount > 0 ? [`الخصم: ${input.discountAmount} ج.م`] : []),
    `الشحن: ${input.shippingFee} ج.م`,
    `الإجمالي: ${input.total} ج.م`,
    "طريقة الدفع: الدفع عند الاستلام",
    ...(input.notes ? [`ملاحظات: ${input.notes}`] : []),
  ].join("\n");
}
