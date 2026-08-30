import { type SeoOverride, safeSeoUrl, publicSeoPath } from "@contracts/seo-settings";
export type SeoProduct = {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  shortDescriptionEn: string | null;
  shortDescriptionAr: string | null;
  price: string;
  salePrice: string | null;
  stock: number;
  sku: string | null;
  images: string[] | string | null;
};

const pageCopy = {
  ar: {
    "/": [
      "هاي لاين برو كير | رول أون وعناية شخصية في مصر",
      "تسوّق منتجات هاي لاين برو كير للعناية الشخصية ومزيلات العرق رول أون، مع التوصيل داخل مصر والدفع عند الاستلام.",
    ],
    "/shop": [
      "منتجات هاي لاين برو كير رول أون",
      "اكتشف مجموعة هاي لاين برو كير رول أون بروائح متنوعة وأسعار محدثة وتوصيل داخل مصر.",
    ],
    "/about": ["عن هاي لاين برو كير", "تعرف على علامة هاي لاين برو كير ومنتجات العناية الشخصية المتاحة في مصر."],
    "/contact": ["تواصل مع هاي لاين برو كير", "تواصل مع متجر هاي لاين برو كير للاستفسار عن المنتجات والطلبات والتوصيل."],
    "/faq": ["الأسئلة الشائعة | هاي لاين برو كير", "إجابات رسمية عن منتجات هاي لاين برو كير والطلب والدفع عند الاستلام والتوصيل."],
  },
  en: {
    "/": [
      "Hi Line Pro Care Egypt | Roll-On Personal Care",
      "Shop Hi Line Pro Care roll-on deodorants and personal-care products with delivery across Egypt and cash on delivery.",
    ],
    "/shop": [
      "Shop Hi Line Pro Care Roll-On Products",
      "Explore Hi Line Pro Care roll-ons in signature scents with current prices, Egypt delivery, and cash on delivery.",
    ],
    "/about": ["About Hi Line Pro Care", "Learn about Hi Line Pro Care and its personal-care products available in Egypt."],
    "/contact": ["Contact Hi Line Pro Care", "Contact the official Hi Line Pro Care store for product, order, and delivery support."],
    "/faq": ["Hi Line Pro Care Frequently Asked Questions", "Official answers about Hi Line Pro Care products, ordering, cash on delivery, and shipping."],
  },
} as const;

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);

const jsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

const imageList = (value: SeoProduct["images"] | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((image): image is string => typeof image === "string" && image.trim().length > 0);
  }
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
      : [];
  } catch {
    return [];
  }
};

const localeDetails = (pathname: string) => {
  const match = pathname.match(/^\/(ar|en)(\/.*)?$/);
  const locale = match?.[1] === "ar" ? "ar" : "en";
  const route = match ? match[2] || "/" : pathname;
  return { locale, route } as const;
};

