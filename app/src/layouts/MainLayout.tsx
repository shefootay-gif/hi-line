import { Outlet, useNavigate, useLocation } from "react-router";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { pathForLocale, pathWithoutLocale } from "@/lib/localeRouting";
import { getActiveSocialLinks } from "@/lib/social-links";
import {
  ShoppingCart,
  Globe,
  Menu,
  X,
  Phone,
  MessageCircle,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  User,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function MainLayout() {
  const { lang, isRTL, toggleLanguage } = useLanguage();
  const t = useTranslations(lang);
  const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem } = useCart();
  const { user, logout } = useAuth({ redirectOnUnauthenticated: false });
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = trpc.store.getSettings.useQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      setLastScroll(currentScroll);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: t.shop, href: "/shop" },
    { label: t.about, href: "/about" },
    { label: t.faq, href: "/faq" },
    { label: t.contact, href: "/contact" },
    { label: lang === "ar" ? "تتبع طلبي" : "Track Order", href: "/track-order" },
  ];

  const cartItemCount = getTotalItems();
  const cartTotal = getTotalPrice();
  const logoUrl = settings?.logo_url || "/brand/logo.jpg";
  const storeName = (lang === "ar" ? settings?.store_name_ar : settings?.store_name_en) || "Hi Line Pro Care";
  const defaultAnnouncement =
    lang === "ar" ? "خصم 50% على مجموعة Hi Line Roll On" : "50% OFF Hi Line Roll On Collection";
  const savedAnnouncement = lang === "ar" ? settings?.announcement_text_ar : settings?.announcement_text_en;
  const announcement =
    savedAnnouncement && !/free shipping|شحن مجاني|500/i.test(savedAnnouncement)
      ? savedAnnouncement
      : defaultAnnouncement;
  const socialLinks = getActiveSocialLinks(settings);
  const whatsappLink = socialLinks.find(link => link.key === "whatsapp_number");
  const displayPhone = settings?.phone_number || settings?.whatsapp_number || "+20 122 386 3092";
  const whatsappText = encodeURIComponent("Hello! I'm interested in ordering Hi Line Pro Care products.");
  const whatsappOrderUrl = whatsappLink ? `${whatsappLink.href}?text=${whatsappText}` : null;
  const seoByPath: Record<"ar" | "en", Record<string, { title: string; description: string }>> = {
    ar: {
      "/": { title: "هاي لاين برو كير | عناية يومية وانتعاش يدوم", description: "تسوق منتجات هاي لاين برو كير للعناية اليومية مع التوصيل داخل مصر والدفع عند الاستلام." },
      "/shop": { title: "منتجات هاي لاين برو كير", description: "اكتشف مجموعة هاي لاين برو كير رول أون بروائح متنوعة وأسعار محدثة." },
      "/about": { title: "عن هاي لاين برو كير", description: "تعرف على علامة هاي لاين برو كير ومنتجات العناية الشخصية." },
      "/contact": { title: "تواصل مع هاي لاين برو كير", description: "تواصل معنا للاستفسار عن المنتجات والطلبات والتوصيل." },
      "/faq": { title: "الأسئلة الشائعة | هاي لاين برو كير", description: "إجابات عن منتجات هاي لاين والطلب والدفع عند الاستلام والتوصيل." },
    },
    en: {
      "/": { title: "Hi Line Pro Care | Daily Personal Care", description: "Shop Hi Line Pro Care personal-care essentials and signature scents with convenient delivery across Egypt." },
      "/shop": { title: "Shop Hi Line Pro Care Products", description: "Browse Hi Line Pro Care roll-ons and daily personal-care products in signature scents." },
      "/about": { title: "About Hi Line Pro Care", description: "Discover the Hi Line Pro Care story and our approach to dependable everyday personal care." },
      "/contact": { title: "Contact Hi Line Pro Care", description: "Contact Hi Line Pro Care for product, order, and delivery support." },
      "/faq": { title: "Hi Line Pro Care FAQs", description: "Find answers about Hi Line Pro Care products, ordering, payment, and delivery." },
    },
  };
  const storefrontPath = pathWithoutLocale(location.pathname);
  const seo = seoByPath[lang][storefrontPath] ?? {
    title: lang === "ar" ? "هاي لاين برو كير" : "Hi Line Pro Care",
    description: lang === "ar" ? "متجر هاي لاين برو كير الرسمي في مصر." : "Shop Hi Line Pro Care personal-care essentials and signature scents.",
  };
  const privatePath = ["/cart", "/checkout", "/account", "/order-confirmation", "/track-order"].some(
    path => storefrontPath.startsWith(path),
  );
  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  const arabicUrl = `${window.location.origin}${pathForLocale(location.pathname, "ar")}`;
  const englishUrl = `${window.location.origin}${pathForLocale(location.pathname, "en")}`;

  return (
    <div className={`min-h-screen flex flex-col beauty-shell ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Helmet>
        <html lang={lang} dir={isRTL ? "rtl" : "ltr"} />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ar" href={arabicUrl} />
        <link rel="alternate" hrefLang="en" href={englishUrl} />
        <link rel="alternate" hrefLang="x-default" href={englishUrl} />
        {privatePath && <meta name="robots" content="noindex, nofollow" />}
        {storefrontPath === "/" && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${window.location.origin}/#organization`,
              name: "Bellory Pharma",
              alternateName: storeName,
              url: window.location.origin,
              logo: new URL(logoUrl, window.location.origin).href,
              brand: {
                "@type": "Brand",
                "@id": `${window.location.origin}/#brand`,
                name: "Hi Line Pro Care",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: displayPhone,
                contactType: "customer service",
              },
            })}
          </script>
        )}
      </Helmet>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-[#4B1C71] focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {lang === "ar" ? "تخطي إلى المحتوى" : "Skip to main content"}
      </a>
      {/* Promo Bar */}
      <div className="bg-[#4B1C71] text-white py-2.5 px-4 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
          <span className="font-semibold">{announcement}</span>
          <Link to={pathForLocale("/shop", lang)} className="hidden sm:inline-flex rounded-full bg-white/12 px-3 py-1 font-semibold hover:bg-white/20">
            Roll On
          </Link>
        </div>
      </div>

      {/* Header */}
      <header
        className={`sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E7D8F1]/70 shadow-[0_8px_30px_rgba(75,28,113,0.06)] transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to={pathForLocale("/", lang)} className="flex items-center shrink-0" onClick={scrollToTop}>
              <img
                src={logoUrl}
                alt={storeName}
                className="h-12 w-auto object-contain rounded-md"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={pathForLocale(link.href, lang)}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-[#B57EDC] ${
                    storefrontPath === link.href
                      ? "text-[#B57EDC]"
                      : "text-[#4B1C71]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full beauty-pill text-sm font-medium hover:bg-[#F1E1FF] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === "en" ? "AR" : "EN"}
              </button>

              {/* Mobile Language */}
              <button
                onClick={toggleLanguage}
                aria-label={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
                className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full beauty-pill"
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Cart */}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label={t.yourCart}
                    className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#F7ECFF] transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-[#4B1C71]" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#B57EDC] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:w-[400px] p-0">
                  <SheetHeader className="px-6 py-4 border-b border-[#E7D8F1] bg-[#FCF8FF]">
                    <SheetTitle className="text-lg font-semibold text-[#4B1C71]">
                      {t.yourCart}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-[calc(100vh-180px)]">
                    {items.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <ShoppingCart className="w-16 h-16 text-[#E7D8F1] mb-4" />
                        <p className="text-[#6F6178] mb-4">{t.emptyCart}</p>
                        <button
                          onClick={() => {
                            setCartOpen(false);
                            navigate(pathForLocale("/shop", lang));
                          }}
                          className="px-6 py-2.5 beauty-button font-semibold rounded-lg"
                        >
                          {t.startShopping}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
                          {items.map((item) => (
                            <div
                              key={item.productId}
                              className="flex gap-4 p-3 bg-[#FCF8FF] rounded-xl border border-[#E7D8F1]/60"
                            >
                              <img
                                src={item.image || "/products/hero-product.jpg"}
                                alt={lang === "ar" && item.nameAr ? item.nameAr : item.name}
                                loading="lazy"
                                className="w-20 h-20 object-contain rounded-lg bg-white"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-[#4B1C71] truncate">
                                  {lang === "ar" && item.nameAr
                                    ? item.nameAr
                                    : item.name}
                                </h4>
                                <p
                                  className="text-xs mt-0.5 font-medium"
                                  style={{ color: item.scentColor || "#6F6178" }}
                                >
                                  {item.scent}
                                </p>
                                <p className="text-sm font-semibold text-[#4B1C71] mt-1">
                                  {parseFloat(item.salePrice || item.price).toFixed(0)}{" "}
                                  {t.currency}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity - 1
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E7D8F1] hover:bg-[#F7ECFF]"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-medium w-6 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        item.productId,
                                        item.quantity + 1
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-[#E7D8F1] hover:bg-[#F7ECFF]"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.productId)}
                                    className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-[#E7D8F1] px-6 py-4 space-y-3 bg-white">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6F6178]">{t.subtotal}</span>
                            <span className="font-semibold">
                              {cartTotal.toFixed(0)} {t.currency}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#6F6178]">{t.shipping}</span>
                            <span className="text-[#8D7A97]">
                              {t.calculatedAtCheckout}
                            </span>
                          </div>
                          <div className="flex justify-between text-base font-bold border-t border-[#E7D8F1] pt-3">
                            <span>{t.total}</span>
                            <span>
                              {cartTotal.toFixed(0)} {t.currency}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setCartOpen(false);
                              navigate(pathForLocale("/checkout", lang));
                            }}
                            className="w-full py-3 beauty-button font-semibold rounded-xl"
                          >
                            {t.proceedToCheckout}
                          </button>
                          <button
                            onClick={() => setCartOpen(false)}
                            className="w-full py-2 text-sm text-[#6F6178] hover:text-[#4B1C71] transition-colors"
                          >
                            {t.continueShopping}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Mobile Login/User Icon */}
              {user ? (
                <Link
                  to="/my-orders"
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F7ECFF] transition-colors"
                  title={lang === "ar" ? "حسابي" : "My Account"}
                >
                  <User className="w-5 h-5 text-[#B57EDC]" />
                </Link>
              ) : (
                <Link
                  to={pathForLocale("/login", lang)}
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F7ECFF] transition-colors"
                  title={lang === "ar" ? "تسجيل الدخول" : "Login"}
                >
                  <User className="w-5 h-5 text-[#4B1C71]" />
                </Link>
              )}

              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full beauty-pill text-sm font-medium hover:bg-[#F1E1FF] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {lang === "ar" ? "حسابي" : "My Account"}
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full beauty-pill text-sm font-medium hover:bg-[#F1E1FF] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                </div>
              ) : (
                <Link
                  to={pathForLocale("/login", lang)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full beauty-pill text-sm font-medium hover:bg-[#F1E1FF] transition-colors"
                >
                  {t.login}
                </Link>
              )}

              {/* WhatsApp Quick Order */}
              {whatsappOrderUrl && (
              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#128C7E] transition-colors shadow-[0_10px_24px_rgba(37,211,102,0.2)]"
              >
                <MessageCircle className="w-4 h-4" />
                {t.orderOnWhatsApp}
              </a>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={
                  mobileMenuOpen
                    ? lang === "ar" ? "إغلاق القائمة" : "Close menu"
                    : lang === "ar" ? "فتح القائمة" : "Open menu"
                }
                aria-expanded={mobileMenuOpen}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F7ECFF] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E7D8F1] px-4 py-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2 text-sm font-medium ${
                    location.pathname === link.href
                      ? "text-[#B57EDC]"
                      : "text-[#4B1C71]"
                  }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-sm font-medium text-[#4B1C71]"
                  >
                    {lang === "ar" ? "حسابي" : "My Account"}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-between py-2 text-sm font-medium text-[#4B1C71]"
                  >
                    {lang === "ar" ? "تسجيل الخروج" : "Logout"}
                  </button>
                </>
              ) : (
                <Link
                  to={pathForLocale("/login", lang)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-[#4B1C71]"
                >
                  {t.login}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              {whatsappOrderUrl && <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-[#25D366] text-white font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                {t.orderOnWhatsApp}
              </a>}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#4B1C71] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div>
              <img
                src={logoUrl}
                alt={storeName}
                className="h-16 w-auto object-contain bg-white rounded-lg p-2 mb-6"
              />
              <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/70">
                {lang === "ar"
                  ? "Hi Line علامة تجارية مملوكة لشركة Bellory Pharma."
                  : "Hi Line is a brand owned by Bellory Pharma."}
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map(link => {
                  const SocialIcon = link.icon;
                  return (
                    <a
                      key={link.key}
                      href={link.href}
                      target={link.kind === "email" ? undefined : "_blank"}
                      rel={link.kind === "email" ? undefined : "noopener noreferrer"}
                      aria-label={lang === "ar" ? link.labelAr : link.labelEn}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#B57EDC] hover:text-white transition-colors"
                    >
                      <SocialIcon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                {t.quickLinks}
              </h4>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={pathForLocale(link.href, lang)}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                {t.products}
              </h4>
              <ul className="space-y-3">
                {[
                  "Tropical Breeze",
                  "Voyage",
                  "Candy Pop",
                  "Sweet Mango",
                  "Fragrance Free",
                ].map((scent) => (
                  <li key={scent}>
                    <Link
                      to={pathForLocale("/shop", lang)}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Hi Line - {scent}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
                {t.getInTouch}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <Phone className="w-4 h-4 text-[#C9A2E2]" />
                  <span>{displayPhone}</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white/70">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>{displayPhone}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} Bellory Pharma. {t.allRightsReserved}
            </p>
            <p className="flex items-center gap-1 text-sm text-white/50">
              {t.madeWithCare} <Heart className="w-3.5 h-3.5 text-red-400" />
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {whatsappOrderUrl && (
      <a
        href={whatsappOrderUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        style={{ [isRTL ? "left" : "right"]: "24px" }}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </a>
      )}
    </div>
  );
}
