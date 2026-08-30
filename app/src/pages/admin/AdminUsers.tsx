import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { staffRoles, roleModules, adminModules, type StaffRole } from "@contracts/admin-access";
import toast from "react-hot-toast";

const labels: Record<StaffRole, string> = { admin: "إدارة تشغيلية", orders: "الطلبات", inventory: "المخزون", marketing: "التسويق", support: "الدعم (قراءة فقط)", viewer: "مشاهدة فقط" };
const empty = { id: undefined as number | undefined, name: "", email: "", role: "viewer" as StaffRole, password: "", isActive: true };
export default function AdminUsers() {
  const { lang } = useLanguage(); const ar = lang === "ar";
  const [form, setForm] = useState(empty);
  const query = trpc.admin.listAdminStaffUsers.useQuery();
  const options = { onSuccess: async () => { setForm(empty); await query.refetch(); toast.success(ar ? "تم حفظ الحساب والصلاحيات" : "Account and permissions saved"); }, onError: (e: { message: string }) => toast.error(e.message) };
  const create = trpc.admin.createAdminStaffUser.useMutation(options);
  const update = trpc.admin.updateAdminStaffUser.useMutation(options);
  const inputClass = "w-full rounded-xl border px-3 py-2";
  return <div className="p-6 lg:p-8">
    <h1 className="mb-2 text-2xl font-bold">{ar ? "حسابات وصلاحيات الفريق" : "Staff accounts and permissions"}</h1>
    <p className="mb-6 text-sm">{ar ? "دخول الفريق بالبريد وكلمة المرور من صفحة دخول الإدارة. الإعدادات والنسخ وصلاحيات الفريق للمالك فقط." : "Staff sign in with email and password on the admin login page. Settings, backups and team management are owner-only."}</p>
    {query.error && <p role="alert">{query.error.message}</p>}
    <div className="grid gap-6 lg:grid-cols-2">
      <form className="space-y-4 rounded-2xl bg-white p-5" onSubmit={e => { e.preventDefault(); const input = { ...form, password: form.password || undefined, permissions: [...roleModules[form.role]] as (typeof adminModules)[number][] }; if (form.id) update.mutate({ ...input, id: form.id }); else create.mutate(input); }}>
        <label className="block">{ar ? "الاسم" : "Name"}<input required className={inputClass} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label className="block">{ar ? "البريد الإلكتروني" : "Email"}<input required type="email" className={inputClass} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label className="block">{ar ? "الدور" : "Role"}<select className={inputClass} value={form.role} onChange={e=>setForm({...form,role:e.target.value as StaffRole})}>{staffRoles.map(role=><option key={role} value={role}>{ar ? labels[role] : role}</option>)}</select></label>
        <label className="block">{ar ? "كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)" : "Password (leave blank to keep current)"}<input autoComplete="new-password" required={!form.id} type="password" minLength={12} maxLength={72} className={inputClass} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        <p className="text-sm">{ar ? "12 حرفًا على الأقل، حرف كبير وصغير ورقم ورمز." : "At least 12 characters, uppercase, lowercase, number and symbol."}</p>
        <label className="flex gap-2"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})}/>{ar ? "نشط" : "Active"}</label>
        <button disabled={create.isPending || update.isPending} className="rounded-xl bg-purple-700 px-4 py-2 text-white">{ar ? "حفظ" : "Save"}</button>
        {form.id && <button type="button" className="mx-3" onClick={()=>setForm(empty)}>{ar ? "إلغاء" : "Cancel"}</button>}
      </form>
      <div className="space-y-3">{query.data?.map(u=><div className="rounded-xl bg-white p-4" key={u.id}><p>{u.name} — {u.email}</p><p>{ar ? labels[u.role as StaffRole] || u.role : u.role} · {u.isActive ? (ar ? "نشط" : "Active") : (ar ? "معطل" : "Disabled")}</p><button className="mt-2 text-purple-700" onClick={()=>setForm({id:u.id,name:u.name,email:u.email??"",role:staffRoles.includes(u.role as StaffRole)?u.role as StaffRole:"viewer",password:"",isActive:Boolean(u.isActive)})}>{ar ? "تعديل / تعطيل" : "Edit / disable"}</button></div>)}</div>
    </div>
  </div>;
}
