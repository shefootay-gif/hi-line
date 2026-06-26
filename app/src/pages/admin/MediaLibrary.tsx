import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { Image, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MediaLibrary() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ title: "", url: "", altText: "", folder: "products" });
  const { data = [], isLoading } = trpc.admin.listUploadAssets.useQuery(undefined, { retry: false });
  const create = trpc.admin.createUploadAsset.useMutation({ onSuccess: async () => { toast.success(ar ? "تم حفظ الصورة" : "Asset saved"); setForm({ title: "", url: "", altText: "", folder: "products" }); await utils.admin.listUploadAssets.invalidate(); }, onError: (e) => toast.error(e.message) });
  const del = trpc.admin.deleteUploadAsset.useMutation({ onSuccess: async () => { toast.success(ar ? "تم الحذف" : "Deleted"); await utils.admin.listUploadAssets.invalidate(); } });
  return <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mb-8 flex items-center gap-3"><Image className="h-8 w-8 text-[#7C3AED]" /><div><h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "مكتبة الوسائط" : "Media Library"}</h1><p className="text-sm text-[#6F6178]">{ar ? "إدارة روابط الصور والملفات" : "Manage image and file URLs"}</p></div></div>
    <form className="mb-6 grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-4" onSubmit={(e)=>{e.preventDefault(); create.mutate(form);}}>
      <input className="rounded-xl border px-3 py-2" placeholder={ar ? "العنوان" : "Title"} value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
      <input className="rounded-xl border px-3 py-2 md:col-span-2" required placeholder="URL" value={form.url} onChange={(e)=>setForm({...form,url:e.target.value})}/>
      <button className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "حفظ" : "Save"}</button>
    </form>
    {isLoading ? <div className="rounded-2xl bg-white p-8 text-center">Loading...</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.map((a) => <div key={a.id} className="overflow-hidden rounded-2xl border bg-white"><div className="aspect-video bg-[#F3E8FF]"><img src={a.url} alt={a.altText ?? a.title ?? ""} className="h-full w-full object-cover" /></div><div className="p-4"><p className="truncate font-semibold">{a.title || a.url}</p><p className="truncate text-xs text-[#9CA3AF]">{a.folder}</p><button onClick={()=>del.mutate({id:a.id})} className="mt-3 flex items-center gap-1 text-sm text-red-600"><Trash2 className="h-4 w-4" />{ar ? "حذف" : "Delete"}</button></div></div>)}</div>}
  </div>;
}
