import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  ArrowRight,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "#B57EDC",
  processing: "#1E6D9E",
  shipped: "#B57EDC",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#8D7A97",
};

export default function AdminDashboard() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: stats, isLoading } = trpc.store.getStats.useQuery();
  const { data: recentOrders } = trpc.admin.getRecentOrders.useQuery(
    { limit: 5 },
    { enabled: true }
  );

  const statCards = [
    {
      label: t.totalOrders,
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "#B57EDC",
    },
    {
      label: t.totalSales,
      value: `${parseFloat(stats?.totalRevenue || "0").toFixed(0)} ${t.currency}`,
      icon: DollarSign,
      color: "#22C55E",
    },
    {
      label: t.pendingOrders,
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "#1E6D9E",
    },
    {
      label: t.lowStock,
      value: stats?.lowStockProducts?.length ?? 0,
      icon: AlertTriangle,
      color: "#EF4444",
    },
  ];

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#4B1C71]">{t.dashboard}</h1>
          <p className="text-sm text-[#6F6178] mt-1">
            {lang === "ar"
              ? "نظرة عامة على متجرك"
              : "Overview of your store"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-6 border border-[#E7D8F1]"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#4B1C71]">{card.value}</p>
            <p className="text-sm text-[#6F6178] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71]">
              {t.recentOrders}
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-[#4B1C71] hover:text-[#B57EDC] flex items-center gap-1"
            >
              {lang === "ar" ? "عرض الكل" : "View All"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[#E7D8F1]">
            {recentOrders?.length === 0 ? (
              <p className="p-6 text-center text-[#6F6178]">{t.noOrdersFound}</p>
            ) : (
              recentOrders?.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#4B1C71]">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-[#6F6178] mt-0.5">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${statusColors[order.orderStatus]}15`,
                        color: statusColors[order.orderStatus],
                      }}
                    >
                      {(t as any)[order.orderStatus] || order.orderStatus}
                    </span>
                    <p className="text-sm font-medium text-[#4B1C71] mt-1">
                      {parseFloat(order.total).toFixed(0)} {t.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71]">
              {t.lowStock}
            </h2>
            <Link
              to="/admin/products"
              className="text-sm text-[#4B1C71] hover:text-[#B57EDC] flex items-center gap-1"
            >
              {lang === "ar" ? "عرض الكل" : "View All"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[#E7D8F1]">
            {stats?.lowStockProducts?.length === 0 ? (
              <p className="p-6 text-center text-[#6F6178]">
                {lang === "ar"
                  ? "لا توجد منتجات منخفضة المخزون"
                  : "No low stock products"}
              </p>
            ) : (
              stats?.lowStockProducts?.map((product) => (
                <div
                  key={product.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#8D7A97]" />
                    <div>
                      <p className="text-sm font-medium text-[#4B1C71]">
                        {product.nameEn}
                      </p>
                      <p className="text-xs text-[#6F6178]">{product.scent}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      (product.stock ?? 0) <= 5
                        ? "text-red-500"
                        : "text-[#B57EDC]"
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
