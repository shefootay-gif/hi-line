import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { Link, Navigate } from "react-router";
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag } from "lucide-react";

export default function MyOrders() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: user } = trpc.auth.me.useQuery();
  const { data: orders, isLoading } = trpc.store.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-orange-500" />;
      case "processing": return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped": return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled": case "refunded": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": case "refunded": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, { ar: string, en: string }> = {
      pending: { ar: "قيد الانتظار", en: "Pending" },
      processing: { ar: "جاري التجهيز", en: "Processing" },
      shipped: { ar: "تم الشحن", en: "Shipped" },
      delivered: { ar: "تم التوصيل", en: "Delivered" },
      cancelled: { ar: "ملغي", en: "Cancelled" },
      refunded: { ar: "مسترجع", en: "Refunded" }
    };
    return lang === "ar" ? statuses[status]?.ar || status : statuses[status]?.en || status;
  };

  return (
    <div className={`pt-32 pb-20 min-h-screen bg-[#FCF8FF] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#4B1C71] mb-8">
          {lang === "ar" ? "سجل طلباتي" : "My Orders"}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-32 border border-[#E7D8F1]" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E7D8F1]">
            <ShoppingBag className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#4B1C71] mb-2">
              {lang === "ar" ? "لا توجد طلبات سابقة" : "No orders found"}
            </h2>
            <p className="text-[#6F6178] mb-6">
              {lang === "ar" ? "لم تقم بأي طلبات بعد." : "You haven't placed any orders yet."}
            </p>
            <Link to="/shop" className="px-8 py-3 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors">
              {t.startShopping}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-[#E7D8F1] shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono font-bold text-[#4B1C71] text-lg">#{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(order.orderStatus || "pending")}`}>
                      {getStatusIcon(order.orderStatus || "pending")}
                      {getStatusText(order.orderStatus || "pending")}
                    </span>
                  </div>
                  <p className="text-sm text-[#6F6178] mb-4">
                    {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-[#8D7A97]">{t.total}</p>
                      <p className="font-bold text-[#4B1C71]">LE {parseFloat(order.total).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8D7A97]">{lang === "ar" ? "العنوان" : "Address"}</p>
                      <p className="font-medium text-[#4B1C71]">{order.city || order.governorate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center md:items-end flex-col justify-end">
                  <Link
                    to={`/order-confirmation?order=${order.orderNumber}`}
                    className="px-6 py-2.5 border border-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#F7ECFF] transition-colors w-full md:w-auto text-center"
                  >
                    {lang === "ar" ? "التفاصيل" : "View Details"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
