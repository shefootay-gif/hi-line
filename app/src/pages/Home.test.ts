import { createElement } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { rollOnProducts } from "@/lib/hiLineCatalog";
import { translations } from "@/lib/translations";
import { SINGLE_ROLL_ON_SALE_PRICE } from "@contracts/sale-products";
import { CARE_SALE_PRICE } from "@contracts/care-sale-products";
import Home from "./Home";

const homepageProducts = [...rollOnProducts, {
  ...rollOnProducts[0], id: 100, slug: "hi-line-cica-facial-cleanser", nameEn: "Hi Line Cica Facial Cleanser", nameAr: "غسول السيكا للوجه", scent: "Cica", images: ["/products/hi-line-cica-facial-cleanser.webp"], price: "299.00", salePrice: "224.00",
}, {
  ...rollOnProducts[0],
  id: 101,
  slug: "additional-care-product",
  nameEn: "Additional care product",
  price: "299.00",
  salePrice: "224.00",
}];

const language = vi.hoisted(() => ({ lang: "ar" as "ar" | "en" }));
vi.mock("@/hooks/useLanguage", () => ({
  useLanguage: () => ({ lang: language.lang, isRTL: language.lang === "ar" }),
}));
vi.mock("@/providers/trpc", () => ({
  trpc: { store: {
    getFaqs: { useQuery: () => ({ data: [] }) },
    getSettings: { useQuery: () => ({ data: {} }) },
    getProducts: { useQuery: () => ({ data: homepageProducts }) },
  } },
}));
vi.mock("gsap", () => ({ gsap: { registerPlugin: vi.fn(), context: () => ({ revert: vi.fn() }) } }));
vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

describe("homepage client content", () => {
  afterEach(cleanup);
  it.each(["ar", "en"] as const)("changes product order in %s", (lang) => {
    language.lang = lang;
    const { container, getByLabelText } = render(createElement(MemoryRouter, null, createElement(Home)));
    const select = getByLabelText(lang === "ar" ? "ترتيب المنتجات" : "Sort products") as HTMLSelectElement;
    const firstLink = () => container.querySelector(".scent-card a")?.getAttribute("href");
    expect(select.value).toBe("oldest");
    expect(firstLink()).toContain(rollOnProducts[0].slug);
    fireEvent.change(select, { target: { value: "newest" } });
    expect(firstLink()).toContain("additional-care-product");
    fireEvent.change(select, { target: { value: "price-asc" } });
    expect(firstLink()).toContain(rollOnProducts[5].slug);
    fireEvent.change(select, { target: { value: "price-desc" } });
    expect(firstLink()).toContain(rollOnProducts[0].slug);
    expect(container.querySelectorAll(".scent-card")).toHaveLength(homepageProducts.length);
  });
  it.each(["ar", "en"] as const)("renders the revised %s homepage", (lang) => {
    language.lang = lang;
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Home)),
    );
    const t = translations[lang];
    const hero = container.querySelector("section")!;
    expect(hero.textContent).toContain(t.lebaneseFormula);
    expect(hero.textContent).toContain(t.naturalIngredients);
    expect(hero.textContent).toContain(t.skinSafeProducts);
    expect(hero.textContent).not.toContain(t.hoursProtection);
    expect(hero.textContent).not.toContain(t.zeroAluminum);
    expect(container.querySelector('img[src="/campaign/beach-collection.jpg"]')).toBeNull();
    expect([...container.querySelectorAll("h2")].map(el => el.textContent)).not.toContain(t.howToUse);
    expect(container.textContent).toContain(t.whyHiLineIntro);
    expect(container.querySelectorAll(".benefit-card")).toHaveLength(4);
    expect(container.textContent).toContain(lang === "ar" ? "مكونات فعالة وآمنة" : "Effective, Safe Ingredients");
    expect(container.textContent).toContain(lang === "ar" ? "إشعارات المنتجات الجديدة" : "new product announcements");
    expect(container.querySelectorAll(".scent-card")).toHaveLength(homepageProducts.length);
    expect(container.querySelector('a[href$="/additional-care-product"]')).not.toBeNull();
    expect(container.querySelectorAll(".scent-card .line-through")).toHaveLength(homepageProducts.length);
    expect([...container.querySelectorAll(".scent-card")].filter(card => card.textContent?.includes("1+1"))).toHaveLength(5);
    const cleanserCard = container.querySelector('a[href$="/hi-line-cica-facial-cleanser"]')?.closest(".scent-card");
    expect(cleanserCard?.querySelector("p")).toBeNull();
    expect(cleanserCard?.querySelector('[data-packshot="normalized"]')).not.toBeNull();
    for (const card of [...container.querySelectorAll(".scent-card")].slice(0, 5)) {
      expect(card.textContent).toContain("285.00");
      expect(card.textContent).toContain("570.00");
      expect(card.textContent).toContain("50% OFF");
    }
  });

  it("preserves separate bundle, single-piece and care offers", () => {
    for (const product of rollOnProducts.slice(0, 5)) {
      expect(product.price).toBe("570.00");
      expect(product.salePrice).toBe("285.00");
    }
    expect(SINGLE_ROLL_ON_SALE_PRICE).toMatchObject({ price: "285.00", salePrice: "199.50", packQuantity: 1 });
    expect(CARE_SALE_PRICE).toMatchObject({ price: "299.00", salePrice: "224.00" });
  });
});
