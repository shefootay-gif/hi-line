import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import toast, { Toaster } from "react-hot-toast";
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";

type SupplierStatus = "active" | "pending" | "inactive";
type CatalogStatus = "available" | "out_of_stock" | "draft";

type SupplierRow = {
  id: number;
  name: string;
  country: string;
  category?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  catalogUrl?: string | null;
  rating?: string | null;
  shippingDays?: string | null;
  status?: SupplierStatus | null;
  notes?: string | null;
  productsCount?: number | string | null;
};

type CatalogProduct = {
  id: number;
  supplierId: number;
  name: string;
  sku?: string | null;
  category?: string | null;
  costPrice: string;
  suggestedPrice?: string | null;
  stock?: number | null;
  status?: CatalogStatus | null;
};

const emptySupplier = {
  id: 0,
  name: "",
  country: "",
  category: "Beauty & Personal Care",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  catalogUrl: "",
  rating: "0",
  shippingDays: "3-5",
  status: "active" as SupplierStatus,
  notes: "",
};

type SupplierForm = typeof emptySupplier;

const statusStyle: Record<SupplierStatus, { bg: string; text: string; ar: string; en: string }> = {
  active: { bg: "#DCFCE7", text: "#15803D", ar: "نشط", en: "Active" },
  pending: { bg: "#FEF3C7", text: "#92400E", ar: "معلق", en: "Pending" },
  inactive: { bg: "#F1F5F9", text: "#475569", ar: "غير نشط", en: "Inactive" },
};

