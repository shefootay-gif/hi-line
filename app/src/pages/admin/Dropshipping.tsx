import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  TrendingUp,
  Plus,
  Package,
  Truck,
  Globe,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  ShoppingCart,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";

type Supplier = {
  id: number;
  name: string;
  country: string;
  flag: string;
  products: number;
  rating: number;
  shippingDays: string;
  status: "active" | "pending" | "inactive";
  category: string;
};

type DropOrder = {
  id: number;
  orderRef: string;
  supplier: string;
  product: string;
  qty: number;
  cost: number;
  status: "processing" | "shipped" | "delivered" | "failed";
  date: string;
};

const mockSuppliers: Supplier[] = [
  { id: 1, name: "Cairo Beauty Wholesale", country: "Egypt", flag: "🇪🇬", products: 124, rating: 4.8, shippingDays: "2-3", status: "active", category: "Beauty & Personal Care" },
  { id: 2, name: "Gulf Cosmetics Hub", country: "UAE", flag: "🇦🇪", products: 89, rating: 4.6, shippingDays: "4-6", status: "active", category: "Cosmetics" },
  { id: 3, name: "Lebanese Fragrance Co.", country: "Lebanon", flag: "🇱🇧", products: 45, rating: 4.9, shippingDays: "5-7", status: "pending", category: "Fragrances" },
  { id: 4, name: "KSA Retail Partners", country: "Saudi Arabia", flag: "🇸🇦", products: 210, rating: 4.5, shippingDays: "3-5", status: "inactive", category: "Personal Care" },
];

const mockOrders: DropOrder[] = [
  { id: 1, orderRef: "DS-001", supplier: "Cairo Beauty Wholesale", product: "Hi Line Tropical Breeze", qty: 20, cost: 1200, status: "shipped", date: "2025-06-20" },
  { id: 2, orderRef: "DS-002", supplier: "Gulf Cosmetics Hub", product: "Hi Line Voyage", qty: 15, cost: 950, status: "delivered", date: "2025-06-18" },
  { id: 3, orderRef: "DS-003", supplier: "Cairo Beauty Wholesale", product: "Hi Line Candy Pop", qty: 30, cost: 1800, status: "processing", date: "2025-06-22" },
];

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label_ar: string; label_en: string }> = {
  active:     { bg: "#DCFCE7", text: "#15803D", icon: CheckCircle, label_ar: "نشط",       label_en: "Active" },
  pending:    { bg: "#FEF3C7", text: "#92400E", icon: Clock,        label_ar: "معلق",      label_en: "Pending" },
  inactive:   { bg: "#F1F5F9", text: "#475569", icon: XCircle,      label_ar: "غير نشط",  label_en: "Inactive" },
  processing: { bg: "#DBEAFE", text: "#1D4ED8", icon: RefreshCcw,   label_ar: "جاري",     label_en: "Processing" },
  shipped:    { bg: "#E0F2FE", text: "#0369A1", icon: Truck,         label_ar: "مشحون",    label_en: "Shipped" },
  delivered:  { bg: "#DCFCE7", text: "#15803D", icon: CheckCircle,  label_ar: "مُسلَّم",   label_en: "Delivered" },
  failed:     { bg: "#FEE2E2", text: "#B91C1C", icon: XCircle,      label_ar: "فشل",      label_en: "Failed" },
};

