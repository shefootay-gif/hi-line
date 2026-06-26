import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { Activity, Loader2 } from "lucide-react";

type ActivityLog = {
  id: number;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: Record<string, unknown> | null;
  createdAt: Date | string;
};

function formatDetails(details: Record<string, unknown> | null | undefined) {
  if (!details || Object.keys(details).length === 0) return "-";
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ");
}

export default function ActivityLogs() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const { data = [], isLoading } = trpc.admin.listAdminActivityLogs.useQuery({ limit: 100 }, { retry: false });
  const rows = data as ActivityLog[];

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF]">
          <Activity className="h-5 w-5 text-[#7C3AED]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "سجل نشاط الأدمن" : "Admin Activity Log"}</h1>
          <p className="text-sm text-[#6F6178]">{ar ? "متابعة التعديلات المهمة داخل لوحة التحكم" : "Track important changes made inside the admin panel"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EDE5F7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-[#FAFAFA] text-xs text-[#9CA3AF]">
                <th className="px-4 py-3 text-start">{ar ? "العملية" : "Action"}</th>
                <th className="px-4 py-3 text-start">{ar ? "النوع" : "Entity"}</th>
                <th className="px-4 py-3 text-start">ID</th>
                <th className="px-4 py-3 text-start">{ar ? "التفاصيل" : "Details"}</th>
                <th className="px-4 py-3 text-start">{ar ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td colSpan={5} className="p-8 text-center text-[#6F6178]"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />{ar ? "جاري التحميل..." : "Loading..."}</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-semibold text-[#1A0533]">{row.action}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.entityType}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.entityId ?? "-"}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{formatDetails(row.details)}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[#6F6178]">{ar ? "لا توجد عمليات بعد" : "No activity yet"}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
