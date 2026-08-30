import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { SearchCode } from "lucide-react";
import toast from "react-hot-toast";

export default function SeoTools() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ path: "/", titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "", keywords: "", ogImage: "", canonicalUrl: "", isIndexed: true });
  const { data = [] } = trpc.admin.listSeoPages.useQuery(undefined, { retry: false });
  const files = trpc.admin.generateSeoFiles.useQuery(undefined, { retry: false });
  const save = trpc.admin.upsertSeoPage.useMutation({ onSuccess: async () => { toast.success(ar ? "تم حفظ SEO" : "SEO saved"); await utils.admin.listSeoPages.invalidate(); await utils.admin.generateSeoFiles.invalidate(); await utils.store.getSeoPages.invalidate(); }, onError: (e) => toast.error(e.message) });
  return <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mb-8 flex items-center gap-3"><SearchCode className="h-8 w-8 text-[#7C3AED]" /><div><h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "أدوات SEO" : "SEO Tools"}</h1><p className="text-sm text-[#6F6178]">{ar ? "الميتا وسايت ماب وروبوتس" : "Metadata, sitemap, and robots preview"}</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form className="space-y-3 rounded-2xl border bg-white p-5" onSubmit={(e)=>{e.preventDefault(); save.mutate(form);}}>
        <input className="w-full rounded-xl border px-3 py-2" required aria-label={ar ? "مسار الصفحة" : "Page path"} placeholder="/shop" value={form.path} onChange={(e)=>setForm({...form,path:e.target.value})}/>
        <input className="w-full rounded-xl border px-3 py-2" aria-label={ar ? "العنوان بالإنجليزية" : "English title"} placeholder={ar ? "العنوان بالإنجليزية" : "English title"} value={form.titleEn} onChange={(e)=>setForm({...form,titleEn:e.target.value})}/>
        <input className="w-full rounded-xl border px-3 py-2" aria-label={ar ? "العنوان بالعربية" : "Arabic title"} placeholder={ar ? "العنوان بالعربية" : "Arabic title"} value={form.titleAr} onChange={(e)=>setForm({...form,titleAr:e.target.value})}/>
        <textarea className="w-full rounded-xl border px-3 py-2" aria-label={ar ? "الوصف بالإنجليزية" : "English description"} placeholder={ar ? "الوصف بالإنجليزية" : "English description"} value={form.descriptionEn} onChange={(e)=>setForm({...form,descriptionEn:e.target.value})}/>
        <textarea className="w-full rounded-xl border px-3 py-2" aria-label={ar ? "الوصف بالعربية" : "Arabic description"} placeholder={ar ? "الوصف بالعربية" : "Arabic description"} value={form.descriptionAr} onChange={(e)=>setForm({...form,descriptionAr:e.target.value})}/>
        <input className="w-full rounded-xl border px-3 py-2" aria-label={ar ? "الكلمات المفتاحية" : "Keywords"} placeholder={ar ? "الكلمات المفتاحية" : "Keywords"} value={form.keywords} onChange={(e)=>setForm({...form,keywords:e.target.value})}/>
        <label className="flex gap-2"><input type="checkbox" checked={form.isIndexed} onChange={e=>setForm({...form,isIndexed:e.target.checked})}/>{ar ? "السماح بالفهرسة" : "Allow indexing"}</label>
        <label className="block">{ar ? "رابط الصورة الاجتماعية" : "Social image URL"}<input className="w-full rounded-xl border px-3 py-2" value={form.ogImage} onChange={e=>setForm({...form,ogImage:e.target.value})}/></label>
        <label className="block">{ar ? "الرابط الأساسي (اختياري)" : "Canonical URL (optional)"}<input className="w-full rounded-xl border px-3 py-2" value={form.canonicalUrl} onChange={e=>setForm({...form,canonicalUrl:e.target.value})}/></label>
        <button disabled={save.isPending} className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "حفظ" : "Save"}</button>
      </form>
      <div className="space-y-6">
        <div className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-bold">{ar ? "الصفحات" : "Pages"}</h2><div className="space-y-2">{data.map((p)=><button key={p.id} onClick={()=>setForm({ path:p.path, titleEn:p.titleEn??"", titleAr:p.titleAr??"", descriptionEn:p.descriptionEn??"", descriptionAr:p.descriptionAr??"", keywords:p.keywords??"", ogImage:p.ogImage??"", canonicalUrl:p.canonicalUrl??"", isIndexed:p.isIndexed??true })} className="block w-full rounded-xl bg-[#F8F4FC] p-3 text-start text-sm"><b>{p.path}</b><br />{p.titleEn || p.titleAr}</button>)}</div></div>
        <div className="rounded-2xl border bg-white p-5"><h2 className="mb-3 font-bold">{ar ? "معاينة خريطة الموقع" : "Sitemap preview"} ({files.data?.urlsCount ?? 0})</h2><pre className="max-h-72 overflow-auto rounded-xl bg-[#111] p-4 text-xs text-white">{files.data?.sitemap ?? ""}</pre></div>
      </div>
    </div>
  </div>;
}
