import { describe, expect, it } from "vitest";
import {
  buildInvoiceDocument,
  buildShippingLabelDocument,
  type PrintableOrder,
} from "./printDocuments";

const printableOrder = (paymentMethod = "cash_on_delivery"): PrintableOrder => ({
  orderNumber: "HL-100",
  customerName: '<script>alert("customer")</script>',
  customerPhone: "01000000000",
  shippingAddress: "Cairo & Giza",
  createdAt: new Date("2026-07-18T00:00:00.000Z"),
  paymentMethod,
  total: "250.00",
  items: [
    {
      productName: "Shampoo <Strong>",
      scent: "Rose & Oud",
      quantity: 2,
      unitPrice: "125.00",
      totalPrice: "250.00",
    },
  ],
});

describe("print documents", () => {
  it("builds an RTL A4 invoice with escaped customer and product values", () => {
    const invoiceDocument = buildInvoiceDocument(printableOrder(), "rtl");

    expect(invoiceDocument).toContain('<html dir="rtl">');
    expect(invoiceDocument).toContain("@page { size: A4;");
    expect(invoiceDocument).toContain(
      "&lt;script&gt;alert(&quot;customer&quot;)&lt;/script&gt;"
    );
    expect(invoiceDocument).toContain("Shampoo &lt;Strong&gt; (Rose &amp; Oud)");
    expect(invoiceDocument).not.toContain('<script>alert("customer")</script>');
  });

  it.each([
    ["cash on delivery", "cash_on_delivery", "COD: 250.00 EGP"],
    ["prepaid", "paymob", "PAID (paymob)"],
  ])("builds a 10x15 %s shipping label", (_scenario, method, paymentText) => {
    const labelDocument = buildShippingLabelDocument(
      printableOrder(method),
      "ltr"
    );

    expect(labelDocument).toContain('<html dir="ltr">');
    expect(labelDocument).toContain("@page { size: 10cm 15cm;");
    expect(labelDocument).toContain("Items: 2");
    expect(labelDocument).toContain(paymentText);
    expect(labelDocument).not.toContain('<script>alert("customer")</script>');
  });
});
