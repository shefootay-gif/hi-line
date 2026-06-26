import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart2,
  DollarSign,
  Eye,
  Facebook,
  Instagram,
  Loader2,
  MousePointer,
  Pause,
  Pencil,
  Play,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

type Platform = "facebook" | "instagram" | "tiktok" | "google";
type CampaignStatus = "active" | "paused" | "draft";

type Campaign = {
  id: number;
  name: string;
  platform?: Platform | null;
  status?: CampaignStatus | null;
  budget?: string | null;
  spend?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  ordersCount?: number | null;
  revenue?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  linkUrl?: string | null;
  notes?: string | null;
};

const emptyCampaign = {
  id: 0,
  name: "",
  platform: "facebook" as Platform,
  status: "draft" as CampaignStatus,
  budget: "0",
  spend: "0",
  impressions: 0,
  clicks: 0,
  conversions: 0,
  ordersCount: 0,
  revenue: "0",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  linkUrl: "",
  notes: "",
};

type CampaignForm = typeof emptyCampaign;

const platformColors: Record<Platform, { color: string; bg: string }> = {
  facebook: { color: "#1877F2", bg: "#EBF4FF" },
  instagram: { color: "#E4405F", bg: "#FEE8EC" },
  tiktok: { color: "#010101", bg: "#F1F1F1" },
  google: { color: "#EA4335", bg: "#FEE8E6" },
};

const statusConfig: Record<CampaignStatus, { bg: string; text: string; ar: string; en: string }> = {
  active: { bg: "#DCFCE7", text: "#15803D", ar: "نشط", en: "Active" },
  paused: { bg: "#FEF3C7", text: "#92400E", ar: "متوقف", en: "Paused" },
  draft: { bg: "#F1F5F9", text: "#475569", ar: "مسودة", en: "Draft" },
};

