import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useParams, Link } from "react-router";
import { useState } from "react";
import {
  ChevronRight,
  Minus,
  Plus,
  Check,
  MessageCircle,
  Facebook,
  Copy,
  CheckCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function listValue<T>(value: T[] | string | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

const scentBenefits = [
  "48h Protection",
  "0% Aluminum",
  "Lebanese Formula",
  "Smooth Application",
];

const scentBenefitsAr = [
  "حماية 48 ساعة",
  "0% ألمنيوم",
  "تركيبة لبنانية",
  "تطبيق سلس",
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: product, isLoading } = trpc.store.getProductBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.nameEn,
        nameAr: product.nameAr,
        scent: product.scent,
        scentColor: product.scentColor,
        price: product.price,
        salePrice: product.salePrice,
        image: listValue<string>(product.images)[0] ?? null,
      });
    }
    setAdded(true);
    toast.success(lang === "ar" ? "تمت الإضافة إلى السلة!" : "Added to cart!");
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const productName =
      lang === "ar" && product.nameAr ? product.nameAr : product.nameEn;
    const message =
      lang === "ar"
        ? `مرحبًا، أريد طلب:\nالمنتج: ${productName}\nالكمية: ${quantity}\nالاسم: \nرقم الهاتف: \nالعنوان: `
        : `Hello! I want to order:\nProduct: ${productName}\nQuantity: ${quantity}\nName: \nPhone: \nAddress: `;
    window.open(
      `https://wa.me/201223863092?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
      
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#B57EDC] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-[#6F6178]">
          {lang === "ar" ? "المنتج غير موجود" : "Product not found"}
        </p>
        <Link
          to="/shop"
          className="px-6 py-2.5 beauty-button font-semibold rounded-lg"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  const images = listValue<string>(product.images);
  const benefits = listValue<string>(product.benefits);
  const benefitsAr = listValue<string>(product.benefitsAr);

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      <Toaster position="top-center" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-[#6F6178]">
            <Link to="/" className="hover:text-[#B57EDC]">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/shop" className="hover:text-[#B57EDC]">
              {t.shop}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#4B1C71]">
              {lang === "ar" && product.nameAr
                ? product.nameAr
                : product.nameEn}
            </span>
          </nav>
        </div>
      </div>

      {/* Product Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`flex flex-col lg:flex-row gap-12 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Product Image */}
          <div className="flex-1 max-w-xl mx-auto lg:mx-0">
            <div
              className="beauty-card rounded-3xl p-8 flex items-center justify-center beauty-image"
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
                loading="eager"
                className="w-full max-w-md object-contain transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white mb-4"
              style={{ backgroundColor: product.scentColor || "#8D7A97" }}
            >
              {product.scent}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {lang === "ar" && product.nameAr
                ? product.nameAr
                : product.nameEn}
            </h1>

            <p className="text-2xl font-bold text-[#4B1C71] mb-6">
              {parseFloat(product.price).toFixed(0)}{" "}
              <span className="text-base font-normal text-[#6F6178]">
                {t.currency}
              </span>
            </p>

            <p className="text-[#6F6178] leading-relaxed mb-6">
              {lang === "ar" && product.shortDescriptionAr
                ? product.shortDescriptionAr
                : product.shortDescriptionEn || product.descriptionEn}
            </p>

            {/* Key Features */}
            <div className="space-y-2 mb-8">
              {(lang === "ar" ? scentBenefitsAr : scentBenefits).map(
                (benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#B57EDC]" />
                    <span className="text-sm text-[#6F6178]">{benefit}</span>
                  </div>
                )
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm font-medium text-[#4B1C71] mb-2 block">
                {t.quantity}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E7D8F1] hover:bg-[#F7ECFF]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E7D8F1] hover:bg-[#F7ECFF]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                  added
                    ? "bg-green-500 text-white"
                    : "beauty-button"
                }`}
              >
                {added ? t.added : t.addToCart}
              </button>
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-[#25D366] text-[#25D366] font-semibold hover:bg-[#25D366] hover:text-white transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                {t.orderOnWhatsApp}
              </button>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#6F6178]">
                {lang === "ar" ? "مشاركة:" : "Share:"}
              </span>
              <button
                onClick={shareOnFacebook}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="w-9 h-9 flex items-center justify-center rounded-full beauty-pill hover:bg-[#4B1C71] hover:text-white transition-colors"
              >
                {copied ? (
                  <CheckCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-[#F7ECFF] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Description */}
            <div className="beauty-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                {t.description}
              </h3>
              <p className="text-sm text-[#6F6178] leading-relaxed">
                {lang === "ar" && product.descriptionAr
                  ? product.descriptionAr
                  : product.descriptionEn}
              </p>
            </div>

            {/* Benefits */}
            <div className="beauty-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                {t.benefits}
              </h3>
              <ul className="space-y-2">
                {(lang === "ar" ? benefitsAr : benefits).map(
                  (benefit: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#6F6178]">
                      <Check className="w-4 h-4 text-[#B57EDC]" />
                      {benefit}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Ingredients */}
            {product.ingredients && (
              <div className="beauty-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                  {t.ingredients}
                </h3>
                <p className="text-sm text-[#6F6178] leading-relaxed">
                  {lang === "ar" && product.ingredientsAr
                    ? product.ingredientsAr
                    : product.ingredients}
                </p>
              </div>
            )}

            {/* Usage Instructions */}
            {product.usageInstructions && (
              <div className="beauty-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                  {t.usage}
                </h3>
                <p className="text-sm text-[#6F6178] leading-relaxed">
                  {lang === "ar" && product.usageInstructionsAr
                    ? product.usageInstructionsAr
                    : product.usageInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProductsList &&
        product.relatedProductsList.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-[#4B1C71] mb-8 text-center">
              {t.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProductsList.map((related) => {
                const relImages = listValue<string>(related.images);
                return (
                  <Link
                    key={related.id}
                    to={`/shop/${related.slug}`}
                    className="group beauty-card rounded-2xl overflow-hidden"
                  >
                    <div
                      className="aspect-square flex items-center justify-center p-6"
                      style={{
                        background: `linear-gradient(145deg, ${related.scentColor || "#B57EDC"}12, #fcf8ff)`,
                      }}
                    >
                      <img
                        src={relImages[0] || "/products/hero-product.jpg"}
                        alt={related.nameEn}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#4B1C71]">
                        {lang === "ar" && related.nameAr
                          ? related.nameAr
                          : related.nameEn}
                      </h3>
                      <p className="text-base font-bold text-[#4B1C71] mt-1">
                        {parseFloat(related.price).toFixed(0)} {t.currency}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
