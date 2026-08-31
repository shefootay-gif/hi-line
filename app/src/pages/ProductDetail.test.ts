import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rollOnProducts } from "@/lib/hiLineCatalog";
import ProductDetail from "./ProductDetail";

const query = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useLanguage", () => ({ useLanguage: () => ({ lang: "en", isRTL: false }) }));
vi.mock("@/providers/trpc", () => ({ trpc: {
  auth: { me: { useQuery: () => ({ data: null }) } },
  store: {
    getSeoPages: { useQuery: () => ({ data: [] }) },
    getProductBySlug: { useQuery: query },
    getWishlist: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
    getReviews: { useQuery: () => ({ data: [] }) },
    toggleWishlist: { useMutation: () => ({}) },
    addReview: { useMutation: () => ({}) },
  },
} }));

function markup() {
  return renderToStaticMarkup(createElement(HelmetProvider, null,
    createElement(MemoryRouter, { initialEntries: [`/shop/${rollOnProducts[0].slug}`] },
      createElement(Routes, null, createElement(Route, {
        path: "/shop/:slug", element: createElement(ProductDetail),
      })),
    ),
  ));
}

describe("product detail uses saved admin data", () => {
  beforeEach(() => query.mockReset());
  it("does not replace edited fields with the local seed catalog", () => {
    query.mockReturnValue({ data: {
      ...rollOnProducts[0], nameEn: "Admin updated product", price: "432.00", salePrice: "321.00",
      images: ["/uploads/admin-image.webp"], shortDescriptionEn: "Saved description from admin",
      benefits: [], benefitsAr: [], relatedProductsList: [], stock: 20,
    } });
    const html = markup();
    expect(html).toContain("Admin updated product");
    const container = document.createElement("div");
    container.innerHTML = html;
    expect(container.querySelector(".line-through")?.textContent).toContain("432");
    expect(html).toContain("321.00");
    expect(html).toContain("/uploads/admin-image.webp");
    expect(html).toContain("Saved description from admin");
    expect(html).not.toContain(rollOnProducts[0].nameEn);
  });
  it("does not resurrect a deleted product from the local catalog", () => {
    query.mockReturnValue({ data: null });
    expect(markup()).toContain("Product not found");
  });
  it("reports a failed request instead of showing outdated prices", () => {
    query.mockReturnValue({ isError: true });
    expect(markup()).toContain("Unable to load this product");
  });
});
