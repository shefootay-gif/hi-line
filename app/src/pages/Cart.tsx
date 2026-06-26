import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { useCart } from "@/hooks/useCart";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, Minus, Plus, Trash2, MessageCircle } from "lucide-react";

export default function Cart() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { items, getTotalPrice, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const total = getTotalPrice();

  const handleWhatsAppCart = () => {
    const itemsList = items
      .map(
        (item) =>
          `- ${item.name} (${item.scent}) x${item.quantity} = ${(
            parseFloat(item.salePrice || item.price) * item.quantity
          ).toFixed(0)} EGP`
      )
      .join("\n");
    const message =
      lang === "ar"
        ? `مرحبًا، أريد تقديم طلب بالعناصر التالية:\n\n${itemsList}\n\nالإجمالي: ${total.toFixed(0)} ج.م\n\nالاسم: \nرقم الهاتف: \nالعنوان: `
        : `Hello! I want to place an order with the following items:\n\n${itemsList}\n\nTotal: ${total.toFixed(0)} EGP\n\nName: \nPhone: \nAddress: `;
    window.open(
      `https://wa.me/201223863092?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className={`pt-24 pb-16 min-h-screen ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#4B1C71] mb-2">{t.yourCart}</h1>
        <nav className="flex items-center gap-2 text-sm text-[#8D7A97] mb-8">
          <Link to="/" className="hover:text-[#B57EDC]">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <span className="text-[#4B1C71]">{t.cart}</span>
        </nav>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-[#E7D8F1] mx-auto mb-6" />
            <p className="text-lg text-[#6F6178] mb-6">{t.emptyCart}</p>
            <button
              onClick={() => navigate("/shop")}
              className="px-8 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors"
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-[#E7D8F1]"
                >
                  <img
                    src={item.image || "/products/hero-product.jpg"}
                    alt={lang === "ar" && item.nameAr ? item.nameAr : item.name}
                    className="w-24 h-24 object-contain rounded-xl bg-[#FCF8FF]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#4B1C71]">
                          {lang === "ar" && item.nameAr
                            ? item.nameAr
                            : item.name}
                        </h3>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white mt-1"
                          style={{
                            backgroundColor: item.scentColor || "#8D7A97",
                          }}
                        >
                          {item.scent}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7D8F1] hover:bg-[#F7ECFF]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= (item.stock ?? 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E7D8F1] hover:bg-[#F7ECFF] disabled:opacity-50 disabled:cursor-not-allowed"
                          title={item.quantity >= (item.stock ?? 1) ? (lang === "ar" ? "أقصى كمية متاحة" : "Max stock reached") : undefined}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-[#4B1C71]">
                        {(
                          parseFloat(item.salePrice || item.price) * item.quantity
                        ).toFixed(0)}{" "}
                        {t.currency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-2xl p-6 border border-[#E7D8F1] sticky top-24">
                <h2 className="text-lg font-semibold text-[#4B1C71] mb-6">
                  {t.orderSummary}
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6F6178]">{t.subtotal}</span>
                    <span className="font-medium">
                      {total.toFixed(0)} {t.currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6F6178]">{t.shipping}</span>
                    <span className="text-[#8D7A97]">
                      {t.calculatedAtCheckout}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#E7D8F1] pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}</span>
                    <span>
                      {total.toFixed(0)} {t.currency}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-4 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors mb-3"
                >
                  {t.proceedToCheckout}
                </button>
                <button
                  onClick={handleWhatsAppCart}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#25D366] text-[#25D366] font-medium rounded-xl hover:bg-[#25D366] hover:text-white transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.orderViaWhatsApp}
                </button>
                <button
                  onClick={() => navigate("/shop")}
                  className="w-full text-center py-3 text-sm text-[#6F6178] hover:text-[#4B1C71] transition-colors mt-2"
                >
                  {t.continueShopping}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
