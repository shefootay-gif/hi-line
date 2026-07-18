import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  Search,
  Plus,
  Trash2,
  X,
  Loader2,
  Users,
  Mail,
  Phone,
  MapPin,
  ShoppingBag
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminCustomers() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const { data: customers, isLoading, isError } = trpc.admin.listCustomers.useQuery(
    search ? { search } : undefined,
    { retry: false }
  );

  const createCustomer = trpc.admin.createCustomer.useMutation({
    onSuccess: () => {
      utils.admin.listCustomers.invalidate();
      setShowModal(false);
      setName("");
      setPhone("");
      setEmail("");
      setGovernorate("");
      setCity("");
      setAddress("");
      setNotes("");
      toast.success(ar ? "تمت إضافة العميل بنجاح" : "Customer added successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteCustomer = trpc.admin.deleteCustomer.useMutation({
    onSuccess: () => {
      utils.admin.listCustomers.invalidate();
      setDeleteId(null);
      toast.success(ar ? "تم حذف العميل" : "Customer deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error(ar ? "الاسم والهاتف مطلوبان" : "Name and Phone are required");
      return;
    }
    createCustomer.mutate({
      name,
      phone,
      email: email || undefined,
      governorate: governorate || undefined,
      city: city || undefined,
      address: address || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#4B1C71] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#B57EDC]" />
            {ar ? "إدارة العملاء" : "Manage Customers"}
          </h1>
          <p className="text-xs text-[#8D7A97] mt-1">
            {ar ? "عرض وإدارة سجل العملاء الذين قاموا بالشراء أو التسجيل" : "View and manage database of registered store customers"}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {ar ? "إضافة عميل" : "Add Customer"}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7A97]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={ar ? "ابحث بالاسم..." : "Search by name..."}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#B57EDC]" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-[#E7D8F1] mx-auto mb-3" />
            <p className="text-[#6F6178] text-sm mb-1">{ar ? "حدث خطأ أثناء تحميل العملاء" : "Error loading customers"}</p>
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="p-12 text-center text-[#6F6178]">
            {ar ? "لم يتم العثور على أي عملاء" : "No customers found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7D8F1] bg-[#FCF8FF]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase">{ar ? "العميل" : "Customer"}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase">{ar ? "بيانات الاتصال" : "Contact"}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase">{ar ? "الموقع" : "Location"}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase">{ar ? "الطلبات" : "Orders"}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase">{ar ? "إجمالي الإنفاق" : "Total Spent"}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#6F6178] uppercase text-right">{ar ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8F1]">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FCF8FF]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#B57EDC]/10 text-[#4B1C71] font-bold text-xs flex items-center justify-center">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#4B1C71]">{customer.name}</p>
                          <p className="text-[10px] text-[#8D7A97]">
                            {ar ? "انضم في" : "Joined"} {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#4B1C71]">
                          <Phone className="w-3.5 h-3.5 text-[#8D7A97]" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-[#6F6178]">
                            <Mail className="w-3.5 h-3.5 text-[#8D7A97]" />
                            <span className="truncate max-w-[180px]">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4B1C71]">
                      {customer.governorate ? (
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#8D7A97]" />
                          <span>{customer.city ? `${customer.city}, ` : ""}{customer.governorate}</span>
                        </div>
                      ) : (
                        <span className="text-[#8D7A97] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#4B1C71]">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#8D7A97]" />
                        <span>{customer.totalOrders}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#4B1C71]">
                      <div className="flex items-center gap-0.5 text-[#059669]">
                        <span>{parseFloat(customer.totalSpent ?? "0").toFixed(0)}</span>
                        <span className="text-[10px] font-normal text-[#6F6178] ml-0.5">{ar ? "ج.م" : "EGP"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteId(customer.id)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#E7D8F1] bg-[#FCF8FF]">
              <h3 className="font-bold text-[#4B1C71]">{ar ? "إضافة عميل جديد" : "Add New Customer"}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8D7A97] hover:text-[#4B1C71]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "الاسم" : "Name"} *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "الهاتف" : "Phone"} *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "البريد الإلكتروني" : "Email"}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "المحافظة" : "Governorate"}</label>
                  <input
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "المدينة" : "City"}</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "العنوان" : "Address"}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8D7A97] mb-1">{ar ? "ملاحظات" : "Notes"}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E7D8F1] rounded-xl text-sm focus:outline-none bg-white resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[#F2EAFA]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6F6178]"
                >
                  {ar ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending}
                  className="px-5 py-2 bg-[#B57EDC] text-[#4B1C71] font-bold rounded-xl hover:bg-[#A66DCC] transition-colors"
                >
                  {ar ? "حفظ" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <p className="text-[#4B1C71] font-medium mb-6">{ar ? "هل أنت متأكد من حذف هذا العميل نهائياً؟" : "Are you sure you want to delete this customer?"}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-[#6F6178]"
              >
                {ar ? "لا" : "No"}
              </button>
              <button
                onClick={() => deleteCustomer.mutate({ id: deleteId })}
                disabled={deleteCustomer.isPending}
                className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {ar ? "نعم، احذف" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
