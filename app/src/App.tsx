import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from "react-router";
import { lazy, Suspense } from "react";
import { LanguageProvider } from "./hooks/useLanguage";
import { TRPCProvider } from "./providers/trpc";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import { HelmetProvider } from "react-helmet-async";
import {
  pathForLocale,
} from "./lib/localeRouting";

const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Account = lazy(() => import("./pages/Account"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const MediaBuyer = lazy(() => import("./pages/admin/MediaBuyer"));
const Dropshipping = lazy(() => import("./pages/admin/Dropshipping"));
const ActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const InventoryMovements = lazy(() => import("./pages/admin/InventoryMovements"));
const DataAnalytics = lazy(() => import("./pages/admin/DataAnalytics"));
const FulfillmentCenter = lazy(() => import("./pages/admin/FulfillmentCenter"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const MediaLibrary = lazy(() => import("./pages/admin/MediaLibrary"));
const SeoTools = lazy(() => import("./pages/admin/SeoTools"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const ExportBackup = lazy(() => import("./pages/admin/ExportBackup"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#B57EDC] border-t-transparent" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function LocaleBoundary() {
  const { locale } = useParams<{ locale: string }>();
  return locale === "ar" || locale === "en" ? <Outlet /> : <NotFound />;
}

function LegacyStorefrontRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={{
        pathname: pathForLocale(location.pathname, "ar"),
        search: location.search,
        hash: location.hash,
      }}
      replace
    />
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <TRPCProvider>
        <LanguageProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
          <Route path="/:locale" element={<LocaleBoundary />}>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/category/:category" element={<Shop />} />
              <Route path="shop/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="my-orders" element={<Navigate to="../account?tab=orders" replace />} />
              <Route path="wishlist" element={<Navigate to="../account?tab=wishlist" replace />} />
              <Route path="returns" element={<Navigate to="../account?tab=returns" replace />} />
              <Route path="account" element={<Account />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {[
            "/",
            "/shop",
            "/shop/category/:category",
            "/shop/:slug",
            "/cart",
            "/checkout",
            "/order-confirmation",
            "/track-order",
            "/about",
            "/contact",
            "/faq",
            "/my-orders",
            "/wishlist",
            "/returns",
            "/account",
            "/login",
            "/forgot-password",
            "/reset-password",
          ].map(path => (
            <Route key={path} path={path} element={<LegacyStorefrontRedirect />} />
          ))}

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
        </Suspense>
      </LanguageProvider>
    </TRPCProvider>
    </HelmetProvider>
  );
}
