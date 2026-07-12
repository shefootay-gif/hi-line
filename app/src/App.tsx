import { Routes, Route, Navigate } from "react-router";
import { LanguageProvider } from "./hooks/useLanguage";
import { TRPCProvider } from "./providers/trpc";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import AdminCoupons from "./pages/admin/Coupons";
import MediaBuyer from "./pages/admin/MediaBuyer";
import Dropshipping from "./pages/admin/Dropshipping";
import ActivityLogs from "./pages/admin/ActivityLogs";
import InventoryMovements from "./pages/admin/InventoryMovements";
import DataAnalytics from "./pages/admin/DataAnalytics";
import FulfillmentCenter from "./pages/admin/FulfillmentCenter";
import Notifications from "./pages/admin/Notifications";
import MediaLibrary from "./pages/admin/MediaLibrary";
import SeoTools from "./pages/admin/SeoTools";
import AdminUsers from "./pages/admin/AdminUsers";
import ExportBackup from "./pages/admin/ExportBackup";
import NotFound from "./pages/NotFound";

import { HelmetProvider } from "react-helmet-async";

export default function App() {
  return (
    <HelmetProvider>
      <TRPCProvider>
        <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/category/:category" element={<Shop />} />
            <Route path="/shop/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/my-orders" element={<Navigate to="/account?tab=orders" replace />} />
            <Route path="/wishlist" element={<Navigate to="/account?tab=wishlist" replace />} />
            <Route path="/returns" element={<Navigate to="/account?tab=returns" replace />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/login" element={<Login mode="admin" />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/media-buyer" element={<MediaBuyer />} />
            <Route path="/admin/dropshipping" element={<Dropshipping />} />
            <Route path="/admin/inventory-movements" element={<InventoryMovements />} />
            <Route path="/admin/analytics" element={<DataAnalytics />} />
            <Route path="/admin/activity-logs" element={<ActivityLogs />} />
            <Route path="/admin/fulfillment" element={<FulfillmentCenter />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/media-library" element={<MediaLibrary />} />
            <Route path="/admin/seo" element={<SeoTools />} />
            <Route path="/admin/admin-users" element={<AdminUsers />} />
            <Route path="/admin/export-backup" element={<ExportBackup />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LanguageProvider>
    </TRPCProvider>
    </HelmetProvider>
  );
}
