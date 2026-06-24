import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState, useEffect } from "react";
import {
  Store,
  CreditCard,
  Truck,
  Palette,
  Loader2,
  Save,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const tabs = [
  { key: "general", labelEn: "General", labelAr: "عام", icon: Store },
  { key: "payment", labelEn: "Payment", labelAr: "الدفع", icon: CreditCard },
  { key: "shipping", labelEn: "Shipping", labelAr: "الشحن", icon: Truck },
  { key: "appearance", labelEn: "Appearance", labelAr: "المظهر", icon: Palette },
];

export default function AdminSettings() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings } = trpc.store.getSettings.useQuery();
  const { data: paymentMethods } = trpc.store.getPaymentMethods.useQuery();
  const { data: shippingSettings } = trpc.store.getShippingGovernorates.useQuery();

  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      utils.store.getSettings.invalidate();
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
    },
  });

  const updatePayment = trpc.admin.updatePaymentMethod.useMutation({
    onSuccess: () => {
      utils.store.getPaymentMethods.invalidate();
      toast.success(lang === "ar" ? "تم التحديث" : "Updated");
    },
  });

  const updateShipping = trpc.admin.updateShippingSetting.useMutation({
    onSuccess: () => {
      utils.store.getShippingGovernorates.invalidate();
      toast.success(lang === "ar" ? "تم التحديث" : "Updated");
    },
  });

  const getSetting = (key: string) => settings?.[key] || "";

  const handleSettingChange = (key: string, value: string) => {
    updateSetting.mutate({ key, value });
  };

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <h1 className="text-2xl font-bold text-[#4B1C71] mb-6">{t.manageSettings}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-[#B57EDC] text-[#4B1C71]"
                : "bg-white border border-[#E7D8F1] text-[#6F6178] hover:border-[#B57EDC]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {lang === "ar" ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white rounded-2xl border border-[#E7D8F1] p-6 max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
            {t.storeSettings}
          </h2>
          <SettingField
            label={t.name}
            value={getSetting("store_name_en")}
            onSave={(v) => handleSettingChange("store_name_en", v)}
          />
          <SettingField
            label={t.nameAr}
            value={getSetting("store_name_ar")}
            onSave={(v) => handleSettingChange("store_name_ar", v)}
          />
          <SettingField
            label={"Tagline (EN)"}
            value={getSetting("tagline_en")}
            onSave={(v) => handleSettingChange("tagline_en", v)}
          />
          <SettingField
            label={"Tagline (AR)"}
            value={getSetting("tagline_ar")}
            onSave={(v) => handleSettingChange("tagline_ar", v)}
          />
          <SettingField
            label={t.whatsappNumber}
            value={getSetting("whatsapp_number")}
            onSave={(v) => handleSettingChange("whatsapp_number", v)}
          />
          <SettingField
            label={t.facebookUrl}
            value={getSetting("facebook_url")}
            onSave={(v) => handleSettingChange("facebook_url", v)}
          />
          <SettingField
            label={t.freeShippingThreshold}
            value={getSetting("free_shipping_threshold")}
            onSave={(v) => handleSettingChange("free_shipping_threshold", v)}
          />
          <SettingField
            label={"Announcement (EN)"}
            value={getSetting("announcement_text_en")}
            onSave={(v) => handleSettingChange("announcement_text_en", v)}
          />
          <SettingField
            label={"Announcement (AR)"}
            value={getSetting("announcement_text_ar")}
            onSave={(v) => handleSettingChange("announcement_text_ar", v)}
          />
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === "payment" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#4B1C71]">
            {t.paymentMethods}
          </h2>
          {paymentMethods?.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-2xl border border-[#E7D8F1] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-[#4B1C71]">
                    {lang === "ar" && method.displayNameAr
                      ? method.displayNameAr
                      : method.displayName}
                  </h3>
                  <p className="text-xs text-[#6F6178] capitalize">
                    {method.method?.replace(/_/g, " ")}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.isEnabled ?? true}
                    onChange={(e) =>
                      updatePayment.mutate({
                        id: method.id,
                        isEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B57EDC]" />
                </label>
              </div>
              {method.isEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#6F6178] mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      defaultValue={method.accountNumber || ""}
                      onBlur={(e) =>
                        updatePayment.mutate({
                          id: method.id,
                          isEnabled: true,
                          accountNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#E7D8F1] text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6F6178] mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      defaultValue={method.accountName || ""}
                      onBlur={(e) =>
                        updatePayment.mutate({
                          id: method.id,
                          isEnabled: true,
                          accountName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#E7D8F1] text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === "shipping" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#4B1C71]">
            {t.shippingSettings}
          </h2>
          <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E7D8F1]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                      Governorate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                      Base Fee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                      Est. Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7D8F1]">
                  {shippingSettings?.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FCF8FF]">
                      <td className="px-4 py-3 text-sm text-[#4B1C71]">
                        {lang === "ar" && s.governorateAr
                          ? s.governorateAr
                          : s.governorate}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={s.baseFee || ""}
                          onBlur={(e) =>
                            updateShipping.mutate({
                              id: s.id,
                              baseFee: e.target.value,
                              isActive: s.isActive ?? true,
                            })
                          }
                          className="w-20 px-2 py-1 rounded border border-[#E7D8F1] text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6F6178]">
                        {s.estimatedDays}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={s.isActive ?? true}
                          onChange={(e) =>
                            updateShipping.mutate({
                              id: s.id,
                              baseFee: s.baseFee || "0",
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-[#B57EDC]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === "appearance" && (
        <div className="bg-white rounded-2xl border border-[#E7D8F1] p-6 max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold text-[#4B1C71] mb-4">
            {lang === "ar" ? "إعدادات المظهر" : "Appearance Settings"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingField
              label={t.primaryColor}
              value={getSetting("primary_color")}
              onSave={(v) => handleSettingChange("primary_color", v)}
            />
            <SettingField
              label={t.secondaryColor}
              value={getSetting("secondary_color")}
              onSave={(v) => handleSettingChange("secondary_color", v)}
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div
              className="w-16 h-16 rounded-xl border border-[#E7D8F1]"
              style={{ backgroundColor: getSetting("primary_color") || "#B57EDC" }}
            />
            <div
              className="w-16 h-16 rounded-xl border border-[#E7D8F1]"
              style={{ backgroundColor: getSetting("secondary_color") || "#B57EDC" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingField({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-[#4B1C71] mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
        />
        <button
          onClick={() => onSave(localValue)}
          className="px-4 py-2.5 bg-[#B57EDC] text-[#4B1C71] rounded-xl hover:bg-[#A66DCC] transition-colors"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
