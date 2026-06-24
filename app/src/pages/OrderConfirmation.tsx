import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useLocation, Link } from "react-router";
import { CheckCircle, MessageCircle, Home } from "lucide-react";

export default function OrderConfirmation() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const location = useLocation();
  const { orderNumber, total } = location.state || {};

  if (!orderNumber) {
    return (
      <div className={`pt-24 pb-16 min-h-screen flex flex-col items-center justify-center ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <p className="text-[#6F6178] mb-4">
          {lang === "ar" ? "لا يوجد طلب" : "No order found"}
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl"
        >
          {t.startShopping}
        </Link>
      </div>
    );
  }

  const handleWhatsAppTrack = () => {
    const message =
      lang === "ar"
        ? `مرحبًا، أريد متابعة طلبي رقم: ${orderNumber}`
        : `Hello! I want to track my order #${orderNumber}`;
    window.open(
      `https://wa.me/201223863092?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-lg mx-auto px-4 text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">
          {t.orderSuccess}
        </h1>

        <div className="bg-[#F7ECFF] rounded-2xl p-6 my-8">
          <p className="text-sm text-[#6F6178] mb-1">{t.orderNumber}</p>
          <p className="text-2xl font-bold text-[#4B1C71] font-mono">
            {orderNumber}
          </p>
          <div className="border-t border-[#E7D8F1] mt-4 pt-4">
            <p className="text-sm text-[#6F6178]">{t.total}</p>
            <p className="text-xl font-bold text-[#4B1C71]">
              {total} {t.currency}
            </p>
          </div>
        </div>

        <p className="text-[#6F6178] mb-8">{t.orderSuccessMessage}</p>

        <div className="space-y-3">
          <button
            onClick={handleWhatsAppTrack}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t.trackOnWhatsApp}
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-4 border border-[#E7D8F1] text-[#4B1C71] font-medium rounded-xl hover:bg-[#F7ECFF] transition-colors"
          >
            <Home className="w-5 h-5" />
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
