import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { CreditCard, Banknote, Smartphone, Building, Loader2, Tag, X, CheckCircle2, ChevronDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type PaymentMethod = "cash_on_delivery" | "vodafone_cash" | "instapay" | "bank_transfer" | "paymob";

export default function Checkout() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const navigate = useNavigate();
  const { items, getTotalPrice, getDiscountAmount, clearCart } = useCart();
  const { data: paymentMethods } = trpc.store.getPaymentMethods.useQuery();
  const { data: governorates } = trpc.store.getShippingGovernorates.useQuery();
  const createOrder = trpc.store.createOrder.useMutation();
  const validateCoupon = trpc.store.validateCoupon.useMutation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: userAddresses } = trpc.store.listAddresses.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const [step, setStep] = useState(1);

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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const subtotal = getTotalPrice();
  const volumeDiscount = getDiscountAmount();

  const selectedGov = governorates?.find(
    (g) => g.governorate === formData.governorate
  );
  const shippingFee = selectedGov ? parseFloat(selectedGov.baseFee ?? "0") : 0;
  const effectiveShipping = shippingFee;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = subtotal - couponDiscount - volumeDiscount + effectiveShipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        subtotal: subtotal,
      });
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.trim(),
          discountAmount: result.discountAmount,
        });
        toast.success(lang === "ar" ? "تم تطبيق كود الخصم بنجاح" : "Coupon applied successfully");
      }
    } catch (err: any) {
      toast.error(err.message || (lang === "ar" ? "كود الخصم غير صالح" : "Invalid coupon code"));
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const validateStep1 = () => {
    if (!formData.phone) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم الهاتف" : "Please enter phone number");
      return false;
    }
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error(lang === "ar" ? "يرجى إدخال رقم هاتف مصري صحيح" : "Please enter a valid Egyptian phone number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName || !formData.address || !formData.governorate) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;

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
        paymentMethod: formData.paymentMethod as PaymentMethod,
        notes: formData.notes || undefined,
        couponCode: appliedCoupon?.code,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      if (result.paymobUrl) {
        window.location.href = result.paymobUrl;
      } else {
        navigate(`/order-confirmation?order=${result.orderNumber}&phone=${encodeURIComponent(formData.phone)}`, {
          state: { total: result.total },
        });
      }
    } catch (err: any) {
      toast.error(err?.message || (lang === "ar" ? "حدث خطأ أثناء إتمام الطلب" : "An error occurred during checkout"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash_on_delivery": return <Banknote className="w-5 h-5" />;
      case "vodafone_cash": return <Smartphone className="w-5 h-5" />;
      case "instapay": return <Smartphone className="w-5 h-5" />;
      case "bank_transfer": return <Building className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  if (items.length === 0) {
    return (
      <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <div className="max-w-xl mx-auto px-4 text-center py-20">
          <p className="text-lg text-[#6F6178] mb-4">
            {lang === "ar" ? "سلة التسوق فارغة" : "Your cart is empty"}
          </p>
          <Link to="/shop" className="px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl">
            {t.startShopping}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"} bg-[#FCF8FF]`}>
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">{t.checkout}</h1>
        <nav className="flex items-center gap-2 text-sm text-[#8D7A97] mb-8">
          <Link to="/" className="hover:text-[#B57EDC]">{lang === "ar" ? "الرئيسية" : "Home"}</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[#B57EDC]">{t.cart}</Link>
          <span>/</span>
          <span className="text-[#4B1C71]">{t.checkout}</span>
        </nav>

        <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
          <div className="flex-1 space-y-6">
            
            {/* Step 1: Contact Info */}
            <div className={`bg-white rounded-2xl border ${step === 1 ? 'border-[#B57EDC] shadow-md' : 'border-[#E7D8F1]'}`}>
              <div className="p-6 cursor-pointer" onClick={() => { if (step > 1) setStep(1); }}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold flex items-center gap-3 ${step === 1 ? 'text-[#4B1C71]' : 'text-[#8D7A97]'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-[#4B1C71] text-white' : step > 1 ? 'bg-green-500 text-white' : 'bg-[#E7D8F1] text-[#6F6178]'}`}>
                      {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : "1"}
                    </span>
                    {t.contactInfo}
                  </h2>
                  {step > 1 && <span className="text-sm font-semibold text-[#B57EDC]">{lang === "ar" ? "تعديل" : "Edit"}</span>}
                </div>
                {step > 1 && (
                  <div className="mt-4 ms-11 text-sm text-[#6F6178]">
                    <p>{formData.phone}</p>
                    {formData.email && <p>{formData.email}</p>}
                  </div>
                )}
              </div>
              
              {step === 1 && (
                <div className="p-6 pt-0 border-t border-[#E7D8F1] animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.phone} *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+20 1XX XXX XXXX" className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.email} <span className="text-[#8D7A97]">({lang === "ar" ? "اختياري" : "optional"})</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none" />
                    </div>
                  </div>
                  <button onClick={() => { if(validateStep1()) setStep(2); }} className="mt-6 px-8 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors">{lang === "ar" ? "متابعة للشحن" : "Continue to Shipping"}</button>
                </div>
              )}
            </div>

            {/* Step 2: Shipping */}
            <div className={`bg-white rounded-2xl border ${step === 2 ? 'border-[#B57EDC] shadow-md' : 'border-[#E7D8F1]'}`}>
              <div className={`p-6 ${step >= 2 ? 'cursor-pointer' : 'opacity-50'}`} onClick={() => { if (step > 2) setStep(2); }}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg font-semibold flex items-center gap-3 ${step === 2 ? 'text-[#4B1C71]' : 'text-[#8D7A97]'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-[#4B1C71] text-white' : step > 2 ? 'bg-green-500 text-white' : 'bg-[#E7D8F1] text-[#6F6178]'}`}>
                      {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : "2"}
                    </span>
                    {t.shippingAddress}
                  </h2>
                  {step > 2 && <span className="text-sm font-semibold text-[#B57EDC]">{lang === "ar" ? "تعديل" : "Edit"}</span>}
                </div>
                {step > 2 && (
                  <div className="mt-4 ms-11 text-sm text-[#6F6178]">
                    <p>{formData.fullName}</p>
                    <p>{formData.address}, {formData.governorate}</p>
                  </div>
                )}
              </div>

              {step === 2 && (
                <div className="p-6 pt-0 border-t border-[#E7D8F1] animate-in slide-in-from-top-4">
                  {userAddresses && userAddresses.length > 0 && (
                    <div className="mt-6 p-4 bg-[#FCF8FF] rounded-2xl border border-[#E7D8F1]">
                      <h3 className="text-sm font-bold text-[#4B1C71] mb-3">
                        {lang === "ar" ? "اختر من عناوينك المحفوظة للشحن التلقائي:" : "Select from your saved addresses to autofill:"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {userAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                fullName: addr.recipientName || prev.fullName || user?.name || "",
                                phone: addr.recipientPhone || prev.phone || user?.phone || "",
                                address: addr.addressDetails || "",
                                governorate: addr.governorate || "",
                                city: addr.city || "",
                              }));
                              toast.success(lang === "ar" ? `تم تحديد عنوان الشحن: ${addr.label}` : `Shipping address selected: ${addr.label}`);
                            }}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E7D8F1] hover:border-[#B57EDC] hover:text-[#4B1C71] transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            📍 {addr.label} ({addr.city || addr.governorate})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.fullName} *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.address} *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.governorate} *</label>
                        <select name="governorate" value={formData.governorate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 bg-white outline-none">
                          <option value="">{lang === "ar" ? "اختر المحافظة" : "Select Governorate"}</option>
                          {governorates?.map((gov) => (
                            <option key={gov.id} value={gov.governorate}>{lang === "ar" && gov.governorateAr ? gov.governorateAr : gov.governorate}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.city}</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">{t.orderNotes}</label>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder={t.notesPlaceholder} rows={2} className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 outline-none resize-none" />
                    </div>
                  </div>
                  <button onClick={() => { if(validateStep2()) setStep(3); }} className="mt-6 px-8 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors">{lang === "ar" ? "متابعة للدفع" : "Continue to Payment"}</button>
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`bg-white rounded-2xl border ${step === 3 ? 'border-[#B57EDC] shadow-md' : 'border-[#E7D8F1]'}`}>
              <div className={`p-6 ${step >= 3 ? 'cursor-pointer' : 'opacity-50'}`}>
                <h2 className={`text-lg font-semibold flex items-center gap-3 ${step === 3 ? 'text-[#4B1C71]' : 'text-[#8D7A97]'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 3 ? 'bg-[#4B1C71] text-white' : 'bg-[#E7D8F1] text-[#6F6178]'}`}>
                    3
                  </span>
                  {t.paymentMethod}
                </h2>
              </div>
              
              {step === 3 && (
                <div className="p-6 pt-0 border-t border-[#E7D8F1] animate-in slide-in-from-top-4">
                  <div className="space-y-3 mt-6">
                    {paymentMethods?.map((method) => (
                      <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${formData.paymentMethod === method.method ? "border-[#B57EDC] bg-[#B57EDC]/5" : "border-[#E7D8F1] hover:border-[#B57EDC]/50"}`}>
                        <input type="radio" name="paymentMethod" value={method.method} checked={formData.paymentMethod === method.method} onChange={handleChange} className="w-4 h-4 accent-[#B57EDC]" />
                        <span className="text-[#4B1C71]">{getPaymentIcon(method.method)}</span>
                        <div>
                          <p className="font-medium text-[#4B1C71]">{lang === "ar" && method.displayNameAr ? method.displayNameAr : method.displayName}</p>
                          {method.instructions && <p className="text-xs text-[#8D7A97] mt-0.5">{lang === "ar" && method.instructionsAr ? method.instructionsAr : method.instructions}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="mt-8 w-full py-4 bg-[#B57EDC] text-[#4B1C71] font-semibold text-lg rounded-xl hover:bg-[#A66DCC] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#B57EDC]/30">
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t.placeOrder}
                  </button>
                </div>
              )}
            </div>
            
          </div>

          {/* Sticky Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1] sticky top-24 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-lg font-semibold text-[#4B1C71] mb-6">{t.orderSummary}</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative">
                      <img src={item.image || "/products/hero-product.jpg"} className="w-16 h-16 rounded-lg border border-[#E7D8F1] object-contain p-1" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#4B1C71] text-white rounded-full flex items-center justify-center text-[10px] font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-semibold text-[#4B1C71] truncate">{lang === 'ar' && item.nameAr ? item.nameAr : item.name}</p>
                      <p className="text-xs text-[#8D7A97]">{item.scent}</p>
                      <p className="text-sm font-bold text-[#4B1C71] mt-1">{(parseFloat(item.salePrice || item.price) * item.quantity).toFixed(0)} {t.currency}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 border-y border-[#E7D8F1] py-4">
                <label className="block text-sm font-medium text-[#4B1C71] mb-2">{lang === "ar" ? "كود الخصم" : "Coupon Code"}</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                      <Tag className="w-3 h-3" />
                      <span>{appliedCoupon.code}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="p-1 text-green-600 hover:bg-green-100 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder={lang === "ar" ? "أدخل كود الخصم" : "Enter code"} className="flex-1 px-3 py-2 rounded-lg border border-[#E7D8F1] focus:ring-2 focus:ring-[#B57EDC]/30 uppercase text-sm" />
                    <button type="button" onClick={handleApplyCoupon} disabled={validateCoupon.isPending || !couponCode.trim()} className="px-4 py-2 bg-[#FCF8FF] text-[#4B1C71] border border-[#E7D8F1] font-semibold text-sm rounded-lg hover:bg-[#F7ECFF] disabled:opacity-50">
                      {validateCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === "ar" ? "تطبيق" : "Apply")}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F6178]">{t.subtotal}</span>
                  <span className="font-medium">{(subtotal).toFixed(0)} {t.currency}</span>
                </div>
                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-sm text-[#D71920]">
                    <span className="font-medium">{lang === 'ar' ? 'خصم باقة التوفير' : 'Volume Discount'}</span>
                    <span>-{volumeDiscount.toFixed(0)} {t.currency}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">{lang === "ar" ? "خصم الكوبون" : "Coupon Discount"}</span>
                    <span>-{appliedCoupon.discountAmount.toFixed(0)} {t.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#6F6178]">{t.shipping}</span>
                  <span>{effectiveShipping === 0 ? <span className="text-green-500 font-medium">{t.freeShipping}</span> : `${effectiveShipping.toFixed(0)} ${t.currency}`}</span>
                </div>
              </div>
              <div className="border-t border-[#E7D8F1] pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-[#4B1C71]">
                  <span>{t.total}</span>
                  <span>{total.toFixed(0)} {t.currency}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
