import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { findCatalogProductBySlug } from "@/lib/hiLineCatalog";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useParams, Link } from "react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  Minus,
  Plus,
  Check,
  MessageCircle,
  Facebook,
  Copy,
  CheckCheck,
  Heart,
  Star,
  Tag,
  ShoppingCart,
  Upload,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { Helmet } from "react-helmet-async";
import { productStructuredData } from "@/lib/productSeo";
import { pathForLocale } from "@/lib/localeRouting";

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
  "0% ألومنيوم",
  "تركيبة لبنانية",
  "تطبيق سلس",
];

type RecentlyViewedProduct = {
  id: number;
  nameEn: string;
  nameAr: string | null;
  slug: string;
  price: string;
  images: string[] | string | null;
  scentColor: string | null;
};

function isRecentlyViewedProduct(value: unknown): value is RecentlyViewedProduct {
  if (!value || typeof value !== "object") return false;
  const product = value as Record<string, unknown>;
  return (
    typeof product.id === "number" &&
    typeof product.nameEn === "string" &&
    typeof product.slug === "string" &&
    typeof product.price === "string"
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: apiProduct, isLoading } = trpc.store.getProductBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: user } = trpc.auth.me.useQuery();
  const { data: wishlist, refetch: refetchWishlist } = trpc.store.getWishlist.useQuery(undefined, {
    enabled: !!user,
  });
  const toggleWishlist = trpc.store.toggleWishlist.useMutation();
  const { data: reviews } = trpc.store.getReviews.useQuery(
    { productId: apiProduct?.id || 0 },
    { enabled: !!apiProduct }
  );
  const addReview = trpc.store.addReview.useMutation();
  
  const catalogProduct = findCatalogProductBySlug(slug);
  const product = useMemo(() => {
    return apiProduct
      ? catalogProduct
        ? {
          ...apiProduct,
          ...catalogProduct,
          id: apiProduct.id,
          relatedProductsList: apiProduct.relatedProductsList,
          benefits: apiProduct.benefits ?? [],
          benefitsAr: apiProduct.benefitsAr ?? [],
          ingredients: apiProduct.ingredients,
          ingredientsAr: apiProduct.ingredientsAr,
          usageInstructions: apiProduct.usageInstructions,
          usageInstructionsAr: apiProduct.usageInstructionsAr,
          }
        : apiProduct
      : catalogProduct
        ? {
          ...catalogProduct,
          descriptionAr: catalogProduct.shortDescriptionAr,
          benefits: [],
          benefitsAr: [],
          ingredients: null,
          ingredientsAr: null,
          usageInstructions: null,
          usageInstructionsAr: null,
          flashSalePrice: null,
          flashSaleEndsAt: null,
          relatedProductsList: [],
          }
        : null;
  }, [apiProduct, catalogProduct]);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);

  // Scroll listener for Sticky Cart
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyCart(true);
      } else {
        setShowStickyCart(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Recently Viewed Tracking
  useEffect(() => {
    if (product) {
      let currentViewed: RecentlyViewedProduct[] = [];
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        currentViewed = Array.isArray(parsed)
          ? parsed.filter(isRecentlyViewedProduct)
          : [];
      } catch {
        localStorage.removeItem("recentlyViewed");
      }
      const filtered = currentViewed.filter(recent => recent.id !== product.id);
      // save lightweight product version
      const lightweight = {
        id: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        slug: product.slug,
        price: product.price,
        images: product.images,
        scentColor: product.scentColor
      };
      const newViewed = [lightweight, ...filtered].slice(0, 4);
      localStorage.setItem("recentlyViewed", JSON.stringify(newViewed));
      setRecentlyViewed(filtered.slice(0, 4));
    }
  }, [product]);

  const isWishlisted = wishlist?.some(w => w.product.id === product?.id) ?? false;

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      return;
    }
    if (!product) return;
    try {
      const res = await toggleWishlist.mutateAsync({ productId: product.id });
      refetchWishlist();
      if (res.added) {
        toast.success(lang === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to wishlist");
      } else {
        toast.success(lang === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
      }
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(lang === "ar" ? "حجم الصورة كبير جداً" : "Image size too large");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReviewImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first");
      return;
    }
    if (!product) return;
    try {
      await addReview.mutateAsync({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages,
      });
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
      toast.success(lang === "ar" ? "تم إرسال تقييمك بنجاح وسيظهر بعد المراجعة" : "Review submitted successfully and will appear after approval");
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ أثناء إرسال التقييم" : "Error submitting review");
    }
  };

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
        stock: (product as { stock?: number }).stock ?? 1,
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
        ? `مرحباً، أريد طلب:\nالمنتج: ${productName}\nالكمية: ${quantity}\nالاسم: \nرقم الهاتف: \nالعنوان: `
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
          to={pathForLocale("/shop", lang)}
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
  const productStock = (product as { stock?: number }).stock ?? 1;
  const productName = lang === "ar" && product.nameAr ? product.nameAr : product.nameEn;
  const productDescription =
    lang === "ar" && product.shortDescriptionAr
      ? product.shortDescriptionAr
      : product.shortDescriptionEn || product.descriptionEn || productName;
  const canonicalUrl = `${window.location.origin}${pathForLocale(window.location.pathname, lang)}`;
  const structuredData = productStructuredData({
    id: product.id,
    name: productName,
    description: productDescription,
    imagePath: images[0] || "/products/hero-product.jpg",
    price: product.flashSalePrice || product.salePrice || product.price,
    stock: productStock,
    url: canonicalUrl,
    origin: window.location.origin,
    brand: (product as { brand?: string }).brand || "Hi Line",
  });

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      <Helmet>
        <title>{`${productName} | Hi Line Pro Care`}</title>
        <meta name="description" content={productDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <Toaster position="top-center" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-[#6F6178]">
            <Link to={pathForLocale("/", lang)} className="hover:text-[#B57EDC]">
              {lang === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={pathForLocale("/shop", lang)} className="hover:text-[#B57EDC]">
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

            {product.flashSaleEndsAt && new Date(product.flashSaleEndsAt) > new Date() && (
              <div className="mb-4">
                <CountdownTimer targetDate={product.flashSaleEndsAt} />
              </div>
            )}

            <div className="flex items-end gap-3 mb-6">
              <p className="text-3xl font-bold text-[#D71920]">
                {parseFloat(product.flashSalePrice || product.salePrice || product.price).toFixed(0)}{" "}
                <span className="text-base font-normal text-[#6F6178]">
                  {t.currency}
                </span>
              </p>
              {(product.flashSalePrice || product.salePrice) && (
                <p className="text-lg text-[#8D7A97] line-through mb-1">
                  {parseFloat(product.price).toFixed(0)} {t.currency}
                </p>
              )}
            </div>

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

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
              <div className="flex items-center justify-between border-2 border-[#E7D8F1] rounded-xl px-4 py-3 sm:w-32 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-[#B57EDC] hover:text-[#4B1C71] p-1"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-bold text-[#4B1C71] text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-[#B57EDC] hover:text-[#4B1C71] p-1"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-3 flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={added || productStock === 0}
                  className={`flex-1 py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    added
                      ? "bg-green-500 text-white shadow-green-500/20"
                      : "bg-[#4B1C71] text-white hover:bg-[#3a1558] shadow-[#4B1C71]/20 hover:shadow-lg hover:-translate-y-0.5"
                  } ${
                    productStock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 animate-in zoom-in" />
                      {lang === "ar" ? "تمت الإضافة" : "Added"}
                    </>
                  ) : (
                    lang === "ar" ? "أضف إلى السلة" : "Add to Cart"
                  )}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                    isWishlisted 
                      ? "border-[#B57EDC] bg-[#F7ECFF] text-[#B57EDC] shadow-sm"
                      : "border-[#E7D8F1] bg-white text-[#8D7A97] hover:border-[#B57EDC] hover:text-[#B57EDC]"
                  }`}
                  title={lang === "ar" ? "المفضلة" : "Wishlist"}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? "fill-[#B57EDC]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mb-8">
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

      {/* Reviews Section */}
      <div className="bg-[#FCF8FF] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#4B1C71] mb-8">
            {lang === "ar" ? "التقييمات والمراجعات" : "Reviews & Ratings"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-[#E7D8F1]">
                      <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[#6F6178] text-sm leading-relaxed mb-4">{review.comment}</p>
                      
                      {review.images && listValue<string>(review.images).length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {listValue<string>(review.images).map((img, i) => (
                            <img key={i} src={img} alt="Review" className="w-20 h-20 object-cover rounded-lg border border-[#E7D8F1] flex-shrink-0" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-[#E7D8F1] text-center">
                  <Star className="w-12 h-12 text-[#E7D8F1] mx-auto mb-3" />
                  <p className="text-[#6F6178]">
                    {lang === "ar" ? "لا توجد تقييمات حتى الآن. كن أول من يقيم!" : "No reviews yet. Be the first to review!"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-white p-6 rounded-2xl border border-[#E7D8F1] shadow-sm sticky top-24">
                <h3 className="font-bold text-[#4B1C71] mb-4">
                  {lang === "ar" ? "أضف تقييمك" : "Write a Review"}
                </h3>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#6F6178] mb-2">
                      {lang === "ar" ? "تقييمك" : "Your Rating"}
                    </label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              i < reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6F6178] mb-2">
                      {lang === "ar" ? "مراجعتك (اختياري)" : "Your Review (optional)"}
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 resize-none text-sm"
                      placeholder={lang === "ar" ? "شاركونا رأيكم بالمنتج..." : "Share your experience..."}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6F6178] mb-2">
                      {lang === "ar" ? "صور المنتج (اختياري)" : "Product Photos (optional)"}
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {reviewImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img src={img} alt="Upload" className="w-full h-full object-cover rounded-lg border border-[#E7D8F1]" />
                          <button
                            type="button"
                            onClick={() => setReviewImages(prev => prev.filter((_, index) => index !== i))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {reviewImages.length < 3 && (
                        <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-[#E7D8F1] rounded-lg cursor-pointer hover:border-[#B57EDC] hover:bg-[#F7ECFF] transition-colors">
                          <Upload className="w-5 h-5 text-[#B57EDC]" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={addReview.isPending}
                    className="w-full py-3 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors disabled:opacity-70"
                  >
                    {addReview.isPending ? "..." : (lang === "ar" ? "إرسال التقييم" : "Submit Review")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Dynamic Product Bundling */}
      {product.relatedProductsList && product.relatedProductsList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-[#fcf8ff] to-[#fff] rounded-3xl p-8 border border-[#B57EDC]/20 shadow-sm">
            <h2 className="text-2xl font-bold text-[#4B1C71] mb-6 flex items-center gap-2">
              <Tag className="w-6 h-6 text-[#B57EDC]" />
              {lang === 'ar' ? 'اشترك معاً ووفر 10%' : 'Buy Together & Save 10%'}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 flex items-center justify-center gap-4 w-full">
                {/* Current Product */}
                <div className="flex-1 beauty-card p-4 rounded-xl text-center bg-white">
                  <img src={images[0]} alt={product.nameEn} className="w-24 h-24 mx-auto object-contain mb-2" loading="lazy" />
                  <p className="text-sm font-semibold text-[#4B1C71] truncate">{lang === 'ar' && product.nameAr ? product.nameAr : product.nameEn}</p>
                  <p className="text-xs text-[#B57EDC]">{parseFloat(product.price).toFixed(0)} {t.currency}</p>
                </div>
                <Plus className="w-8 h-8 text-[#B57EDC] flex-shrink-0" />
                {/* Recommended Product */}
                <div className="flex-1 beauty-card p-4 rounded-xl text-center bg-white">
                  <img src={listValue(product.relatedProductsList[0].images)[0]} alt={product.relatedProductsList[0].nameEn} className="w-24 h-24 mx-auto object-contain mb-2" loading="lazy" />
                  <p className="text-sm font-semibold text-[#4B1C71] truncate">{lang === 'ar' && product.relatedProductsList[0].nameAr ? product.relatedProductsList[0].nameAr : product.relatedProductsList[0].nameEn}</p>
                  <p className="text-xs text-[#B57EDC]">{parseFloat(product.relatedProductsList[0].price).toFixed(0)} {t.currency}</p>
                </div>
              </div>
              <div className="flex-shrink-0 bg-white p-6 rounded-2xl shadow-sm text-center min-w-[200px]">
                <p className="text-sm text-[#6F6178] line-through mb-1">
                  {(parseFloat(product.price) + parseFloat(product.relatedProductsList[0].price)).toFixed(0)} {t.currency}
                </p>
                <p className="text-3xl font-bold text-[#4B1C71] mb-4">
                  {((parseFloat(product.price) + parseFloat(product.relatedProductsList[0].price)) * 0.9).toFixed(0)} {t.currency}
                </p>
                <button 
                  onClick={() => {
                    addItem({ productId: product.id, name: product.nameEn, nameAr: product.nameAr, scent: product.scent, scentColor: product.scentColor, price: (parseFloat(product.price)*0.9).toFixed(2), salePrice: null, image: images[0], stock: productStock });
                    const rel = product.relatedProductsList[0];
                    addItem({ productId: rel.id, name: rel.nameEn, nameAr: rel.nameAr, scent: rel.scent, scentColor: rel.scentColor, price: (parseFloat(rel.price)*0.9).toFixed(2), salePrice: null, image: listValue(rel.images)[0], stock: 10 });
                    toast.success(lang === 'ar' ? 'تم إضافة العرض للسلة!' : 'Bundle added to cart!');
                  }}
                  className="w-full beauty-button py-3 rounded-xl font-bold text-white shadow-lg shadow-[#B57EDC]/30"
                >
                  {lang === 'ar' ? 'أضف العرض للسلة' : 'Add Bundle to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    to={pathForLocale(`/shop/${related.slug}`, lang)}
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

      {/* Recently Viewed */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h2 className="text-2xl font-bold text-[#4B1C71] mb-8 text-center">
            {lang === "ar" ? "شوهد مؤخراً" : "Recently Viewed"}
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
            {recentlyViewed.map((recent) => {
              const relImages = listValue<string>(recent.images);
              return (
                <Link
                  key={recent.id}
                  to={pathForLocale(`/shop/${recent.slug}`, lang)}
                  className="group beauty-card rounded-2xl overflow-hidden min-w-[240px] snap-start"
                >
                  <div
                    className="aspect-square flex items-center justify-center p-6"
                    style={{
                      background: `linear-gradient(145deg, ${recent.scentColor || "#B57EDC"}12, #fcf8ff)`,
                    }}
                  >
                    <img
                      src={relImages[0] || "/products/hero-product.jpg"}
                      alt={recent.nameEn}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-[#4B1C71]">
                      {lang === "ar" && recent.nameAr
                        ? recent.nameAr
                        : recent.nameEn}
                    </h3>
                    <p className="text-base font-bold text-[#4B1C71] mt-1">
                      {parseFloat(recent.price).toFixed(0)} {t.currency}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add To Cart */}
      {showStickyCart && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E7D8F1] p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:hidden animate-in slide-in-from-bottom-full">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-[#4B1C71] line-clamp-1">
                {lang === "ar" && product.nameAr ? product.nameAr : product.nameEn}
              </p>
              <p className="text-[#D71920] font-bold text-sm">
                {parseFloat(product.flashSalePrice || product.salePrice || product.price).toFixed(0)} {t.currency}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={added || productStock === 0}
              className={`px-6 py-2.5 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-[#4B1C71] text-white"
              } ${productStock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
              {added ? (lang === "ar" ? "تم" : "Added") : (lang === "ar" ? "إضافة" : "Add")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
