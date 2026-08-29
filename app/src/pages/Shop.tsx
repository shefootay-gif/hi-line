import { useLanguage } from "@/hooks/useLanguage";
import { pathForLocale } from "@/lib/localeRouting";
import { useTranslations, getArabicScentName } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import { rollOnProducts } from "@/lib/hiLineCatalog";
import { productImage } from "@/lib/product-media";
import { PRIMARY_PRODUCT_CATEGORY } from "@contracts/product-category";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

const categoryFilters = [
  { key: "all", labelEn: "All", labelAr: "الكل" },
  { key: "roll-on", labelEn: "Deodorant", labelAr: "مزيل العرق" },
  { key: "body-mist", labelEn: "Body Mist", labelAr: "بادي ميست" },
  { key: "facial-care", labelEn: "Facial Care", labelAr: "العناية بالوجه" },
];

const categoryKeys = new Set(categoryFilters.map((category) => category.key));
const categoryAliases: Record<string, string> = {
  "all-products": "all",
  [PRIMARY_PRODUCT_CATEGORY.slug]: "roll-on",
  "fresh-scents": "roll-on",
  "fruity-scents": "roll-on",
  "fragrance-free": "roll-on",
  "summer-collection": "all",
  "best-sellers": "all",
  offers: "all",
};

const groupedCollectionImage = "/products/collection-flatlay.jpg";

type ShopProduct = {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
  scent: string;
  scentColor: string;
  price: string;
  salePrice: string | null;
  originalPrice: string;
  images: string[];
  discountLabel: string;
  brand: string;
  section: string;
};

function normalizeCategory(value?: string | null) {
  if (!value) return "all";
  const normalized = value.toLowerCase();
  const alias = categoryAliases[normalized] || normalized;
  return categoryKeys.has(alias) ? alias : "all";
}

function formatLE(value: string) {
  return `LE ${Number.parseFloat(value).toFixed(2)}`;
}

function matchesCategory(product: ShopProduct, category: string) {
  if (category === "all") return true;
  if (category === "roll-on") return product.section === "Roll On";
  if (category === "body-mist") return product.section === "Body Mist";
  if (category === "facial-care") return product.section === "Facial Care";
  return false;
}

function productSection(slug: string) {
  if (slug.includes("body-mist")) return "Body Mist";
  if (slug.includes("facial-cleanser")) return "Facial Care";
  return "Roll On";
}

