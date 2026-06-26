import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import { rollOnProducts } from "@/lib/hiLineCatalog";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

const categoryFilters = [
  { key: "all", labelEn: "All", labelAr: "الكل" },
  { key: "roll-on", labelEn: "Roll On", labelAr: "رول أون" },
];

const categoryKeys = new Set(categoryFilters.map((category) => category.key));
const categoryAliases: Record<string, string> = {
  "all-products": "all",
  "deodorant-roll-on": "roll-on",
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
  salePrice: string;
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
  return false;
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
        price: p.salePrice ?? p.price,
        salePrice: p.salePrice ?? p.price,
        originalPrice: p.price,
        images: Array.isArray(p.images) ? p.images as string[] : ["/products/tropical-breeze.jpg"],
        discountLabel: p.salePrice ? `${Math.round((1 - parseFloat(p.salePrice) / parseFloat(p.price)) * 100)}% OFF` : "NEW",
        brand: "Hi Line",
        section: "Roll On",
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
      <section className="bg-white pt-24 pb-8 sm:pt-28 sm:pb-10">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="beauty-eyebrow mb-3 text-xs font-semibold uppercase">
            {lang === "ar" ? "المتجر" : "MARKET"}
          </p>
          <div className="mx-auto flex max-w-2xl items-center justify-center rounded-lg bg-white px-4 py-3">
            <img
              src="/brand/logo.jpg"
              alt="Hi Line Pro Care"
              className="h-24 w-auto object-contain sm:h-32 lg:h-40"
            />
          </div>
          <h1 className="sr-only">Hi Line Pro Care</h1>
          <h2 className="mt-5 text-2xl font-semibold text-[#7F4CA5] sm:text-3xl">
            Roll On
          </h2>
          <p className="mt-2 text-sm text-[#6F6178]">
            {lang === "ar"
              ? "كل المنتجات الحالية داخل قسم Roll On، ويمكن إضافة أقسام جديدة من لوحة التحكم."
              : "All current products sit under Roll On, with new sections ready to add from admin."}
          </p>
        </div>
      </section>

      <div className="sticky top-[72px] z-40 border-y border-[#E7D8F1]/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7F4CA5]" />
              <input
                type="text"
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
                  <Link to={`/shop/${product.slug}`} className="block">
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
                      <span className="block">{product.nameEn}</span>
                      <span className="block">{product.scent}</span>
                    </h3>

                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-black text-[#D71920] sm:text-lg">
                        {formatLE(product.salePrice)}
                      </span>
                      <span className="text-xs text-[#8D7A97] line-through sm:text-sm">
                        {formatLE(product.originalPrice)}
                      </span>
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
                      alt="Hi Line Roll On collection"
                      loading="lazy"
                      className="h-full max-h-[360px] w-full object-cover"
                    />
                    <div className="p-6 sm:p-8">
                      <p className="text-sm font-semibold text-[#7F4CA5]">Hi Line</p>
                      <h3 className="mt-2 text-2xl font-black text-[#4B1C71] sm:text-3xl">
                        Roll On Collection
                      </h3>
                      <p className="mt-3 text-[#6F6178]">
                        Full Hi Line Roll On collection in one clean promotional view.
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
