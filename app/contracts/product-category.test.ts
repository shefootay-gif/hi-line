import { describe, expect, it } from "vitest";
import {
  PRIMARY_PRODUCT_CATEGORY,
  isPrimaryProductCategory,
} from "./product-category";

describe("primary product category", () => {
  it("uses one stable bilingual category for all current products", () => {
    expect(PRIMARY_PRODUCT_CATEGORY).toEqual({
      slug: "deodorant-roll-on",
      nameEn: "Deodorant Roll On",
      nameAr: "رول أون مزيل عرق",
    });
    expect(isPrimaryProductCategory("deodorant-roll-on")).toBe(true);
    expect(isPrimaryProductCategory("fresh-scents")).toBe(false);
  });
});