export const injectSeoDocument = (
  template: string,
  origin: string,
  pathname: string,
  product?: SeoProduct | null,
  override?: SeoOverride,
) => {
  const { locale, route } = localeDetails(pathname);
  const localizedName = product
    ? locale === "ar" ? product.nameAr : product.nameEn
    : null;
  const localizedDescription = product
    ? (locale === "ar"
        ? product.descriptionAr || product.shortDescriptionAr
        : product.descriptionEn || product.shortDescriptionEn) || localizedName || ""
    : null;
  const page = product
    ? [`${localizedName} | Hi Line Pro Care`, localizedDescription]
    : pageCopy[locale][route as keyof typeof pageCopy[typeof locale]];
  const indexable = Boolean(page) && publicSeoPath(route) && override?.isIndexed !== false;
  const title = (locale === "ar" ? override?.titleAr : override?.titleEn) || page?.[0] || "Hi Line Pro Care";
  const description = (locale === "ar" ? override?.descriptionAr : override?.descriptionEn) || page?.[1] || "Official Hi Line Pro Care online store in Egypt.";
  const canonical = safeSeoUrl(override?.canonicalUrl, origin) || new URL(pathname, origin).href;
  const alternateRoute = route === "/" ? "" : route;
  const alternateAr = new URL(`/ar${alternateRoute}`, origin).href;
  const alternateEn = new URL(`/en${alternateRoute}`, origin).href;
  const logo = new URL("/brand/logo.jpg", origin).href;
  const images = imageList(product?.images);
  const imageUrls = safeSeoUrl(override?.ogImage, origin) ? [safeSeoUrl(override?.ogImage, origin)!] : images.length > 0
    ? images.map(image => new URL(image, origin).href)
    : [logo];
  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${canonical}#product`,
        name: localizedName,
        description,
        image: imageUrls,
        sku: product.sku || product.slug,
        brand: { "@type": "Brand", "@id": `${origin}/#brand`, name: "Hi Line Pro Care" },
        offers: {
          "@type": "Offer",
          url: canonical,
          priceCurrency: "EGP",
          price: product.salePrice || product.price,
          availability: product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": `${origin}/#organization` },
        },
      }
    : {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${origin}/#organization`,
            name: "Bellory Pharma",
            alternateName: "Bellory Pharma Egypt",
            url: `${origin}/`,
            logo,
            areaServed: { "@type": "Country", name: "Egypt" },
            brand: { "@id": `${origin}/#brand` },
            sameAs: ["https://www.facebook.com/profile.php?id=61587944979845"],
          },
          {
            "@type": "Brand",
            "@id": `${origin}/#brand`,
            name: "Hi Line Pro Care",
            alternateName: "Hi Line",
          },
          {
            "@type": "WebSite",
            "@id": `${origin}/#website`,
            name: "Hi Line Pro Care",
            url: `${origin}/`,
            inLanguage: ["ar", "en"],
            publisher: { "@id": `${origin}/#organization` },
          },
          {
            "@type": "OnlineStore",
            "@id": `${origin}/#store`,
            name: "Hi Line Pro Care",
            url: `${origin}/`,
            currenciesAccepted: "EGP",
            paymentAccepted: "Cash on delivery",
            areaServed: { "@type": "Country", name: "Egypt" },
            parentOrganization: { "@id": `${origin}/#organization` },
            brand: { "@id": `${origin}/#brand` },
          },
        ],
      };
  const fallback = product
    ? `<article><h1>${escapeHtml(localizedName || "Hi Line Pro Care product")}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(product.salePrice || product.price)} EGP — ${product.stock > 0 ? "In stock" : "Out of stock"}</p><p><a href="${escapeHtml(new URL(`/${locale}/shop`, origin).href)}">${locale === "ar" ? "تصفح كل المنتجات" : "Browse all products"}</a></p></article>`
    : `<article><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><ul><li>${locale === "ar" ? "الدفع عند الاستلام" : "Cash on delivery"}</li><li>${locale === "ar" ? "التوصيل داخل مصر" : "Delivery across Egypt"}</li><li><a href="${escapeHtml(new URL(`/${locale}/shop`, origin).href)}">${locale === "ar" ? "المنتجات والأسعار" : "Products and prices"}</a></li><li><a href="${escapeHtml(new URL(`/${locale}/faq`, origin).href)}">${locale === "ar" ? "الأسئلة الشائعة" : "Frequently asked questions"}</a></li></ul></article>`;
  const head = [
    ...(override?.keywords ? [`<meta name="keywords" content="${escapeHtml(override.keywords)}">`] : []),
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="robots" content="${indexable ? "index, follow, max-image-preview:large, max-snippet:-1" : "noindex, nofollow"}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<link rel="alternate" hreflang="ar" href="${escapeHtml(alternateAr)}">`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(alternateEn)}">`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(alternateEn)}">`,
    `<meta property="og:type" content="${product ? "product" : "website"}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:image" content="${escapeHtml(imageUrls[0])}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<script type="application/ld+json">${jsonLd(structuredData)}</script>`,
  ].join("\n    ");

  return template
    .replace(/<html[^>]*>/, `<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><main id="seo-fallback">${fallback}</main></div>`);
};
