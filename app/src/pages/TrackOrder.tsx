import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import { Search, Package, Loader2, MessageCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "#B57EDC",
  processing: "#1E6D9E",
  shipped: "#B57EDC",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#8D7A97",
};

export default function TrackOrder() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const [orderNumber, setOrderNumber] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: order, isLoading } = trpc.store.getOrderByNumber.useQuery(
    { orderNumber },
    { enabled: searched && orderNumber.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const handleWhatsAppInquiry = () => {
    const message =
      lang === "ar"
        ? `مرحبًا، أريد الاستفسار عن طلبي رقم: ${orderNumber}`
        : `Hello! I want to inquire about my order #${orderNumber}`;
    window.open(
      `https://wa.me/201223863092?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
            {lang === "ar" ? "تتبع" : "TRACK"}
          </p>
          <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">{t.trackOrder}</h1>
          <p className="text-[#6F6178]">{t.enterOrderNumber}</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setSearched(false);
            }}
            placeholder="HL..."
            className="flex-1 px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 font-mono"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </form>

        {searched && !isLoading && !order && (
          <div className="text-center py-10">
            <Package className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
            <p className="text-[#6F6178]">{t.orderNotFound}</p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
            <div className="p-6 border-b border-[#E7D8F1]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#6F6178]">{t.orderNumber}</span>
                <span className="text-lg font-bold text-[#4B1C71] font-mono">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6F6178]">{t.orderDate}</span>
                <span className="text-sm text-[#4B1C71]">
                  {new Date(order.createdAt).toLocaleDateString(
                    lang === "ar" ? "ar-EG" : "en-US"
                  )}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="p-6 border-b border-[#E7D8F1]">
              <span className="text-sm text-[#6F6178] block mb-2">
                {t.orderStatus}
              </span>
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${statusColors[order.orderStatus]}15`,
                  color: statusColors[order.orderStatus],
                }}
              >
                {(t as any)[order.orderStatus] || order.orderStatus}
              </span>
            </div>

            {/* Items */}
            <div className="p-6 border-b border-[#E7D8F1]">
              <span className="text-sm text-[#6F6178] block mb-3">
                {t.items}
              </span>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-[#4B1C71]">
                      {item.productName} x{item.quantity}
                    </span>
                    <span className="text-[#6F6178]">
                      {parseFloat(item.totalPrice).toFixed(0)} {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-6 border-b border-[#E7D8F1]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#4B1C71]">{t.total}</span>
                <span className="text-xl font-bold text-[#4B1C71]">
                  {parseFloat(order.total).toFixed(0)} {t.currency}
                </span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="p-6">
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#128C7E] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {t.trackOnWhatsApp}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
