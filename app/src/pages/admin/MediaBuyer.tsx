import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Zap,
  Plus,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  BarChart2,
  Facebook,
  Instagram,
  Play,
  Pause,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  platform: "facebook" | "instagram" | "tiktok" | "google";
  status: "active" | "paused" | "draft";
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
};

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Hi Line Summer - Tropical Breeze",
    platform: "facebook",
    status: "active",
    budget: 5000,
    spend: 3200,
    impressions: 145000,
    clicks: 4350,
    conversions: 87,
    ctr: 3.0,
    cpc: 0.74,
    roas: 4.2,
  },
  {
    id: 2,
    name: "Roll-On Campaign - Instagram Stories",
    platform: "instagram",
    status: "active",
    budget: 3000,
    spend: 1800,
    impressions: 89000,
    clicks: 2670,
    conversions: 54,
    ctr: 3.0,
    cpc: 0.67,
    roas: 3.8,
  },
  {
    id: 3,
    name: "New Scents Launch - Retargeting",
    platform: "facebook",
    status: "paused",
    budget: 2000,
    spend: 980,
    impressions: 42000,
    clicks: 1260,
    conversions: 28,
    ctr: 3.0,
    cpc: 0.78,
    roas: 3.2,
  },
];

const platformColors: Record<string, { color: string; bg: string }> = {
  facebook:  { color: "#1877F2", bg: "#EBF4FF" },
  instagram: { color: "#E4405F", bg: "#FEE8EC" },
  tiktok:    { color: "#010101", bg: "#F1F1F1" },
  google:    { color: "#EA4335", bg: "#FEE8E6" },
};

const statusConfig: Record<string, { bg: string; text: string; label_ar: string; label_en: string }> = {
  active: { bg: "#DCFCE7", text: "#15803D", label_ar: "نشط",    label_en: "Active" },
  paused: { bg: "#FEF3C7", text: "#92400E", label_ar: "موقف",   label_en: "Paused" },
  draft:  { bg: "#F1F5F9", text: "#475569", label_ar: "مسودة",  label_en: "Draft" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE5F7] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1A0533]">{value}</p>
      <p className="text-xs text-[#6F6178] mt-1">{label}</p>
      {sub && <p className="text-[10px] text-[#9CA3AF] mt-2">{sub}</p>}
    </div>
  );
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "facebook") return <Facebook className="w-4 h-4" style={{ color: "#1877F2" }} />;
  if (platform === "instagram") return <Instagram className="w-4 h-4" style={{ color: "#E4405F" }} />;
  return <BarChart2 className="w-4 h-4 text-[#6F6178]" />;
};

export default function MediaBuyer() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const [campaigns] = useState<Campaign[]>(mockCampaigns);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "paused">("all");

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgRoas = campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length;

  const filtered = campaigns.filter((c) =>
    activeTab === "all" ? true : c.status === activeTab
  );

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#D97706]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A0533]">
              {ar ? "ميديا باير" : "Media Buyer"}
            </h1>
          </div>
          <p className="text-sm text-[#6F6178] ms-10">
            {ar ? "إدارة ومتابعة حملاتك الإعلانية" : "Manage and track your ad campaigns"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#7C3AED] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          {ar ? "حملة جديدة" : "New Campaign"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={DollarSign} label={ar ? "إجمالي الإنفاق" : "Total Spend"} value={`${totalSpend.toLocaleString()} ${ar ? "ج" : "EGP"}`} color="#7C3AED" />
        <StatCard icon={Eye} label={ar ? "الظهورات" : "Impressions"} value={totalImpressions.toLocaleString()} color="#0EA5E9" sub={ar ? "إجمالي مشاهدات الإعلان" : "Total ad views"} />
        <StatCard icon={MousePointer} label={ar ? "النقرات" : "Clicks"} value={totalClicks.toLocaleString()} color="#059669" sub={`CTR ${((totalClicks / totalImpressions) * 100).toFixed(1)}%`} />
        <StatCard icon={Target} label={ar ? "التحويلات" : "Conversions"} value={totalConversions.toLocaleString()} color="#D97706" sub={ar ? "عمليات شراء مؤكدة" : "Confirmed purchases"} />
        <StatCard icon={TrendingUp} label="ROAS" value={`${avgRoas.toFixed(1)}x`} color="#EC4899" sub={ar ? "متوسط العائد" : "Avg. return on ad spend"} />
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5F7] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#EDE5F7]">
          <h2 className="font-semibold text-[#1A0533]">
            {ar ? "الحملات الإعلانية" : "Ad Campaigns"}
          </h2>
          <div className="flex gap-1 bg-[#F8F4FC] rounded-xl p-1">
            {(["all", "active", "paused"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-white text-[#7C3AED] shadow-sm"
                    : "text-[#6F6178] hover:text-[#1A0533]"
                }`}
              >
                {tab === "all" ? (ar ? "الكل" : "All") : tab === "active" ? (ar ? "نشطة" : "Active") : (ar ? "موقفة" : "Paused")}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[#9CA3AF] border-b border-[#EDE5F7] bg-[#FAFAFA]">
                <th className="px-6 py-3 font-medium">{ar ? "الحملة" : "Campaign"}</th>
                <th className="px-4 py-3 font-medium">{ar ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{ar ? "الإنفاق" : "Spend"}</th>
                <th className="px-4 py-3 font-medium">{ar ? "الظهورات" : "Impressions"}</th>
                <th className="px-4 py-3 font-medium">{ar ? "النقرات" : "Clicks"}</th>
                <th className="px-4 py-3 font-medium">CTR</th>
                <th className="px-4 py-3 font-medium">ROAS</th>
                <th className="px-4 py-3 font-medium">{ar ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAF8]">
              {filtered.map((c) => {
                const plat = platformColors[c.platform];
                const stat = statusConfig[c.status];
                const spendPct = Math.round((c.spend / c.budget) * 100);
                return (
                  <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: plat.bg }}>
                          <PlatformIcon platform={c.platform} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A0533]">{c.name}</p>
                          <p className="text-xs text-[#9CA3AF] capitalize">{c.platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: stat.bg, color: stat.text }}>
                        {ar ? stat.label_ar : stat.label_en}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[#1A0533]">{c.spend.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="h-1 w-16 bg-[#F3E8FF] rounded-full overflow-hidden">
                            <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${spendPct}%` }} />
                          </div>
                          <span className="text-[10px] text-[#9CA3AF]">{spendPct}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{c.impressions.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-[#1A0533]">{c.clicks.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#1A0533]">{c.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-bold ${ c.roas >= 4 ? "text-green-600" : c.roas >= 3 ? "text-amber-600" : "text-red-500" }`}>
                        {c.roas.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6F6178] hover:text-[#7C3AED] transition-colors">
                          {c.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6F6178] hover:text-[#7C3AED] transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#6F6178] hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#F3E8FF] text-[#6F6178] hover:text-[#7C3AED] transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
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
    </div>
  );
}
