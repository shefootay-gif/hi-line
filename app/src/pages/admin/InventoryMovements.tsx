import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { Loader2, PackageSearch } from "lucide-react";

type InventoryMovement = {
  id: number;
  productId: number;
  orderId?: number | null;
  supplierProductId?: number | null;
  type: "sale" | "restock" | "adjustment" | "return" | "import" | "cancel";
  quantity: number;
  previousStock?: number | null;
  newStock?: number | null;
  reason?: string | null;
  reference?: string | null;
  createdAt: Date | string;
};

const typeLabels: Record<InventoryMovement["type"], { ar: string; en: string }> = {
  sale: { ar: "بيع", en: "Sale" },
  restock: { ar: "إضافة مخزون", en: "Restock" },
  adjustment: { ar: "تعديل يدوي", en: "Adjustment" },
  return: { ar: "مرتجع", en: "Return" },
  import: { ar: "استيراد", en: "Import" },
  cancel: { ar: "إلغاء طلب", en: "Cancel" },
};

export default function InventoryMovements() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const { data = [], isLoading } = trpc.admin.listInventoryMovements.useQuery({ limit: 100 }, { retry: false });
  const rows = data as InventoryMovement[];

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F2FE]">
          <PackageSearch className="h-5 w-5 text-[#0EA5E9]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "حركة المخزون" : "Inventory Movements"}</h1>
          <p className="text-sm text-[#6F6178]">{ar ? "سجل البيع والإلغاء والاستيراد وتعديل المخزون" : "Track sales, cancellations, imports, and manual stock changes"}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EDE5F7] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b bg-[#FAFAFA] text-xs text-[#9CA3AF]">
                <th className="px-4 py-3 text-start">{ar ? "النوع" : "Type"}</th>
                <th className="px-4 py-3 text-start">Product ID</th>
                <th className="px-4 py-3 text-start">{ar ? "الكمية" : "Qty"}</th>
                <th className="px-4 py-3 text-start">{ar ? "قبل" : "Before"}</th>
                <th className="px-4 py-3 text-start">{ar ? "بعد" : "After"}</th>
                <th className="px-4 py-3 text-start">{ar ? "المرجع" : "Reference"}</th>
                <th className="px-4 py-3 text-start">{ar ? "السبب" : "Reason"}</th>
                <th className="px-4 py-3 text-start">{ar ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading && (
                <tr><td colSpan={8} className="p-8 text-center text-[#6F6178]"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />{ar ? "جاري التحميل..." : "Loading..."}</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-semibold text-[#1A0533]">{ar ? typeLabels[row.type].ar : typeLabels[row.type].en}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.productId}</td>
                  <td className={`px-4 py-3 font-semibold ${row.quantity < 0 ? "text-red-600" : "text-green-600"}`}>{row.quantity}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.previousStock ?? "-"}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.newStock ?? "-"}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.reference ?? "-"}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{row.reason ?? "-"}</td>
                  <td className="px-4 py-3 text-[#6F6178]">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-[#6F6178]">{ar ? "لا توجد حركات مخزون بعد" : "No inventory movements yet"}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
