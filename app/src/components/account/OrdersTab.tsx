import { useLanguage } from "@/hooks/useLanguage";
import { pathForLocale } from "@/lib/localeRouting";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import {
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router";

type Translations = ReturnType<typeof useTranslations>;

function statusIcon(status: string) {
  switch (status) {
    case "pending": return <Clock className="w-4 h-4 text-orange-500 animate-pulse" />;
    case "processing": return <Package className="w-4 h-4 text-blue-500" />;
    case "shipped": return <Truck className="w-4 h-4 text-purple-500" />;
    case "delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "cancelled":
    case "refunded": return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Package className="w-4 h-4 text-gray-500" />;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "pending": return "bg-orange-50 text-orange-700 border border-orange-200";
    case "processing": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "shipped": return "bg-purple-50 text-purple-700 border border-purple-200";
    case "delivered": return "bg-green-50 text-green-700 border border-green-200";
    case "cancelled":
    case "refunded": return "bg-red-50 text-red-700 border border-red-200";
    default: return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

function statusText(status: string, ar: boolean) {
  const statuses: Record<string, { ar: string; en: string }> = {
    pending: { ar: "قيد الانتظار", en: "Pending" },
    processing: { ar: "جاري التجهيز", en: "Processing" },
    shipped: { ar: "تم الشحن", en: "Shipped" },
    delivered: { ar: "تم التوصيل", en: "Delivered" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    refunded: { ar: "مسترجع", en: "Refunded" },
  };
  return ar ? statuses[status]?.ar || status : statuses[status]?.en || status;
}

export function OrdersTab({ ar, t }: { ar: boolean; t: Translations }) {
  const { lang } = useLanguage();
  const { data: orders, isLoading } = trpc.store.getMyOrders.useQuery();

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="animate-pulse bg-[#FCF8FF] rounded-2xl h-32 border border-[#E7D8F1]" />)}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "لا توجد طلبات سابقة" : "No orders found"}</h2>
        <p className="text-[#6F6178] mb-6 text-sm">{ar ? "لم تقم بأي طلبات بعد." : "You haven't placed any orders yet."}</p>
        <Link to={pathForLocale("/shop", lang)} className="inline-block px-8 py-3 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors">{t.startShopping}</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "الطلبات" : "Orders"}</h2>
      <p className="text-xs text-[#8D7A97] mb-6">{ar ? "استعرض حالة طلباتك الحالية وتفاصيل المشتريات السابقة" : "View your current order status and purchase history"}</p>
      <div className="space-y-4">
        {orders.map(order => {
          const status = order.orderStatus || "pending";
          return (
            <div key={order.id} className="bg-white rounded-2xl p-5 border border-[#E7D8F1] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                  <span className="font-mono font-bold text-[#4B1C71] text-base">#{order.orderNumber}</span>
                  <p className="text-xs text-[#8D7A97] mt-0.5">{new Date(order.createdAt).toLocaleDateString(ar ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusColor(status)}`}>{statusIcon(status)}{statusText(status, ar)}</span>
              </div>
              <div className="border-t border-[#F2EAFA] pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div><p className="text-[10px] text-[#8D7A97] font-bold uppercase">{ar ? "الإجمالي" : "Total"}</p><p className="font-extrabold text-[#4B1C71]">{parseFloat(order.total).toFixed(0)} {t.currency}</p></div>
                  <div><p className="text-[10px] text-[#8D7A97] font-bold uppercase">{ar ? "طريقة الدفع" : "Payment"}</p><p className="text-sm font-semibold text-[#4B1C71]">{ar ? "الدفع عند الاستلام" : "COD"}</p></div>
                  <div><p className="text-[10px] text-[#8D7A97] font-bold uppercase">{ar ? "العنوان" : "Shipping To"}</p><p className="text-sm font-semibold text-[#4B1C71] truncate max-w-xs">{order.shippingAddress}</p></div>
                </div>
                <Link to={`${pathForLocale("/order-confirmation", lang)}?order=${order.orderNumber}&phone=${encodeURIComponent(order.customerPhone)}`} className="px-5 py-2 border border-[#B57EDC] text-[#4B1C71] text-xs font-bold rounded-xl hover:bg-[#F7ECFF] transition-colors w-full md:w-auto text-center">{ar ? "تفاصيل الطلب" : "Order Details"}</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
