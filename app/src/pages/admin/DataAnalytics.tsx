import { useMemo, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Eye,
  Loader2,
  MousePointer,
  Package,
  ShoppingBag,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

type Summary = {
  revenue?: string | number;
  orders?: string | number;
  deliveredOrders?: string | number;
  cancelledOrders?: string | number;
  customers?: string | number;
  averageOrderValue?: string | number;
  discounts?: string | number;
  shippingFees?: string | number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  cancellationRate?: number;
};

type TrendPoint = {
  date: string;
  orders: string | number;
  revenue: string | number;
  averageOrderValue: string | number;
};

type TopProduct = {
  productId: string | number;
  productName: string;
  scent?: string | null;
  quantitySold: string | number;
  revenue: string | number;
};

type CustomerAnalytics = {
  customers?: string | number;
  repeatCustomers?: string | number;
  totalSpent?: string | number;
  repeatRate?: number;
  topLocations?: Array<{ governorate?: string | null; city?: string | null; orders: string | number; revenue: string | number }>;
};

type InventoryAnalytics = {
  products?: string | number;
  activeProducts?: string | number;
  lowStockProducts?: string | number;
  outOfStockProducts?: string | number;
  totalStock?: string | number;
  lowStock?: Array<{ id: string | number; nameEn: string; nameAr: string; sku?: string | null; stock: string | number }>;
  movements?: Array<{ type: string; quantity: string | number; count: string | number }>;
};

type MediaAnalytics = {
  campaignsCount?: string | number;
  activeCampaigns?: string | number;
  spend?: string | number;
  revenue?: string | number;
  impressions?: string | number;
  clicks?: string | number;
  conversions?: string | number;
  ordersCount?: string | number;
  roas?: number;
  ctr?: number;
  conversionRate?: number;
  cpc?: number;
  campaigns?: Array<{
    id: string | number;
    name: string;
    platform: string;
    status: string;
    spend: string | number;
    revenue: string | number;
    impressions: string | number;
    clicks: string | number;
    conversions: string | number;
    ordersCount: string | number;
  }>;
};

type FunnelAnalytics = {
  impressions: number;
  clicks: number;
  conversions: number;
  campaignOrders: number;
  storeOrders: number;
};

function num(value: string | number | null | undefined) {
  return Number(value ?? 0) || 0;
}

function money(value: string | number | null | undefined, ar: boolean) {
  return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${ar ? "ج" : "EGP"}`;
}

function pct(value: string | number | null | undefined) {
  return `${num(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EDE5F7] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1A0533]">{value}</p>
      <p className="mt-1 text-xs text-[#6F6178]">{label}</p>
      {sub && <p className="mt-2 text-[11px] text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(4, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F3E8FF]">
      <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function DataAnalytics() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const [days, setDays] = useState<30 | 90 | 180>(30);

  const summaryQuery = trpc.admin.getAnalyticsSummary.useQuery({ days }, { retry: false });
  const trendQuery = trpc.admin.getRevenueTrend.useQuery({ days }, { retry: false });
  const productsQuery = trpc.admin.getTopProductsAnalytics.useQuery({ limit: 10 }, { retry: false });
  const customersQuery = trpc.admin.getCustomerAnalytics.useQuery(undefined, { retry: false });
  const inventoryQuery = trpc.admin.getInventoryAnalytics.useQuery(undefined, { retry: false });
  const mediaQuery = trpc.admin.getMediaBuyerAnalytics.useQuery(undefined, { retry: false });
  const funnelQuery = trpc.admin.getFunnelAnalytics.useQuery(undefined, { retry: false });

  const summary = (summaryQuery.data ?? {}) as Summary;
  const trend = (trendQuery.data ?? []) as TrendPoint[];
  const topProducts = (productsQuery.data ?? []) as TopProduct[];
  const customers = (customersQuery.data ?? {}) as CustomerAnalytics;
  const inventory = (inventoryQuery.data ?? {}) as InventoryAnalytics;
  const media = (mediaQuery.data ?? {}) as MediaAnalytics;
  const funnel = (funnelQuery.data ?? { impressions: 0, clicks: 0, conversions: 0, campaignOrders: 0, storeOrders: 0 }) as FunnelAnalytics;

  const maxTrendRevenue = useMemo(() => Math.max(...trend.map((point) => num(point.revenue)), 0), [trend]);
  const maxProductRevenue = useMemo(() => Math.max(...topProducts.map((product) => num(product.revenue)), 0), [topProducts]);

  const isLoading = summaryQuery.isLoading || trendQuery.isLoading || productsQuery.isLoading || customersQuery.isLoading || inventoryQuery.isLoading || mediaQuery.isLoading || funnelQuery.isLoading;

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF]">
            <BarChart3 className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "تحليل البيانات" : "Data Analytics"}</h1>
            <p className="text-sm text-[#6F6178]">{ar ? "مؤشرات المبيعات والعملاء والمخزون والإعلانات في مكان واحد" : "Sales, customer, inventory, and advertising insights in one place"}</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {([30, 90, 180] as const).map((value) => (
            <button
              key={value}
              onClick={() => setDays(value)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${days === value ? "bg-[#7C3AED] text-white" : "text-[#6F6178] hover:bg-[#F8F4FC]"}`}
            >
              {ar ? `آخر ${value} يوم` : `Last ${value} days`}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-[#EDE5F7] bg-white p-4 text-sm text-[#6F6178]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {ar ? "جاري تحميل التحليلات..." : "Loading analytics..."}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label={ar ? "الإيراد" : "Revenue"} value={money(summary.revenue, ar)} color="#059669" sub={`${ar ? "النمو" : "Growth"}: ${pct(summary.revenueGrowth)}`} />
        <StatCard icon={ShoppingBag} label={ar ? "الطلبات" : "Orders"} value={num(summary.orders).toLocaleString()} color="#7C3AED" sub={`${ar ? "النمو" : "Growth"}: ${pct(summary.ordersGrowth)}`} />
        <StatCard icon={Users} label={ar ? "العملاء" : "Customers"} value={num(summary.customers).toLocaleString()} color="#0EA5E9" sub={`${ar ? "تكرار الشراء" : "Repeat rate"}: ${pct(customers.repeatRate)}`} />
        <StatCard icon={AlertTriangle} label={ar ? "نسبة الإلغاء" : "Cancellation Rate"} value={pct(summary.cancellationRate)} color="#DC2626" sub={`${ar ? "متوسط الطلب" : "AOV"}: ${money(summary.averageOrderValue, ar)}`} />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-[#1A0533]">{ar ? "اتجاه الإيرادات" : "Revenue Trend"}</h2>
            <TrendingUp className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div className="space-y-3">
            {trend.slice(-14).map((point) => (
              <div key={point.date} className="grid grid-cols-[90px_1fr_110px] items-center gap-3 text-sm">
                <span className="text-xs text-[#6F6178]">{String(point.date).slice(0, 10)}</span>
                <MiniBar value={num(point.revenue)} max={maxTrendRevenue} />
                <span className="text-end font-semibold text-[#1A0533]">{money(point.revenue, ar)}</span>
              </div>
            ))}
            {trend.length === 0 && <p className="py-8 text-center text-sm text-[#6F6178]">{ar ? "لا توجد بيانات مبيعات بعد" : "No sales data yet"}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-[#1A0533]">{ar ? "أفضل المنتجات" : "Top Products"}</h2>
            <Package className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div className="space-y-3">
            {topProducts.map((product) => (
              <div key={`${product.productId}-${product.productName}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-[#1A0533]">{product.productName}</span>
                  <span className="shrink-0 text-[#6F6178]">{money(product.revenue, ar)}</span>
                </div>
                <div className="grid grid-cols-[1fr_80px] items-center gap-3">
                  <MiniBar value={num(product.revenue)} max={maxProductRevenue} />
                  <span className="text-end text-xs text-[#9CA3AF]">{num(product.quantitySold)} {ar ? "قطعة" : "sold"}</span>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="py-8 text-center text-sm text-[#6F6178]">{ar ? "لا توجد منتجات مباعة بعد" : "No sold products yet"}</p>}
          </div>
        </section>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label={ar ? "ظهور الإعلانات" : "Ad Impressions"} value={num(media.impressions).toLocaleString()} color="#0EA5E9" />
        <StatCard icon={MousePointer} label={ar ? "CTR" : "CTR"} value={pct(media.ctr)} color="#7C3AED" sub={`${ar ? "CPC" : "CPC"}: ${money(media.cpc, ar)}`} />
        <StatCard icon={Target} label={ar ? "التحويل" : "Conversion"} value={pct(media.conversionRate)} color="#D97706" />
        <StatCard icon={TrendingUp} label="ROAS" value={`${num(media.roas).toLocaleString(undefined, { maximumFractionDigits: 2 })}x`} color="#059669" sub={`${ar ? "إنفاق" : "Spend"}: ${money(media.spend, ar)}`} />
      </div>

      <div className="mb-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
          <h2 className="mb-5 font-bold text-[#1A0533]">{ar ? "قمع التسويق" : "Marketing Funnel"}</h2>
          <div className="space-y-4">
            {[
              { label: ar ? "ظهور" : "Impressions", value: funnel.impressions },
              { label: ar ? "نقرات" : "Clicks", value: funnel.clicks },
              { label: ar ? "تحويلات" : "Conversions", value: funnel.conversions },
              { label: ar ? "طلبات الحملات" : "Campaign Orders", value: funnel.campaignOrders },
              { label: ar ? "طلبات المتجر" : "Store Orders", value: funnel.storeOrders },
           ].map((step, _unusedIndex, arr) => (
              <div key={step.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[#6F6178]">{step.label}</span>
                  <span className="font-semibold text-[#1A0533]">{step.value.toLocaleString()}</span>
                </div>
                <MiniBar value={step.value} max={arr[0]?.value || 1} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
          <h2 className="mb-5 font-bold text-[#1A0533]">{ar ? "مؤشرات المخزون" : "Inventory Insights"}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[#F8F4FC] p-4"><p className="text-[#6F6178]">{ar ? "المنتجات" : "Products"}</p><p className="text-xl font-bold text-[#1A0533]">{num(inventory.products)}</p></div>
            <div className="rounded-xl bg-[#F8F4FC] p-4"><p className="text-[#6F6178]">{ar ? "إجمالي المخزون" : "Total Stock"}</p><p className="text-xl font-bold text-[#1A0533]">{num(inventory.totalStock)}</p></div>
            <div className="rounded-xl bg-[#FEF3C7] p-4"><p className="text-[#92400E]">{ar ? "مخزون منخفض" : "Low Stock"}</p><p className="text-xl font-bold text-[#92400E]">{num(inventory.lowStockProducts)}</p></div>
            <div className="rounded-xl bg-[#FEE2E2] p-4"><p className="text-[#B91C1C]">{ar ? "نفد المخزون" : "Out of Stock"}</p><p className="text-xl font-bold text-[#B91C1C]">{num(inventory.outOfStockProducts)}</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
          <h2 className="mb-5 font-bold text-[#1A0533]">{ar ? "أفضل المناطق" : "Top Locations"}</h2>
          <div className="space-y-3">
            {(customers.topLocations ?? []).slice(0, 6).map((location, index) => (
              <div key={`${location.governorate}-${location.city}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-[#1A0533]">{location.governorate || "-"} {location.city ? `• ${location.city}` : ""}</span>
                <span className="shrink-0 text-[#6F6178]">{money(location.revenue, ar)}</span>
              </div>
            ))}
            {(customers.topLocations ?? []).length === 0 && <p className="py-8 text-center text-sm text-[#6F6178]">{ar ? "لا توجد بيانات مناطق بعد" : "No location data yet"}</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-[#EDE5F7] bg-white p-6">
        <h2 className="mb-5 font-bold text-[#1A0533]">{ar ? "تنبيهات المخزون المنخفض" : "Low Stock Alerts"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-[#FAFAFA] text-xs text-[#9CA3AF]">
                <th className="px-4 py-3 text-start">ID</th>
                <th className="px-4 py-3 text-start">{ar ? "المنتج" : "Product"}</th>
                <th className="px-4 py-3 text-start">SKU</th>
                <th className="px-4 py-3 text-start">{ar ? "المخزون" : "Stock"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(inventory.lowStock ?? []).map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 text-[#6F6178]">{product.id}</td>
                  <td className="px-4 py-3 font-semibold text-[#1A0533]">{ar ? product.nameAr : product.nameEn}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{product.sku ?? "-"}</td>
                  <td className="px-4 py-3 font-bold text-red-600">{num(product.stock)}</td>
                </tr>
              ))}
              {(inventory.lowStock ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-[#6F6178]">{ar ? "لا توجد منتجات منخفضة المخزون" : "No low stock products"}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
