import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Store,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", labelAr: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "Products", labelAr: "المنتجات", href: "/admin/products", icon: Package },
  { label: "Orders", labelAr: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
  { label: "Settings", labelAr: "الإعدادات", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth();
  const { lang, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#B57EDC] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-[#6F6178]">
          {lang === "ar"
            ? "غير مصرح بالوصول"
            : "Access Denied"}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-lg"
        >
          {lang === "ar" ? "الصفحة الرئيسية" : "Go Home"}
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F7ECFF] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      {/* Mobile Header */}
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
      <div className={`lg:${isRTL ? "mr-64" : "ml-64"} pt-16 lg:pt-0 min-h-screen`}>
        <Outlet />
      </div>

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
