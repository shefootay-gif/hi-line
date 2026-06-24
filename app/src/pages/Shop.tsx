import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router";
import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

type ShopProduct = {
  id: number;
  nameEn: string;
  nameAr: string;
  scent: string;
  scentColor: string | null;
  price: string;
  salePrice: string | null;
  images: string[] | string | null;
};

function listValue(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

const categoryFilters = [
  { key: "all", labelEn: "All", labelAr: "الكل" },
  { key: "roll-on", labelEn: "Roll On", labelAr: "رول أون" },
  { key: "fresh", labelEn: "Fresh Scents", labelAr: "روائح منعشة" },
  { key: "fruity", labelEn: "Fruity", labelAr: "فواكه" },
  { key: "fragrance-free", labelEn: "Fragrance Free", labelAr: "بدون عطر" },
];

export default function Shop() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: products, isLoading } = trpc.store.getProducts.useQuery();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddToCart = (product: ShopProduct) => {
    addItem({
      productId: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      scent: product.scent,
      scentColor: product.scentColor,
      price: product.price,
      salePrice: product.salePrice,
      image: listValue(product.images)[0] ?? null,
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

  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "roll-on" && product.scent) ||
        (activeCategory === "fresh" &&
          ["Tropical Breeze", "Voyage"].includes(product.scent)) ||
        (activeCategory === "fruity" &&
          ["Candy Pop", "Sweet Mango"].includes(product.scent)) ||
        (activeCategory === "fragrance-free" &&
          product.scent === "Fragrance Free");

      return matchesSearch && matchesCategory;
    }) || [];

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      {/* Page Header */}
      <div
        className="pt-28 pb-16 beauty-section"
        style={{
          background: "linear-gradient(180deg, rgba(255,241,245,0.95) 0%, #fcf8ff 55%, white 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
            {lang === "ar" ? "تسوق" : "SHOP"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#4B1C71] mb-4">
            {lang === "ar" ? "تسوق هاي لاين" : "Shop Hi Line"}
          </h1>
          <p className="text-[#6F6178] max-w-md mx-auto">
            {lang === "ar"
              ? "اختر رائحتك المثالية"
              : "Choose your perfect scent"}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-white/92 backdrop-blur-xl border-b border-[#E7D8F1]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7F4CA5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FCF8FF] border border-[#E7D8F1]/70 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? "bg-[#B57EDC] text-white shadow-[0_10px_24px_rgba(181,126,220,0.18)]"
                      : "beauty-pill hover:bg-[#F1E1FF]"
                  }`}
                >
                  {lang === "ar" ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Result count */}
            <span className="text-sm text-[#6F6178] ml-auto">
              {filteredProducts.length} {lang === "ar" ? "منتج" : "products"}
            </span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="beauty-card rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-[#F7ECFF]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#F7ECFF] rounded w-1/3" />
                  <div className="h-4 bg-[#F7ECFF] rounded" />
                  <div className="h-4 bg-[#F7ECFF] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
            <p className="text-[#6F6178]">{t.noProductsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const images = listValue(product.images);
              return (
                <div
                  key={product.id}
                  className="group beauty-card rounded-2xl overflow-hidden reveal-up"
                >
                  <Link to={`/shop/${product.slug}`} className="block">
                    <div
                      className="aspect-square relative flex items-center justify-center p-8"
                      style={{
                        background: `linear-gradient(145deg, ${product.scentColor || "#B57EDC"}12, #fcf8ff)`,
                      }}
                    >
                      <img
                        src={images[0] || "/products/hero-product.jpg"}
                        alt={
                          lang === "ar" && product.nameAr
                            ? product.nameAr
                            : product.nameEn
                        }
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-5">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white mb-2"
                      style={{
                        backgroundColor: product.scentColor || "#8D7A97",
                      }}
                    >
                      {product.scent}
                    </span>
                    <h3 className="text-base font-semibold text-[#4B1C71] mb-1">
                      {lang === "ar" && product.nameAr
                        ? product.nameAr
                        : product.nameEn}
                    </h3>
                    <p className="text-sm text-[#6F6178] mb-3 line-clamp-2">
                      {lang === "ar" && product.shortDescriptionAr
                        ? product.shortDescriptionAr
                        : product.shortDescriptionEn || product.descriptionEn}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#4B1C71]">
                        {parseFloat(product.price).toFixed(0)} {t.currency}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          addedIds.has(product.id)
                            ? "bg-green-500 text-white"
                            : "beauty-button"
                        }`}
                      >
                        {addedIds.has(product.id)
                          ? t.added
                          : t.addToCart}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