export default function Shop() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(() =>
    normalizeCategory(params.category || searchParams.get("category")),
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const { data: apiProducts, isError: apiError, isLoading } = trpc.store.getProducts.useQuery(
    activeCategory !== "all" ? { category: activeCategory } : undefined,
    { retry: false, throwOnError: false }
  );

  useEffect(() => {
    setActiveCategory(normalizeCategory(params.category || searchParams.get("category")));
    setSearchQuery(searchParams.get("q") || "");
  }, [params.category, searchParams]);

  const updateCategory = (category: string) => {
    const nextCategory = normalizeCategory(category);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    navigate({
      pathname: nextCategory === "all" ? "/shop" : `/shop/category/${nextCategory}`,
      search: nextParams.toString(),
    });
  };

  const updateSearch = (value: string) => {
    setSearchQuery(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set("q", value);
    else nextParams.delete("q");
    setSearchParams(nextParams, { replace: true });
  };

  const handleAddToCart = (product: ShopProduct) => {
    addItem({
      productId: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      scent: product.scent,
      scentColor: product.scentColor,
      price: product.price,
      salePrice: product.salePrice,
      image: product.images[0] ?? null,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  // Use API products when available, fall back to local catalog
  const sourceProducts = (!apiError && apiProducts && apiProducts.length > 0)
    ? apiProducts.map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        nameAr: p.nameAr ?? p.nameEn,
        slug: p.slug,
        scent: p.scent,
        scentColor: p.scentColor ?? "#B57EDC",
        price: p.price,
        salePrice: p.salePrice,
        originalPrice: p.price,
        images: [productImage(p.images)],
        discountLabel: p.salePrice ? `${Math.round((1 - parseFloat(p.salePrice) / parseFloat(p.price)) * 100)}% OFF` : "NEW",
        brand: "Hi Line",
        section: productSection(p.slug),
      }))
    : rollOnProducts;

  const filteredProducts = sourceProducts.filter((product) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      product.nameEn.toLowerCase().includes(q) ||
      product.nameAr.toLowerCase().includes(q) ||
      product.scent.toLowerCase().includes(q);

    return matchesSearch && matchesCategory(product, activeCategory);
  });

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FCF8FF] via-white to-[#F7ECFF] pt-24 pb-10 sm:pt-28 sm:pb-12">
        <div className="absolute -top-24 start-10 h-56 w-56 rounded-full bg-[#B57EDC]/20 blur-3xl" />
        <div className="absolute -bottom-28 end-10 h-64 w-64 rounded-full bg-[#F6B6D6]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="beauty-eyebrow mb-4 text-xs font-semibold uppercase tracking-[0.35em]">
              {lang === "ar" ? "تسوق العناية اليومية" : "DAILY CARE SHOP"}
            </p>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-[#241A2E] sm:text-5xl lg:text-6xl">
              {lang === "ar" ? (
                <>
                  عناية يومية بروائح مميزة
                  <span className="block text-[#7F4CA5]">وانتعاش يدوم</span>
                </>
              ) : (
                <>
                  Fresh care essentials
                  <span className="block text-[#7F4CA5]">for every day</span>
                </>
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#6F6178] sm:text-lg">
              {lang === "ar"
                ? "اختاري منتجات Hi Line Pro Care بتجربة تسوق سهلة، عروض واضحة، وخطوات طلب سريعة وآمنة."
                : "Discover Hi Line Pro Care with a smooth shopping experience, clear offers, and fast secure checkout."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-[#E7D8F1] bg-white/80 px-4 py-2 text-sm font-medium text-[#4B1678] shadow-sm">
                {lang === "ar" ? "منتجات أصلية" : "Original Products"}
              </span>
              <span className="rounded-full border border-[#E7D8F1] bg-white/80 px-4 py-2 text-sm font-medium text-[#4B1678] shadow-sm">
                {lang === "ar" ? "عروض متجددة" : "Fresh Offers"}
              </span>
              <span className="rounded-full border border-[#E7D8F1] bg-white/80 px-4 py-2 text-sm font-medium text-[#4B1678] shadow-sm">
                {lang === "ar" ? "طلب سريع وآمن" : "Fast & Secure Order"}
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-[2rem] border border-[#E7D8F1] bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(75,28,113,0.13)] backdrop-blur sm:p-10">
              <div className="absolute -end-4 -top-4 rounded-2xl bg-[#7F4CA5] px-4 py-2 text-xs font-bold text-white shadow-lg">
                Hi Line
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#7F4CA5]">
                LEBANESE FORMULA
              </p>
              <h2 className="mt-4 text-6xl font-black leading-none text-[#4B1C71] sm:text-7xl">
                Hi Line
              </h2>
              <p className="mt-3 text-3xl font-semibold text-[#B57EDC] sm:text-4xl">
                Pro Care
              </p>
              <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-[#6F6178]">
                {lang === "ar"
                  ? "هوية عناية أنيقة، منتجات مختارة، وتجربة تسوق بسيطة وواضحة."
                  : "Elegant care identity, curated products, and a simple premium shopping experience."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-[#FCF8FF] p-3">
                  <p className="text-lg font-bold text-[#4B1678]">{filteredProducts.length}</p>
                  <p className="text-xs text-[#6F6178]">{lang === "ar" ? "منتج متاح" : "Products"}</p>
                </div>
                <div className="rounded-2xl bg-[#FCF8FF] p-3">
                  <p className="text-lg font-bold text-[#4B1678]">Pro Care</p>
                  <p className="text-xs text-[#6F6178]">{lang === "ar" ? "عناية يومية" : "Daily Care"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-40 border-y border-[#E7D8F1]/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7F4CA5]" />
              <input
                type="text"
                aria-label={t.search}
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder={t.search}
                className="w-full rounded-lg border border-[#E7D8F1]/70 bg-[#FCF8FF] py-2.5 ps-10 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((category) => (
                <button
                  key={category.key}
                  onClick={() => updateCategory(category.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === category.key
                      ? "bg-[#B57EDC] text-white shadow-[0_10px_24px_rgba(181,126,220,0.18)]"
                      : "beauty-pill hover:bg-[#F1E1FF]"
                  }`}
                >
                  {lang === "ar" ? category.labelAr : category.labelEn}
                </button>
              ))}
            </div>

            <span className="text-sm text-[#6F6178] sm:ml-auto">
              {filteredProducts.length} {lang === "ar" ? "منتج" : "products"}
            </span>
          </div>
        </div>
      </div>

      <section className="bg-[#FCF8FF]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-[#E7D8F1]/80 bg-white animate-pulse">
                  <div className="bg-[#E7D8F1]/40 aspect-square w-full" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#E7D8F1]/40 rounded w-3/4" />
                    <div className="h-4 bg-[#E7D8F1]/40 rounded w-1/2" />
                    <div className="h-5 bg-[#E7D8F1]/40 rounded w-1/3 mt-4" />
                    <div className="h-10 bg-[#E7D8F1]/40 rounded w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-[#E7D8F1]" />
              <p className="text-[#6F6178]">{t.noProductsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <article
                  key={product.slug}
                  className="overflow-hidden rounded-lg border border-[#E7D8F1]/80 bg-white shadow-[0_10px_30px_rgba(75,28,113,0.07)]"
                >
                  <Link to={pathForLocale(`/shop/${product.slug}`, lang)} className="block">
                    <div className="relative flex aspect-square items-center justify-center bg-white p-4 sm:p-5">
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-[#D71920] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
                        {product.discountLabel}
                      </span>
                      <img
                        src={product.images[0]}
                        alt={`${product.nameEn} ${product.scent}`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </Link>

                  <div className="p-4 pt-3">
                    <h3 className="min-h-[3.25rem] text-sm font-semibold leading-snug text-[#241A2E] sm:text-base">
                      <span className="block">{lang === "ar" && product.nameAr ? product.nameAr : product.nameEn}</span>
                      <span className="block">{lang === "ar" ? getArabicScentName(product.scent) : product.scent}</span>
                    </h3>

                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-black text-[#D71920] sm:text-lg">
                        {formatLE(product.salePrice ? product.salePrice : product.originalPrice)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-[#8D7A97] line-through sm:text-sm">
                          {formatLE(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`mt-4 w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        addedIds.has(product.id) ? "bg-green-500 text-white" : "beauty-button"
                      }`}
                    >
                      {addedIds.has(product.id) ? t.added : t.addToCart}
                    </button>
                  </div>
                </article>
              ))}

              {!searchQuery && (
                <article className="overflow-hidden rounded-lg border border-[#E7D8F1]/80 bg-white shadow-[0_10px_30px_rgba(75,28,113,0.07)] md:col-span-3 xl:col-span-5">
                  <div className="grid items-center md:grid-cols-[1.2fr_0.8fr]">
                    <img
                      src={groupedCollectionImage}
                      alt="Hi Line Pro Care collection"
                      loading="lazy"
                      className="h-full max-h-[360px] w-full object-cover"
                    />
                    <div className="p-6 sm:p-8">
                      <p className="text-sm font-semibold text-[#7F4CA5]">Hi Line</p>
                      <h3 className="mt-2 text-2xl font-black text-[#4B1C71] sm:text-3xl">
                        {lang === "ar" ? "مجموعة Hi Line Pro Care" : "Hi Line Pro Care Collection"}
                      </h3>
                      <p className="mt-3 text-[#6F6178]">
                        {lang === "ar"
                          ? "تشكيلة عناية يومية بروائح مميزة وتجربة تسوق منظمة."
                          : "A clean promotional view of Hi Line Pro Care daily essentials."}
                      </p>
                    </div>
                  </div>
                </article>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
