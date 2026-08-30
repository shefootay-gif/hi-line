export type SeoOverride = { path: string; titleEn?: string | null; titleAr?: string | null; descriptionEn?: string | null; descriptionAr?: string | null; keywords?: string | null; ogImage?: string | null; canonicalUrl?: string | null; isIndexed?: boolean | null };
export function seoRoute(path: string) { return path.replace(/^\/(ar|en)(?=\/|$)/, "").replace(/\/$/, "") || "/"; }
export function publicSeoPath(path: string): boolean { return /^\/(?:ar|en)(?:\/|$)/.test(path) ? publicSeoPath(seoRoute(path)) : path === "/" || ["/shop", "/about", "/contact", "/faq"].includes(path) || /^\/shop\/[a-z0-9-]+$/.test(path); }
export function findSeoOverride(rows: SeoOverride[], path: string) { return rows.find(row => row.path === path) ?? rows.find(row => row.path === seoRoute(path)); }
export function safeSeoUrl(value?: string | null, origin = "https://bellorypharma.com") {
  if (!value) return undefined;
  try { const url = new URL(value, origin); return /^https?:$/.test(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
