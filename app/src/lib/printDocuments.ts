type PrintableOrderItem = {
  productName: string;
  scent: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type PrintableOrder = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: Date;
  paymentMethod: string | null;
  total: string;
  items: PrintableOrderItem[];
};

export type PrintDirection = "rtl" | "ltr";

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapedHtml = (rawText: string | number) =>
  String(rawText).replace(/[&<>"']/g, character => htmlEntities[character] ?? character);

const invoiceRows = (orderItems: PrintableOrderItem[]) =>
  orderItems
    .map(orderItem => {
      const scent = orderItem.scent ? ` (${escapedHtml(orderItem.scent)})` : "";
      return `<tr><td>${escapedHtml(orderItem.productName)}${scent}</td><td>${orderItem.quantity}</td><td>${escapedHtml(orderItem.unitPrice)} EGP</td><td>${escapedHtml(orderItem.totalPrice)} EGP</td></tr>`;
    })
    .join("");

const printScript = '<script>setTimeout(() => window.print(), 500);</script>';

const invoiceStyles = (direction: PrintDirection) => `<style>
body { font-family: 'Inter', 'Cairo', sans-serif; padding: 40px; color: #333; }
.header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
.logo { font-size: 24px; font-weight: bold; color: #4B1C71; }
.invoice-title { font-size: 20px; color: #666; }
.info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
th, td { border: 1px solid #ddd; padding: 12px; text-align: ${direction === "rtl" ? "right" : "left"}; }
th { background-color: #f9f9f9; }
.total-section { text-align: ${direction === "rtl" ? "left" : "right"}; font-size: 18px; font-weight: bold; }
@media print { @page { size: A4; margin: 0; } body { padding: 2cm; } }
</style>`;

const shippingLabelStyles = `<style>
body { font-family: 'Inter', 'Cairo', sans-serif; padding: 20px; display: flex; justify-content: center; background: #eee; }
.label { width: 10cm; height: 15cm; background: #fff; padding: 20px; border: 1px solid #000; box-sizing: border-box; }
.header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 15px; text-align: center; font-weight: bold; font-size: 24px; }
.barcode { text-align: center; margin: 20px 0; font-family: 'Libre Barcode 39', monospace; font-size: 48px; }
.section { border: 1px solid #000; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
.title { font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase; }
.content { font-size: 18px; font-weight: bold; }
.cod { font-size: 24px; font-weight: bold; text-align: center; border: 2px dashed #000; padding: 10px; margin-top: 20px; }
@media print { @page { size: 10cm 15cm; margin: 0; } body { padding: 0; background: #fff; } .label { border: none; } }
</style>`;

export const buildInvoiceDocument = (order: PrintableOrder, direction: PrintDirection) => {
  const paymentMethod = order.paymentMethod?.replace(/_/g, " ") ?? "";

  return `<html dir="${direction}"><head><title>Invoice #${escapedHtml(order.orderNumber)}</title>${invoiceStyles(direction)}</head><body><div class="header"><div class="logo">Hi Line Pro Care</div><div class="invoice-title">INVOICE</div></div>
<div class="info-section"><div><strong>Bill To:</strong><br/>${escapedHtml(order.customerName)}<br/>${escapedHtml(order.customerPhone)}<br/>${escapedHtml(order.shippingAddress)}</div>
<div><strong>Order #:</strong> ${escapedHtml(order.orderNumber)}<br/><strong>Date:</strong> ${order.createdAt.toLocaleDateString()}<br/><strong>Payment:</strong> ${escapedHtml(paymentMethod)}</div></div>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${invoiceRows(order.items)}</tbody></table>
<div class="total-section">Grand Total: ${escapedHtml(order.total)} EGP</div>${printScript}</body></html>`;
};

export const buildShippingLabelDocument = (order: PrintableOrder, direction: PrintDirection) => {
  const orderNumber = escapedHtml(order.orderNumber);
  const paymentStatus =
    order.paymentMethod === "cash_on_delivery"
      ? `<div class="cod">COD: ${escapedHtml(order.total)} EGP</div>`
      : `<div class="cod" style="color: green; border-color: green;">PAID (${escapedHtml(order.paymentMethod ?? "")})</div>`;
  const itemCount = order.items.reduce((quantity, orderItem) => quantity + orderItem.quantity, 0);

  return `<html dir="${direction}"><head><title>Shipping Label #${orderNumber}</title>${shippingLabelStyles}<link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet"></head><body>
<div class="label"><div class="header">HI LINE - SHIPPING</div><div class="section"><div class="title">Deliver To</div>
<div class="content">${escapedHtml(order.customerName)}<br/>${escapedHtml(order.customerPhone)}<br/>${escapedHtml(order.shippingAddress)}</div></div>
<div class="section"><div class="title">Order Details</div><div class="content" style="font-size: 14px;">Order #: ${orderNumber}<br/>Items: ${itemCount}</div></div>
<div class="barcode">*${orderNumber}*</div><div style="text-align:center; font-family:monospace;">${orderNumber}</div>${paymentStatus}</div>${printScript}</body></html>`;
};
