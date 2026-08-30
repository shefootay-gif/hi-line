import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import toast from "react-hot-toast";

type ExportType = "orders" | "customers" | "products" | "inventory" | "campaigns" | "activity" | "returns";
const exportNames: Record<ExportType,string> = {orders:"الطلبات",customers:"العملاء",products:"المنتجات",inventory:"المخزون",campaigns:"الحملات",activity:"النشاط",returns:"المرتجعات"};
function download(content: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([content],{type:"application/octet-stream"}));
  const a = document.createElement("a"); a.href=url; a.download=fileName; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function ExportBackup() {
  const {lang}=useLanguage(); const ar=lang==="ar"; const utils=trpc.useUtils();
  const [type,setType]=useState<ExportType>("orders"); const [passphrase,setPassphrase]=useState("");
  const [label,setLabel]=useState("backup-"+new Date().toISOString().slice(0,10));
  const [lastExport,setLastExport]=useState<{fileName:string;content:string}|null>(null);
  const [downloading,setDownloading]=useState(false);
  const backups=trpc.admin.listBackupJobs.useQuery();
  const exports=trpc.admin.listExportJobs.useQuery();
  const onError=(e:{message:string})=>toast.error(e.message);
  const createExport=trpc.admin.createExportJob.useMutation({onError,onSuccess:async data=>{setLastExport(data);download('\uFEFF'+data.content,data.fileName);await exports.refetch();}});
  const createBackup=trpc.admin.createBackupJob.useMutation({onError,onSuccess:async data=>{download(data.content,data.fileName);setPassphrase("");await backups.refetch();toast.success(ar?"تم إنشاء وتنزيل النسخة المشفرة":"Encrypted backup created and downloaded");}});
  const inputClass="w-full rounded-xl border px-3 py-2";
  return <div className="space-y-6 p-6 lg:p-8">
    <h1 className="text-2xl font-bold">{ar?"التصدير والنسخ الاحتياطي":"Export and backup"}</h1>
    <p className="rounded-xl border border-amber-300 bg-amber-50 p-4">{ar?"احتفظ بالنسخة المنزلة خارج الاستضافة وبكلمة تشفيرها في مكان منفصل. تشمل جداول قاعدة البيانات والملفات العامة المحلية؛ لا تشمل أسرار السيرفر أو الملفات الموجودة على خدمات خارجية. الاستعادة بأداة آمنة إلى قاعدة جديدة فارغة فقط، وليست زرًا يمسح الإنتاج.":"Keep the downloaded archive off-host and its password separately. Includes database tables and local public assets, not server secrets or externally hosted files. Recovery uses the safe offline tool into a new empty database, never an overwrite of production."}</p>
    {(backups.error||exports.error)&&<p role="alert">{backups.error?.message||exports.error?.message}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3 rounded-xl bg-white p-5"><h2>{ar?"تصدير CSV":"CSV export"}</h2><label>{ar?"نوع البيانات":"Data type"}<select className={inputClass} value={type} onChange={e=>setType(e.target.value as ExportType)}>{(Object.keys(exportNames) as ExportType[]).map(key=><option key={key} value={key}>{ar?exportNames[key]:key}</option>)}</select></label><button disabled={createExport.isPending} className="rounded-lg bg-purple-700 p-3 text-white" onClick={()=>createExport.mutate({type})}>{ar?"تجهيز وتنزيل":"Create and download"}</button>{lastExport&&<button className="mx-3" onClick={()=>download('\uFEFF'+lastExport.content,lastExport.fileName)}>{ar?"إعادة التنزيل":"Download again"}</button>}</section>
      <form className="space-y-3 rounded-xl bg-white p-5" onSubmit={e=>{e.preventDefault();createBackup.mutate({label,passphrase});}}><h2>{ar?"نسخة مستقلة مشفرة":"Independent encrypted backup"}</h2><label className="block">{ar?"اسم النسخة":"Label"}<input className={inputClass} required value={label} onChange={e=>setLabel(e.target.value)}/></label><label className="block">{ar?"كلمة تشفير النسخة (12 حرفًا على الأقل)":"Backup password (at least 12 characters)"}<input className={inputClass} autoComplete="new-password" required minLength={12} maxLength={256} type="password" value={passphrase} onChange={e=>setPassphrase(e.target.value)}/></label><button disabled={createBackup.isPending} className="rounded-lg bg-purple-700 p-3 text-white">{createBackup.isPending?(ar?"جارٍ إنشاء النسخة…":"Creating backup…"):(ar?"إنشاء وتنزيل النسخة":"Create and download backup")}</button></form>
    </div>
    <h2>{ar?"النسخ المشفرة المحفوظة":"Saved encrypted backups"}</h2>
    <div className="space-y-2">{backups.data?.map(b=><div key={b.fileName} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-3"><span dir="ltr">{b.fileName}</span><span>{(b.bytes/1024/1024).toFixed(2)} MB</span><button disabled={downloading} className="text-purple-700" onClick={async()=>{setDownloading(true);try{const data=await utils.admin.downloadBackup.fetch({fileName:b.fileName});download(data.content,data.fileName);}catch(error){onError({message:error instanceof Error?error.message:"Download failed"});}finally{setDownloading(false);}}}>{ar?"تنزيل":"Download"}</button></div>)}</div>
    <p className="text-sm">{ar?"النسخ الجزئية القديمة محفوظة دون حذف، لكنها ليست نسخ استعادة كاملة. تعليمات الاستعادة في ملف BACKUP-RECOVERY.md ضمن المشروع.":"Legacy partial snapshots remain untouched; they are not complete recovery archives. See BACKUP-RECOVERY.md in the project for recovery instructions."}</p>
  </div>;
}
