import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { Download, Database } from "lucide-react";
import toast from "react-hot-toast";

type ExportType = "orders" | "customers" | "products" | "inventory" | "campaigns" | "activity" | "returns";

export default function ExportBackup() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [type, setType] = useState<ExportType>("orders");
  const [backupLabel, setBackupLabel] = useState(`backup-${new Date().toISOString().slice(0, 10)}`);
  const [lastContent, setLastContent] = useState("");
  const exportsQuery = trpc.admin.listExportJobs.useQuery(undefined, { retry: false });
  const backupsQuery = trpc.admin.listBackupJobs.useQuery(undefined, { retry: false });
  const createExport = trpc.admin.createExportJob.useMutation({ onSuccess: async (data) => { toast.success(ar ? "تم تجهيز التصدير" : "Export ready"); setLastContent(data.content); await utils.admin.listExportJobs.invalidate(); }, onError: (e) => toast.error(e.message) });
  const createBackup = trpc.admin.createBackupJob.useMutation({ onSuccess: async () => { toast.success(ar ? "تم إنشاء نسخة احتياطية" : "Backup created"); await utils.admin.listBackupJobs.invalidate(); }, onError: (e) => toast.error(e.message) });
  const downloadText = (content: string, name: string) => { const blob = new Blob([content], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); };
  return <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mb-8 flex items-center gap-3"><Database className="h-8 w-8 text-[#7C3AED]" /><div><h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "التصدير والنسخ الاحتياطي" : "Export & Backup"}</h1><p className="text-sm text-[#6F6178]">{ar ? "تصدير CSV ونسخ بيانات أساسية" : "CSV exports and basic data backups"}</p></div></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-5 space-y-3"><h2 className="font-bold">{ar ? "تصدير CSV" : "CSV Export"}</h2><select className="w-full rounded-xl border px-3 py-2" value={type} onChange={(e)=>setType(e.target.value as ExportType)}><option value="orders">Orders</option><option value="customers">Customers</option><option value="products">Products</option><option value="inventory">Inventory</option><option value="campaigns">Campaigns</option><option value="activity">Activity</option><option value="returns">Returns</option></select><button onClick={()=>createExport.mutate({type})} className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "تجهيز التصدير" : "Create export"}</button>{lastContent && <button onClick={()=>downloadText(lastContent, `${type}.csv`)} className="mx-2 inline-flex items-center gap-2 rounded-xl border px-4 py-2"><Download className="h-4 w-4" />Download</button>}</div>
      <div className="rounded-2xl border bg-white p-5 space-y-3"><h2 className="font-bold">{ar ? "نسخة احتياطية" : "Backup"}</h2><input className="w-full rounded-xl border px-3 py-2" value={backupLabel} onChange={(e)=>setBackupLabel(e.target.value)} /><button onClick={()=>createBackup.mutate({label: backupLabel})} className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "إنشاء نسخة" : "Create backup"}</button></div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><SimpleList title={ar ? "عمليات التصدير" : "Export jobs"} rows={exportsQuery.data ?? []} /><SimpleList title={ar ? "النسخ الاحتياطية" : "Backups"} rows={backupsQuery.data ?? []} /></div>
  </div>;
}
function SimpleList({ title, rows }: { title: string; rows: unknown[] }) { const normalized = rows as Record<string, unknown>[]; return <div className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-bold">{title}</h2><div className="space-y-2">{normalized.map((r,i)=><div key={i} className="rounded-xl bg-[#F8F4FC] p-3 text-sm">{Object.entries(r).slice(0,5).map(([k,v])=><span key={k} className="me-3"><b>{k}</b>: {String(v).slice(0,50)}</span>)}</div>)}</div></div> }
