type SitemapProduct = {
  slug: string;
  updatedAt: Date | null;
};

const publicPaths = ["/", "/shop", "/about", "/contact", "/faq"];
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

const sitemapUrl = (
  location: string,
  alternates: { ar: string; en: string },
  lastModified?: Date | null,
) =>
  `<url><loc>${xmlText(location)}</loc><xhtml:link rel="alternate" hreflang="ar" href="${xmlText(alternates.ar)}"/><xhtml:link rel="alternate" hreflang="en" href="${xmlText(alternates.en)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${xmlText(alternates.en)}"/>${lastModified ? `<lastmod>${lastModified.toISOString()}</lastmod>` : ""}</url>`;

export const buildSitemap = (origin: string, products: SitemapProduct[]) => {
  const staticUrls = locales.flatMap(locale =>
    publicPaths.map(path => {
      const suffix = path === "/" ? "" : path;
      return sitemapUrl(
        new URL(`/${locale}${suffix}`, origin).href,
        {
          ar: new URL(`/ar${suffix}`, origin).href,
          en: new URL(`/en${suffix}`, origin).href,
        },
      );
    })
  );
  const productUrls = locales.flatMap(locale =>
    products.map(product => {
      const encodedSlug = encodeURIComponent(product.slug);
      return sitemapUrl(
        new URL(`/${locale}/shop/${encodedSlug}`, origin).href,
        {
          ar: new URL(`/ar/shop/${encodedSlug}`, origin).href,
          en: new URL(`/en/shop/${encodedSlug}`, origin).href,
        },
        product.updatedAt,
      );
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${[...staticUrls, ...productUrls].join("")}</urlset>`;
};
