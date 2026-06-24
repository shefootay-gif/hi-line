import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { ChevronLeft, CreditCard, Banknote, Smartphone, Building, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Checkout() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { data: paymentMethods } = trpc.store.getPaymentMethods.useQuery();
  const { data: governorates } = trpc.store.getShippingGovernorates.useQuery();
  const createOrder = trpc.store.createOrder.useMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    governorate: "",
    city: "",
    postalCode: "",
    paymentMethod: "cash_on_delivery",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getTotalPrice();

  const selectedGov = governorates?.find(
    (g) => g.governorate === formData.governorate
  );
  const shippingFee = selectedGov ? parseFloat(selectedGov.baseFee ?? "0") : 0;
  const freeShippingThreshold = 500;
  const effectiveShipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + effectiveShipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address || !formData.governorate) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder.mutateAsync({
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerWhatsapp: formData.phone,
        customerEmail: formData.email || undefined,
        shippingAddress: formData.address,
        governorate: formData.governorate,
        city: formData.city || undefined,
        postalCode: formData.postalCode || undefined,
        paymentMethod: formData.paymentMethod as any,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate("/order-confirmation", {
        state: { orderNumber: result.orderNumber, total: result.total },
      });
    } catch (error) {
      toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash_on_delivery":
        return <Banknote className="w-5 h-5" />;
      case "vodafone_cash":
        return <Smartphone className="w-5 h-5" />;
      case "instapay":
        return <Smartphone className="w-5 h-5" />;
      case "bank_transfer":
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <div className="max-w-xl mx-auto px-4 text-center py-20">
          <p className="text-lg text-[#6F6178] mb-4">
            {lang === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl"
          >
            {t.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">{t.checkout}</h1>
        <nav className="flex items-center gap-2 text-sm text-[#8D7A97] mb-8">
          <Link to="/" className="hover:text-[#B57EDC]">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#B57EDC]">
            {t.cart}
          </Link>
          <span>/</span>
          <span className="text-[#4B1C71]">{t.checkout}</span>
        </nav>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.contactInfo}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {t.email}{" "}
                  <span className="text-[#8D7A97]">({lang === "ar" ? "اختياري" : "optional"})</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+20 1XX XXX XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.shippingAddress}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {t.address} *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                    {t.governorate} *
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                  >
                    <option value="">
                      {lang === "ar" ? "اختر المحافظة" : "Select Governorate"}
                    </option>
                    {governorates?.map((gov) => (
                      <option key={gov.id} value={gov.governorate}>
                        {lang === "ar" && gov.governorateAr
                          ? gov.governorateAr
                          : gov.governorate}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                    {t.city}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                    {t.postalCode}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.paymentMethod}
            </h2>
            <div className="space-y-3">
              {paymentMethods?.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.paymentMethod === method.method
                      ? "border-[#B57EDC] bg-[#B57EDC]/5"
                      : "border-[#E7D8F1] hover:border-[#B57EDC]/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.method}
                    checked={formData.paymentMethod === method.method}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#B57EDC]"
                  />
                  <span className="text-[#4B1C71]">
                    {getPaymentIcon(method.method)}
                  </span>
                  <div>
                    <p className="font-medium text-[#4B1C71]">
                      {lang === "ar" && method.displayNameAr
                        ? method.displayNameAr
                        : method.displayName}
                    </p>
                    {method.instructions && (
                      <p className="text-xs text-[#8D7A97] mt-0.5">
                        {lang === "ar" && method.instructionsAr
                          ? method.instructionsAr
                          : method.instructions}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Notes */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.orderNotes}
            </h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1]">
            <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.orderSummary}
            </h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-[#6F6178]">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {(parseFloat(item.price) * item.quantity).toFixed(0)}{" "}
                    {t.currency}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#E7D8F1] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6F6178]">{t.subtotal}</span>
                <span>{subtotal.toFixed(0)} {t.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6F6178]">{t.shipping}</span>
                <span>
                  {effectiveShipping === 0 ? (
                    <span className="text-green-500 font-medium">{t.freeShipping}</span>
                  ) : (
                    `${effectiveShipping.toFixed(0)} ${t.currency}`
                  )}
                </span>
              </div>
            </div>
            <div className="border-t border-[#E7D8F1] pt-4 mt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>{t.total}</span>
                <span>{total.toFixed(0)} {t.currency}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#B57EDC] text-[#4B1C71] font-semibold text-lg rounded-xl hover:bg-[#A66DCC] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {t.placeOrder}
          </button>
        </form>
      </div>
    </div>
  );
}
