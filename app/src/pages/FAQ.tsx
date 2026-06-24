import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

const categories = [
  { key: "all", labelEn: "All", labelAr: "الكل" },
  { key: "product", labelEn: "Product", labelAr: "منتج" },
  { key: "ordering", labelEn: "Ordering", labelAr: "طلب" },
  { key: "shipping", labelEn: "Shipping", labelAr: "شحن" },
  { key: "returns", labelEn: "Returns", labelAr: "إرجاع" },
];

export default function FAQ() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: faqs, isLoading } = trpc.store.getFaqs.useQuery();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs =
    faqs?.filter(
      (faq) => activeCategory === "all" || faq.category === activeCategory
    ) || [];

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      {/* Header */}
      <div
        className="pt-32 pb-20"
        style={{
          background: "linear-gradient(180deg, rgba(181,126,220,0.22) 0%, white 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#4B1C71] mb-4">
            {lang === "ar"
              ? "الأسئلة الشائعة"
              : "Frequently Asked Questions"}
          </h1>
          <p className="text-[#6F6178]">
            {lang === "ar"
              ? "إجابات على الأسئلة الأكثر شيوعاً"
              : "Answers to the most common questions"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-[#B57EDC] text-[#4B1C71]"
                  : "bg-[#F7ECFF] text-[#6F6178] hover:bg-[#B57EDC]/20"
              }`}
            >
              {lang === "ar" ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#F7ECFF] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-[#E7D8F1] overflow-hidden">
                <button
                  onClick={() =>
                    setOpenFaq(openFaq === faq.id ? null : faq.id)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-sm sm:text-base font-medium text-[#4B1C71] pr-4">
                    {lang === "ar" ? faq.questionAr : faq.questionEn}
                  </span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-[#8D7A97] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8D7A97] shrink-0" />
                  )}
                </button>
                {openFaq === faq.id && (
                  <div className="px-5 pb-5">
                    <p className="text-sm sm:text-base text-[#6F6178] leading-relaxed">
                      {lang === "ar" ? faq.answerAr : faq.answerEn}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-10 text-center p-8 bg-[#F7ECFF] rounded-2xl">
          <p className="text-[#6F6178] mb-4">
            {lang === "ar"
              ? "لم تجب إجابتك؟ تواصل معنا مباشرة"
              : "Didn't find your answer? Contact us directly"}
          </p>
          <a
            href="https://wa.me/201223863092"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {t.chatOnWhatsApp}
          </a>
        </div>
      </div>
    </div>
  );
}
