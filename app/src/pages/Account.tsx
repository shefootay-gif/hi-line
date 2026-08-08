import { useLanguage } from "@/hooks/useLanguage";
import { pathForLocale } from "@/lib/localeRouting";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  ShoppingBag,
  RotateCcw,
  Heart,
  User,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";
import { EGYPT_GOVERNORATES } from "@/lib/egypt-governorates";
import { OrdersTab } from "@/components/account/OrdersTab";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type AuthUser = NonNullable<RouterOutputs["auth"]["me"]>;
type WishlistProduct = RouterOutputs["store"]["getWishlist"][number]["product"];
type UserAddress = RouterOutputs["store"]["listAddresses"][number];
type Translations = ReturnType<typeof useTranslations>;
type UpdateProfileMutation = {
  mutateAsync: (input: {
    name: string;
    phone: string | null;
    gender: string | null;
    birthday: string | null;
    nationality: string | null;
  }) => Promise<unknown>;
};

export default function Account() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "orders";
  const ar = lang === "ar";

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const updateProfile = trpc.auth.updateProfile.useMutation();
  const logout = trpc.auth.logout.useMutation();

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate(pathForLocale("/login", lang));
    }
  }, [lang, navigate, user, userLoading]);

  // Tab State Handlers
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success(ar ? "تم تسجيل الخروج" : "Logged out successfully");
      navigate("/");
      window.location.reload();
    } catch {
      toast.error(ar ? "حدث خطأ" : "Logout failed");
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCF8FF]">
        <Loader2 className="w-10 h-10 animate-spin text-[#4B1C71]" />
      </div>
    );
  }

  return (
    <div className={`pt-28 pb-20 min-h-screen bg-[#F7F6F9] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-80 bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden flex-shrink-0">
            {/* User Header */}
            <div className="p-6 border-b border-[#F2EAFA] flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#4B1C71] text-white flex items-center justify-center font-bold text-lg shadow-inner">
                {getInitials(user.name)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-[#8D7A97]">{ar ? "أهلاً بك،" : "Welcome,"}</p>
                <p className="font-bold text-[#4B1C71] truncate text-base">{user.name || "User"}</p>
                <p className="text-xs text-[#8D7A97] truncate">{user.email}</p>
              </div>
            </div>

            {/* Premium Noon One-like Banner */}
            <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-[#ffe066] to-[#f5d033] rounded-xl flex items-center justify-between border border-[#e6c21e] text-[#1A0533]">
              <div>
                <p className="text-xs font-black uppercase tracking-wider">{ar ? "عضوية هاي لاين المميزة" : "Hi Line One Member"}</p>
                <p className="text-[10px] opacity-90">{ar ? "شحن مجاني على كافة طلباتك!" : "Free shipping on all orders!"}</p>
              </div>
              <div className="bg-[#1A0533] text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                {ar ? "نشط" : "Active"}
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-1">
              <button
                onClick={() => handleTabChange("orders")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === "orders"
                    ? "bg-[#4B1C71] text-white"
                    : "text-[#6F6178] hover:bg-[#F2EAFA] hover:text-[#4B1C71]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "الطلبات" : "Orders"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>

              <button
                onClick={() => handleTabChange("returns")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === "returns"
                    ? "bg-[#4B1C71] text-white"
                    : "text-[#6F6178] hover:bg-[#F2EAFA] hover:text-[#4B1C71]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "الإرجاع" : "Returns"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>

              <button
                onClick={() => handleTabChange("wishlist")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === "wishlist"
                    ? "bg-[#4B1C71] text-white"
                    : "text-[#6F6178] hover:bg-[#F2EAFA] hover:text-[#4B1C71]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "المفضلة" : "Wishlist"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>

              <div className="py-2">
                <p className="px-4 text-[10px] font-bold text-[#8D7A97] uppercase tracking-wider">{ar ? "حسابي" : "MY ACCOUNT"}</p>
              </div>

              <button
                onClick={() => handleTabChange("profile")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === "profile"
                    ? "bg-[#4B1C71] text-white"
                    : "text-[#6F6178] hover:bg-[#F2EAFA] hover:text-[#4B1C71]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "بياناتك الشخصية" : "Profile Details"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>

              <button
                onClick={() => handleTabChange("addresses")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === "addresses"
                    ? "bg-[#4B1C71] text-white"
                    : "text-[#6F6178] hover:bg-[#F2EAFA] hover:text-[#4B1C71]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "العناوين" : "Addresses"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRTL ? "rotate-180" : ""}`} />
              </button>

              <div className="border-t border-[#F2EAFA] my-3"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">{ar ? "تسجيل الخروج" : "Logout"}</span>
                </div>
              </button>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-[#E7D8F1] p-6 lg:p-8 min-h-[500px]">
            {activeTab === "orders" && <OrdersTab ar={ar} t={t} />}
            {activeTab === "returns" && <ReturnsTab ar={ar} />}
            {activeTab === "wishlist" && <WishlistTab ar={ar} t={t} />}
            {activeTab === "profile" && <ProfileTab user={user} ar={ar} updateProfile={updateProfile} />}
            {activeTab === "addresses" && <AddressesTab user={user} ar={ar} />}
          </div>

        </div>
      </div>
    </div>
  );
}

