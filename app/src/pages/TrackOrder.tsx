import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  Search,
  Package,
  Loader2,
  MessageCircle,
  CheckCircle2,
  Clock,
  Truck,
  Box,
  XCircle,
  Ban,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
type OrderStatus = (typeof statuses)[number];
type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  totalPrice: string;
};

function orderStatus(status: string | null): OrderStatus {
  return statuses.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "pending";
}

export default function TrackOrder() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const ar = lang === "ar";
  const [orderNumber, setOrderNumber] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const utils = trpc.useUtils();

  const { data: order, isLoading } = trpc.store.getOrderByNumber.useQuery(
    { orderNumber, customerPhone },
    { enabled: searched && orderNumber.trim().length > 0 && customerPhone.trim().length > 0 }
  );

  const cancelMutation = trpc.store.cancelOrder.useMutation({
    onSuccess: () => {
      toast.success(ar ? "تم إلغاء الطلب بنجاح" : "Order cancelled successfully");
      utils.store.getOrderByNumber.invalidate({ orderNumber, customerPhone });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const handleWhatsAppInquiry = () => {
    const message = ar
      ? `مرحبًا، أريد الاستفسار عن طلبي رقم: ${orderNumber}`
      : `Hello! I want to inquire about my order #${orderNumber}`;
    window.open(
      `https://wa.me/201223863092?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const currentStatus = order ? orderStatus(order.orderStatus) : "pending";

  const timelineSteps = [
    {
      id: "pending",
      icon: Clock,
      labelAr: "تم الطلب",
      labelEn: "Order Placed",
      activeColor: "text-blue-500",
      bgColor: "bg-blue-500",
      date: order?.createdAt,
    },
    {
      id: "processing",
      icon: Box,
      labelAr: "قيد التجهيز",
      labelEn: "Processing",
      activeColor: "text-purple-500",
      bgColor: "bg-purple-500",
    },
    {
      id: "shipped",
      icon: Truck,
      labelAr: "تم الشحن",
      labelEn: "Shipped",
      activeColor: "text-indigo-500",
      bgColor: "bg-indigo-500",
    },
    {
      id: "delivered",
      icon: CheckCircle2,
      labelAr: "تم التوصيل",
      labelEn: "Delivered",
      activeColor: "text-green-500",
      bgColor: "bg-green-500",
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === "delivered") return 3;
    if (status === "shipped") return 2;
    if (status === "processing") return 1;
    if (status === "pending") return 0;
    return -1; // For cancelled or refunded
  };

  const currentIndex = getStepIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";

  const canCancel = currentStatus === "pending" || currentStatus === "processing";

  const handleCancelOrder = () => {
    if (confirm(ar ? "هل أنت متأكد من إلغاء هذا الطلب؟" : "Are you sure you want to cancel this order?")) {
      cancelMutation.mutate({ orderNumber: order!.orderNumber, customerPhone: customerPhone.trim() });
    }
  };

  return (
    <div className={`pt-24 pb-16 min-h-screen bg-[#FCF8FF] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
            {ar ? "تتبع" : "TRACK"}
          </p>
          <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">{t.trackOrder}</h1>
          <p className="text-[#6F6178]">{t.enterOrderNumber}</p>
        </div>

        <form onSubmit={handleSearch} className="grid gap-3 mb-10 max-w-xl mx-auto sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              setSearched(false);
            }}
            placeholder="HL..."
            className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 font-mono bg-white"
          />
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              setSearched(false);
            }}
            placeholder={ar ? "رقم الهاتف" : "Phone number"}
            className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || orderNumber.trim() === "" || customerPhone.trim() === ""}
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
          <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-[#E7D8F1]">
            <Package className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
            <p className="text-[#6F6178]">{t.orderNotFound}</p>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-3xl shadow-lg shadow-[#7C3AED]/5 border border-[#E7D8F1] overflow-hidden">
            {/* Header info */}
            <div className="p-6 md:p-8 border-b border-[#E7D8F1] bg-[#FAFAFA]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#6F6178] mb-1">{t.orderNumber}</p>
                  <p className="text-2xl font-bold text-[#4B1C71] font-mono">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-[#6F6178] mb-1">{t.orderDate}</p>
                  <p className="font-medium text-[#4B1C71]">
                    {new Date(order.createdAt).toLocaleDateString(
                      ar ? "ar-EG" : "en-US",
                      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 md:p-10 border-b border-[#E7D8F1]">
              {isCancelled ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-red-600 mb-2">
                    {currentStatus === "refunded"
                      ? (ar ? "تم استرجاع الطلب" : "Order Refunded")
                      : (ar ? "تم إلغاء الطلب" : "Order Cancelled")}
                  </h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    {ar 
                      ? "تم إلغاء هذا الطلب ولا يمكن شحنه. إذا كنت بحاجة للمساعدة، يرجى التواصل معنا."
                      : "This order has been cancelled and cannot be shipped. If you need help, please contact us."}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-8 right-8 h-1 bg-gray-100 rounded-full hidden sm:block">
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-[#B57EDC] transition-all duration-500 rounded-full"
                      style={{ width: `${(currentIndex / (timelineSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Vertical line for mobile */}
                  <div className="absolute top-6 bottom-6 left-6 w-1 bg-gray-100 rounded-full sm:hidden">
                    <div 
                      className="absolute top-0 left-0 right-0 bg-[#B57EDC] transition-all duration-500 rounded-full"
                      style={{ height: `${(currentIndex / (timelineSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between relative gap-8 sm:gap-0">
                    {timelineSteps.map((step, idx) => {
                      const isActive = currentIndex >= idx;
                      const isCurrent = currentIndex === idx;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 z-10">
                          <div 
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm border-4 border-white
                              ${isActive ? step.bgColor : 'bg-gray-100'}
                              ${isCurrent ? 'ring-4 ring-opacity-20 ' + step.bgColor.replace('bg-', 'ring-') : ''}
                            `}
                          >
                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <div className="text-left sm:text-center">
                            <p className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                              {ar ? step.labelAr : step.labelEn}
                            </p>
                            {idx === 0 && step.date && (
                              <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                                {new Date(step.date).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Cancel Actions */}
            {!isCancelled && (
              <div className="p-6 md:px-10 border-b border-[#E7D8F1] bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">
                    {canCancel 
                      ? (ar ? "يمكنك إلغاء الطلب قبل الشحن" : "You can cancel the order before shipping")
                      : (ar ? "لا يمكن إلغاء الطلب بعد شحنه" : "Order cannot be cancelled after shipping")}
                  </span>
                </div>
                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelMutation.isPending}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white text-red-600 border border-red-200 font-medium rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    {ar ? "إلغاء الطلب" : "Cancel Order"}
                  </button>
                )}
              </div>
            )}

            {/* Items */}
            <div className="p-6 md:p-10 border-b border-[#E7D8F1]">
              <h3 className="font-bold text-[#1A0533] mb-4">{t.items}</h3>
              <div className="space-y-4">
                {order.items?.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#FCF8FF] border border-[#E7D8F1]"
                  >
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#B57EDC] font-bold shadow-sm">
                        x{item.quantity}
                      </div>
                      <div>
                        <p className="font-semibold text-[#4B1C71]">{item.productName}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#4B1C71]">
                      {parseFloat(item.totalPrice).toFixed(0)} {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-6 md:p-10 bg-[#FAFAFA]">
              <div className="flex items-center justify-between max-w-sm ms-auto">
                <span className="text-[#6F6178]">{t.total}</span>
                <span className="text-3xl font-bold text-[#4B1C71]">
                  {parseFloat(order.total).toFixed(0)} {t.currency}
                </span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="p-6 md:p-8 bg-white border-t border-[#E7D8F1]">
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="w-6 h-6" />
                {t.trackOnWhatsApp}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
