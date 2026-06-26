import { Outlet, Link, Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Settings,
  Menu,
  X,
  LogOut,
  Store,
  Zap,
  TrendingUp,
  Tag,
  Activity,
  PackageSearch,
  BarChart3,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard",    labelAr: "لوحة التحكم",  href: "/admin",              icon: LayoutDashboard },
  { label: "Products",     labelAr: "المنتجات",     href: "/admin/products",     icon: Package },
  { label: "Categories",   labelAr: "الأقسام",      href: "/admin/categories",   icon: FolderTree },
  { label: "Orders",       labelAr: "الطلبات",      href: "/admin/orders",       icon: ShoppingBag },
  { label: "Coupons",      labelAr: "الكوبونات",    href: "/admin/coupons",      icon: Tag },
  { label: "Media Buyer",  labelAr: "ميديا باير",   href: "/admin/media-buyer",  icon: Zap },
  { label: "Dropshipping", labelAr: "دروب شوبينج",  href: "/admin/dropshipping", icon: TrendingUp },
  { label: "Inventory",    labelAr: "حركة المخزون", href: "/admin/inventory-movements", icon: PackageSearch },
  { label: "Analytics",    labelAr: "تحليل البيانات", href: "/admin/analytics", icon: BarChart3 },
  { label: "Activity Log", labelAr: "سجل النشاط", href: "/admin/activity-logs", icon: Activity },
  { label: "Settings",     labelAr: "الإعدادات",    href: "/admin/settings",     icon: Settings },
];

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth({ redirectPath: "/admin/login" });
  const { lang, isRTL } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#B57EDC] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
<div
  dir={isRTL ? "rtl" : "ltr"}
  className={`min-h-screen w-full overflow-x-hidden bg-[#F7ECFF] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}
>      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#4B1C71] text-white h-16 flex items-center justify-between px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-bold text-[#B57EDC]">Hi Line Admin</span>
        <Link to="/" className="text-white/70">
          <Store className="w-5 h-5" />
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} z-40 h-full w-64 bg-[#4B1C71] text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-[#B57EDC]">Hi Line Admin</h2>
          <p className="text-xs text-white/50 mt-1">
            {lang === "ar" ? "لوحة تحكم المتجر" : "Store Dashboard"}
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#B57EDC] text-[#4B1C71]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {lang === "ar" ? item.labelAr : item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-8 h-8 rounded-full bg-[#B57EDC] flex items-center justify-center text-[#4B1C71] font-bold text-sm">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Store className="w-4 h-4" />
              {lang === "ar" ? "عرض المتجر" : "View Store"}
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {lang === "ar" ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen min-w-0 overflow-x-hidden pt-16 lg:pt-0 ${isRTL ? "lg:mr-64" : "lg:ml-64"}`}>
  <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <Outlet />
        </div>
</main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
