import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { Bell, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Notifications() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ title: "", message: "", type: "system" as const });
  const { data = [], isLoading } = trpc.admin.listAdminNotifications.useQuery({ limit: 100 }, { retry: false });
  const create = trpc.admin.createAdminNotification.useMutation({ onSuccess: async () => { toast.success(ar ? "تم إنشاء الإشعار" : "Notification created"); setForm({ title: "", message: "", type: "system" }); await utils.admin.listAdminNotifications.invalidate(); }, onError: (e) => toast.error(e.message) });
  const markRead = trpc.admin.markAdminNotificationRead.useMutation({ onSuccess: async () => { await utils.admin.listAdminNotifications.invalidate(); } });
  return <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mb-8 flex items-center gap-3"><Bell className="h-8 w-8 text-[#7C3AED]" /><div><h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "الإشعارات" : "Notifications"}</h1><p className="text-sm text-[#6F6178]">{ar ? "إشعارات الطلبات والدفع والمخزون" : "Order, payment, shipping, and inventory alerts"}</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="space-y-3 rounded-2xl border bg-white p-5" onSubmit={(e)=>{e.preventDefault(); create.mutate(form);}}>
        <input className="w-full rounded-xl border px-3 py-2" required placeholder={ar ? "العنوان" : "Title"} value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
        <textarea className="w-full rounded-xl border px-3 py-2" required placeholder={ar ? "الرسالة" : "Message"} value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})}/>
        <select className="w-full rounded-xl border px-3 py-2" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as typeof form.type})}><option value="system">System</option><option value="order">Order</option><option value="payment">Payment</option><option value="shipping">Shipping</option><option value="inventory">Inventory</option><option value="return">Return</option></select>
        <button className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "إنشاء" : "Create"}</button>
      </form>
      <div className="space-y-3">{isLoading && <div className="rounded-2xl bg-white p-8 text-center">{ar ? "جاري التحميل..." : "Loading..."}</div>}{data.map((n) => <div key={n.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-3"><div><p className="font-bold text-[#1A0533]">{n.title}</p><p className="text-sm text-[#6F6178]">{n.message}</p><p className="mt-2 text-xs text-[#9CA3AF]">{n.type} • {new Date(n.createdAt).toLocaleString()}</p></div>{!n.isRead && <button onClick={()=>markRead.mutate({id:n.id})} className="text-green-600"><CheckCircle className="h-5 w-5" /></button>}</div></div>)}</div>
    </div>
  </div>;
}
