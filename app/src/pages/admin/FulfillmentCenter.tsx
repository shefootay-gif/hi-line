import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { CreditCard, FileText, Truck, Undo2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "payments" | "shipping" | "invoices" | "returns";

const inputClass = "w-full rounded-xl border border-[#EDE5F7] bg-white px-3 py-2 text-sm outline-none focus:border-[#B57EDC]";
const buttonClass = "rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9]";

export default function FulfillmentCenter() {
  const { lang, isRTL } = useLanguage();
  const ar = lang === "ar";
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<Tab>("payments");
  const [paymentForm, setPaymentForm] = useState({ orderId: "", orderNumber: "", amount: "0", method: "manual", status: "pending" as const });
  const [providerForm, setProviderForm] = useState({ name: "", phone: "", website: "", trackingUrlTemplate: "", baseFee: "0" });
  const [shipmentForm, setShipmentForm] = useState({ orderId: "", providerId: "", trackingNumber: "", status: "pending" as const, shippingCost: "0" });
  const [invoiceForm, setInvoiceForm] = useState({ orderId: "", taxAmount: "0" });
  const [returnForm, setReturnForm] = useState({ orderNumber: "", customerPhone: "", customerName: "", reason: "", refundAmount: "0" });

  const payments = trpc.admin.listPaymentTransactions.useQuery({ limit: 100 }, { retry: false });
  const providers = trpc.admin.listShippingProviders.useQuery(undefined, { retry: false });
  const shipments = trpc.admin.listShipments.useQuery({ limit: 100 }, { retry: false });
  const invoices = trpc.admin.listInvoices.useQuery(undefined, { retry: false });
  const returns = trpc.admin.listReturnRequests.useQuery(undefined, { retry: false });

  const createPayment = trpc.admin.createManualPaymentTransaction.useMutation({
    onSuccess: async () => { toast.success(ar ? "تم تسجيل عملية الدفع" : "Payment saved"); await utils.admin.listPaymentTransactions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const createProvider = trpc.admin.createShippingProvider.useMutation({
    onSuccess: async () => { toast.success(ar ? "تم إضافة شركة الشحن" : "Provider added"); await utils.admin.listShippingProviders.invalidate(); setProviderForm({ name: "", phone: "", website: "", trackingUrlTemplate: "", baseFee: "0" }); },
    onError: (err) => toast.error(err.message),
  });
  const createShipment = trpc.admin.createShipment.useMutation({
    onSuccess: async () => { toast.success(ar ? "تم إنشاء الشحنة" : "Shipment created"); await utils.admin.listShipments.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const createInvoice = trpc.admin.createInvoiceForOrder.useMutation({
    onSuccess: async () => { toast.success(ar ? "تم إنشاء الفاتورة" : "Invoice created"); await utils.admin.listInvoices.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const createReturn = trpc.admin.createReturnRequestAdmin.useMutation({
    onSuccess: async () => { toast.success(ar ? "تم تسجيل طلب الاسترجاع" : "Return request saved"); await utils.admin.listReturnRequests.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className={`min-h-screen bg-[#F8F4FC] p-6 lg:p-8 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A0533]">{ar ? "مركز التشغيل التجاري" : "Commerce Fulfillment Center"}</h1>
        <p className="text-sm text-[#6F6178]">{ar ? "الدفع والشحن والفواتير والاسترجاع" : "Payments, shipping, invoices, and returns"}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {([
          ["payments", ar ? "الدفع" : "Payments", CreditCard],
          ["shipping", ar ? "الشحن" : "Shipping", Truck],
          ["invoices", ar ? "الفواتير" : "Invoices", FileText],
          ["returns", ar ? "الاسترجاع" : "Returns", Undo2],
        ] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${tab === key ? "bg-[#7C3AED] text-white" : "bg-white text-[#6F6178]"}`}><Icon className="h-4 w-4" />{label}</button>
        ))}
      </div>

      {tab === "payments" && (
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); createPayment.mutate({ orderId: paymentForm.orderId ? Number(paymentForm.orderId) : undefined, orderNumber: paymentForm.orderNumber || undefined, amount: paymentForm.amount, method: paymentForm.method, status: paymentForm.status }); }} className="rounded-2xl border bg-white p-5 space-y-3">
            <h2 className="font-bold text-[#1A0533]">{ar ? "تسجيل دفع" : "Record payment"}</h2>
            <input className={inputClass} placeholder={ar ? "رقم الطلب الداخلي" : "Order ID"} value={paymentForm.orderId} onChange={(e) => setPaymentForm({ ...paymentForm, orderId: e.target.value })} />
            <input className={inputClass} placeholder={ar ? "رقم الطلب" : "Order number"} value={paymentForm.orderNumber} onChange={(e) => setPaymentForm({ ...paymentForm, orderNumber: e.target.value })} />
            <input className={inputClass} placeholder={ar ? "المبلغ" : "Amount"} value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
            <select className={inputClass} value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as typeof paymentForm.status })}><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
            <button className={buttonClass} disabled={createPayment.isPending}>{createPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : ar ? "حفظ" : "Save"}</button>
          </form>
          <DataTable rows={payments.data ?? []} loading={payments.isLoading} ar={ar} />
        </section>
      )}

      {tab === "shipping" && (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={(e) => { e.preventDefault(); createProvider.mutate(providerForm); }} className="rounded-2xl border bg-white p-5 space-y-3">
              <h2 className="font-bold text-[#1A0533]">{ar ? "إضافة شركة شحن" : "Add shipping provider"}</h2>
              <input className={inputClass} required placeholder={ar ? "اسم الشركة" : "Provider name"} value={providerForm.name} onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })} />
              <input className={inputClass} placeholder={ar ? "الهاتف" : "Phone"} value={providerForm.phone} onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })} />
              <input className={inputClass} placeholder={ar ? "رابط التتبع" : "Tracking URL template"} value={providerForm.trackingUrlTemplate} onChange={(e) => setProviderForm({ ...providerForm, trackingUrlTemplate: e.target.value })} />
              <button className={buttonClass}>{ar ? "إضافة" : "Add"}</button>
            </form>
            <form onSubmit={(e) => { e.preventDefault(); createShipment.mutate({ orderId: Number(shipmentForm.orderId), providerId: shipmentForm.providerId ? Number(shipmentForm.providerId) : undefined, trackingNumber: shipmentForm.trackingNumber || undefined, status: shipmentForm.status, shippingCost: shipmentForm.shippingCost }); }} className="rounded-2xl border bg-white p-5 space-y-3">
              <h2 className="font-bold text-[#1A0533]">{ar ? "إنشاء شحنة" : "Create shipment"}</h2>
              <input className={inputClass} required placeholder="Order ID" value={shipmentForm.orderId} onChange={(e) => setShipmentForm({ ...shipmentForm, orderId: e.target.value })} />
              <input className={inputClass} placeholder="Provider ID" value={shipmentForm.providerId} onChange={(e) => setShipmentForm({ ...shipmentForm, providerId: e.target.value })} />
              <input className={inputClass} placeholder={ar ? "رقم التتبع" : "Tracking number"} value={shipmentForm.trackingNumber} onChange={(e) => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })} />
              <select className={inputClass} value={shipmentForm.status} onChange={(e) => setShipmentForm({ ...shipmentForm, status: e.target.value as typeof shipmentForm.status })}><option value="pending">Pending</option><option value="ready">Ready</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="returned">Returned</option></select>
              <button className={buttonClass}>{ar ? "إنشاء" : "Create"}</button>
            </form>
          </div>
          <h3 className="font-bold text-[#1A0533]">{ar ? "شركات الشحن" : "Providers"}</h3><DataTable rows={providers.data ?? []} loading={providers.isLoading} ar={ar} />
          <h3 className="font-bold text-[#1A0533]">{ar ? "الشحنات" : "Shipments"}</h3><DataTable rows={shipments.data ?? []} loading={shipments.isLoading} ar={ar} />
        </section>
      )}

      {tab === "invoices" && (
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); createInvoice.mutate({ orderId: Number(invoiceForm.orderId), taxAmount: invoiceForm.taxAmount }); }} className="rounded-2xl border bg-white p-5 space-y-3">
            <h2 className="font-bold text-[#1A0533]">{ar ? "إنشاء فاتورة" : "Create invoice"}</h2>
            <input className={inputClass} required placeholder="Order ID" value={invoiceForm.orderId} onChange={(e) => setInvoiceForm({ ...invoiceForm, orderId: e.target.value })} />
            <input className={inputClass} placeholder={ar ? "الضريبة" : "Tax"} value={invoiceForm.taxAmount} onChange={(e) => setInvoiceForm({ ...invoiceForm, taxAmount: e.target.value })} />
            <button className={buttonClass}>{ar ? "إنشاء" : "Create"}</button>
          </form>
          <DataTable rows={invoices.data ?? []} loading={invoices.isLoading} ar={ar} />
        </section>
      )}

      {tab === "returns" && (
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={(e) => { e.preventDefault(); createReturn.mutate(returnForm); }} className="rounded-2xl border bg-white p-5 space-y-3">
            <h2 className="font-bold text-[#1A0533]">{ar ? "طلب استرجاع" : "Return request"}</h2>
            <input className={inputClass} required placeholder={ar ? "رقم الطلب" : "Order number"} value={returnForm.orderNumber} onChange={(e) => setReturnForm({ ...returnForm, orderNumber: e.target.value })} />
            <input className={inputClass} required placeholder={ar ? "هاتف العميل" : "Customer phone"} value={returnForm.customerPhone} onChange={(e) => setReturnForm({ ...returnForm, customerPhone: e.target.value })} />
            <input className={inputClass} placeholder={ar ? "اسم العميل" : "Customer name"} value={returnForm.customerName} onChange={(e) => setReturnForm({ ...returnForm, customerName: e.target.value })} />
            <textarea className={inputClass} required placeholder={ar ? "سبب الاسترجاع" : "Reason"} value={returnForm.reason} onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })} />
            <button className={buttonClass}>{ar ? "حفظ" : "Save"}</button>
          </form>
          <DataTable rows={returns.data ?? []} loading={returns.isLoading} ar={ar} />
        </section>
      )}
    </div>
  );
}

function DataTable({ rows, loading, ar }: { rows: unknown[]; loading: boolean; ar: boolean }) {
  const normalized = rows as Record<string, unknown>[];
  const keys = normalized[0] ? Object.keys(normalized[0]).slice(0, 8) : [];
  return <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b bg-[#FAFAFA] text-xs text-[#9CA3AF]">{keys.map((k) => <th key={k} className="px-4 py-3 text-start">{k}</th>)}</tr></thead><tbody>{loading && <tr><td className="p-8 text-center" colSpan={Math.max(keys.length, 1)}>{ar ? "جاري التحميل..." : "Loading..."}</td></tr>}{normalized.map((row, i) => <tr key={i} className="border-b hover:bg-[#FAFAFA]">{keys.map((k) => <td key={k} className="px-4 py-3 text-[#6F6178]">{String(row[k] ?? "-").slice(0, 80)}</td>)}</tr>)}{!loading && normalized.length === 0 && <tr><td className="p-8 text-center text-[#6F6178]" colSpan={Math.max(keys.length, 1)}>{ar ? "لا توجد بيانات" : "No data"}</td></tr>}</tbody></table></div></div>;
}
