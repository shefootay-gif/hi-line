import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [form, setForm] = useState({ name: "", email: "", role: "viewer" as const, permissions: "orders,products", isActive: true, notes: "" });
  const { data = [] } = trpc.admin.listAdminStaffUsers.useQuery(undefined, { retry: false });
  const create = trpc.admin.createAdminStaffUser.useMutation({ onSuccess: async () => { toast.success(ar ? "تم إضافة مستخدم لوحة" : "Staff user added"); await utils.admin.listAdminStaffUsers.invalidate(); }, onError: (e) => toast.error(e.message) });
  return <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
    <div className="mb-8 flex items-center gap-3"><Users className="h-8 w-8 text-[#7C3AED]" /><div><h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "صلاحيات فريق العمل" : "Admin Staff & Roles"}</h1><p className="text-sm text-[#6F6178]">{ar ? "سجل صلاحيات وتشغيل الفريق" : "Staff registry and permission planning"}</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="space-y-3 rounded-2xl border bg-white p-5" onSubmit={(e)=>{e.preventDefault(); create.mutate({ ...form, permissions: form.permissions.split(',').map(x=>x.trim()).filter(Boolean) });}}>
        <input className="w-full rounded-xl border px-3 py-2" required placeholder={ar ? "الاسم" : "Name"} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/>
        <select className="w-full rounded-xl border px-3 py-2" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value as typeof form.role})}><option value="owner">Owner</option><option value="admin">Admin</option><option value="orders">Orders</option><option value="inventory">Inventory</option><option value="marketing">Marketing</option><option value="support">Support</option><option value="viewer">Viewer</option></select>
        <input className="w-full rounded-xl border px-3 py-2" placeholder="permissions" value={form.permissions} onChange={(e)=>setForm({...form,permissions:e.target.value})}/>
        <button className="rounded-xl bg-[#7C3AED] px-4 py-2 text-white">{ar ? "إضافة" : "Add"}</button>
      </form>
      <div className="overflow-hidden rounded-2xl border bg-white"><table className="w-full text-sm"><tbody>{data.map((u)=><tr key={u.id} className="border-b"><td className="p-4 font-semibold">{u.name}</td><td className="p-4 text-[#6F6178]">{u.email}</td><td className="p-4">{u.role}</td><td className="p-4">{u.isActive ? "Active" : "Inactive"}</td></tr>)}</tbody></table></div>
    </div>
  </div>;
}
