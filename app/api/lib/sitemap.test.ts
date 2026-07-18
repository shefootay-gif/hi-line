import { describe, expect, it } from "vitest";
import { buildSitemap } from "./sitemap";

describe("buildSitemap", () => {
  it("includes public pages and encoded product URLs with modification dates", () => {
    const sitemap = buildSitemap("https://hiline.example", [
      {
        slug: "rose & oud",
        updatedAt: new Date("2026-07-18T00:00:00.000Z"),
      },
    ]);

    expect(sitemap).toContain("<loc>https://hiline.example/ar/shop</loc>");
    expect(sitemap).toContain("<loc>https://hiline.example/en/shop</loc>");
    expect(sitemap).toContain(
      "<loc>https://hiline.example/ar/shop/rose%20%26%20oud</loc>"
    );
    expect(sitemap).toContain("<lastmod>2026-07-18T00:00:00.000Z</lastmod>");
    expect(sitemap).not.toContain("/admin");
    expect(sitemap).not.toContain("/checkout");
  });
});
