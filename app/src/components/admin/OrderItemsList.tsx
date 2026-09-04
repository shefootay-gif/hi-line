export type AdminOrderItem = {
  id: number;
  productName: string;
  productNameAr: string | null;
  scent: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type Props = {
  items: AdminOrderItem[];
  lang: "ar" | "en";
  currency: string;
  compact?: boolean;
};

export function OrderItemsList({ items, lang, currency, compact = false }: Props) {
  if (items.length === 0) {
    return <p className="text-xs text-[#8D7A97]">
      {lang === "ar" ? "لا توجد تفاصيل منتجات مسجلة" : "No product details recorded"}
    </p>;
  }

  if (compact) {
    const first = items[0];
    const firstName = lang === "ar" && first.productNameAr ? first.productNameAr : first.productName;
    return <div className="min-w-44 max-w-64">
      <p className="text-xs font-medium text-[#4B1C71] line-clamp-2">
        {firstName} × {first.quantity}
      </p>
      {items.length > 1 && <p className="mt-1 text-[11px] text-[#8D7A97]">
        {lang === "ar" ? `+ ${items.length - 1} منتج آخر` : `+ ${items.length - 1} more item${items.length > 2 ? "s" : ""}`}
      </p>}
    </div>;
  }

  return <div className="space-y-2">
    {items.map(item => {
      const name = lang === "ar" && item.productNameAr ? item.productNameAr : item.productName;
      return <div key={item.id} className="rounded-xl border border-[#E7D8F1] bg-[#FCF8FF] p-3">
        <p className="text-sm font-semibold text-[#4B1C71]">{name}</p>
        {item.scent && <p className="mt-0.5 text-xs text-[#8D7A97]">{item.scent}</p>}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6F6178]">
          <span>{lang === "ar" ? "الكمية" : "Quantity"}: {item.quantity}</span>
          <span>{Number(item.unitPrice).toFixed(2)} {currency} × {item.quantity}</span>
          <strong className="text-[#4B1C71]">{Number(item.totalPrice).toFixed(2)} {currency}</strong>
        </div>
      </div>;
    })}
  </div>;
}