// ======================== RETURNS TAB ========================
function ReturnsTab({ ar }: { ar: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-[#F2EAFA] rounded-full flex items-center justify-center mx-auto mb-6 text-[#B57EDC]">
        <RotateCcw className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "لا توجد طلبات استرجاع" : "No return requests"}</h2>
      <p className="text-sm text-[#6F6178] max-w-md mx-auto">
        {ar 
          ? "لم تقم بتقديم أي طلب استرجاع خلال الـ 3 أشهر الأخيرة. يمكنك الاسترجاع أو الاستبدال لطلباتك خلال 14 يوماً من التوصيل."
          : "You haven't submitted any return requests in the last 3 months. Returns are eligible within 14 days of delivery."}
      </p>
    </div>
  );
}

// ======================== WISHLIST TAB ========================
function WishlistTab({ ar, t }: { ar: boolean; t: Translations }) {
  const { lang } = useLanguage();
  const { data: wishlist, refetch, isLoading } = trpc.store.getWishlist.useQuery();
  const toggleWishlist = trpc.store.toggleWishlist.useMutation();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleRemove = async (productId: number) => {
    try {
      await toggleWishlist.mutateAsync({ productId });
      refetch();
      toast.success(ar ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
    } catch {
      toast.error(ar ? "حدث خطأ" : "An error occurred");
    }
  };

  const handleAddToCart = (product: WishlistProduct) => {
    setAddingId(product.id);
    addItem({
      productId: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      scent: product.scent,
      scentColor: product.scentColor,
      price: product.salePrice ?? product.price,
      salePrice: product.salePrice,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
    });
    toast.success(ar ? "تمت الإضافة إلى السلة" : "Added to cart");
    setTimeout(() => setAddingId(null), 1000);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-[#E7D8F1]" />
        ))}
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-[#E7D8F1] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "قائمتك فارغة" : "Your wishlist is empty"}</h2>
        <p className="text-[#6F6178] mb-6 text-sm">{ar ? "تصفح المتجر وأضف منتجاتك المفضلة هنا" : "Browse our shop and add your favorite products here"}</p>
        <Link to={pathForLocale("/shop", lang)} className="inline-block px-8 py-3 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors">
          {t.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "المفضلة" : "Wishlist"}</h2>
      <p className="text-xs text-[#8D7A97] mb-6">{ar ? "المنتجات التي قمت بحفظها لشرائها لاحقاً" : "Products you saved to buy later"}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          return (
            <div key={item.wishlistId} className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden group flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-square bg-[#FCF8FF] p-4 flex items-center justify-center">
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 hover:bg-red-50 transition-colors z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link to={pathForLocale(`/shop/${product.slug}`, lang)} className="block w-full h-full">
                  <img
                    src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ""}
                    alt={product.nameEn}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-[#4B1C71] text-sm line-clamp-1">
                    {ar ? product.nameAr : product.nameEn}
                  </h3>
                  <p className="text-xs text-[#8D7A97] mt-0.5">{product.scent}</p>

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-black text-[#D71920]">
                      {product.salePrice ? parseFloat(product.salePrice).toFixed(0) : parseFloat(product.price).toFixed(0)} {t.currency}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-[#8D7A97] line-through">
                        {parseFloat(product.price).toFixed(0)} {t.currency}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingId === product.id}
                  className="mt-4 w-full py-2 bg-[#4B1C71] text-white text-xs font-bold rounded-xl hover:bg-[#3a1558] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {addingId === product.id ? t.added : t.addToCart}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================== PROFILE TAB ========================
function ProfileTab({ user, ar, updateProfile }: { user: AuthUser; ar: boolean; updateProfile: UpdateProfileMutation }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [gender, setGender] = useState(user.gender || "");
  const [birthday, setBirthday] = useState(user.birthday || "");
  const [nationality, setNationality] = useState(user.nationality || "مصر");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        name,
        phone: phone || null,
        gender: gender || null,
        birthday: birthday || null,
        nationality: nationality || null,
      });
      toast.success(ar ? "تم تحديث البيانات بنجاح" : "Profile updated successfully");
    } catch {
      toast.error(ar ? "فشل التحديث" : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "بياناتك الشخصية" : "Personal Profile"}</h2>
        <p className="text-xs text-[#8D7A97] mb-6">{ar ? "استعرض وحدّث معلومات الاتصال الخاصة بك ومعلومات حسابك" : "Review and update your contact information and personal details"}</p>
      </div>

      {/* Card 1: Contact Info */}
      <div className="bg-white rounded-2xl border border-[#E7D8F1] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#4B1C71] border-b border-[#F2EAFA] pb-2 mb-3">
          {ar ? "معلومات الاتصال" : "Contact Details"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "البريد الإلكتروني" : "Email Address"}</label>
            <input
              type="email"
              value={user.email ?? ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm bg-[#F7F6F9] text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "رقم الهاتف" : "Phone Number"}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 1XX XXX XXXX"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Personal Info */}
      <div className="bg-white rounded-2xl border border-[#E7D8F1] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#4B1C71] border-b border-[#F2EAFA] pb-2 mb-3">
          {ar ? "المعلومات الشخصية" : "Personal Information"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "الاسم بالكامل" : "Full Name"}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "تاريخ الميلاد" : "Date of Birth"}</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "الجنس" : "Gender"}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  gender === "male"
                    ? "border-[#4B1C71] bg-[#4B1C71]/5 text-[#4B1C71]"
                    : "border-[#E7D8F1] hover:border-[#B57EDC] text-[#6F6178]"
                }`}
              >
                <span>{ar ? "ذكر" : "Male"}</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  gender === "female"
                    ? "border-[#4B1C71] bg-[#4B1C71]/5 text-[#4B1C71]"
                    : "border-[#E7D8F1] hover:border-[#B57EDC] text-[#6F6178]"
                }`}
              >
                <span>{ar ? "أنثى" : "Female"}</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "الجنسية" : "Nationality"}</label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
            >
              <option value="مصر">{ar ? "مصر" : "Egypt"}</option>
              <option value="السعودية">{ar ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
              <option value="الإمارات">{ar ? "الإمارات العربية المتحدة" : "United Arab Emirates"}</option>
              <option value="أخرى">{ar ? "أخرى" : "Other"}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#4B1C71] text-white font-bold rounded-xl hover:bg-[#3a1558] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {ar ? "تحديث حسابك" : "Update Profile"}
        </button>
      </div>
    </form>
  );
}

