import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
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

const scentVariants = [
  {
    id: 1,
    name: "Tropical Breeze",
    nameAr: "تروبيكال بريز",
    color: "#159C73",
    image: "/products/tropical-breeze.jpg",
    slug: "hi-line-deodorant-roll-on-tropical-breeze",
  },
  {
    id: 2,
    name: "Voyage",
    nameAr: "فوياج",
    color: "#1E6D9E",
    image: "/products/voyage.jpg",
    slug: "hi-line-deodorant-roll-on-voyage",
  },
  {
    id: 3,
    name: "Candy Pop",
    nameAr: "كاندي بوب",
    color: "#C85BAA",
    image: "/products/candy-pop.jpg",
    slug: "hi-line-deodorant-roll-on-candy-pop",
  },
  {
    id: 4,
    name: "Sweet Mango",
    nameAr: "سويت مانجو",
    color: "#F28A24",
    image: "/products/sweet-mango.jpg",
    slug: "hi-line-deodorant-roll-on-sweet-mango",
  },
  {
    id: 5,
    name: "Fragrance Free",
    nameAr: "بدون عطر",
    color: "#4B1C71",
    image: "/products/fragrance-free.jpg",
    slug: "hi-line-deodorant-roll-on-fragrance-free",
  },
];

const benefitCards = [
  {
    icon: Shield,
    title: "48h Protection",
    titleAr: "حماية 48 ساعة",
    desc: "Stay fresh all day with up to 48 hours of reliable protection",
    descAr: "ابقَ منتعشاً طوال اليوم مع حماية تصل إلى 48 ساعة",
  },
  {
    icon: Leaf,
    title: "0% Aluminum",
    titleAr: "0% ألمنيوم",
    desc: "Clean formula with zero aluminum for healthy skin",
    descAr: "تركيبة نظيفة خالية من الألمنيوم لبشرة صحية",
  },
  {
    icon: Award,
    title: "Lebanese Formula",
    titleAr: "تركيبة لبنانية",
    desc: "Premium quality crafted with Lebanese expertise",
    descAr: "جودة ممتازة مصنوعة بالخبرة اللبنانية",
  },
  {
    icon: Droplets,
    title: "Daily Freshness",
    titleAr: "انتعاش يومي",
    desc: "Smooth roll-on application for everyday confidence",
    descAr: "تطبيق سلس بالرول لثقة يومية",
  },
];

const howToSteps = [
  {
    num: "1",
    title: "Shake Well",
    titleAr: "رجّ جيداً",
    desc: "Shake the bottle before each use",
    descAr: "رجّ الزجاجة قبل كل استخدام",
  },
  {
    num: "2",
    title: "Apply",
    titleAr: "ضع المنتج",
    desc: "Roll onto clean, dry underarms",
    descAr: "ادهن على الإبطين النظيفين والجافين",
  },
  {
    num: "3",
    title: "Let Dry",
    titleAr: "اتركه يجف",
    desc: "Wait a moment before dressing",
    descAr: "انتظر قليلاً قبل ارتداء الملابس",
  },
];

