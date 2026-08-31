import { getDb } from "../api/queries/connection";
import { eq, inArray, sql } from "drizzle-orm";
import { PRIMARY_PRODUCT_CATEGORY } from "../contracts/product-category";
import { SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE } from "../contracts/sale-products";
import {
  CARE_SALE_CATEGORIES,
  CARE_SALE_PRICE,
  CARE_SALE_PRODUCTS,
} from "../contracts/care-sale-products";
import {
  products,
  categories,
  faqs,
  storeSettings,
  paymentSettings,
  shippingSettings,
} from "./schema";

function buildSingleRollOnSaleProductRows(categoryId: number) {
  return SINGLE_ROLL_ON_SALE_PRODUCTS_WITH_PRICE.map(product => ({
    nameEn: `Hi Line Deodorant Roll On - ${product.scent} - Single Piece (30% Sale)`,
    nameAr: `هاي لاين رول أون مزيل عرق - ${product.scentAr} - قطعة واحدة (خصم 30%)`,
    slug: product.slug,
    descriptionEn: `One Hi Line Deodorant Roll On with ${product.scent} and up to 48-hour freshness. This offer contains one 60ml piece.`,
    descriptionAr: `قطعة واحدة من هاي لاين رول أون مزيل العرق ${product.scentAr} بحجم 60 مل، مع انتعاش يصل إلى 48 ساعة.`,
    shortDescriptionEn: `Single 60ml roll-on in ${product.scent}, now 30% off.`,
    shortDescriptionAr: `قطعة واحدة رول أون 60 مل ${product.scentAr} بخصم 30%.`,
    price: product.price,
    salePrice: product.salePrice,
    stock: 100,
    sku: product.sku,
    scent: product.scent,
    scentColor: product.scentColor,
    categoryId,
    images: [product.image],
    benefits: [
      "One 60ml piece",
      "Up to 48 hours freshness",
      "0% Aluminum formula",
      "Lebanese Formula",
    ],
    benefitsAr: [
      "قطعة واحدة بحجم 60 مل",
      "انتعاش يصل إلى 48 ساعة",
      "تركيبة خالية من الألمنيوم",
      "تركيبة لبنانية",
    ],
    usageInstructions: "Apply to clean, dry underarms and allow to dry before dressing.",
    usageInstructionsAr: "يُستخدم على إبطين نظيفين وجافين ويُترك حتى يجف قبل ارتداء الملابس.",
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    seoTitle: `Hi Line ${product.scent} Roll On Single Piece - 30% Sale`,
    seoDescription: `Shop one 60ml Hi Line ${product.scent} Deodorant Roll On for EGP 199.50 instead of EGP 285.`,
  }));
}

export async function seedSingleRollOnSaleProducts() {
  const db = getDb();
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, PRIMARY_PRODUCT_CATEGORY.slug))
    .limit(1);

  if (!category) {
    throw new Error(`Missing product category: ${PRIMARY_PRODUCT_CATEGORY.slug}`);
  }

  await db
    .insert(products)
    .values(buildSingleRollOnSaleProductRows(category.id))
    .onDuplicateKeyUpdate({ set: { id: sql`${products.id}` } });
}

