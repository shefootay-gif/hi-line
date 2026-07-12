import { getDb } from "../api/queries/connection";
import { faqs } from "../db/schema";
import { eq } from "drizzle-orm";

async function fixFaqs() {
  const db = getDb();
  await db.delete(faqs);
  
  await db.insert(faqs).values([
    {
      questionEn: "How long does the protection last?",
      questionAr: "كم تستمر الحماية؟",
      answerEn: "Hi Line provides up to 48 hours of freshness and protection with a single application.",
      answerAr: "يوفر هاي لاين حتى 48 ساعة من الانتعاش والحماية بتطبيق واحد.",
      category: "product",
      sortOrder: 1,
    },
    {
      questionEn: "Is it safe for sensitive skin?",
      questionAr: "هل هو آمن للبشرة الحساسة؟",
      answerEn: "Yes, our 0% Aluminum formula is designed for daily use on all skin types. We also offer a Fragrance Free option specifically for sensitive skin.",
      answerAr: "نعم، تركيبتنا الخالية من الألمنيوم مصممة للاستخدام اليومي على جميع أنواع البشرة. كما نقدم خياراً خالياً من العطر مخصصاً للبشرة الحساسة.",
      category: "product",
      sortOrder: 2,
    },
    {
      questionEn: "What sizes are available?",
      questionAr: "ما هي الأحجام المتوفرة؟",
      answerEn: "Our roll-on deodorants come in a convenient 50ml size, perfect for daily use and travel-friendly.",
      answerAr: "تأتي مزيلات العرق الرول أون الخاصة بنا بحجم 50 مل المريح، مثالية للاستخدام اليومي ومناسبة للسفر.",
      category: "product",
      sortOrder: 3,
    },
    {
      questionEn: "Do you offer free shipping?",
      questionAr: "هل توفرون شحن مجاني؟",
      answerEn: "Yes, we offer free shipping on all orders over 500 EGP within Cairo and Alexandria.",
      answerAr: "نعم، نوفر شحن مجاني لجميع الطلبات التي تزيد عن 500 جنيه داخل القاهرة والإسكندرية.",
      category: "shipping",
      sortOrder: 4,
    }
  ]);
  
  console.log("FAQs fixed!");
  process.exit(0);
}

fixFaqs();