type HomeProduct = {
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

export default function Home() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { data: products } = trpc.store.getProducts.useQuery();
  const { data: faqs } = trpc.store.getFaqs.useQuery();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const heroRef = useRef<HTMLDivElement>(null);
  const scentRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const howToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        ".hero-text",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
      );
      gsap.fromTo(
        ".hero-product",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: "power2.out" }
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

      // How to animation
      if (howToRef.current) {
        gsap.fromTo(
          ".how-step",
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: howToRef.current,
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

  const getProductForScent = (scentName: string) => {
    return products?.find(
      (p) => p.scent.toLowerCase() === scentName.toLowerCase()
    );
  };

  const getProductPrice = (product: any) => {
    if (!product) return "85";
    return parseFloat(product.price).toFixed(0);
  };

  const visibleFaqs = faqs?.slice(0, 4) || [];

  return (
    <div>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center overflow-hidden beauty-section"
        style={{
          background: `radial-gradient(ellipse at 80% 100%, rgba(219,182,238,0.34) 0%, transparent 58%), radial-gradient(ellipse at 12% 18%, rgba(181,126,220,0.16) 0%, transparent 42%), linear-gradient(135deg, #FCF8FF 0%, #FFFFFF 52%, #F7ECFF 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div
            className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-8 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left max-w-xl">
              <p className="hero-text text-xs sm:text-sm uppercase beauty-eyebrow font-semibold mb-4">
                Lebanese Formula
              </p>
              <h1 className="hero-text text-4xl sm:text-5xl lg:text-6xl font-bold text-[#4B1C71] leading-tight mb-4">
                {t.heroTitle}
              </h1>
              <h2 className="hero-text text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#B57EDC] mb-6">
                {t.heroSubtitle}
              </h2>
              <p className="hero-text text-base sm:text-lg text-[#6F6178] leading-relaxed mb-8">
                {t.heroDescription}
              </p>
              <div
                className={`hero-text flex flex-col sm:flex-row gap-4 ${
                  isRTL ? "sm:flex-row-reverse" : ""
                } justify-center lg:justify-start mb-8`}
              >
                <button
                  onClick={() => navigate("/shop")}
                  className="px-8 py-3.5 beauty-button font-semibold rounded-xl"
                >
                  {t.shopNow}
                </button>
                <a
                  href={`https://wa.me/201223863092?text=${encodeURIComponent(
                    "Hello! I'm interested in ordering Hi Line Pro Care products."
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
                className={`hero-text flex flex-wrap gap-3 justify-center lg:justify-start`}
              >
                {[
                  { icon: Shield, label: t.hoursProtection },
                  { icon: Leaf, label: t.zeroAluminum },
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

            {/* Product Image */}
            <div className="flex-1 flex justify-center">
              <div className="hero-product relative beauty-card rounded-[2rem] p-3 sm:p-4 float-soft">
                <img
                  src="/campaign/beach-collection.jpg"
                  alt="Hi Line Deodorant"
                  loading="eager"
                  className="w-72 sm:w-96 lg:w-[28rem] aspect-[4/5] object-cover rounded-[1.5rem] drop-shadow-2xl"
                />
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
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {t.chooseYourScent}
            </h2>
            <p className="text-[#6F6178] max-w-md mx-auto">{t.scentSubtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {scentVariants.map((variant) => {
              const product = getProductForScent(variant.name);
              return (
                <div
                  key={variant.id}
                  className="scent-card group beauty-card rounded-2xl overflow-hidden"
                >
                  <Link to={`/shop/${variant.slug}`} className="block">
                    <div
                      className="aspect-square relative flex items-center justify-center p-6"
                      style={{
                        background: `linear-gradient(145deg, ${variant.color}12, #fcf8ff)`,
                      }}
                    >
                      <img
                        src={variant.image}
                        alt={variant.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white mb-2"
                      style={{ backgroundColor: variant.color }}
                    >
                      {lang === "ar" ? variant.nameAr : variant.name}
                    </span>
                    <h3 className="text-sm font-semibold text-[#4B1C71] mb-1">
                      Hi Line
                    </h3>
                    <p className="text-xs text-[#6F6178] mb-2">
                      {lang === "ar" ? "رول أون مزيل عرق" : "Deodorant Roll On"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-[#4B1C71]">
                        {getProductPrice(product)} {t.currency}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => product && handleAddToCart(product)}
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
              alt="Hi Line Lifestyle"
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
                onClick={() => navigate("/shop")}
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

      {/* How to Use Section */}
      <section ref={howToRef} className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase beauty-eyebrow font-semibold mb-3">
              {lang === "ar" ? "دليل الاستخدام" : "GUIDE"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4B1C71] mb-4">
              {t.howToUse}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-4">
            {howToSteps.map((step, idx) => (
              <div key={idx} className="how-step flex-1 text-center relative">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#B57EDC] text-white flex items-center justify-center text-lg font-bold shadow-[0_12px_28px_rgba(181,126,220,0.22)]">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-[#4B1C71] mb-1">
                  {lang === "ar" ? step.titleAr : step.title}
                </h3>
                <p className="text-sm text-[#6F6178]">
                  {lang === "ar" ? step.descAr : step.desc}
                </p>
                {idx < howToSteps.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-6 ${
                      isRTL ? "-left-2" : "-right-2"
                    } w-full border-t-2 border-dashed border-[#E7D8F1]`}
                  />
                )}
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
              to="/faq"
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
              alt="Hi Line Collection"
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
              "Hello! I'm interested in ordering Hi Line Pro Care products."
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
