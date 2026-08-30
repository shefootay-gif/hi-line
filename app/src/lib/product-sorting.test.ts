import { describe, expect, it } from "vitest";
import { sortProducts } from "./product-sorting";

describe("product sorting", () => {
  const products = [
    { id: 3, price: "299.00", salePrice: "224.00" },
    { id: 1, price: "570.00", salePrice: "285.00" },
    { id: 2, price: "285.00", salePrice: "199.50" },
    { id: 4, price: "210.00", salePrice: null },
  ];
  it.each([
    ["oldest", [1, 2, 3, 4]],
    ["newest", [4, 3, 2, 1]],
    ["price-asc", [2, 4, 3, 1]],
    ["price-desc", [1, 3, 4, 2]],
  ] as const)("sorts by %s without changing the source", (sort, ids) => {
    expect(sortProducts(products, sort).map(p => p.id)).toEqual(ids);
    expect(products.map(p => p.id)).toEqual([3, 1, 2, 4]);
  });
  it("uses creation dates when available and IDs to break ties", () => {
    const dated = products.map(p => ({ ...p, createdAt: p.id === 4 ? "2020-01-01" : "2026-01-01" }));
    expect(sortProducts(dated, "oldest").map(p => p.id)).toEqual([4, 1, 2, 3]);
    expect(sortProducts([], "oldest")).toEqual([]);
  });
});