export async function seedCareSaleProducts() {
  const db = getDb();

  await db
    .insert(categories)
    .values(CARE_SALE_CATEGORIES.map(category => ({ ...category, isActive: true })))
    .onDuplicateKeyUpdate({
      set: { id: sql`${categories.id}` },
    });

  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories)
    .where(inArray(categories.slug, CARE_SALE_CATEGORIES.map(category => category.slug)));
  const categoryIds = new Map(categoryRows.map(category => [category.slug, category.id]));

  for (const product of CARE_SALE_PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing product category: ${product.categorySlug}`);

    const isCleanser = product.categorySlug === "facial-care";
    const row = {
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      slug: product.slug,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      shortDescriptionEn: isCleanser
        ? "Deep cleansing and makeup removal for oily and combination skin."
        : `${product.scent} body mist with instant, long-lasting freshness.`,
      shortDescriptionAr: isCleanser
        ? "تنظيف عميق وإزالة للمكياج للبشرة الدهنية والمختلطة."
        : `بادي ميست ${product.scentAr} لانتعاش فوري يدوم طويلًا.`,
      price: CARE_SALE_PRICE.price,
      salePrice: CARE_SALE_PRICE.salePrice,
      stock: 100,
      sku: product.sku,
      barcode: product.barcode,
      scent: product.scent,
      scentColor: product.scentColor,
      categoryId,
      images: [product.image],
      benefits: isCleanser
        ? ["Deep cleansing", "Makeup removal", "For oily and combination skin"]
        : ["Instant freshness", "Long-lasting fragrance", "Silky skin feel", "250 ml"],
      benefitsAr: isCleanser
        ? ["تنظيف عميق", "إزالة المكياج", "للبشرة الدهنية والمختلطة"]
        : ["انتعاش فوري", "رائحة تدوم طويلًا", "ملمس ناعم كالحرير", "250 مل"],
      usageInstructions: product.usageInstructions,
      usageInstructionsAr: product.usageInstructionsAr,
      isActive: true,
      isFeatured: true,
      isBestSeller: false,
      seoTitle: `${product.nameEn} - 25% Off`,
      seoDescription: `${product.descriptionEn} Now EGP 224 instead of EGP 299.`,
    };

    await db.insert(products).values(row)
      .onDuplicateKeyUpdate({ set: { id: sql`${products.id}` } });
  }
}

export async function seed() {
  const db = getDb();

  // The filesystem marker can be lost during migration or deployment. The
  // database remains authoritative: never reset an existing or partial store.
  const existingRows = await Promise.all([
    db.select({ id: products.id }).from(products).limit(1),
    db.select({ id: categories.id }).from(categories).limit(1),
    db.select({ id: storeSettings.id }).from(storeSettings).limit(1),
    db.select({ id: shippingSettings.id }).from(shippingSettings).limit(1),
    db.select({ id: paymentSettings.id }).from(paymentSettings).limit(1),
    db.select({ id: faqs.id }).from(faqs).limit(1),
  ]);
  if (existingRows.some(rows => rows.length > 0)) {
    console.log("Existing store detected; keeping admin-managed data unchanged.");
    return;
  }

  console.log("Seeding database...");

  // Seed categories
  await db
    .insert(categories)
    .values([
      {
        nameEn: "All Products",
        nameAr: "كل المنتجات",
        slug: "all-products",
        sortOrder: 0,
      },
      {
        nameEn: "Deodorant Roll On",
        nameAr: "رول أون مزيل عرق",
        slug: "deodorant-roll-on",
        sortOrder: 1,
      },
      {
        nameEn: "Fresh Scents",
        nameAr: "روائح منعشة",
        slug: "fresh-scents",
        sortOrder: 2,
      },
      {
        nameEn: "Fruity Scents",
        nameAr: "روائح فواكه",
        slug: "fruity-scents",
        sortOrder: 3,
      },
      {
        nameEn: "Fragrance Free",
        nameAr: "بدون عطر",
        slug: "fragrance-free",
        sortOrder: 4,
      },
      {
        nameEn: "Summer Collection",
        nameAr: "مجموعة الصيف",
        slug: "summer-collection",
        sortOrder: 5,
      },
      {
        nameEn: "Best Sellers",
        nameAr: "الأكثر مبيعًا",
        slug: "best-sellers",
        sortOrder: 6,
      },
      {
        nameEn: "Offers",
        nameAr: "العروض",
        slug: "offers",
        sortOrder: 7,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Categories seeded");

  // Seed products
  await db
    .insert(products)
    .values([
      {
        nameEn: "Hi Line Deodorant Roll On - Tropical Breeze",
        nameAr: "هاي لاين رول أون مزيل عرق - تروبيكال بريز",
        slug: "hi-line-deodorant-roll-on-tropical-breeze",
        descriptionEn:
          "Experience the refreshing sensation of Tropical Breeze. This Hi Line Deodorant Roll On delivers up to 48 hours of protection with our exclusive Lebanese Formula. 0% Aluminum for a clean, healthy care routine. The tropical scent transports you to paradise with every application.",
        descriptionAr:
          "جرب الإحساس المنعش لتروبيكال بريز. يقدم هاي لاين رول أون مزيل العرق حماية تصل إلى 48 ساعة بفضل تركيبتنا اللبنانية الحصرية. 0% ألمنيوم لروتين نظيف وصحي. الرائحة الاستوائية تنقلك إلى الجنة مع كل استخدام.",
        shortDescriptionEn: "Up to 48h protection with tropical freshness",
        shortDescriptionAr: "حماية تصل إلى 48 ساعة بانتعاش استوائي",
        price: "570.00",
        salePrice: "285.00",
        stock: 100,
        sku: "HL-TB-001",
        scent: "Tropical Breeze",
        scentColor: "#159C73",
        categoryId: 2,
        images: ["/products/hi-line-tropical-breeze.webp"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "انتعاش يصل إلى 48 ساعة",
          "تركيبة خالية من الألمنيوم",
          "تركيبة لبنانية",
          "تطبيق سلس بالرول",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Aloe Vera Extract",
        ingredientsAr:
          "ماء، بروبيلين جليكول، جليسرين، عطر، ستيرات الصوديوم، سيتيل الكحول، ستيريل الكحول، توكوفيريل أسيتات (فيتامين هـ)، مستخلص الألوفيرا",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "رج جيداً قبل الاستخدام. ضع على الإبطين النظيفين والجافين. اترك حتى يجف قبل ارتداء الملابس. للحصول على أفضل النتائج، استخدم يومياً.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Tropical Breeze - 48h Protection",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Tropical Breeze. 48 hours protection, 0% Aluminum, Lebanese Formula. Fresh tropical scent for daily confidence.",
        relatedProducts: [2, 3, 4],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Voyage",
        nameAr: "هاي لاين رول أون مزيل عرق - فوياج",
        slug: "hi-line-deodorant-roll-on-voyage",
        descriptionEn:
          "Set sail with Voyage. This sophisticated scent combines oceanic freshness with our trusted Lebanese Formula. Enjoy up to 48 hours of aluminum-free protection that keeps you feeling fresh through every adventure.",
        descriptionAr:
          "انطلق في رحلة مع فوياج. تجمع هذه الرائحة المتطورة بين انتعاش المحيط وتركيبتنا اللبنانية الموثوقة. استمتع بحماية خالية من الألمنيوم تصل إلى 48 ساعة تبقيك منتعشاً خلال كل مغامرة.",
        shortDescriptionEn: "Ocean-fresh protection for the modern explorer",
        shortDescriptionAr: "حماية منتعشة كالمحيط للمستكشف العصري",
        price: "570.00",
        salePrice: "285.00",
        stock: 100,
        sku: "HL-VG-002",
        scent: "Voyage",
        scentColor: "#1E6D9E",
        categoryId: 2,
        images: ["/products/hi-line-voyage.webp"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "انتعاش يصل إلى 48 ساعة",
          "تركيبة خالية من الألمنيوم",
          "تركيبة لبنانية",
          "تطبيق سلس بالرول",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Sea Salt Extract",
        ingredientsAr:
          "ماء، بروبيلين جليكول، جليسرين، عطر، ستيرات الصوديوم، سيتيل الكحول، ستيريل الكحول، توكوفيريل أسيتات (فيتامين هـ)، مستخلص ملح البحر",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "رج جيداً قبل الاستخدام. ضع على الإبطين النظيفين والجافين. اترك حتى يجف قبل ارتداء الملابس. للحصول على أفضل النتائج، استخدم يومياً.",
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        seoTitle: "Hi Line Deodorant Roll On Voyage - Ocean Fresh Scent",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Voyage. Ocean fresh scent with 48h protection. 0% Aluminum, Lebanese Formula. Perfect for daily freshness.",
        relatedProducts: [1, 3, 5],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Candy Pop",
        nameAr: "هاي لاين رول أون مزيل عرق - كاندي بوب",
        slug: "hi-line-deodorant-roll-on-candy-pop",
        descriptionEn:
          "Sweet, playful, and irresistibly fresh. Candy Pop brings a burst of joyful fragrance with our signature Lebanese Formula. Up to 48 hours of aluminum-free protection wrapped in a delightful candy-inspired scent.",
        descriptionAr:
          "حلو، مرح، ومنعش بشكل لا يقاوم. تجلب كاندي بوب اندفاعة من العطر المبهج مع تركيبتنا اللبنانية المميزة. حماية خالية من الألمنيوم تصل إلى 48 ساعة مغلفة برائحة حلوى شهية.",
        shortDescriptionEn: "Playful sweetness with long-lasting freshness",
        shortDescriptionAr: "حلاوة مرحة مع انتعاش طويل الأمد",
        price: "570.00",
        salePrice: "285.00",
        stock: 100,
        sku: "HL-CP-003",
        scent: "Candy Pop",
        scentColor: "#C85BAA",
        categoryId: 2,
        images: ["/products/hi-line-candy-pop.webp"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "انتعاش يصل إلى 48 ساعة",
          "تركيبة خالية من الألمنيوم",
          "تركيبة لبنانية",
          "تطبيق سلس بالرول",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Berry Extract",
        ingredientsAr:
          "ماء، بروبيلين جليكول، جليسرين، عطر، ستيرات الصوديوم، سيتيل الكحول، ستيريل الكحول، توكوفيريل أسيتات (فيتامين هـ)، مستخلص التوت",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "رج جيداً قبل الاستخدام. ضع على الإبطين النظيفين والجافين. اترك حتى يجف قبل ارتداء الملابس. للحصول على أفضل النتائج، استخدم يومياً.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Candy Pop - Sweet Freshness",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Candy Pop. Sweet playful scent with 48h protection. 0% Aluminum, Lebanese Formula. Daily freshness guaranteed.",
        relatedProducts: [1, 2, 4],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Sweet Mango",
        nameAr: "هاي لاين رول أون مزيل عرق - سويت مانجو",
        slug: "hi-line-deodorant-roll-on-sweet-mango",
        descriptionEn:
          "Indulge in the tropical sweetness of Sweet Mango. This vibrant scent combines juicy mango notes with our proven Lebanese Formula for up to 48 hours of aluminum-free freshness. A summer favorite!",
        descriptionAr:
          "استمتاع بحلاوة المانجو الاستوائية مع سويت مانجو. تجمع هذه الرائحة النابضة بين نغمات المانجو العصيرية وتركيبتنا اللبنانية المثبتة لانتعاش خالي من الألمنيوم يصل إلى 48 ساعة. المفضل في الصيف!",
        shortDescriptionEn: "Tropical mango freshness for sunny days",
        shortDescriptionAr: "انتعاش المانجو الاستوائي لأيام مشمسة",
        price: "570.00",
        salePrice: "285.00",
        stock: 100,
        sku: "HL-SM-004",
        scent: "Sweet Mango",
        scentColor: "#F28A24",
        categoryId: 2,
        images: ["/products/hi-line-sweet-mango.webp"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Smooth roll-on application",
        ],
        benefitsAr: [
          "انتعاش يصل إلى 48 ساعة",
          "تركيبة خالية من الألمنيوم",
          "تركيبة لبنانية",
          "تطبيق سلس بالرول",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Fragrance, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Mango Extract",
        ingredientsAr:
          "ماء، بروبيلين جليكول، جليسرين، عطر، ستيرات الصوديوم، سيتيل الكحول، ستيريل الكحول، توكوفيريل أسيتات (فيتامين هـ)، مستخلص المانجو",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "رج جيداً قبل الاستخدام. ضع على الإبطين النظيفين والجافين. اترك حتى يجف قبل ارتداء الملابس. للحصول على أفضل النتائج، استخدم يومياً.",
        isActive: true,
        isFeatured: true,
        isBestSeller: false,
        seoTitle: "Hi Line Deodorant Roll On Sweet Mango - Tropical Freshness",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Sweet Mango. Tropical mango scent with 48h protection. 0% Aluminum, Lebanese Formula. Summer essential!",
        relatedProducts: [1, 3, 5],
      },
      {
        nameEn: "Hi Line Deodorant Roll On - Fragrance Free",
        nameAr: "هاي لاين رول أون مزيل عرق - بدون عطر",
        slug: "hi-line-deodorant-roll-on-fragrance-free",
        descriptionEn:
          "Pure protection without the scent. Our Fragrance Free formula delivers the same 48-hour protection and 0% Aluminum benefits in a clean, unscented formula. Perfect for sensitive skin and those who prefer no fragrance.",
        descriptionAr:
          "حماية نقية بدون رائحة. توفر تركيبتنا الخالية من العطر نفس الحماية لمدة 48 ساعة ونفس فوائد 0% ألمنيوم في تركيبة نظيفة خالية من الرائحة. أسلوب حياة خالي من العطر مناسب للبشرة الحساسة.",
        shortDescriptionEn: "Gentle protection for sensitive skin",
        shortDescriptionAr: "حماية لطيفة للبشرة الحساسة",
        price: "570.00",
        salePrice: "285.00",
        stock: 100,
        sku: "HL-FF-005",
        scent: "Fragrance Free",
        scentColor: "#222222",
        categoryId: 2,
        images: ["/products/fragrance-free.jpg"],
        benefits: [
          "Up to 48 hours freshness",
          "0% Aluminum formula",
          "Lebanese Formula",
          "Ideal for sensitive skin",
        ],
        benefitsAr: [
          "انتعاش يصل إلى 48 ساعة",
          "تركيبة خالية من الألمنيوم",
          "تركيبة لبنانية",
          "مثالية للبشرة الحساسة",
        ],
        ingredients:
          "Aqua, Propylene Glycol, Glycerin, Sodium Stearate, Cetyl Alcohol, Stearyl Alcohol, Tocopheryl Acetate (Vitamin E), Chamomile Extract",
        ingredientsAr:
          "ماء، بروبيلين جليكول، جليسرين، ستيرات الصوديوم، سيتيل الكحول، ستيريل الكحول، توكوفيريل أسيتات (فيتامين هـ)، مستخلص البابونج",
        usageInstructions:
          "Shake well before use. Apply to clean, dry underarms. Allow to dry before dressing. For best results, use daily.",
        usageInstructionsAr:
          "رج جيداً قبل الاستخدام. ضع على الإبطين النظيفين والجافين. اترك حتى يجف قبل ارتداء الملابس. للحصول على أفضل النتائج، استخدم يومياً.",
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        seoTitle: "Hi Line Deodorant Roll On Fragrance Free - Sensitive Skin",
        seoDescription:
          "Buy Hi Line Deodorant Roll On Fragrance Free. Unscented, 0% Aluminum, Lebanese Formula. Perfect for sensitive skin. 48h protection.",
        relatedProducts: [1, 2, 3],
      },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Products seeded");

  await seedSingleRollOnSaleProducts();
  console.log("Single-piece sale products seeded");

  await seedCareSaleProducts();
  console.log("Body mist and facial-care products seeded");

  // Seed FAQs
  await db
    .insert(faqs)
    .values([
      {
        questionEn: "How long does the protection last?",
        questionAr: "كم تستمر الحماية؟",
        answerEn:
          "Hi Line provides up to 48 hours of freshness and protection with a single application.",
        answerAr:
          "يوفر هاي لاين حتى 48 ساعة من الانتعاش والحماية بتطبيق واحد.",
        category: "product",
        sortOrder: 1,
      },
      {
        questionEn: "Is it safe for sensitive skin?",
        questionAr: "هل هو آمن للبشرة الحساسة؟",
        answerEn:
          "Yes, our 0% Aluminum formula is designed for daily use on all skin types. We also offer a Fragrance Free option specifically for sensitive skin.",
        answerAr:
          "نعم، تركيبتنا الخالية من الألمنيوم مصممة للاستخدام اليومي على جميع أنواع البشرة. نقدم أيضًا خيارًا خالٍ من العطر مخصصًا للبشرة الحساسة.",
        category: "product",
        sortOrder: 2,
      },
      {
        questionEn: "What sizes are available?",
        questionAr: "ما هي الأحجام المتوفرة؟",
        answerEn: "Currently available in 60ml Roll On bottles.",
        answerAr: "متاح حاليًا في زجاجات رول أون 60 مل.",
        category: "product",
        sortOrder: 3,
      },
      {
        questionEn: "How do I place an order?",
        questionAr: "كيف أقوم بطلب منتج؟",
        answerEn:
          "You can order through our website by adding products to cart and checking out, or directly via WhatsApp for quick delivery.",
        answerAr:
          "يمكنك الطلب من خلال موقعنا الإلكتروني بإضافة المنتجات إلى سلة التسوق وإتمام الشراء، أو مباشرة عبر الواتساب للتوصيل السريع.",
        category: "ordering",
        sortOrder: 4,
      },
      {
        questionEn: "What payment methods do you accept?",
        questionAr: "ما هي طرق الدفع المتاحة؟",
        answerEn:
          "Cash on Delivery is currently the only available payment method.",
        answerAr:
          "نقبل الدفع عند الاستلام، فودافون كاش، إنستا باي، والتحويل البنكي.",
        category: "ordering",
        sortOrder: 5,
      },
      {
        questionEn: "How much is shipping?",
        questionAr: "كم تكلفة الشحن؟",
        answerEn:
          "Shipping fees vary by governorate, typically between EGP 45-65. Free shipping available on orders over EGP 500.",
        answerAr:
          "تختلف رسوم الشحن حسب المحافظة، عادة بين 45-65 جنيه. الشحن المجاني متاح للطلبات التي تزيد عن 500 جنيه.",
        category: "shipping",
        sortOrder: 6,
      },
      {
        questionEn: "How long does delivery take?",
        questionAr: "كم تستغرق عملية التوصيل؟",
        answerEn:
          "Delivery typically takes 2-5 business days depending on your location in Egypt.",
        answerAr:
          "يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل حسب موقعك في مصر.",
        category: "shipping",
        sortOrder: 7,
      },
      {
        questionEn: "Can I return or exchange a product?",
        questionAr: "هل يمكنني إرجاع أو استبدال المنتج؟",
        answerEn:
          "Yes, we accept returns within 14 days of delivery if the product is unused and in original packaging.",
        answerAr:
          "نعم، نقبل الإرجاع خلال 14 يومًا من التوصيل إذا كان المنتج غير مستخدم وفي عبوته الأصلية.",
        category: "returns",
        sortOrder: 8,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { isActive: true },
    });

  console.log("FAQs seeded");

  // Seed store settings
  await db
    .insert(storeSettings)
    .values([
      { key: "store_name_en", value: "Hi Line Pro Care" },
      { key: "store_name_ar", value: "هاي لاين برو كير" },
      { key: "tagline_en", value: "Freshness that fits every mood" },
      { key: "tagline_ar", value: "انتعاش يناسب كل مزاج" },
      { key: "whatsapp_number", value: "+201223863092" },
      { key: "phone_number", value: "+201223863092" },
      { key: "facebook_url", value: "https://www.facebook.com/profile.php?id=61587944979845" },
      { key: "instagram_url", value: "" },
      { key: "logo_url", value: "/brand/logo.jpg" },
      { key: "currency", value: "EGP" },
      { key: "default_language", value: "en" },
      { key: "meta_title_en", value: "Hi Line Pro Care - Deodorant Roll On | Freshness That Fits Every Mood" },
      { key: "meta_description_en", value: "Discover Hi Line Deodorant Roll On. 48h protection, 0% Aluminum, Lebanese Formula. 5 amazing scents. Shop now and experience the freshness!" },
      { key: "meta_title_ar", value: "هاي لاين برو كير - رول أون مزيل عرق | انتعاش يناسب كل مزاج" },
      { key: "meta_description_ar", value: "اكتشف هاي لاين رول أون مزيل العرق. حماية 48 ساعة، 0% ألمنيوم، تركيبة لبنانية. 5 روائح رائعة. تسوق الآن واختبر الانتعاش!" },
      { key: "free_shipping_threshold", value: "" },
      { key: "announcement_text_en", value: "50% OFF Hi Line Roll On Collection" },
      { key: "announcement_text_ar", value: "خصم 50% على مجموعة Hi Line Roll On" },
      { key: "primary_color", value: "#4B1C71" },
      { key: "secondary_color", value: "#B57EDC" },
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Store settings seeded");

  // Seed payment settings
  await db
    .insert(paymentSettings)
    .values([
      {
        method: "cash_on_delivery",
        isEnabled: true,
        displayName: "Cash on Delivery",
        displayNameAr: "الدفع عند الاستلام",
        sortOrder: 1,
      },
      {
        method: "vodafone_cash",
        isEnabled: false,
        displayName: "Vodafone Cash",
        displayNameAr: "فودافون كاش",
        accountNumber: "+201223863092",
        accountName: "Hi Line Pro Care",
        instructions: "Send the payment, then send the receipt via WhatsApp for seller approval",
        instructionsAr: "حوّل المبلغ ثم أرسل الإيصال عبر واتساب لاعتماده من البائع",
        sortOrder: 2,
      },
      {
        method: "instapay",
        isEnabled: false,
        displayName: "InstaPay",
        displayNameAr: "إنستا باي",
        accountNumber: "hiline@instapay",
        accountName: "Hi Line Pro Care",
        instructions: "Send the payment, then send the receipt via WhatsApp for seller approval",
        instructionsAr: "حوّل المبلغ ثم أرسل الإيصال عبر واتساب لاعتماده من البائع",
        sortOrder: 3,
      },
      {
        method: "bank_transfer",
        isEnabled: false,
        displayName: "Bank Transfer",
        displayNameAr: "التحويل البنكي",
        sortOrder: 4,
      },
    ])
    .onDuplicateKeyUpdate({
      set: { isEnabled: sql`VALUES(is_enabled)` },
    });

  await db
    .update(paymentSettings)
    .set({ isEnabled: false })
    .where(inArray(paymentSettings.method, ["bank_transfer", "paymob"]));

  console.log("Payment settings seeded");

  // Seed shipping settings for Egyptian governorates
  await db.delete(shippingSettings);
  await db
    .insert(shippingSettings)
    .values([
      { governorate: "Cairo", governorateAr: "القاهرة", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Giza", governorateAr: "الجيزة", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Alexandria", governorateAr: "الإسكندرية", baseFee: "55.00", estimatedDays: "3-4 days" },
      { governorate: "Sharqia", governorateAr: "الشرقية", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Dakahlia", governorateAr: "الدقهلية", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Beheira", governorateAr: "البحيرة", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Gharbia", governorateAr: "الغربية", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Kafr El Sheikh", governorateAr: "كفر الشيخ", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Monufia", governorateAr: "المنوفية", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Qalyubia", governorateAr: "القليوبية", baseFee: "45.00", estimatedDays: "2-3 days" },
      { governorate: "Damietta", governorateAr: "دمياط", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Port Said", governorateAr: "بورسعيد", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Ismailia", governorateAr: "الإسماعيلية", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Suez", governorateAr: "السويس", baseFee: "50.00", estimatedDays: "3-4 days" },
      { governorate: "Fayoum", governorateAr: "الفيوم", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Beni Suef", governorateAr: "بني سويف", baseFee: "55.00", estimatedDays: "3-5 days" },
      { governorate: "Minya", governorateAr: "المنيا", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Assiut", governorateAr: "أسيوط", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Sohag", governorateAr: "سوهاج", baseFee: "60.00", estimatedDays: "4-5 days" },
      { governorate: "Qena", governorateAr: "قنا", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Luxor", governorateAr: "الأقصر", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Aswan", governorateAr: "أسوان", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Red Sea", governorateAr: "البحر الأحمر", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "North Sinai", governorateAr: "شمال سيناء", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "South Sinai", governorateAr: "جنوب سيناء", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "Matrouh", governorateAr: "مطروح", baseFee: "65.00", estimatedDays: "4-5 days" },
      { governorate: "New Valley", governorateAr: "الوادي الجديد", baseFee: "65.00", estimatedDays: "4-5 days" },
    ])
    .onDuplicateKeyUpdate({
      set: { isActive: true },
    });

  console.log("Shipping settings seeded");
  console.log("Database seeding complete!");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  seed().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