export default function Dropshipping() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders" | "catalog">("suppliers");
  const [search, setSearch] = useState("");

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  const totalProducts = mockSuppliers.filter(s => s.status === "active").reduce((sum, s) => sum + s.products, 0);
  const activeSuppliers = mockSuppliers.filter(s => s.status === "active").length;
  const pendingOrders = mockOrders.filter(o => o.status === "processing").length;
  const totalCost = mockOrders.reduce((s, o) => s + o.cost, 0);

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A0533]">
              {ar ? "دروب شوبينج" : "Dropshipping"}
            </h1>
          </div>
          <p className="text-sm text-[#6F6178] ms-10">
            {ar ? "إدارة الموردين والطلبات والكتالوج" : "Manage suppliers, orders, and product catalog"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#0EA5E9] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#0284C7] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          {ar ? "إضافة مورد" : "Add Supplier"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Globe, label: ar ? "موردون نشطون" : "Active Suppliers", value: activeSuppliers.toString(), color: "#0EA5E9" },
          { icon: Package, label: ar ? "منتجات متاحة" : "Available Products", value: totalProducts.toLocaleString(), color: "#7C3AED" },
          { icon: ShoppingCart, label: ar ? "طلبات معلقة" : "Pending Orders", value: pendingOrders.toString(), color: "#D97706" },
          { icon: TrendingUp, label: ar ? "إجمالي التكلفة" : "Total Cost", value: `${totalCost.toLocaleString()} ${ar ? "ج" : "EGP"}`, color: "#059669" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#EDE5F7] p-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}18` }}>
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-bold text-[#1A0533]">{stat.value}</p>
            <p className="text-xs text-[#6F6178] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#EDE5F7] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#EDE5F7] flex-wrap gap-4">
          <div className="flex gap-1 bg-[#F8F4FC] rounded-xl p-1">
            {(["suppliers", "orders", "catalog"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#0EA5E9] shadow-sm"
                    : "text-[#6F6178] hover:text-[#1A0533]"
                }`}
              >
                {tab === "suppliers" ? (ar ? "الموردون" : "Suppliers")
                  : tab === "orders" ? (ar ? "الطلبات" : "Orders")
                  : (ar ? "الكتالوج" : "Catalog")}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] ${isRTL ? "right-3" : "left-3"}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ar ? "بحث..." : "Search..."}
              className={`text-sm border border-[#EDE5F7] rounded-xl py-2 bg-[#FAFAFA] focus:outline-none focus:border-[#0EA5E9] transition-colors ${
                isRTL ? "pr-9 pl-4" : "pl-9 pr-4"
              }`}
            />
          </div>
        </div>

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <div className="divide-y divide-[#F0EAF8]">
            {filteredSuppliers.map((supplier) => {
              const s = statusConfig[supplier.status];
              const StatusIcon = s.icon;
              return (
                <div key={supplier.id} className="flex items-center justify-between p-5 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3E8FF] flex items-center justify-center text-2xl">
                      {supplier.flag}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A0533]">{supplier.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[#9CA3AF]">{supplier.country}</span>
                        <span className="text-xs text-[#9CA3AF]">•</span>
                        <span className="text-xs text-[#9CA3AF]">{supplier.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="text-center hidden sm:block">
                      <p className="text-sm font-bold text-[#1A0533]">{supplier.products}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{ar ? "منتج" : "products"}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <p className="text-sm font-bold text-[#1A0533]">{supplier.rating}</p>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF]">{ar ? "التقييم" : "rating"}</p>
                    </div>
                    <div className="text-center hidden md:block">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#6F6178]" />
                        <p className="text-sm font-bold text-[#1A0533]">{supplier.shippingDays}d</p>
                      </div>
                      <p className="text-[10px] text-[#9CA3AF]">{ar ? "شحن" : "delivery"}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>
                      <StatusIcon className="w-3 h-3" />
                      {ar ? s.label_ar : s.label_en}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6F6178] hover:text-[#7C3AED] transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1 text-xs font-medium text-white bg-[#0EA5E9] hover:bg-[#0284C7] px-3 py-1.5 rounded-lg transition-colors">
                        {ar ? "استيراد" : "Import"}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#9CA3AF] border-b border-[#EDE5F7] bg-[#FAFAFA]">
                  <th className="px-6 py-3 font-medium">{ar ? "رقم الطلب" : "Order Ref"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "المورد" : "Supplier"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "المنتج" : "Product"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "الكمية" : "Qty"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "التكلفة" : "Cost"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 font-medium">{ar ? "التاريخ" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAF8]">
                {mockOrders.map((order) => {
                  const s = statusConfig[order.status];
                  const StatusIcon = s.icon;
                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#7C3AED]">{order.orderRef}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#1A0533]">{order.supplier}</td>
                      <td className="px-4 py-4 text-sm text-[#1A0533]">{order.product}</td>
                      <td className="px-4 py-4 text-sm font-medium text-[#1A0533]">{order.qty}</td>
                      <td className="px-4 py-4 text-sm font-bold text-[#1A0533]">{order.cost.toLocaleString()} {ar ? "ج" : "EGP"}</td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 w-fit text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.text }}>
                          <StatusIcon className="w-3 h-3" />
                          {ar ? s.label_ar : s.label_en}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#9CA3AF]">{order.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Catalog Tab */}
        {activeTab === "catalog" && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[#0EA5E9]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A0533] mb-2">
              {ar ? "استورد كتالوج المورد" : "Import Supplier Catalog"}
            </h3>
            <p className="text-sm text-[#6F6178] mb-6 max-w-sm mx-auto">
              {ar
                ? "اختر مورداً من القائمة واضغط استيراد لإضافة منتجاته إلى متجرك"
                : "Select a supplier and click Import to add their products to your store"}
            </p>
            <button
              onClick={() => setActiveTab("suppliers")}
              className="flex items-center gap-2 mx-auto bg-[#0EA5E9] text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[#0284C7] transition-colors"
            >
              {ar ? "اختر مورداً" : "Choose Supplier"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
