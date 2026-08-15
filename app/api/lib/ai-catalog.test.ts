import { describe, expect, it } from "vitest";
import { buildAiCatalog } from "./ai-catalog";

describe("buildAiCatalog", () => {
  it("publishes bilingual canonical product facts without customer data", () => {
    const catalog = buildAiCatalog(
      "https://bellorypharma.com",
      [{
        slug: "rose & oud",
        nameEn: "Rose & Oud",
        nameAr: "ورد وعود",
        descriptionEn: "Daily roll-on.",
        descriptionAr: "رول أون يومي.",
        shortDescriptionEn: null,
        shortDescriptionAr: null,
        price: "120.00",
        salePrice: "99.00",
        stock: 4,
      }],
      [{
        questionEn: "How do I pay?",
        questionAr: "كيف أدفع؟",
        answerEn: "Cash on delivery.",
        answerAr: "الدفع عند الاستلام.",
      }],
    );

    expect(catalog).toContain("Price: 99.00 EGP");
    expect(catalog).toContain("Availability: In stock");
    expect(catalog).toContain("/en/shop/rose%20%26%20oud");
    expect(catalog).toContain("الدفع عند الاستلام");
    expect(catalog).not.toContain("customerPhone");
  });
});
