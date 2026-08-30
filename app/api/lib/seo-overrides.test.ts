import { expect, it } from "vitest";
import { injectSeoDocument } from "./seo-document";
import { buildSitemap } from "./sitemap";
import { findSeoOverride, publicSeoPath, safeSeoUrl } from "@contracts/seo-settings";

it("uses saved bilingual SEO and escapes it in initial HTML", () => {
  const row = {path:"/shop",titleAr:'عنوان <script>',descriptionAr:'وصف "خاص"',isIndexed:false};
  const html = injectSeoDocument('<html><head><title>Old</title></head><body><div id="root"></div></body></html>',"https://bellorypharma.com","/ar/shop",null,row);
  expect(html).toContain('عنوان &lt;script&gt;'); expect(html).toContain('noindex, nofollow');
  expect(findSeoOverride([row],"/ar/shop")).toEqual(row);
  expect(buildSitemap("https://bellorypharma.com",[],[row])).not.toContain('<loc>https://bellorypharma.com/ar/shop</loc>');
});
it("cannot enable private URLs or unsafe metadata URL protocols", () => {
  expect(publicSeoPath('/admin')).toBe(false); expect(publicSeoPath('/ar/checkout')).toBe(false);
  expect(safeSeoUrl('javascript:alert(1)')).toBeUndefined();
});