export default function Dropshipping() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"suppliers" | "catalog">("suppliers");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SupplierForm>(emptySupplier);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);

  const { data: suppliers = [], isLoading } = trpc.admin.listDropshippingSuppliers.useQuery(undefined, {
    retry: false,
    throwOnError: false,
  });
  const { data: catalog = [], isLoading: catalogLoading } = trpc.admin.listSupplierCatalog.useQuery(
    { supplierId: selectedSupplierId },
    { retry: false, throwOnError: false }
  );

  const createSupplier = trpc.admin.createDropshippingSupplier.useMutation({
    onSuccess: () => {
      utils.admin.listDropshippingSuppliers.invalidate();
      setShowModal(false);
      setEditing(emptySupplier);
      toast.success(ar ? "تمت إضافة المورد" : "Supplier created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateSupplier = trpc.admin.updateDropshippingSupplier.useMutation({
    onSuccess: () => {
      utils.admin.listDropshippingSuppliers.invalidate();
      setShowModal(false);
      setEditing(emptySupplier);
      toast.success(ar ? "تم تعديل المورد" : "Supplier updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteSupplier = trpc.admin.deleteDropshippingSupplier.useMutation({
    onSuccess: () => {
      utils.admin.listDropshippingSuppliers.invalidate();
      utils.admin.listSupplierCatalog.invalidate();
      toast.success(ar ? "تم حذف المورد" : "Supplier deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const importCatalog = trpc.admin.importSupplierCatalog.useMutation({
    onSuccess: (data) => {
      utils.admin.listSupplierCatalog.invalidate();
      utils.admin.listDropshippingSuppliers.invalidate();
      toast.success(ar ? `تم استيراد ${data.importedCount} منتجات` : `${data.importedCount} products imported`);
      setActiveTab("catalog");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredSuppliers = (suppliers as SupplierRow[]).filter((supplier) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [supplier.name, supplier.country, supplier.category ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const activeSuppliers = (suppliers as SupplierRow[]).filter((s) => s.status === "active").length;
  const totalCatalog = (catalog as CatalogProduct[]).length;

  const openCreate = () => {
    setEditing(emptySupplier);
    setShowModal(true);
  };

  const openEdit = (supplier: SupplierRow) => {
    setEditing({
      ...emptySupplier,
      id: supplier.id,
      name: supplier.name,
      country: supplier.country,
      category: supplier.category ?? "Beauty & Personal Care",
      contactName: supplier.contactName ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      website: supplier.website ?? "",
      catalogUrl: supplier.catalogUrl ?? "",
      rating: supplier.rating ?? "0",
      shippingDays: supplier.shippingDays ?? "3-5",
      status: supplier.status ?? "active",
      notes: supplier.notes ?? "",
    });
    setShowModal(true);
  };

  const saveSupplier = () => {
    if (!editing.name.trim() || !editing.country.trim()) {
      toast.error(ar ? "اكتب اسم المورد والدولة" : "Supplier name and country are required");
      return;
    }

    const payload = {
      name: editing.name.trim(),
      country: editing.country.trim(),
      category: editing.category.trim(),
      contactName: editing.contactName.trim(),
      phone: editing.phone.trim(),
      email: editing.email.trim(),
      website: editing.website.trim(),
      catalogUrl: editing.catalogUrl.trim(),
      rating: editing.rating.trim() || "0",
      shippingDays: editing.shippingDays.trim() || "3-5",
      status: editing.status,
      notes: editing.notes.trim(),
    };

    if (editing.id) updateSupplier.mutate({ id: editing.id, ...payload });
    else createSupplier.mutate(payload);
  };

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E0F2FE]">
              <Truck className="h-4 w-4 text-[#0EA5E9]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "دروب شوبينج" : "Dropshipping"}</h1>
          </div>
          <p className="text-sm text-[#6F6178] ms-10">
            {ar ? "إدارة الموردين واستيراد كتالوج المنتجات" : "Manage suppliers and import product catalogs"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#0EA5E9] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0284C7]"
        >
          <Plus className="h-4 w-4" />
          {ar ? "إضافة مورد" : "Add Supplier"}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#EDE5F7] bg-white p-5">
          <CheckCircle className="mb-3 h-5 w-5 text-green-600" />
          <p className="text-2xl font-bold text-[#1A0533]">{activeSuppliers}</p>
          <p className="text-xs text-[#6F6178]">{ar ? "موردون نشطون" : "Active Suppliers"}</p>
        </div>
        <div className="rounded-2xl border border-[#EDE5F7] bg-white p-5">
          <Package className="mb-3 h-5 w-5 text-[#7C3AED]" />
          <p className="text-2xl font-bold text-[#1A0533]">{totalCatalog}</p>
          <p className="text-xs text-[#6F6178]">{ar ? "منتجات في الكتالوج" : "Catalog Products"}</p>
        </div>
        <div className="rounded-2xl border border-[#EDE5F7] bg-white p-5">
          <RefreshCcw className="mb-3 h-5 w-5 text-[#0EA5E9]" />
          <p className="text-2xl font-bold text-[#1A0533]">{(suppliers as SupplierRow[]).length}</p>
          <p className="text-xs text-[#6F6178]">{ar ? "إجمالي الموردين" : "Total Suppliers"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EDE5F7] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE5F7] p-6">
          <div className="flex gap-1 rounded-xl bg-[#F8F4FC] p-1">
            {(["suppliers", "catalog"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab ? "bg-white text-[#0EA5E9] shadow-sm" : "text-[#6F6178] hover:text-[#1A0533]"
                }`}
              >
                {tab === "suppliers" ? (ar ? "الموردون" : "Suppliers") : ar ? "الكتالوج" : "Catalog"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] ${isRTL ? "right-3" : "left-3"}`} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={ar ? "بحث..." : "Search..."}
              className={`rounded-xl border border-[#EDE5F7] bg-[#FAFAFA] py-2 text-sm focus:border-[#0EA5E9] focus:outline-none ${
                isRTL ? "pr-9 pl-4" : "pl-9 pr-4"
              }`}
            />
          </div>
        </div>

        {activeTab === "suppliers" && (
          <div className="divide-y divide-[#F0EAF8]">
            {isLoading && <div className="p-8 text-center text-sm text-[#6F6178]">{ar ? "جاري التحميل..." : "Loading..."}</div>}
            {filteredSuppliers.map((supplier) => {
              const status = statusStyle[supplier.status ?? "active"];
              return (
                <div key={supplier.id} className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:bg-[#FAFAFA]">
                  <div>
                    <p className="font-semibold text-[#1A0533]">{supplier.name}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      {supplier.country} • {supplier.category ?? "Beauty & Personal Care"} • {Number(supplier.productsCount ?? 0)} {ar ? "منتج" : "products"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: status.bg, color: status.text }}>
                      {ar ? status.ar : status.en}
                    </span>
                    {supplier.website && (
                      <button onClick={() => window.open(supplier.website ?? "", "_blank")} className="rounded-lg p-2 text-[#6F6178] hover:bg-[#F3E8FF]">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => openEdit(supplier)} className="rounded-lg p-2 text-[#6F6178] hover:bg-[#F3E8FF]">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => importCatalog.mutate({ supplierId: supplier.id })}
                      disabled={importCatalog.isPending}
                      className="flex items-center gap-1 rounded-lg bg-[#0EA5E9] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0284C7] disabled:opacity-60"
                    >
                      {importCatalog.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                      {ar ? "استيراد الكتالوج" : "Import Catalog"}
                    </button>
                    <button onClick={() => deleteSupplier.mutate({ id: supplier.id })} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="p-6">
            <select
              value={selectedSupplierId ?? ""}
              onChange={(event) => setSelectedSupplierId(event.target.value ? Number(event.target.value) : undefined)}
              className="mb-4 rounded-xl border border-[#EDE5F7] bg-white px-3 py-2 text-sm"
            >
              <option value="">{ar ? "كل الموردين" : "All suppliers"}</option>
              {(suppliers as SupplierRow[]).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b bg-[#FAFAFA] text-xs text-[#9CA3AF]">
                    <th className="px-4 py-3 text-start">{ar ? "المنتج" : "Product"}</th>
                    <th className="px-4 py-3 text-start">SKU</th>
                    <th className="px-4 py-3 text-start">{ar ? "التكلفة" : "Cost"}</th>
                    <th className="px-4 py-3 text-start">{ar ? "السعر المقترح" : "Suggested"}</th>
                    <th className="px-4 py-3 text-start">{ar ? "المخزون" : "Stock"}</th>
                    <th className="px-4 py-3 text-start">{ar ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {catalogLoading && <tr><td colSpan={6} className="p-6 text-center text-[#6F6178]">{ar ? "جاري التحميل..." : "Loading..."}</td></tr>}
                  {(catalog as CatalogProduct[]).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-[#1A0533]">{item.name}</td>
                      <td className="px-4 py-3 text-[#6F6178]">{item.sku ?? "-"}</td>
                      <td className="px-4 py-3">{item.costPrice}</td>
                      <td className="px-4 py-3">{item.suggestedPrice ?? "-"}</td>
                      <td className="px-4 py-3">{item.stock ?? 0}</td>
                      <td className="px-4 py-3">{item.status ?? "available"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A0533]">{editing.id ? (ar ? "تعديل مورد" : "Edit Supplier") : ar ? "إضافة مورد" : "Add Supplier"}</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["name", ar ? "اسم المورد" : "Supplier name"],
                ["country", ar ? "الدولة" : "Country"],
                ["category", ar ? "التصنيف" : "Category"],
                ["contactName", ar ? "اسم المسؤول" : "Contact name"],
                ["phone", ar ? "الهاتف" : "Phone"],
                ["email", ar ? "الإيميل" : "Email"],
                ["website", ar ? "الموقع" : "Website"],
                ["catalogUrl", ar ? "رابط الكتالوج" : "Catalog URL"],
                ["rating", ar ? "التقييم" : "Rating"],
                ["shippingDays", ar ? "مدة الشحن" : "Shipping days"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm font-medium text-[#1A0533]">
                  {label}
                  <input
                    value={String(editing[key as keyof SupplierForm])}
                    onChange={(event) => setEditing({ ...editing, [key]: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#0EA5E9]"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-[#1A0533]">
                {ar ? "الحالة" : "Status"}
                <select
                  value={editing.status}
                  onChange={(event) => setEditing({ ...editing, status: event.target.value as SupplierStatus })}
                  className="mt-1 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#0EA5E9]"
                >
                  <option value="active">{ar ? "نشط" : "Active"}</option>
                  <option value="pending">{ar ? "معلق" : "Pending"}</option>
                  <option value="inactive">{ar ? "غير نشط" : "Inactive"}</option>
                </select>
              </label>
              <label className="md:col-span-2 text-sm font-medium text-[#1A0533]">
                {ar ? "ملاحظات" : "Notes"}
                <textarea
                  value={editing.notes}
                  onChange={(event) => setEditing({ ...editing, notes: event.target.value })}
                  className="mt-1 min-h-24 w-full rounded-xl border border-[#EDE5F7] px-3 py-2 text-sm outline-none focus:border-[#0EA5E9]"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-xl border px-4 py-2 text-sm">{ar ? "إلغاء" : "Cancel"}</button>
              <button onClick={saveSupplier} disabled={createSupplier.isPending || updateSupplier.isPending} className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {ar ? "حفظ" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
