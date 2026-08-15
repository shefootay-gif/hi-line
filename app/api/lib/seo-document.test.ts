import { describe, expect, it } from "vitest";
import { injectSeoDocument } from "./seo-document";

const template = '<!doctype html><html lang="en"><head><title>App</title></head><body><div id="root"></div></body></html>';

describe("injectSeoDocument", () => {
  it("adds indexable bilingual metadata and readable fallback content", () => {
    const html = injectSeoDocument(template, "https://bellorypharma.com", "/ar/shop");

    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain("الدفع عند الاستلام");
    expect(html).toContain("index, follow, max-image-preview:large");
  });

  it("puts product data and offer schema in the initial HTML", () => {
    const html = injectSeoDocument(template, "https://bellorypharma.com", "/en/shop/rose", {
      slug: "rose",
      nameEn: "Rose Roll-On",
      nameAr: "رول أون روز",
      descriptionEn: "Fresh daily protection.",
      descriptionAr: "انتعاش يومي.",
      shortDescriptionEn: null,
      shortDescriptionAr: null,
      price: "120.00",
      salePrice: "99.00",
      stock: 3,
      sku: "ROSE-1",
      images: ["/products/rose.webp"],
    });

    expect(html).toContain("Rose Roll-On | Hi Line Pro Care");
    expect(html).toContain('"@type":"Product"');
    expect(html).toContain('"price":"99.00"');
    expect(html).toContain("Fresh daily protection.");
  });

  it("marks unknown SPA routes as noindex", () => {
    const html = injectSeoDocument(template, "https://bellorypharma.com", "/en/not-real");
    expect(html).toContain('content="noindex, nofollow"');
  });
});
