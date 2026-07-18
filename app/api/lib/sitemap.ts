type SitemapProduct = {
  slug: string;
  updatedAt: Date | null;
};

const publicPaths = ["/", "/shop", "/about", "/contact", "/faq", "/track-order"];
const locales = ["ar", "en"] as const;

const xmlText = (text: string) =>
  text.replace(/[&<>"']/g, character => {
    const entity = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
    return entity ?? character;
  });

const sitemapUrl = (location: string, lastModified?: Date | null) =>
  `<url><loc>${xmlText(location)}</loc>${lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : ""}</url>`;

export const buildSitemap = (origin: string, products: SitemapProduct[]) => {
  const staticUrls = locales.flatMap(locale =>
    publicPaths.map(path =>
      sitemapUrl(new URL(`/${locale}${path === "/" ? "" : path}`, origin).href)
    )
  );
  const productUrls = locales.flatMap(locale =>
    products.map(product =>
      sitemapUrl(
        new URL(`/${locale}/shop/${encodeURIComponent(product.slug)}`, origin).href,
        product.updatedAt
      )
    )
  );

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticUrls, ...productUrls].join("")}</urlset>`;
};
