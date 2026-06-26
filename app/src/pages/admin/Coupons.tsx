import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface CouponForm {
  id?: number;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  minOrderValue: string;
  maxUsage: string;
  isActive: boolean;
  expiresAt: string;
}

const emptyForm: CouponForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "0",
  maxUsage: "",
  isActive: true,
  expiresAt: "",
};

export default function AdminCoupons() {
  const { lang, isRTL } = useLanguage();
  const utils = trpc.useUtils();
  const { data: coupons, isLoading } = trpc.admin.listCoupons.useQuery();
  const createCoupon = trpc.admin.createCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success(lang === "ar" ? "تم إنشاء الكوبون" : "Coupon created");
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateCoupon = trpc.admin.updateCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success(lang === "ar" ? "تم تحديث الكوبون" : "Coupon updated");
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteCoupon = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success(lang === "ar" ? "تم حذف الكوبون" : "Coupon deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setIsEditing(false);
  };

  const handleEdit = (coupon: any) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue ?? "0",
      maxUsage: coupon.maxUsage?.toString() ?? "",
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discountValue) {
      toast.error(lang === "ar" ? "أكمل الحقول المطلوبة" : "Fill required fields");
      return;
    }

    const payload = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderValue: form.minOrderValue || "0",
      maxUsage: form.maxUsage ? parseInt(form.maxUsage) : undefined,
      isActive: form.isActive,
      expiresAt: form.expiresAt || undefined,
    };

    if (isEditing && form.id) {
      updateCoupon.mutate({ id: form.id, ...payload });
    } else {
      createCoupon.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(lang === "ar" ? "هل تريد حذف هذا الكوبون؟" : "Delete this coupon?")) {
      deleteCoupon.mutate({ id });
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isMaxedOut = (current: number | null, max: number | null) => {
    if (max === null) return false;
    return (current ?? 0) >= max;
  };

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "text-right" : "text-left"}`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#4B1C71]">
            {lang === "ar" ? "إدارة الكوبونات" : "Coupons Management"}
          </h1>
          <p className="text-[#8D7A97] text-sm mt-1">
            {lang === "ar"
              ? "أنشئ وأدر أكواد الخصم للعملاء"
              : "Create and manage discount codes for customers"}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4B1C71] text-white rounded-xl hover:bg-[#3a1558] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          {lang === "ar" ? "إضافة كوبون" : "Add Coupon"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E7D8F1] p-6 mb-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-semibold text-[#4B1C71] mb-6">
            {isEditing
              ? lang === "ar"
                ? "تعديل الكوبون"
                : "Edit Coupon"
              : lang === "ar"
                ? "كوبون جديد"
                : "New Coupon"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "كود الكوبون *" : "Coupon Code *"}
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SAVE20"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 uppercase font-mono"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "نوع الخصم" : "Discount Type"}
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                >
                  <option value="percentage">
                    {lang === "ar" ? "نسبة مئوية (%)" : "Percentage (%)"}
                  </option>
                  <option value="fixed">
                    {lang === "ar" ? "مبلغ ثابت (ج.م)" : "Fixed Amount (EGP)"}
                  </option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "قيمة الخصم *" : "Discount Value *"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    placeholder={form.discountType === "percentage" ? "20" : "50"}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 end-4 text-[#8D7A97]">
                    {form.discountType === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                  </span>
                </div>
              </div>

              {/* Min Order Value */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "الحد الأدنى للطلب" : "Min Order Value"}
                </label>
                <input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm({ ...form, minOrderValue: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>

              {/* Max Usage */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "الحد الأقصى للاستخدام" : "Max Usage"}
                </label>
                <input
                  type="number"
                  value={form.maxUsage}
                  onChange={(e) =>
                    setForm({ ...form, maxUsage: e.target.value })
                  }
                  min="0"
                  placeholder={lang === "ar" ? "بلا حدود" : "Unlimited"}
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                  {lang === "ar" ? "تاريخ الانتهاء" : "Expiration Date"}
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="text-[#4B1C71]"
              >
                {form.isActive ? (
                  <ToggleRight className="w-8 h-8 text-green-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
              <span className="text-sm text-[#4B1C71] font-medium">
                {form.isActive
                  ? lang === "ar"
                    ? "مفعّل"
                    : "Active"
                  : lang === "ar"
                    ? "معطّل"
                    : "Inactive"}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={createCoupon.isPending || updateCoupon.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-[#4B1C71] text-white rounded-xl hover:bg-[#3a1558] transition-colors font-medium disabled:opacity-50"
              >
                {(createCoupon.isPending || updateCoupon.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isEditing
                  ? lang === "ar"
                    ? "حفظ التعديلات"
                    : "Save Changes"
                  : lang === "ar"
                    ? "إنشاء الكوبون"
                    : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-[#6F6178] bg-[#F7ECFF] rounded-xl hover:bg-[#E7D8F1] transition-colors font-medium"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#B57EDC]" />
        </div>
      ) : !coupons || coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7D8F1] p-12 text-center">
          <Tag className="w-12 h-12 text-[#B57EDC] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#4B1C71] mb-2">
            {lang === "ar" ? "لا توجد كوبونات" : "No Coupons"}
          </h3>
          <p className="text-[#8D7A97] text-sm">
            {lang === "ar"
              ? "أنشئ كوبونًا جديدًا لتبدأ"
              : "Create a new coupon to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7ECFF] text-[#4B1C71] text-sm">
                  <th className="px-5 py-3.5 text-start font-semibold">
                    {lang === "ar" ? "الكود" : "Code"}
                  </th>
                  <th className="px-5 py-3.5 text-start font-semibold">
                    {lang === "ar" ? "الخصم" : "Discount"}
                  </th>
                  <th className="px-5 py-3.5 text-start font-semibold hidden sm:table-cell">
                    {lang === "ar" ? "الحد الأدنى" : "Min Order"}
                  </th>
                  <th className="px-5 py-3.5 text-start font-semibold hidden md:table-cell">
                    {lang === "ar" ? "الاستخدام" : "Usage"}
                  </th>
                  <th className="px-5 py-3.5 text-start font-semibold hidden lg:table-cell">
                    {lang === "ar" ? "الانتهاء" : "Expires"}
                  </th>
                  <th className="px-5 py-3.5 text-start font-semibold">
                    {lang === "ar" ? "الحالة" : "Status"}
                  </th>
                  <th className="px-5 py-3.5 text-end font-semibold">
                    {lang === "ar" ? "إجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8F1]">
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt as string | null);
                  const maxedOut = isMaxedOut(coupon.currentUsage, coupon.maxUsage);
                  const active = coupon.isActive && !expired && !maxedOut;

                  return (
                    <tr
                      key={coupon.id}
                      className={`hover:bg-[#FCF8FF] transition-colors ${
                        !active ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 bg-[#F7ECFF] text-[#4B1C71] px-3 py-1.5 rounded-lg font-mono font-semibold text-sm">
                          <Tag className="w-3.5 h-3.5" />
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[#4B1C71] font-semibold">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `${coupon.discountValue} ${lang === "ar" ? "ج.م" : "EGP"}`}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-[#6F6178] text-sm">
                        {parseFloat(coupon.minOrderValue ?? "0") > 0
                          ? `${coupon.minOrderValue} ${lang === "ar" ? "ج.م" : "EGP"}`
                          : lang === "ar"
                            ? "بلا حد"
                            : "None"}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-[#6F6178]">
                          {coupon.currentUsage ?? 0}
                          {coupon.maxUsage !== null
                            ? ` / ${coupon.maxUsage}`
                            : ` / ∞`}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-sm text-[#6F6178]">
                        {coupon.expiresAt ? (
                          <span
                            className={`flex items-center gap-1.5 ${
                              expired ? "text-red-500" : ""
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(coupon.expiresAt).toLocaleDateString(
                              lang === "ar" ? "ar-EG" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}
                          </span>
                        ) : (
                          <span className="text-[#8D7A97]">
                            {lang === "ar" ? "بلا انتهاء" : "No expiry"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {lang === "ar" ? "نشط" : "Active"}
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {lang === "ar" ? "منتهي" : "Expired"}
                          </span>
                        ) : maxedOut ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {lang === "ar" ? "مكتمل" : "Maxed"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            {lang === "ar" ? "معطّل" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(coupon)}
                            className="p-2 rounded-lg text-[#4B1C71] hover:bg-[#F7ECFF] transition-colors"
                            title={lang === "ar" ? "تعديل" : "Edit"}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title={lang === "ar" ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
