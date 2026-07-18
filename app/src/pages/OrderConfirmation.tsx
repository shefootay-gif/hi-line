import { useLanguage } from "@/hooks/useLanguage";
import { pathForLocale } from "@/lib/localeRouting";
import { useTranslations } from "@/lib/translations";
import { Link, useSearchParams } from "react-router";
import { CheckCircle, MessageCircle, Home, Loader2, MapPin } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function OrderConfirmation() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const customerPhone = searchParams.get("phone") || "";

  const { data: order, isLoading } = trpc.store.getOrderByNumber.useQuery(
    { orderNumber: orderNumber || "", customerPhone: customerPhone || undefined },
    { enabled: !!orderNumber, retry: false }
  );

  if (isLoading) {
    return (
      <div className={`pt-24 pb-16 min-h-screen flex items-center justify-center ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#B57EDC]" />
      </div>
    );
  }

  if (!orderNumber || !order) {
    return (
      <div className={`pt-24 pb-16 min-h-screen flex flex-col items-center justify-center ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <p className="text-[#6F6178] mb-4">
          {lang === "ar" ? "لم يتم العثور على الطلب" : "No order found"}
        </p>
        <Link
          to={pathForLocale("/shop", lang)}
          className="px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#a66ecf] transition-colors"
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
      <div className="max-w-lg mx-auto px-4 text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">
          {t.orderSuccess}
        </h1>
        
        <p className="text-[#6F6178] mb-8">{t.orderSuccessMessage}</p>

        <div className="bg-[#F7ECFF] rounded-2xl p-6 my-8 text-start shadow-sm border border-[#E7D8F1]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-[#6F6178] mb-1">{t.orderNumber}</p>
              <p className="text-xl font-bold text-[#4B1C71] font-mono">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-end">
              <p className="text-sm text-[#6F6178] mb-1">{t.total}</p>
              <p className="text-xl font-bold text-[#4B1C71]">
                {parseFloat(order.total).toFixed(0)} {t.currency}
              </p>
            </div>
          </div>
          
          <div className="border-t border-[#E7D8F1] mt-4 pt-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#B57EDC] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#4B1C71]">{order.customerName}</p>
                <p className="text-sm text-[#6F6178] mt-1 line-clamp-2">{order.shippingAddress}, {order.city || order.governorate}</p>
              </div>
            </div>
          </div>
        </div>

        {order.paymentMethod === "vodafone_cash" && (
          <div className="bg-[#FFF8E7] rounded-2xl p-6 my-8 text-start shadow-sm border border-[#FDE68A]">
            <h3 className="text-lg font-bold text-[#D97706] mb-2">
              {lang === "ar" ? "تحويل فودافون كاش" : "Vodafone Cash Transfer"}
            </h3>
            <p className="text-[#92400E] mb-4">
              {lang === "ar" 
                ? "يرجى تحويل إجمالي المبلغ إلى الرقم التالي ثم إرسال إيصال التحويل عبر الواتساب لتأكيد الطلب." 
                : "Please transfer the total amount to the following number, then send the receipt via WhatsApp to confirm the order."}
            </p>
            <div className="bg-white rounded-lg p-4 border border-[#FDE68A] text-center">
              <p className="text-xl font-bold text-[#D97706] tracking-widest">0122 386 3092</p>
            </div>
          </div>
        )}

        {order.paymentMethod === "instapay" && (
          <div className="bg-[#F0FDF4] rounded-2xl p-6 my-8 text-start shadow-sm border border-[#BBF7D0]">
            <h3 className="text-lg font-bold text-[#166534] mb-2">
              {lang === "ar" ? "تحويل إنستاباي (InstaPay)" : "InstaPay Transfer"}
            </h3>
            <p className="text-[#15803D] mb-4">
              {lang === "ar" 
                ? "يرجى تحويل إجمالي المبلغ إلى حساب إنستاباي التالي ثم إرسال الإيصال عبر الواتساب." 
                : "Please transfer the total amount to the following InstaPay account, then send the receipt via WhatsApp."}
            </p>
            <div className="bg-white rounded-lg p-4 border border-[#BBF7D0] text-center">
              <p className="text-xl font-bold text-[#166534] tracking-widest">hiline@instapay</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to={pathForLocale("/track-order", lang)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors shadow-md shadow-[#4B1C71]/20"
          >
            {lang === "ar" ? "تتبع حالة الطلب هنا" : "Track Order Status"}
          </Link>
          <button
            onClick={handleWhatsAppTrack}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t.trackOnWhatsApp}
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-4 border border-[#E7D8F1] text-[#4B1C71] font-medium rounded-xl hover:bg-[#FCF8FF] transition-colors"
          >
            <Home className="w-5 h-5" />
            {t.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
