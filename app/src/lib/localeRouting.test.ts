import { describe, expect, it } from "vitest";
import {
  localeFromPath,
  pathForLocale,
  pathWithoutLocale,
  preferredStorefrontLocale,
  storefrontEntryLocale,
} from "./localeRouting";

describe("locale routing", () => {
  it.each([
    ["/ar/shop/item", "ar"],
    ["/en", "en"],
    ["/shop", null],
  ])("reads the locale from %s", (pathname, locale) => {
    expect(localeFromPath(pathname)).toBe(locale);
  });

  it.each([
    ["/ar/shop/item", "en", "/en/shop/item"],
    ["/shop/item", "ar", "/ar/shop/item"],
    ["/", "en", "/en"],
  ] as const)("maps %s to the %s locale", (pathname, locale, expected) => {
    expect(pathForLocale(pathname, locale)).toBe(expected);
  });

  it("removes only a leading storefront locale", () => {
    expect(pathWithoutLocale("/ar/shop/item")).toBe("/shop/item");
    expect(pathWithoutLocale("/admin")).toBe("/admin");
  });

  it("defaults to English while preserving a valid saved preference", () => {
    expect(preferredStorefrontLocale(null)).toBe("en");
    expect(preferredStorefrontLocale("ar")).toBe("ar");
  });

  it("opens the bare homepage in English even after an Arabic visit", () => {
    expect(storefrontEntryLocale("/", "ar")).toBe("en");
    expect(storefrontEntryLocale("/", null)).toBe("en");
    expect(storefrontEntryLocale("/shop", "ar")).toBe("ar");
    expect(localeFromPath("/ar")).toBe("ar");
  });
});
