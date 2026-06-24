import { Routes, Route } from "react-router";
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
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <TRPCProvider>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LanguageProvider>
    </TRPCProvider>
  );
}
