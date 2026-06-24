import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  X,
  Loader2,
  Package,
  MessageCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "#B57EDC",
  processing: "#1E6D9E",
  shipped: "#B57EDC",
  delivered: "#22C55E",
  cancelled: "#EF4444",
  refunded: "#8D7A97",
};

const paymentStatusColors: Record<string, string> = {
  pending: "#B57EDC",
  paid: "#22C55E",
  failed: "#EF4444",
  refunded: "#8D7A97",
};

export default function AdminOrders() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [updateStatusId, setUpdateStatusId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data: orders, isLoading } = trpc.admin.listOrders.useQuery(
    search || statusFilter
      ? { search: search || undefined, status: statusFilter || undefined }
      : undefined
  );

  const updateOrderStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.admin.listOrders.invalidate();
      setUpdateStatusId(null);
      toast.success(lang === "ar" ? "تم التحديث" : "Updated");
    },
  });

  const deleteOrder = trpc.admin.deleteOrder.useMutation({
    onSuccess: () => {
      utils.admin.listOrders.invalidate();
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    },
  });

  const handleWhatsAppCustomer = (order: any) => {
    const message = `Hello! Regarding your order #${order.orderNumber}`;
    window.open(
      `https://wa.me/${order.customerPhone?.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

  return (
    <div className={`p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />

      <h1 className="text-2xl font-bold text-[#4B1C71] mb-6">{t.manageOrders}</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D7A97]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E7D8F1] text-sm focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-[#E7D8F1] text-sm focus:outline-none"
        >
          <option value="">{lang === "ar" ? "كل الحالات" : "All Statuses"}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {(t as any)[s] || s}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#B57EDC]" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="p-12 text-center text-[#6F6178]">{t.noOrdersFound}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7D8F1]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.customerName}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.total}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.paymentMethod}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.orderStatus}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.date}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F6178]">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D8F1]">
                {orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FCF8FF]">
                    <td className="px-4 py-3 text-sm font-mono text-[#4B1C71]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#4B1C71]">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-[#8D7A97]">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#4B1C71]">
                      {parseFloat(order.total).toFixed(0)} {t.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[#6F6178] capitalize">
                        {order.paymentMethod?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setUpdateStatusId(order.id);
                          setNewStatus(order.orderStatus);
                        }}
                      >
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${statusColors[order.orderStatus]}15`,
                            color: statusColors[order.orderStatus],
                          }}
                        >
                          {(t as any)[order.orderStatus] || order.orderStatus}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6F6178]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewOrder(order)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#B57EDC]/10 text-[#4B1C71]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppCustomer(order)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#25D366]/10 text-[#25D366]"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t.confirmDelete)) {
                              deleteOrder.mutate({ id: order.id });
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E7D8F1]">
              <h2 className="text-lg font-semibold text-[#4B1C71]">
                {t.orderDetails}
              </h2>
              <button onClick={() => setViewOrder(null)}>
                <X className="w-5 h-5 text-[#8D7A97]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-[#6F6178]">{t.orderNumber}</span>
                <span className="text-sm font-mono font-medium">{viewOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6F6178]">{t.customerName}</span>
                <span className="text-sm text-[#4B1C71]">{viewOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6F6178]">{t.customerPhone}</span>
                <span className="text-sm text-[#4B1C71]">{viewOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6F6178]">{t.shippingAddress}</span>
                <span className="text-sm text-[#4B1C71] text-right max-w-[200px]">{viewOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6F6178]">{t.paymentMethod}</span>
                <span className="text-sm text-[#4B1C71] capitalize">{viewOrder.paymentMethod?.replace(/_/g, " ")}</span>
              </div>
              <div className="border-t border-[#E7D8F1] pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t.total}</span>
                  <span>{parseFloat(viewOrder.total).toFixed(0)} {t.currency}</span>
                </div>
              </div>
              {viewOrder.notes && (
                <div className="bg-[#FCF8FF] rounded-xl p-4">
                  <span className="text-sm text-[#6F6178]">{t.notes}:</span>
                  <p className="text-sm text-[#4B1C71] mt-1">{viewOrder.notes}</p>
                </div>
              )}
              <a
                href={`https://wa.me/${viewOrder.customerPhone?.replace(/\+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-medium rounded-xl hover:bg-[#128C7E] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {t.chatOnWhatsApp}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {updateStatusId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
              {t.updateStatus}
            </h3>
            <div className="space-y-2 mb-6">
              {statuses.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    newStatus === s
                      ? "border-[#B57EDC] bg-[#B57EDC]/5"
                      : "border-[#E7D8F1]"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={newStatus === s}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-4 h-4 accent-[#B57EDC]"
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: statusColors[s] }}
                  >
                    {(t as any)[s] || s}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUpdateStatusId(null)}
                className="px-4 py-2 text-sm text-[#6F6178]"
              >
                {t.cancel}
              </button>
              <button
                onClick={() =>
                  updateOrderStatus.mutate({
                    id: updateStatusId,
                    status: newStatus as any,
                  })
                }
                disabled={updateOrderStatus.isPending}
                className="px-6 py-2 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl disabled:opacity-50"
              >
                {updateOrderStatus.isPending && (
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                )}
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