// ======================== ADDRESSES TAB ========================
function AddressesTab({ user, ar }: { user: AuthUser; ar: boolean }) {
  const { data: addresses, refetch, isLoading } = trpc.store.listAddresses.useQuery();
  const createAddress = trpc.store.createAddress.useMutation();
  const updateAddress = trpc.store.updateAddress.useMutation();
  const deleteAddress = trpc.store.deleteAddress.useMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("البيت");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const openAddModal = () => {
    setEditingAddress(null);
    setTitle(ar ? "البيت" : "Home");
    setFullName(user.name || "");
    setPhone(user.phone || "");
    setGovernorate("");
    setCity("");
    setAddress("");
    setIsDefault(false);
    setShowModal(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setTitle(addr.title);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setGovernorate(addr.governorate);
    setCity(addr.city || "");
    setAddress(addr.address);
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress.mutateAsync({ id });
      refetch();
      toast.success(ar ? "تم حذف العنوان" : "Address deleted successfully");
    } catch {
      toast.error(ar ? "حدث خطأ" : "Failed to delete address");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!governorate) {
      toast.error(ar ? "الرجاء اختيار المحافظة" : "Please select governorate");
      return;
    }

    try {
      if (editingAddress) {
        await updateAddress.mutateAsync({
          id: editingAddress.id,
          title,
          fullName,
          phone,
          governorate,
          city: city || undefined,
          address,
          isDefault,
        });
        toast.success(ar ? "تم تحديث العنوان" : "Address updated successfully");
      } else {
        await createAddress.mutateAsync({
          title,
          fullName,
          phone,
          governorate,
          city: city || undefined,
          address,
          isDefault,
        });
        toast.success(ar ? "تمت إضافة العنوان الجديد" : "Address added successfully");
      }
      refetch();
      setShowModal(false);
    } catch {
      toast.error(ar ? "حدث خطأ" : "Failed to save address");
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-xl font-bold text-[#4B1C71] mb-2">{ar ? "العناوين" : "Saved Addresses"}</h2>
        <p className="text-xs text-[#8D7A97] mb-6">
          {ar 
            ? "أدر عناوين الشحن المحفوظة لتتمكن من إتمام عمليات الشراء بسرعة وسهولة"
            : "Manage your shipping addresses for a faster checkout experience"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="animate-pulse bg-[#FCF8FF] rounded-2xl h-40 border border-[#E7D8F1]" />
          <div className="animate-pulse bg-[#FCF8FF] rounded-2xl h-40 border border-[#E7D8F1]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address Cards */}
          {addresses?.map((addr) => (
            <div key={addr.id} className="border border-[#E7D8F1] rounded-2xl p-5 relative bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-[#F2EAFA] text-[#B57EDC] rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-[#4B1C71]">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {ar ? "الافتراضي" : "Default"}
                    </span>
                  )}
                </div>

                <p className="font-bold text-xs text-[#4B1C71] mb-1">{addr.fullName}</p>
                <p className="text-xs text-[#6F6178] leading-relaxed mb-2">
                  {addr.address}, {addr.city ? `${addr.city}, ` : ""}{ar ? EGYPT_GOVERNORATES.find(g => g.en === addr.governorate)?.ar || addr.governorate : addr.governorate}
                </p>
                <p className="text-xs font-semibold text-[#8D7A97]">{addr.phone}</p>
              </div>

              <div className="flex items-center gap-3 border-t border-[#F2EAFA] pt-4 mt-4 justify-end">
                <button
                  onClick={() => openEditModal(addr)}
                  className="flex items-center gap-1 text-xs font-bold text-[#4B1C71] hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  {ar ? "تعديل" : "Edit"}
                </button>
                <span className="text-[#E7D8F1]">|</span>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {ar ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          ))}

          {/* Add New Address Card */}
          <button
            onClick={openAddModal}
            className="border-2 border-dashed border-[#B57EDC]/30 hover:border-[#B57EDC] bg-[#FCF8FF]/50 hover:bg-[#FCF8FF] rounded-2xl p-6 min-h-[170px] flex flex-col items-center justify-center gap-2 group transition-all"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#B57EDC] text-[#B57EDC] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-[#4B1C71] text-sm">{ar ? "إضافة عنوان جديد" : "Add New Address"}</span>
          </button>
        </div>
      )}

      {/* Address Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-[#E7D8F1] bg-[#FCF8FF]">
              <h3 className="font-bold text-[#4B1C71] text-base">
                {editingAddress ? (ar ? "تعديل العنوان" : "Edit Address") : (ar ? "إضافة عنوان جديد" : "Add New Address")}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8D7A97] hover:text-[#4B1C71]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Title / Label */}
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "تسمية العنوان (مثل: البيت، العمل)" : "Address Label (e.g. Home, Work)"} *</label>
                <div className="flex gap-2">
                  {["البيت", "العمل", "آخر"].map((lbl) => {
                    const matchedLbl = ar ? lbl : (lbl === "البيت" ? "Home" : lbl === "العمل" ? "Work" : "Other");
                    return (
                      <button
                        type="button"
                        key={lbl}
                        onClick={() => setTitle(matchedLbl)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                          title === matchedLbl
                            ? "border-[#4B1C71] bg-[#4B1C71]/5 text-[#4B1C71]"
                            : "border-[#E7D8F1] hover:border-[#B57EDC] text-[#6F6178]"
                        }`}
                      >
                        {ar ? lbl : matchedLbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "الاسم الكامل للمستلم" : "Receiver Full Name"} *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "رقم الهاتف المحمول" : "Mobile Phone Number"} *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+20 1XX XXX XXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white animate-ltr"
                />
              </div>

              {/* Governorate & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "المحافظة" : "Governorate"} *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                  >
                    <option value="">{ar ? "اختر المحافظة" : "Select..."}</option>
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov.en} value={gov.en}>
                        {ar ? gov.ar : gov.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "المدينة / المنطقة" : "City / Area"}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                  />
                </div>
              </div>

              {/* Address details */}
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1.5">{ar ? "العنوان بالتفصيل (الشارع، العمارة، الشقة)" : "Detailed Address (Street, Building, Apt)"} *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white resize-none"
                />
              </div>

              {/* Set Default */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-[#4B1C71] rounded border-[#E7D8F1]"
                />
                <span className="text-xs text-[#4B1C71] font-semibold">{ar ? "تعيين كعنوان افتراضي للشحن" : "Set as default shipping address"}</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F2EAFA] mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-[#6F6178] hover:text-[#4B1C71]"
                >
                  {ar ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={createAddress.isPending || updateAddress.isPending}
                  className="px-6 py-2.5 bg-[#4B1C71] text-white text-xs font-bold rounded-xl hover:bg-[#3a1558] transition-colors disabled:opacity-50"
                >
                  {ar ? "حفظ" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
