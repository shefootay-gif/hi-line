import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import toast from "react-hot-toast";

export default function ReturnRequest() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const [form, setForm] = useState({ orderNumber: "", customerPhone: "", reason: "" });
  const create = trpc.store.createReturnRequest.useMutation({
    onSuccess: () => { toast.success(ar ? "تم إرسال طلب الاسترجاع" : "Return request submitted"); setForm({ orderNumber: "", customerPhone: "", reason: "" }); },
    onError: (e) => toast.error(e.message),
  });
  return <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-[#FCF8FF] px-4 py-16 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mx-auto max-w-xl rounded-3xl border border-[#EDE5F7] bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-3xl font-bold text-[#1A0533]">{ar ? "طلب استرجاع أو استبدال" : "Return or Exchange Request"}</h1>
      <p className="mb-6 text-sm text-[#6F6178]">{ar ? "أدخل رقم الطلب والهاتف وسبب الاسترجاع، وسيتم مراجعته من الإدارة." : "Enter your order number, phone, and reason. The store team will review it."}</p>
      <form className="space-y-4" onSubmit={(e)=>{e.preventDefault(); create.mutate(form);}}>
        <input className="w-full rounded-xl border border-[#EDE5F7] px-4 py-3" required placeholder={ar ? "رقم الطلب" : "Order number"} value={form.orderNumber} onChange={(e)=>setForm({...form,orderNumber:e.target.value})}/>
        <input className="w-full rounded-xl border border-[#EDE5F7] px-4 py-3" required placeholder={ar ? "رقم الهاتف" : "Phone number"} value={form.customerPhone} onChange={(e)=>setForm({...form,customerPhone:e.target.value})}/>
        <textarea className="min-h-32 w-full rounded-xl border border-[#EDE5F7] px-4 py-3" required placeholder={ar ? "سبب الاسترجاع" : "Reason"} value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})}/>
        <button className="w-full rounded-xl bg-[#7C3AED] px-4 py-3 font-semibold text-white" disabled={create.isPending}>{create.isPending ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "إرسال الطلب" : "Submit request")}</button>
      </form>
    </div>
  </div>;
}
