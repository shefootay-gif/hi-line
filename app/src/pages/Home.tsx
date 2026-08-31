import { useLanguage } from "@/hooks/useLanguage";
import { pathForLocale } from "@/lib/localeRouting";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { type CatalogProduct } from "@/lib/hiLineCatalog";
import { productImage } from "@/lib/product-media";
import { ProductPackshot } from "@/components/ProductPackshot";
import { isBundleOffer, productScentLabel } from "@/lib/product-presentation";
import { sortProducts, type ProductSort } from "@/lib/product-sorting";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import {
  Shield,
  Leaf,
  Award,
  Droplets,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(ScrollTrigger);

const benefitCards = [
  {
    icon: Shield,
    title: "Effective, Safe Ingredients",
    titleAr: "مكونات فعالة وآمنة",
    desc: "We choose natural extracts and carefully considered ingredients.",
    descAr: "لأننا نختار خلاصات طبيعية ومكونات مدروسة.",
  },
  {
    icon: Leaf,
    title: "Care for Your Skin Type",
    titleAr: "عناية مخصصة لنوع بشرتك",
    desc: "Care focused on real skin concerns and addressing them naturally and effectively.",
    descAr: "تركز على مشاكل البشرة الحقيقية وحلها بشكل طبيعي وفعال.",
  },
  {
    icon: Award,
    title: "International-Standard Quality",
    titleAr: "جودة تضاهي المنتجات العالمية",
    desc: "We combine high manufacturing standards with a price suited to your everyday routine.",
    descAr: "نمزج بين أعلى معايير الجودة للتصنيع وبين السعر الذي يناسب استخدامك اليومي المستمر.",
  },
  {
    icon: Droplets,
    title: "Confidence and Safe Use",
    titleAr: "ثقة واستخدام آمن",
    desc: "Our products are free from harmful substances and harsh ingredients, making it easier to enjoy a light, reliable daily care routine.",
    descAr: "منتجاتنا خالية من المواد الضارة والمكونات القاسية، لنسهل عليك الاستمتاع بروتين عناية يومي خفيف وموثوق.",
  },
];

import { getArabicScentName } from "../lib/translations";

type HomeProduct = CatalogProduct;

export default function Home() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: faqs } = trpc.store.getFaqs.useQuery();
  const { data: settings } = trpc.store.getSettings.useQuery();
  const { data: apiProducts } = trpc.store.getProducts.useQuery();

  const sourceProducts = (apiProducts ?? []).map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
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
        brand: "Hi Line" as const,
        section: "Roll On" as const,
        category: "Roll On" as const,
        shortDescriptionEn: "",
        shortDescriptionAr: "",
        descriptionEn: "",
      }));

  const [productSort, setProductSort] = useState<ProductSort>("oldest");
  const sortedProducts = sortProducts(sourceProducts, productSort);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const storeName = (lang === "ar" ? settings?.store_name_ar : settings?.store_name_en) || t.heroSubtitle;
  const tagline = (lang === "ar" ? settings?.tagline_ar : settings?.tagline_en) || t.heroDescription;

  const heroRef = useRef<HTMLDivElement>(null);
  const scentRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
      );

      // Scent cards animation
      if (scentRef.current) {
        gsap.fromTo(
          ".scent-card",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scentRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // Benefits animation
      if (benefitsRef.current) {
        gsap.fromTo(
          ".benefit-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: "top 80%",
            },
          }
        );
      }

    });

    return () => ctx.revert();
  }, []);

  const handleAddToCart = (product: HomeProduct) => {
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



  const visibleFaqs = faqs?.slice(0, 4) || [];

  return (
    <div>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative flex items-center overflow-hidden beauty-section py-20 sm:py-28"
        style={{
          background: `radial-gradient(ellipse at 80% 100%, rgba(219,182,238,0.34) 0%, transparent 58%), radial-gradient(ellipse at 12% 18%, rgba(181,126,220,0.16) 0%, transparent 42%), linear-gradient(135deg, #FCF8FF 0%, #FFFFFF 52%, #F7ECFF 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-center">
            {/* Text Content */}
            <div className="text-center max-w-2xl">
              <p className="hero-text text-xs sm:text-sm uppercase beauty-eyebrow font-semibold mb-4">
                {lang === "ar" ? "التركيبة اللبنانية" : "Lebanese Formula"}
              </p>
              <h1 className="hero-text text-5xl sm:text-6xl lg:text-7xl font-black text-[#4B1C71] leading-none mb-3">
                {lang === "ar" ? "هاي لاين" : "Hi Line"}
              </h1>
              <h2 className="hero-text text-3xl sm:text-4xl font-semibold text-[#B57EDC] mb-6">
                {lang === "ar" ? "برو كير" : "Pro Care"}
              </h2>
              <h3 className="sr-only">
                {storeName}
              </h3>
              <p className="sr-only">
                {t.heroTitle}
              </p>
              <p className="sr-only">
                {tagline}
              </p>
              <p className="hero-text text-base sm:text-lg text-[#6F6178] leading-relaxed mb-8">
                {lang === "ar"
                  ? "اختاري منتجات هاي لاين برو كير للعناية اليومية بروائح مميزة، ملمس لطيف، وانتعاش يدوم طوال اليوم."
                  : "Discover Hi Line Pro Care daily essentials with elegant scents, gentle formulas, and freshness that lasts."}
              </p>
              <div
                className={`hero-text flex flex-col sm:flex-row gap-4 ${
                  isRTL ? "sm:flex-row-reverse" : ""
                } justify-center mb-8`}
              >
                <button
                  onClick={() => navigate(pathForLocale("/shop", lang))}
                  className="px-8 py-3.5 beauty-button font-semibold rounded-xl"
                >
                  {t.shopNow}
                </button>
                <a
                  href={`https://wa.me/201223863092?text=${encodeURIComponent(
                    lang === "ar"
                      ? "مرحبًا، أرغب في طلب منتجات هاي لاين برو كير."
                      : "Hello! I'm interested in ordering Hi Line Pro Care products."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-[#25D366] text-[#25D366] font-semibold rounded-xl hover:bg-[#25D366] hover:text-white transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.orderOnWhatsApp}
                </a>
              </div>
              {/* Feature badges */}
              <div
                className="hero-text flex flex-wrap gap-3 justify-center"
              >
                {[
                  { icon: Leaf, label: t.naturalIngredients },
                  { icon: Shield, label: t.skinSafeProducts },
                  { icon: Award, label: t.lebaneseFormula },
                ].map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 px-4 py-2 beauty-pill rounded-full text-xs font-medium"
                  >
                    <badge.icon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Scent Collection Section */}
      <section ref={scentRef} className="py-20 sm:py-28 bg-[#F7ECFF] beauty-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "مجموعتنا" : "OUR COLLECTION"}
            </p>
            <h2 className="mb-2 text-2xl font-semibold text-[#7F4CA5] sm:text-3xl">
              {lang === "ar" ? "مجموعة العناية اليومية" : "Daily Care Collection"}
            </h2>
            <p className="mx-auto max-w-md text-[#6F6178]">
              {lang === "ar" ? "منتجات مختارة بعناية لتجربة انتعاش يومية أنيقة" : "A curated care collection for a fresh, elegant daily routine"}
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <label htmlFor="home-product-sort" className="text-sm font-medium text-[#6F6178]">
              {lang === "ar" ? "ترتيب المنتجات" : "Sort products"}
            </label>
            <select
              id="home-product-sort"
              value={productSort}
              onChange={(event) => setProductSort(event.target.value as ProductSort)}
              className="min-h-11 w-full rounded-xl border border-[#E8D4F5] bg-white px-3 py-2 text-sm text-[#4A2063] focus:outline-none focus:ring-2 focus:ring-[#B57EDC] sm:w-auto"
            >
              <option value="oldest">{lang === "ar" ? "الأقدم أولًا" : "Oldest first"}</option>
              <option value="newest">{lang === "ar" ? "الأحدث أولًا" : "Newest first"}</option>
              <option value="price-asc">{lang === "ar" ? "السعر: من الأقل للأعلى" : "Price: low to high"}</option>
              <option value="price-desc">{lang === "ar" ? "السعر: من الأعلى للأقل" : "Price: high to low"}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {sortedProducts.map((product) => {
              const variant = {
                id: product.id,
                name: product.nameEn,
                nameAr: product.nameAr || product.nameEn,
                scent: product.scent,
                scentAr: getArabicScentName(product.scent),
                color: product.scentColor,
                image: product.images[0],
                slug: product.slug,
              };
              return (
                <div
                  key={variant.id}
                  className="scent-card group overflow-hidden rounded-lg border border-[#E7D8F1]/80 bg-white shadow-[0_10px_30px_rgba(75,28,113,0.07)]"
                >
                  <Link to={pathForLocale(`/shop/${variant.slug}`, lang)} className="block">
                    <div
                      className="aspect-square relative flex items-center justify-center bg-white"
                      style={{
                        background: `linear-gradient(145deg, ${variant.color}12, #fcf8ff)`,
                      }}
                    >
                      {product.discountLabel && (
                        <span dir="ltr" className="absolute left-3 top-3 z-10 rounded-full bg-[#D71920] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          {isBundleOffer(product.slug) ? `1+1 · ${product.discountLabel}` : product.discountLabel}
                        </span>
                      )}
                      <ProductPackshot
                        src={variant.image}
                        alt={lang === "ar" ? variant.nameAr : variant.name}
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4 text-center">
                    <span
                      className="hidden"
                      style={{ backgroundColor: variant.color }}
                    >
                      {lang === "ar" ? variant.nameAr : variant.name}
                    </span>
                    <h3 className="min-h-[3.4rem] text-sm font-semibold leading-snug text-[#241A2E]">
                      {lang === "ar" ? (
                        <span className="block">{variant.nameAr}</span>
                      ) : (
                        <>
                          <span className="block">Hi Line Pro Care</span>
                          <span className="block">{variant.name}</span>
                        </>
                      )}
                    </h3>
                    {productScentLabel(product.slug, product.scent, lang) && <p className="mt-1 text-xs font-medium text-[#7F4CA5]">
                      {productScentLabel(product.slug, product.scent, lang)}
                    </p>}
                    <div className="mt-3 flex flex-wrap items-baseline justify-center gap-2">
                      <span className="text-base font-black text-[#D71920]">
                        {product.salePrice ? product.salePrice : product.price} {lang === "ar" ? "ج.م" : "LE"}
                      </span>
                      {product.salePrice && (
                        <span className="text-sm text-[#8D7A97] line-through">
                          {product.price} {lang === "ar" ? "ج.م" : "LE"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (product) handleAddToCart(product);
                      }}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        addedIds.has(product?.id || 0)
                          ? "bg-green-500 text-white"
                            : "beauty-button"
                      }`}
                    >
                      {addedIds.has(product?.id || 0)
                        ? t.added
                        : t.addToCart}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video / Lifestyle Section */}
      <section className="py-20 sm:py-28 bg-white beauty-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "اكتشف" : "DISCOVER"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {t.seeHiLineInAction}
            </h2>
          </div>
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden beauty-card">
            <img
              src="/campaign/tropical-48h.jpg"
              alt={lang === "ar" ? "أسلوب حياة هاي لاين" : "Hi Line Lifestyle"}
              loading="lazy"
              className="w-full aspect-video object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-lg font-semibold mb-2">
                {lang === "ar"
                  ? "انتعاش يومي يدوم طويلاً"
                  : "Daily freshness that lasts"}
              </p>
              <button
                onClick={() => navigate(pathForLocale("/shop", lang))}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
              >
                {t.shopNow} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        ref={benefitsRef}
        className="py-20 sm:py-28"
        style={{ backgroundColor: "rgba(255,241,245,0.72)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "لماذا نحن" : "WHY US"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {t.whyChooseHiLine}
            </h2>
            <p className="max-w-3xl mx-auto text-base text-[#6F6178] leading-relaxed">
              {t.whyHiLineIntro}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefitCards.map((card, idx) => (
              <div
                key={idx}
                className="benefit-card beauty-card rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#F7ECFF] flex items-center justify-center">
                  <card.icon className="w-7 h-7 text-[#B57EDC]" />
                </div>
                <h3 className="text-lg font-semibold text-[#4B1C71] mb-2">
                  {lang === "ar" ? card.titleAr : card.title}
                </h3>
                <p className="text-sm text-[#6F6178] leading-relaxed">
                  {lang === "ar" ? card.descAr : card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20 sm:py-28 bg-[#F7ECFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "مساعدة" : "HELP"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {t.commonQuestions}
            </h2>
          </div>

          <div className="space-y-3">
            {visibleFaqs.map((faq) => (
              <div
                key={faq.id}
                className="beauty-card rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === faq.id ? null : faq.id)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm font-medium text-[#4B1C71]">
                    {lang === "ar" ? faq.questionAr : faq.questionEn}
                  </span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-[#8D7A97] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8D7A97] shrink-0" />
                  )}
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-[#6F6178] leading-relaxed">
                      {lang === "ar" ? faq.answerAr : faq.answerEn}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to={pathForLocale("/faq", lang)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#4B1C71] hover:text-[#B57EDC] transition-colors"
            >
              {t.viewAllFaqs} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Showcase */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "المجموعة" : "COLLECTION"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {lang === "ar"
                ? "خمس روائح، انتعاش لا حدود له"
                : "Five Scents, Endless Freshness"}
            </h2>
          </div>
          <div className="rounded-3xl overflow-hidden beauty-card">
            <img
              src="/campaign/collection-pool.jpg"
              alt={lang === "ar" ? "مجموعة هاي لاين" : "Hi Line Collection"}
              loading="lazy"
              className="w-full aspect-[16/9] object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        </div>
      </section>

      {/* Newsletter / Contact CTA Section */}
      <section
        className="py-20 sm:py-28"
        style={{
          background: "linear-gradient(135deg, #B57EDC 0%, #C9A2E2 52%, #DBB6EE 100%)",
        }}
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t.stayFresh}
          </h2>
          <p className="text-white/80 mb-8">{t.subscribeText}</p>

          <div
            className={`flex flex-col sm:flex-row gap-3 mb-6 ${
              isRTL ? "sm:flex-row-reverse" : ""
            }`}
          >
            <input
              type="email"
              aria-label={t.emailPlaceholder}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="flex-1 px-6 py-3.5 rounded-full bg-white text-[#4B1C71] placeholder:text-[#8D7A97] focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-8 py-3.5 bg-[#4B1C71] text-white font-semibold rounded-full hover:bg-[#3B1559] transition-colors">
              {t.subscribe}
            </button>
          </div>

          <p className="text-white/60 text-sm mb-4">{t.or}</p>

          <a
            href={`https://wa.me/201223863092?text=${encodeURIComponent(
              lang === "ar"
                ? "مرحبًا، أرغب في طلب منتجات هاي لاين برو كير."
                : "Hello! I'm interested in ordering Hi Line Pro Care products."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-white font-semibold rounded-full hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t.orderOnWhatsApp}
          </a>
        </div>
      </section>
    </div>
  );
}
