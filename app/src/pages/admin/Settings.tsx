import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useState, useEffect } from "react";
import {
  Store,
  CreditCard,
  Truck,
  Palette,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Send,
  Image,
  Check,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Settings2,
  Eye,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ─── Tabs ─────────────────────────────────────────────────────────── */
const tabs = [
  { key: "store",      labelEn: "Store Identity",  labelAr: "هوية المتجر",   icon: Store },
  { key: "contact",   labelEn: "Contact & Social", labelAr: "التواصل",       icon: Phone },
  { key: "appearance",labelEn: "Appearance",       labelAr: "المظهر",        icon: Palette },
  { key: "shipping",  labelEn: "Shipping",         labelAr: "الشحن",         icon: Truck },
  { key: "payment",   labelEn: "Payment",          labelAr: "الدفع",         icon: CreditCard },
  { key: "seo",       labelEn: "SEO",              labelAr: "تحسين البحث",   icon: Globe },
];

/* ─── Social platforms ─────────────────────────────────────────────── */
const socialPlatforms = [
  { key: "whatsapp_number",  labelEn: "WhatsApp",     labelAr: "واتساب",      icon: Phone,     placeholder: "+20 100 000 0000",          color: "#25D366" },
  { key: "phone_number",     labelEn: "Phone",        labelAr: "هاتف",        icon: Phone,     placeholder: "+20 100 000 0000",          color: "#4B1C71" },
  { key: "email_address",    labelEn: "Email",        labelAr: "البريد",      icon: Mail,      placeholder: "hello@hiline.com",          color: "#EA4335" },
  { key: "address_en",       labelEn: "Address (EN)", labelAr: "العنوان EN",  icon: MapPin,    placeholder: "Cairo, Egypt",              color: "#6F6178" },
  { key: "address_ar",       labelEn: "Address (AR)", labelAr: "العنوان AR",  icon: MapPin,    placeholder: "القاهرة، مصر",              color: "#6F6178" },
  { key: "facebook_url",     labelEn: "Facebook",     labelAr: "فيسبوك",     icon: Facebook,  placeholder: "https://facebook.com/...",   color: "#1877F2" },
  { key: "instagram_url",    labelEn: "Instagram",    labelAr: "انستجرام",   icon: Instagram, placeholder: "https://instagram.com/...",  color: "#E4405F" },
  { key: "tiktok_url",       labelEn: "TikTok",       labelAr: "تيك توك",    icon: Globe,     placeholder: "https://tiktok.com/@...",   color: "#010101" },
  { key: "youtube_url",      labelEn: "YouTube",      labelAr: "يوتيوب",     icon: Youtube,   placeholder: "https://youtube.com/...",   color: "#FF0000" },
  { key: "twitter_url",      labelEn: "X (Twitter)",  labelAr: "إكس تويتر",  icon: Twitter,   placeholder: "https://x.com/...",         color: "#1DA1F2" },
  { key: "snapchat_url",     labelEn: "Snapchat",     labelAr: "سناب شات",   icon: Globe,     placeholder: "https://snapchat.com/...",  color: "#FFFC00" },
  { key: "telegram_url",     labelEn: "Telegram",     labelAr: "تيليجرام",   icon: Send,      placeholder: "https://t.me/...",          color: "#0088CC" },
  { key: "linkedin_url",     labelEn: "LinkedIn",     labelAr: "لينكد إن",   icon: Globe,     placeholder: "https://linkedin.com/...",  color: "#0A66C2" },
  { key: "pinterest_url",    labelEn: "Pinterest",    labelAr: "بينترست",    icon: Globe,     placeholder: "https://pinterest.com/...", color: "#E60023" },
];

/* ─── Color presets ────────────────────────────────────────────────── */
const colorPresets = [
  { name: "Purple (Default)", primary: "#4B1C71", secondary: "#B57EDC", accent: "#F7ECFF", bg: "#FFFFFF" },
  { name: "Rose Gold",        primary: "#9B2335", secondary: "#E8A0B4", accent: "#FFF0F3", bg: "#FFFAFA" },
  { name: "Ocean Blue",       primary: "#0C4A6E", secondary: "#38BDF8", accent: "#E0F2FE", bg: "#F8FBFF" },
  { name: "Forest Green",     primary: "#14532D", secondary: "#4ADE80", accent: "#DCFCE7", bg: "#F8FFF9" },
  { name: "Midnight Gold",    primary: "#1C1917", secondary: "#D97706", accent: "#FEF3C7", bg: "#FFFBF0" },
  { name: "Coral",            primary: "#9A3412", secondary: "#FB923C", accent: "#FFEDD5", bg: "#FFF8F0" },
];

/* ─── Helper: single save field ────────────────────────────────────── */
function Field({
  label,
  fieldKey,
  value,
  placeholder,
  onSave,
  type = "text",
  multiline = false,
}: {
  label: string;
  fieldKey: string;
  value: string;
  placeholder?: string;
  onSave: (key: string, val: string) => Promise<any>;
  type?: string;
  multiline?: boolean;
}) {
  const [local, setLocal] = useState(value);
  const [saved, setSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => { setLocal(value); }, [value]);

  const save = async () => {
    setIsPending(true);
    try {
      await onSave(fieldKey, local);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // Error is handled by trpc onError
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{label}</label>
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 resize-none transition-colors"
          />
        ) : (
          <input
            type={type}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-colors"
          />
        )}
        <button
          onClick={save}
          disabled={isPending}
          className={`px-4 py-2.5 rounded-xl flex items-center justify-center min-w-[3rem] gap-1.5 text-sm font-medium transition-all disabled:opacity-50 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
          }`}
        >
          {isPending ? (
            <svg className="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Color picker field ────────────────────────────────────────────── */
function ColorField({
  label,
  fieldKey,
  value,
  onSave,
}: {
  label: string;
  fieldKey: string;
  value: string;
  onSave: (key: string, val: string) => Promise<any>;
}) {
  const [local, setLocal] = useState(value || "#4B1C71");
  const [saved, setSaved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => { if (value) setLocal(value); }, [value]);

  const save = async (v: string) => {
    setLocal(v);
    setIsPending(true);
    try {
      await onSave(fieldKey, v);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      // handled
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={(e) => save(e.target.value)}
            className="w-14 h-11 rounded-xl border border-[#EDE5F7] cursor-pointer p-0.5 bg-white"
          />
        </div>
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={(e) => save(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] font-mono uppercase transition-colors"
          maxLength={7}
        />
        <div
          className="w-11 h-11 rounded-xl border border-[#EDE5F7] flex-shrink-0 transition-all flex items-center justify-center"
          style={{ backgroundColor: local }}
        >
          {isPending && <svg className="w-4 h-4 animate-spin text-white/70 mix-blend-difference" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
        </div>
        {saved && !isPending && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
      </div>
    </div>
  );
}

/* ─── Logo / image field ───────────────────────────────────────────── */
function ImageField({
  label,
  fieldKey,
  value,
  description,
  onSave,
}: {
  label: string;
  fieldKey: string;
  value: string;
  description?: string;
  onSave: (key: string, val: string) => Promise<any>;
}) {
  const [preview, setPreview] = useState(value);
  const [urlInput, setUrlInput] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => { setPreview(value); setUrlInput(value); }, [value]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"].includes(file.type)) {
      toast.error("Use PNG, JPG, WEBP, GIF, or SVG");
      return;
    }
    if (file.size > 3_000_000) {
      toast.error("Image must be under 3 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreview(reader.result);
        setUrlInput(reader.result);
        onSave(fieldKey, reader.result);
        toast.success("Image uploaded ✓");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSave = async () => {
    setPreview(urlInput);
    setIsPending(true);
    try {
      await onSave(fieldKey, urlInput);
      toast.success("Saved ✓");
    } catch (err) {
      // Error handled
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#1A0533]">{label}</label>
      {description && <p className="text-xs text-[#9CA3AF]">{description}</p>}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview */}
        <div className="w-28 h-20 rounded-2xl border-2 border-dashed border-[#EDE5F7] bg-[#FAFAFA] flex items-center justify-center overflow-hidden flex-shrink-0">
          {preview ? (
            <img src={preview} alt={label} className="max-h-full max-w-full object-contain p-2" />
          ) : (
            <Image className="w-6 h-6 text-[#D8B4FE]" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          {/* File upload */}
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#F3E8FF] text-[#7C3AED] text-sm font-medium rounded-xl cursor-pointer hover:bg-[#EDE9FE] transition-colors w-fit">
            <Image className="w-4 h-4" />
            {fieldKey.includes("logo") ? "رفع لوجو" : "رفع صورة"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-xl border border-[#EDE5F7] text-xs focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
            <button
              onClick={handleUrlSave}
              disabled={isPending}
              className="px-3 py-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#6D28D9] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <svg className="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Toggle switch ─────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[#7C3AED]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ─── Section card wrapper ───────────────────────────────────────────── */
function Section({
  title,
  subtitle,
  icon: Icon,
  children,
  color = "#7C3AED",
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE5F7] overflow-hidden mb-5">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EDE5F7]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A0533] text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ─── Main Settings Page ────────────────────────────────────────────── */
export default function AdminSettings() {
  const { lang, isRTL } = useLanguage();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("store");
  const [shippingExpanded, setShippingExpanded] = useState<number | null>(null);

  const { data: settings, isError: settingsError } = trpc.store.getSettings.useQuery(
    undefined, { retry: false, throwOnError: false }
  );
  const { data: paymentMethods, isError: paymentError } = trpc.store.getPaymentMethods.useQuery(
    undefined, { retry: false, throwOnError: false }
  );
  const { data: shippingSettings, isError: shippingError } = trpc.store.getShippingGovernorates.useQuery(
    undefined, { retry: false, throwOnError: false }
  );

  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => utils.store.getSettings.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const updatePayment = trpc.admin.updatePaymentMethod.useMutation({
    onSuccess: () => utils.store.getPaymentMethods.invalidate(),
    onError: (err) => toast.error(err.message),
  });
  const updateShipping = trpc.admin.updateShippingSetting.useMutation({
    onSuccess: () => utils.store.getShippingGovernorates.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  const ar = lang === "ar";
  const g = (key: string) => settings?.[key] || "";
  const save = async (key: string, value: string) => {
    return updateSetting.mutateAsync({ key, value });
  };

  const isDbError = settingsError && paymentError && shippingError;

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-[#7C3AED]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A0533]">
            {ar ? "إعدادات المتجر" : "Store Settings"}
          </h1>
        </div>
        <p className="text-sm text-[#6F6178] ms-12">
          {ar ? "تحكم كامل في كل جوانب متجرك" : "Full control over every aspect of your store"}
        </p>
      </div>

      {/* DB Error banner */}
      {isDbError && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex items-center gap-3">
          <Settings2 className="w-4 h-4 flex-shrink-0" />
          {ar ? "تعذّر الاتصال بقاعدة البيانات — التعديلات لن تُحفظ حتى يتم الاتصال." : "Cannot connect to database — changes won't be saved until connected."}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/20"
                : "bg-white border border-[#EDE5F7] text-[#6F6178] hover:border-[#7C3AED] hover:text-[#7C3AED]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {ar ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* ══ STORE IDENTITY TAB ═════════════════════════════════════════ */}
      {activeTab === "store" && (
        <div className="max-w-3xl space-y-0">
          <Section title={ar ? "اسم المتجر والعلامة التجارية" : "Store Name & Branding"} icon={Store} color="#7C3AED">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={ar ? "اسم المتجر (EN)" : "Store Name (EN)"} fieldKey="store_name_en" value={g("store_name_en")} placeholder="Hi Line Pro Care" onSave={save} />
              <Field label={ar ? "اسم المتجر (AR)" : "Store Name (AR)"} fieldKey="store_name_ar" value={g("store_name_ar")} placeholder="هاي لاين برو كير" onSave={save} />
              <Field label={ar ? "الشعار (EN)" : "Tagline (EN)"} fieldKey="tagline_en" value={g("tagline_en")} placeholder="Fresh. Clean. Confident." onSave={save} />
              <Field label={ar ? "الشعار (AR)" : "Tagline (AR)"} fieldKey="tagline_ar" value={g("tagline_ar")} placeholder="منتعش. نظيف. واثق." onSave={save} />
            </div>
          </Section>

          <Section title={ar ? "الإعلان الترويجي" : "Announcement Bar"} subtitle={ar ? "يظهر في أعلى الموقع" : "Shown at the top of the site"} icon={Megaphone} color="#D97706">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={ar ? "نص الإعلان (EN)" : "Announcement (EN)"} fieldKey="announcement_text_en" value={g("announcement_text_en")} placeholder="FREE shipping on orders over 500 EGP!" onSave={save} />
              <Field label={ar ? "نص الإعلان (AR)" : "Announcement (AR)"} fieldKey="announcement_text_ar" value={g("announcement_text_ar")} placeholder="شحن مجاني للطلبات فوق 500 جنيه!" onSave={save} />
            </div>
          </Section>

          <Section title={ar ? "إعدادات المتجر" : "Store Configuration"} icon={Globe} color="#0EA5E9">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "العملة" : "Currency"}</label>
                <select
                  defaultValue={g("currency") || "EGP"}
                  onChange={(e) => save("currency", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] bg-white"
                >
                  <option value="EGP">EGP — جنيه مصري</option>
                  <option value="SAR">SAR — ريال سعودي</option>
                  <option value="AED">AED — درهم إماراتي</option>
                  <option value="USD">USD — دولار أمريكي</option>
                  <option value="LBP">LBP — ليرة لبنانية</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "اللغة الافتراضية" : "Default Language"}</label>
                <select
                  defaultValue={g("default_language") || "ar"}
                  onChange={(e) => save("default_language", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] bg-white"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ══ CONTACT & SOCIAL TAB ═══════════════════════════════════════ */}
      {activeTab === "contact" && (
        <div className="max-w-3xl">
          <Section title={ar ? "بيانات التواصل والشبكات الاجتماعية" : "Contact Info & Social Media"} subtitle={ar ? "كل منصات التواصل في مكان واحد" : "All platforms in one place"} icon={Phone} color="#059669">
            <div className="space-y-4">
              {socialPlatforms.map((platform) => {
                const IconComp = platform.icon;
                return (
                  <div key={platform.key} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${platform.color}18` }}
                    >
                      <IconComp className="w-4 h-4" style={{ color: platform.color }} />
                    </div>
                    <div className="flex-1">
                      <Field
                        label={ar ? platform.labelAr : platform.labelEn}
                        fieldKey={platform.key}
                        value={g(platform.key)}
                        placeholder={platform.placeholder}
                        onSave={save}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      )}

      {/* ══ APPEARANCE TAB ══════════════════════════════════════════════ */}
      {activeTab === "appearance" && (
        <div className="max-w-3xl space-y-0">
          {/* Logo & Images */}
          <Section title={ar ? "الصور والهوية البصرية" : "Images & Visual Identity"} icon={Image} color="#7C3AED">
            <div className="space-y-6">
              <ImageField
                label={ar ? "🖼 اللوجو" : "🖼 Logo"}
                fieldKey="logo_url"
                value={g("logo_url") || "/brand/logo.jpg"}
                description={ar ? "يظهر في الهيدر والمتجر — PNG شفاف يُفضّل" : "Shown in header and store — transparent PNG preferred"}
                onSave={save}
              />
              <div className="border-t border-[#EDE5F7] pt-6">
                <ImageField
                  label={ar ? "🎨 خلفية الهيرو (Hero Section)" : "🎨 Hero Background"}
                  fieldKey="hero_bg_url"
                  value={g("hero_bg_url")}
                  description={ar ? "الصورة الكبيرة في الصفحة الرئيسية — يُفضّل 1920×1080" : "Large image on homepage — 1920×1080 preferred"}
                  onSave={save}
                />
              </div>
              <div className="border-t border-[#EDE5F7] pt-6">
                <ImageField
                  label={ar ? "🌐 الفافيكون (أيقونة المتصفح)" : "🌐 Favicon (Browser Icon)"}
                  fieldKey="favicon_url"
                  value={g("favicon_url")}
                  description={ar ? "32×32 أو 64×64 — ICO أو PNG" : "32×32 or 64×64 — ICO or PNG"}
                  onSave={save}
                />
              </div>
            </div>
          </Section>

          {/* Color presets */}
          <Section title={ar ? "ثيمات الألوان الجاهزة" : "Color Theme Presets"} subtitle={ar ? "اختر ثيم كامل بضغطة واحدة" : "Apply a full color theme instantly"} icon={Palette} color="#EC4899">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    save("primary_color", preset.primary);
                    save("secondary_color", preset.secondary);
                    save("accent_color", preset.accent);
                    save("background_color", preset.bg);
                    toast.success(`Theme "${preset.name}" applied!`);
                  }}
                  className="group p-3 rounded-2xl border-2 border-[#EDE5F7] hover:border-[#7C3AED] transition-all text-left"
                >
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-6 h-6 rounded-lg" style={{ background: preset.primary }} />
                    <div className="w-6 h-6 rounded-lg" style={{ background: preset.secondary }} />
                    <div className="w-6 h-6 rounded-lg border" style={{ background: preset.accent }} />
                  </div>
                  <p className="text-xs font-medium text-[#1A0533]">{preset.name}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Custom colors */}
          <Section title={ar ? "ألوان مخصصة" : "Custom Colors"} subtitle={ar ? "أو اختر ألوانك الخاصة يدوياً" : "Or pick your own colors manually"} icon={Palette} color="#7C3AED">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorField label={ar ? "اللون الأساسي" : "Primary Color"} fieldKey="primary_color" value={g("primary_color") || "#4B1C71"} onSave={save} />
              <ColorField label={ar ? "اللون الثانوي" : "Secondary Color"} fieldKey="secondary_color" value={g("secondary_color") || "#B57EDC"} onSave={save} />
              <ColorField label={ar ? "لون التمييز (Accent)" : "Accent Color"} fieldKey="accent_color" value={g("accent_color") || "#F7ECFF"} onSave={save} />
              <ColorField label={ar ? "لون الخلفية" : "Background Color"} fieldKey="background_color" value={g("background_color") || "#FFFFFF"} onSave={save} />
            </div>

            {/* Live preview */}
            <div className="mt-6 pt-5 border-t border-[#EDE5F7]">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-[#9CA3AF]" />
                <p className="text-xs text-[#9CA3AF]">{ar ? "معاينة مباشرة" : "Live preview"}</p>
              </div>
              <div
                className="rounded-2xl p-5 border"
                style={{ background: g("background_color") || "#FFFFFF", borderColor: g("accent_color") || "#EDE5F7" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl" style={{ background: g("primary_color") || "#4B1C71" }} />
                  <div>
                    <div className="h-3 w-32 rounded-full mb-1" style={{ background: g("primary_color") || "#4B1C71" }} />
                    <div className="h-2 w-20 rounded-full" style={{ background: g("secondary_color") || "#B57EDC", opacity: 0.5 }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 rounded-lg text-xs font-medium text-white" style={{ background: g("primary_color") || "#4B1C71" }}>
                    {ar ? "إضافة للسلة" : "Add to Cart"}
                  </div>
                  <div className="px-4 py-2 rounded-lg text-xs font-medium border-2" style={{ borderColor: g("secondary_color") || "#B57EDC", color: g("primary_color") || "#4B1C71", background: g("accent_color") || "#F7ECFF" }}>
                    {ar ? "تسوق الآن" : "Shop Now"}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ══ SHIPPING TAB ════════════════════════════════════════════════ */}
      {activeTab === "shipping" && (
        <div className="max-w-3xl space-y-0">
          <Section title={ar ? "الشحن المجاني" : "Free Shipping Threshold"} icon={Truck} color="#059669">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label={ar ? "حد الشحن المجاني (بالعملة)" : "Free Shipping Threshold"}
                fieldKey="free_shipping_threshold"
                value={g("free_shipping_threshold")}
                placeholder="500"
                onSave={save}
              />
              <Field
                label={ar ? "رسوم الشحن الافتراضية" : "Default Shipping Fee"}
                fieldKey="default_shipping_fee"
                value={g("default_shipping_fee")}
                placeholder="60"
                onSave={save}
              />
            </div>
            <p className="text-xs text-[#9CA3AF] mt-3">
              {ar ? "مثال: أكتب 500 للشحن المجاني على الطلبات فوق 500 جنيه" : "Example: Enter 500 to offer free shipping on orders above 500 EGP"}
            </p>
          </Section>

          <Section title={ar ? "عروض الشحن بالمحافظة" : "Shipping Rates by Governorate"} subtitle={ar ? "ضبط سعر الشحن وأيام التوصيل لكل محافظة" : "Set shipping fee and delivery days per governorate"} icon={MapPin} color="#0EA5E9">
            {shippingError ? (
              <div className="text-center py-8">
                <Truck className="w-10 h-10 text-[#EDE5F7] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">{ar ? "تعذّر تحميل بيانات الشحن" : "Could not load shipping data"}</p>
              </div>
            ) : !shippingSettings || shippingSettings.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-10 h-10 text-[#D8B4FE] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">{ar ? "لا توجد محافظات مضافة بعد" : "No governorates added yet"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shippingSettings.map((s) => {
                  const isOpen = shippingExpanded === s.id;
                  return (
                    <div key={s.id} className="rounded-2xl border border-[#EDE5F7] overflow-hidden">
                      {/* Row header */}
                      <button
                        onClick={() => setShippingExpanded(isOpen ? null : s.id)}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#FAFAFA] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${s.isActive ? "bg-green-400" : "bg-gray-300"}`} />
                          <span className="text-sm font-medium text-[#1A0533]">
                            {ar && s.governorateAr ? s.governorateAr : s.governorate}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#7C3AED] font-bold bg-[#F3E8FF] px-2 py-0.5 rounded-lg">
                            {s.baseFee || "0"} {g("currency") || "EGP"}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">{s.estimatedDays}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
                        </div>
                      </button>

                      {/* Expanded edit */}
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-[#EDE5F7] pt-4 bg-[#FAFAFA]">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "سعر الشحن" : "Shipping Fee"}</label>
                              <input
                                type="number"
                                defaultValue={s.baseFee || "0"}
                                onBlur={(e) => updateShipping.mutate({ id: s.id, baseFee: e.target.value, isActive: s.isActive ?? true })}
                                className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "أيام التوصيل" : "Est. Days"}</label>
                              <input
                                type="text"
                                defaultValue={s.estimatedDays || ""}
                                onBlur={(e) => updateShipping.mutate({ id: s.id, baseFee: s.baseFee || "0", isActive: s.isActive ?? true, estimatedDays: e.target.value })}
                                placeholder="2-3"
                                className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED]"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "مفعّل" : "Active"}</label>
                              <Toggle
                                checked={s.isActive ?? true}
                                onChange={(val) => updateShipping.mutate({ id: s.id, baseFee: s.baseFee || "0", isActive: val })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ══ PAYMENT TAB ══════════════════════════════════════════════════ */}
      {activeTab === "payment" && (
        <div className="max-w-3xl">
          <Section title={ar ? "طرق الدفع" : "Payment Methods"} subtitle={ar ? "فعّل أو عطّل طرق الدفع وأضف بيانات الحسابات" : "Enable/disable payment methods and add account details"} icon={CreditCard} color="#059669">
            {paymentError ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-[#EDE5F7] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">{ar ? "تعذّر تحميل طرق الدفع" : "Could not load payment methods"}</p>
              </div>
            ) : !paymentMethods || paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-[#D8B4FE] mx-auto mb-2" />
                <p className="text-sm text-[#9CA3AF]">{ar ? "لا توجد طرق دفع مضافة" : "No payment methods added"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="rounded-2xl border border-[#EDE5F7] overflow-hidden">
                    {/* Method header */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-[#7C3AED]" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1A0533]">
                            {ar && method.displayNameAr ? method.displayNameAr : method.displayName}
                          </p>
                          <p className="text-xs text-[#9CA3AF] capitalize">{method.method?.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={method.isEnabled ?? true}
                        onChange={(val) => updatePayment.mutate({ id: method.id, isEnabled: val })}
                      />
                    </div>

                    {/* Account details when enabled */}
                    {method.isEnabled && (
                      <div className="px-5 pb-5 border-t border-[#EDE5F7] pt-4 bg-[#FAFAFA]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "رقم الحساب / المحفظة" : "Account Number"}</label>
                            <input
                              type="text"
                              defaultValue={method.accountNumber || ""}
                              onBlur={(e) => updatePayment.mutate({ id: method.id, isEnabled: true, accountNumber: e.target.value })}
                              placeholder="01X XXXX XXXX"
                              className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "اسم صاحب الحساب" : "Account Name"}</label>
                            <input
                              type="text"
                              defaultValue={method.accountName || ""}
                              onBlur={(e) => updatePayment.mutate({ id: method.id, isEnabled: true, accountName: e.target.value })}
                              placeholder={ar ? "الاسم الكامل" : "Full Name"}
                              className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED]"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "تعليمات للعميل (EN)" : "Instructions for Customer (EN)"}</label>
                            <textarea
                              defaultValue={method.instructions || ""}
                              onBlur={(e) => updatePayment.mutate({ id: method.id, isEnabled: true, instructions: e.target.value })}
                              rows={2}
                              placeholder="Transfer amount to the account above..."
                              className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] resize-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-[#6F6178] mb-1">{ar ? "تعليمات للعميل (AR)" : "Instructions for Customer (AR)"}</label>
                            <textarea
                              defaultValue={method.instructionsAr || ""}
                              onBlur={(e) => updatePayment.mutate({ id: method.id, isEnabled: true, instructionsAr: e.target.value })}
                              rows={2}
                              placeholder="حوّل المبلغ على الحساب أعلاه..."
                              className="w-full px-3 py-2 rounded-xl border border-[#EDE5F7] text-sm focus:outline-none focus:border-[#7C3AED] resize-none"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {/* ══ SEO TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "seo" && (
        <div className="max-w-3xl">
          <Section title={ar ? "تحسين محركات البحث (SEO)" : "Search Engine Optimization"} subtitle={ar ? "يساعد موقعك على الظهور في Google" : "Helps your site rank on Google"} icon={Globe} color="#0EA5E9">
            <div className="space-y-4">
              <Field label="Meta Title (EN)" fieldKey="meta_title_en" value={g("meta_title_en")} placeholder="Hi Line Pro Care – Roll-On Deodorant Egypt" onSave={save} />
              <Field label="Meta Description (EN)" fieldKey="meta_description_en" value={g("meta_description_en")} placeholder="48h protection, 0% aluminum Lebanese formula..." onSave={save} multiline />
              <div className="border-t border-[#EDE5F7] pt-4">
                <Field label="Meta Title (AR)" fieldKey="meta_title_ar" value={g("meta_title_ar")} placeholder="هاي لاين برو كير — ديودورانت رول أون مصر" onSave={save} />
              </div>
              <Field label="Meta Description (AR)" fieldKey="meta_description_ar" value={g("meta_description_ar")} placeholder="حماية 48 ساعة، 0% ألمنيوم..." onSave={save} multiline />
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD]">
              <p className="text-xs text-[#0369A1] font-medium mb-1">💡 نصيحة SEO</p>
              <p className="text-xs text-[#0369A1]">
                {ar
                  ? "العنوان المثالي بين 50-60 حرف. الوصف بين 150-160 حرف. اذكر الكلمات المفتاحية مثل: ديودورانت، رول أون، مصر."
                  : "Ideal title is 50-60 chars. Description 150-160 chars. Include keywords like: deodorant, roll-on, Egypt."}
              </p>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
