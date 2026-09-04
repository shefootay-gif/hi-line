import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OrderItemsList } from "./OrderItemsList";

const items = [{
  id: 1,
  productName: "Tropical Breeze Roll On",
  productNameAr: "رول أون تروبيكال بريز",
  scent: "Tropical Breeze",
  quantity: 2,
  unitPrice: "199.50",
  totalPrice: "399.00",
}];

describe("OrderItemsList", () => {
  it("shows the ordered product, quantity and prices in Arabic", () => {
    const html = renderToStaticMarkup(<OrderItemsList items={items} lang="ar" currency="ج.م" />);
    expect(html).toContain("رول أون تروبيكال بريز");
    expect(html).toContain("الكمية: 2");
    expect(html).toContain("199.50");
    expect(html).toContain("399.00");
  });

  it("shows a clear empty state instead of a blank section", () => {
    expect(renderToStaticMarkup(<OrderItemsList items={[]} lang="en" currency="EGP" />))
      .toContain("No product details recorded");
  });
});