function numberValue(value: string | number | null | undefined) {
  return Number(value ?? 0) || 0;
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "facebook") return <Facebook className="h-4 w-4" style={{ color: "#1877F2" }} />;
  if (platform === "instagram") return <Instagram className="h-4 w-4" style={{ color: "#E4405F" }} />;
  return <BarChart2 className="h-4 w-4 text-[#6F6178]" />;
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#EDE5F7] bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-[#1A0533]">{value}</p>
      <p className="mt-1 text-xs text-[#6F6178]">{label}</p>
      {sub && <p className="mt-2 text-[10px] text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

export default function MediaBuyer() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused" | "draft">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CampaignForm>(emptyCampaign);

  const { data: campaigns = [], isLoading } = trpc.admin.listMediaCampaigns.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });

  const createCampaign = trpc.admin.createMediaCampaign.useMutation({
    onSuccess: () => {
      utils.admin.listMediaCampaigns.invalidate();
      setShowModal(false);
      setEditing(emptyCampaign);
      toast.success(ar ? "تمت إضافة الحملة" : "Campaign created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCampaign = trpc.admin.updateMediaCampaign.useMutation({
    onSuccess: () => {
      utils.admin.listMediaCampaigns.invalidate();
      setShowModal(false);
      setEditing(emptyCampaign);
      toast.success(ar ? "تم تعديل الحملة" : "Campaign updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = trpc.admin.updateMediaCampaignStatus.useMutation({
    onSuccess: () => {
      utils.admin.listMediaCampaigns.invalidate();
      toast.success(ar ? "تم تغيير الحالة" : "Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCampaign = trpc.admin.deleteMediaCampaign.useMutation({
    onSuccess: () => {
      utils.admin.listMediaCampaigns.invalidate();
      toast.success(ar ? "تم حذف الحملة" : "Campaign deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const rows = campaigns as Campaign[];
  const totalSpend = rows.reduce((sum, campaign) => sum + numberValue(campaign.spend), 0);
  const totalImpressions = rows.reduce((sum, campaign) => sum + numberValue(campaign.impressions), 0);
  const totalClicks = rows.reduce((sum, campaign) => sum + numberValue(campaign.clicks), 0);
  const totalConversions = rows.reduce((sum, campaign) => sum + numberValue(campaign.conversions), 0);
  const totalRevenue = rows.reduce((sum, campaign) => sum + numberValue(campaign.revenue), 0);
  const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const filtered = rows.filter((campaign) => (activeTab === "all" ? true : campaign.status === activeTab));

  const openCreate = () => {
    setEditing(emptyCampaign);
    setShowModal(true);
  };

  const openEdit = (campaign: Campaign) => {
    setEditing({
      ...emptyCampaign,
      id: campaign.id,
      name: campaign.name,
      platform: campaign.platform ?? "facebook",
      status: campaign.status ?? "draft",
      budget: campaign.budget ?? "0",
      spend: campaign.spend ?? "0",
      impressions: campaign.impressions ?? 0,
      clicks: campaign.clicks ?? 0,
      conversions: campaign.conversions ?? 0,
      ordersCount: campaign.ordersCount ?? 0,
      revenue: campaign.revenue ?? "0",
      utmSource: campaign.utmSource ?? "",
      utmMedium: campaign.utmMedium ?? "",
      utmCampaign: campaign.utmCampaign ?? "",
      linkUrl: campaign.linkUrl ?? "",
      notes: campaign.notes ?? "",
    });
    setShowModal(true);
  };

  const saveCampaign = () => {
    if (!editing.name.trim()) {
      toast.error(ar ? "اكتب اسم الحملة" : "Campaign name is required");
      return;
    }
    if (editing.clicks > editing.impressions || editing.conversions > editing.clicks || editing.ordersCount > editing.conversions) {
      toast.error(ar ? "تأكد من منطق الأرقام: النقرات ≤ الظهور، التحويلات ≤ النقرات، الطلبات ≤ التحويلات" : "Check metrics: clicks ≤ impressions, conversions ≤ clicks, orders ≤ conversions");
      return;
    }
    if (numberValue(editing.budget) > 0 && numberValue(editing.spend) > numberValue(editing.budget)) {
      toast.error(ar ? "الإنفاق لا يجب أن يتجاوز الميزانية" : "Spend cannot exceed budget");
      return;
    }

    const payload = {
      name: editing.name.trim(),
      platform: editing.platform,
      status: editing.status,
      budget: editing.budget.trim() || "0",
      spend: editing.spend.trim() || "0",
      impressions: Number(editing.impressions) || 0,
      clicks: Number(editing.clicks) || 0,
      conversions: Number(editing.conversions) || 0,
      ordersCount: Number(editing.ordersCount) || 0,
      revenue: editing.revenue.trim() || "0",
      utmSource: editing.utmSource.trim(),
      utmMedium: editing.utmMedium.trim(),
      utmCampaign: editing.utmCampaign.trim(),
      linkUrl: editing.linkUrl.trim(),
      notes: editing.notes.trim(),
    };

    if (editing.id) updateCampaign.mutate({ id: editing.id, ...payload });
    else createCampaign.mutate(payload);
  };

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <Zap className="h-4 w-4 text-[#D97706]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "ميديا باير" : "Media Buyer"}</h1>
          </div>
          <p className="text-sm text-[#6F6178] ms-10">{ar ? "إدارة ومتابعة الحملات الإعلانية" : "Manage and track ad campaigns"}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6D28D9]"
        >
          <Plus className="h-4 w-4" />
          {ar ? "حملة جديدة" : "New Campaign"}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard icon={DollarSign} label={ar ? "إجمالي الإنفاق" : "Total Spend"} value={`${totalSpend.toLocaleString()} ${ar ? "ج" : "EGP"}`} color="#7C3AED" />
        <StatCard icon={Eye} label={ar ? "الظهورات" : "Impressions"} value={totalImpressions.toLocaleString()} color="#0EA5E9" />
        <StatCard icon={MousePointer} label={ar ? "النقرات" : "Clicks"} value={totalClicks.toLocaleString()} color="#059669" sub={`CTR ${ctr.toFixed(1)}%`} />
        <StatCard icon={Target} label={ar ? "التحويلات" : "Conversions"} value={totalConversions.toLocaleString()} color="#D97706" />
        <StatCard icon={DollarSign} label={ar ? "الإيراد" : "Revenue"} value={`${totalRevenue.toLocaleString()} ${ar ? "ج" : "EGP"}`} color="#059669" />
        <StatCard icon={TrendingUp} label="ROAS" value={`${avgRoas.toFixed(1)}x`} color="#EC4899" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EDE5F7] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE5F7] p-6">
          <h2 className="font-semibold text-[#1A0533]">{ar ? "الحملات الإعلانية" : "Ad Campaigns"}</h2>
          <div className="flex gap-1 rounded-xl bg-[#F8F4FC] p-1">
            {(["all", "active", "paused", "draft"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab ? "bg-white text-[#7C3AED] shadow-sm" : "text-[#6F6178] hover:text-[#1A0533]"
                }`}
              >
                {tab === "all" ? (ar ? "الكل" : "All") : tab === "active" ? (ar ? "نشطة" : "Active") : tab === "paused" ? (ar ? "متوقفة" : "Paused") : ar ? "مسودة" : "Draft"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#EDE5F7] bg-[#FAFAFA] text-xs text-[#9CA3AF]">
                <th className="px-6 py-3 text-start font-medium">{ar ? "الحملة" : "Campaign"}</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "الميزانية" : "Budget"}</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "الإنفاق" : "Spend"}</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "الظهورات" : "Impressions"}</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "النقرات" : "Clicks"}</th>
                <th className="px-4 py-3 text-start font-medium">CTR</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "الإيراد" : "Revenue"}</th>
                <th className="px-4 py-3 text-start font-medium">ROAS</th>
                <th className="px-4 py-3 text-start font-medium">{ar ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAF8]">
              {isLoading && <tr><td colSpan={10} className="p-8 text-center text-sm text-[#6F6178]">{ar ? "جاري التحميل..." : "Loading..."}</td></tr>}
              {filtered.map((campaign) => {
                const platform = campaign.platform ?? "facebook";
                const platformColor = platformColors[platform];
                const status = statusConfig[campaign.status ?? "draft"];
                const campaignCtr = numberValue(campaign.impressions) > 0 ? (numberValue(campaign.clicks) / numberValue(campaign.impressions)) * 100 : 0;
                const spendPct = numberValue(campaign.budget) > 0 ? Math.min(100, Math.round((numberValue(campaign.spend) / numberValue(campaign.budget)) * 100)) : 0;
                const campaignRoas = numberValue(campaign.spend) > 0 ? numberValue(campaign.revenue) / numberValue(campaign.spend) : 0;
                return (
                  <tr key={campaign.id} className="transition-colors hover:bg-[#FAFAFA]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: platformColor.bg }}>
                          <PlatformIcon platform={platform} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A0533]">{campaign.name}</p>
                          <p className="text-xs capitalize text-[#9CA3AF]">{platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: status.bg, color: status.text }}>
                        {ar ? status.ar : status.en}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{numberValue(campaign.budget).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#1A0533]">{numberValue(campaign.spend).toLocaleString()}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-[#F3E8FF]">
                          <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${spendPct}%` }} />
                        </div>
                        <span className="text-[10px] text-[#9CA3AF]">{spendPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{numberValue(campaign.impressions).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{numberValue(campaign.clicks).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#1A0533]">{campaignCtr.toFixed(1)}%</td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{numberValue(campaign.revenue).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#1A0533]">{campaignRoas.toFixed(1)}x</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus.mutate({ id: campaign.id, status: campaign.status === "active" ? "paused" : "active" })}
                          className="rounded-lg p-1.5 text-[#6F6178] transition-colors hover:bg-[#F3E8FF] hover:text-[#7C3AED]"
                        >
                          {campaign.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(campaign)} className="rounded-lg p-1.5 text-[#6F6178] transition-colors hover:bg-[#F3E8FF] hover:text-[#7C3AED]">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteCampaign.mutate({ id: campaign.id })} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A0533]">{editing.id ? (ar ? "تعديل حملة" : "Edit Campaign") : ar ? "حملة جديدة" : "New Campaign"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[#1A0533]">
                {ar ? "اسم الحملة" : "Campaign name"}
                <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]" />
              </label>
              <label className="text-sm font-medium text-[#1A0533]">
                {ar ? "المنصة" : "Platform"}
                <select value={editing.platform} onChange={(event) => setEditing({ ...editing, platform: event.target.value as Platform })} className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="google">Google</option>
                </select>
              </label>
              <label className="text-sm font-medium text-[#1A0533]">
                {ar ? "الحالة" : "Status"}
                <select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as CampaignStatus })} className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]">
                  <option value="draft">{ar ? "مسودة" : "Draft"}</option>
                  <option value="active">{ar ? "نشط" : "Active"}</option>
                  <option value="paused">{ar ? "متوقف" : "Paused"}</option>
                </select>
              </label>
              {[
                ["budget", ar ? "الميزانية" : "Budget"],
                ["spend", ar ? "الإنفاق" : "Spend"],
                ["impressions", ar ? "الظهورات" : "Impressions"],
                ["clicks", ar ? "النقرات" : "Clicks"],
                ["conversions", ar ? "التحويلات" : "Conversions"],
                ["ordersCount", ar ? "الطلبات" : "Orders"],
                ["revenue", ar ? "الإيراد" : "Revenue"],
                ["utmSource", "UTM Source"],
                ["utmMedium", "UTM Medium"],
                ["utmCampaign", "UTM Campaign"],
                ["linkUrl", ar ? "رابط الحملة" : "Campaign link"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-[#1A0533]">
                  {label}
                  <input
                    value={String(editing[key as keyof CampaignForm])}
                    onChange={(event) => {
                      const numericKeys = ["impressions", "clicks", "conversions", "ordersCount"];
                      setEditing({ ...editing, [key]: numericKeys.includes(key) ? Number(event.target.value) || 0 : event.target.value });
                    }}
                    className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-[#1A0533] md:col-span-2">
                {ar ? "ملاحظات" : "Notes"}
                <textarea value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} className="mt-1 min-h-24 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-xl border px-4 py-2 text-sm">{ar ? "إلغاء" : "Cancel"}</button>
              <button onClick={saveCampaign} disabled={createCampaign.isPending || updateCampaign.isPending} className="flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {(createCampaign.isPending || updateCampaign.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                {ar ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
