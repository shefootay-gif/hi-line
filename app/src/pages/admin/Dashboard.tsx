import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { rollOnProducts } from "@/lib/hiLineCatalog";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Zap,
  BarChart2,
  Star,
  RefreshCcw,
} from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label_ar: string; label_en: string }> = {
  pending:    { bg: "#F3E8FF", text: "#7C3AED", label_ar: "معلق",    label_en: "Pending" },
  processing: { bg: "#DBEAFE", text: "#1D4ED8", label_ar: "جاري",    label_en: "Processing" },
  shipped:    { bg: "#E0F2FE", text: "#0369A1", label_ar: "مشحون",   label_en: "Shipped" },
  delivered:  { bg: "#DCFCE7", text: "#15803D", label_ar: "مُسلَّم",  label_en: "Delivered" },
  cancelled:  { bg: "#FEE2E2", text: "#B91C1C", label_ar: "ملغي",    label_en: "Cancelled" },
  refunded:   { bg: "#F1F5F9", text: "#475569", label_ar: "مسترجع",  label_en: "Refunded" },
};

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  trendLabel?: string;
}) {
  const isPositive = (trend ?? 0) >= 0;
  return (
    <div className="shopify-card group">
      <div className="flex items-start justify-between mb-5">
        <div
          className="shopify-icon-wrap"
          style={{ background: `${color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            <ArrowUpRight
              className={`w-3 h-3 ${!isPositive ? "rotate-180" : ""}`}
            />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-[#1A0533] tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[#6F6178]">{label}</p>
      {trendLabel && (
        <p className="mt-3 text-xs text-[#9CA3AF]">{trendLabel}</p>
      )}
    </div>
  );
}

function QuickActionBtn({
  to,
  icon: Icon,
  label,
  color,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#EDE5F7] bg-white hover:border-[#B57EDC] hover:shadow-md transition-all duration-200 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ background: `${color}18` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-xs font-medium text-[#4B1C71] text-center">{label}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const { lang, isRTL } = useLanguage();
  const { data: stats, isError: statsError } = trpc.store.getStats.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });
  const { data: recentOrders, isError: ordersError } =
    trpc.admin.getRecentOrders.useQuery(
      { limit: 5 },
      { enabled: true, retry: false, throwOnError: false },
    );
  const { data: salesByScent } = trpc.admin.getSalesByScent.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });

  const dataUnavailable = statsError || ordersError;
  const localProducts = rollOnProducts.map((product) => ({
    id: product.id,
    nameEn: product.nameEn,
    scent: product.scent,
    stock: 100,
  }));
  const lowStockProducts = dataUnavailable
    ? localProducts
    : stats?.lowStockProducts ?? [];

  const ar = lang === "ar";

  const metricCards = [
    {
      label: ar ? "إجمالي الطلبات" : "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "#7C3AED",
      trend: 12,
      trendLabel: ar ? "مقارنة بالشهر الماضي" : "vs. last month",
    },
    {
      label: ar ? "إجمالي المبيعات" : "Total Revenue",
      value: `${parseFloat(stats?.totalRevenue || "0").toFixed(0)} ${ar ? "جنيه" : "EGP"}`,
      icon: DollarSign,
      color: "#059669",
      trend: 8,
      trendLabel: ar ? "مقارنة بالشهر الماضي" : "vs. last month",
    },
    {
      label: ar ? "طلبات معلقة" : "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "#D97706",
      trend: -3,
      trendLabel: ar ? "مقارنة بالأمس" : "vs. yesterday",
    },
    {
      label: ar ? "مخزون منخفض" : "Low Stock",
      value: dataUnavailable ? localProducts.length : stats?.lowStockProducts?.length ?? 0,
      icon: AlertTriangle,
      color: "#EF4444",
      trendLabel: ar ? "منتجات تحتاج تجديد" : "products need restocking",
    },
  ];

  const quickActions = [
    { to: "/admin/products", icon: Package, label: ar ? "المنتجات" : "Products", color: "#7C3AED" },
    { to: "/admin/orders", icon: ShoppingBag, label: ar ? "الطلبات" : "Orders", color: "#059669" },
    { to: "/admin/media-buyer", icon: Zap, label: ar ? "ميديا باير" : "Media Buyer", color: "#D97706" },
    { to: "/admin/dropshipping", icon: TrendingUp, label: ar ? "دروب شوبينج" : "Dropshipping", color: "#0EA5E9" },
    { to: "/admin/customers", icon: Users, label: ar ? "العملاء" : "Customers", color: "#EC4899" },
    { to: "/admin/analytics", icon: BarChart2, label: ar ? "التحليلات" : "Analytics", color: "#8B5CF6" },
  ];

  // Build a small bar chart for scents
  const scentData = Array.isArray(salesByScent)
    ? (salesByScent as unknown as Array<{ scent: string; total_sold: string | number }>
      ).slice(0, 5)
    : [];

  const maxSold = scentData.reduce((max, s) => Math.max(max, Number(s.total_sold)), 1);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? ar ? "صباح الخير" : "Good morning"
      : now.getHours() < 18
      ? ar ? "مساء الخير" : "Good afternoon"
      : ar ? "مساء النور" : "Good evening";

  return (
    <div className={`min-h-screen bg-[#F8F4FC] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <style>{`
        .shopify-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #EDE5F7;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .shopify-card:hover {
          box-shadow: 0 4px 24px rgba(123,63,157,0.10);
          border-color: #D8B4FE;
        }
        .shopify-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-bar {
          transition: width 0.7s cubic-bezier(.4,0,.2,1);
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-[#9CA3AF] mb-1">{greeting} 👋</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#1A0533]">
                {ar ? "لوحة التحكم" : "Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-[#6F6178]">
                {ar ? "نظرة شاملة على متجرك" : "A full overview of your store performance"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-xs text-[#7C3AED] border border-[#D8B4FE] rounded-lg px-3 py-2 hover:bg-[#F3E8FF] transition-colors">
                <RefreshCcw className="w-3.5 h-3.5" />
                {ar ? "تحديث" : "Refresh"}
              </button>
              <div className="text-xs text-[#9CA3AF] bg-white border border-[#EDE5F7] rounded-lg px-3 py-2">
                {ar
                  ? now.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })
                  : now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Preview mode banner */}
        {dataUnavailable && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {ar
              ? "تعمل اللوحة في وضع المعاينة. بيانات الطلبات الكاملة تحتاج اتصال قاعدة البيانات."
              : "Dashboard is in preview mode. Full order data requires a database connection."}
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metricCards.map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="shopify-card mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="font-semibold text-[#1A0533]">
              {ar ? "إجراءات سريعة" : "Quick Actions"}
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {quickActions.map((qa) => (
              <QuickActionBtn key={qa.to} {...qa} />
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 shopify-card">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                <h2 className="font-semibold text-[#1A0533]">
                  {ar ? "آخر الطلبات" : "Recent Orders"}
                </h2>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:text-[#5B21B6] transition-colors"
              >
                {ar ? "عرض الكل" : "View all"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!recentOrders?.length ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-10 h-10 text-[#D8B4FE] mx-auto mb-3" />
                <p className="text-sm text-[#9CA3AF]">
                  {ar ? "لا توجد طلبات حتى الآن" : "No orders yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentOrders.map((order) => {
                  const s = statusColors[order.orderStatus ?? "pending"];
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8F4FC] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-4 h-4 text-[#7C3AED]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A0533]">{order.orderNumber}</p>
                          <p className="text-xs text-[#9CA3AF]">{order.customerName}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <span
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.text }}
                        >
                          {ar ? s.label_ar : s.label_en}
                        </span>
                        <span className="text-sm font-bold text-[#1A0533]">
                          {parseFloat(order.total).toFixed(0)}
                          <span className="text-xs font-normal text-[#9CA3AF] ms-1">{ar ? "جنيه" : "EGP"}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Scents Panel */}
          <div className="shopify-card">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-4 h-4 text-[#D97706]" />
              <h2 className="font-semibold text-[#1A0533]">
                {ar ? "أفضل العطور مبيعاً" : "Top Selling Scents"}
              </h2>
            </div>
            {scentData.length === 0 ? (
              <div className="space-y-3">
                {["Tropical Breeze", "Voyage", "Candy Pop", "Sweet Mango"].map((name, i) => (
                  <div key={name}>
                    <div className="flex justify-between text-xs text-[#6F6178] mb-1">
                      <span>{name}</span>
                      <span>{(100 - i * 18)}%</span>
                    </div>
                    <div className="h-2 bg-[#F3E8FF] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full stat-bar"
                        style={{
                          width: `${100 - i * 18}%`,
                          background: `linear-gradient(90deg, #7C3AED, #B57EDC)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {scentData.map((s) => (
                  <div key={s.scent}>
                    <div className="flex justify-between text-xs text-[#6F6178] mb-1">
                      <span>{s.scent}</span>
                      <span>{Number(s.total_sold)} {ar ? "مباع" : "sold"}</span>
                    </div>
                    <div className="h-2 bg-[#F3E8FF] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full stat-bar"
                        style={{
                          width: `${(Number(s.total_sold) / maxSold) * 100}%`,
                          background: `linear-gradient(90deg, #7C3AED, #B57EDC)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-[#EDE5F7]">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-[#EF4444]" />
                <h3 className="text-sm font-semibold text-[#1A0533]">
                  {ar ? (dataUnavailable ? "منتجات Hi Line" : "مخزون منخفض") : (dataUnavailable ? "Hi Line Products" : "Low Stock")}
                </h3>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] text-center py-4">
                  {ar ? "لا يوجد مخزون منخفض ✓" : "No low stock items ✓"}
                </p>
              ) : (
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[#1A0533]">{product.nameEn}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{product.scent}</p>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          product.stock < 10
                            ? "bg-red-50 text-red-500"
                            : product.stock < 20
                            ? "bg-amber-50 text-amber-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: "/admin/settings", icon: Star, label: ar ? "الإعدادات" : "Settings", desc: ar ? "تخصيص المتجر" : "Customize store" },
            { to: "/admin/media-buyer", icon: Zap, label: ar ? "ميديا باير" : "Media Buyer", desc: ar ? "إدارة الإعلانات" : "Manage ads" },
            { to: "/admin/dropshipping", icon: TrendingUp, label: ar ? "دروب شوبينج" : "Dropshipping", desc: ar ? "إدارة الموردين" : "Manage suppliers" },
            { to: "/admin/categories", icon: Package, label: ar ? "التصنيفات" : "Categories", desc: ar ? "تنظيم المنتجات" : "Organize products" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shopify-card flex items-start gap-3 hover:border-[#B57EDC] cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A0533]">{item.label}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
