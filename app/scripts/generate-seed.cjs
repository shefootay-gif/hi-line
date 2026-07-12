require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);

  const [categories] = await db.query("SELECT * FROM categories ORDER BY sort_order ASC");
  const [products] = await db.query("SELECT * FROM products");
  const [faqs] = await db.query("SELECT * FROM faqs ORDER BY sort_order ASC");
  const [storeSettings] = await db.query("SELECT * FROM store_settings");
  const [paymentSettings] = await db.query("SELECT * FROM payment_settings ORDER BY sort_order ASC");
  const [shippingSettings] = await db.query("SELECT * FROM shipping_settings");

  await db.end();

  const str = (val) => val === null ? "null" : JSON.stringify(val);
  const arr = (val) => val ? JSON.stringify(val) : "[]";

  const categoriesStr = categories.map(c => `      {
        nameEn: ${str(c.name_en)},
        nameAr: ${str(c.name_ar)},
        slug: ${str(c.slug)},
        sortOrder: ${c.sort_order},
      }`).join(",\n");

  const productsStr = products.map(p => `      {
        nameEn: ${str(p.name_en)},
        nameAr: ${str(p.name_ar)},
        slug: ${str(p.slug)},
        descriptionEn: ${str(p.description_en)},
        descriptionAr: ${str(p.description_ar)},
        shortDescriptionEn: ${str(p.short_description_en)},
        shortDescriptionAr: ${str(p.short_description_ar)},
        price: ${str(p.price)},
        salePrice: ${str(p.sale_price)},
        stock: ${p.stock},
        sku: ${str(p.sku)},
        scent: ${str(p.scent)},
        scentColor: ${str(p.scent_color)},
        categoryId: ${p.category_id},
        images: ${arr(p.images)},
        benefits: ${arr(p.benefits)},
        benefitsAr: ${arr(p.benefits_ar)},
        ingredients: ${str(p.ingredients)},
        ingredientsAr: ${str(p.ingredients_ar)},
        usageInstructions: ${str(p.usage_instructions)},
        usageInstructionsAr: ${str(p.usage_instructions_ar)},
        isActive: ${p.is_active ? "true" : "false"},
        isFeatured: ${p.is_featured ? "true" : "false"},
        isBestSeller: ${p.is_best_seller ? "true" : "false"},
        seoTitle: ${str(p.seo_title)},
        seoDescription: ${str(p.seo_description)},
        relatedProducts: ${arr(p.related_products)},
      }`).join(",\n");

  const faqsStr = faqs.map(f => `      {
        questionEn: ${str(f.question_en)},
        questionAr: ${str(f.question_ar)},
        answerEn: ${str(f.answer_en)},
        answerAr: ${str(f.answer_ar)},
        category: ${str(f.category)},
        sortOrder: ${f.sort_order},
      }`).join(",\n");

  const storeSettingsStr = storeSettings.map(s => `      { key: ${str(s.key)}, value: ${str(s.value)} }`).join(",\n");

  const paymentSettingsStr = paymentSettings.map(p => `      {
        method: ${str(p.method)},
        isEnabled: ${p.is_enabled ? "true" : "false"},
        displayName: ${str(p.display_name)},
        displayNameAr: ${str(p.display_name_ar)},
        accountNumber: ${str(p.account_number)},
        accountName: ${str(p.account_name)},
        instructions: ${str(p.instructions)},
        instructionsAr: ${str(p.instructions_ar)},
        sortOrder: ${p.sort_order},
      }`).join(",\n");

  const shippingSettingsStr = shippingSettings.map(s => `      { governorate: ${str(s.governorate)}, governorateAr: ${str(s.governorate_ar)}, baseFee: ${str(s.base_fee)}, estimatedDays: ${str(s.estimated_days)} }`).join(",\n");

  const seedTs = `import { getDb } from "../api/queries/connection";
import {
  products,
  categories,
  faqs,
  storeSettings,
  paymentSettings,
  shippingSettings,
} from "./schema";

async function seed() {
  const db = getDb();

  console.log("Seeding database...");

  await db
    .insert(categories)
    .values([
${categoriesStr}
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Categories seeded");

  await db
    .insert(products)
    .values([
${productsStr}
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Products seeded");

  await db
    .insert(faqs)
    .values([
${faqsStr}
    ]);

  console.log("FAQs seeded");

  await db
    .insert(storeSettings)
    .values([
${storeSettingsStr}
    ])
    .onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });

  console.log("Store settings seeded");

  await db
    .insert(paymentSettings)
    .values([
${paymentSettingsStr}
    ]);

  console.log("Payment settings seeded");

  await db
    .insert(shippingSettings)
    .values([
${shippingSettingsStr}
    ]);

  console.log("Shipping settings seeded");
  console.log("Database seeding complete!");
}

seed().catch(console.error);
`;

  fs.writeFileSync("db/seed.ts", seedTs, "utf8");
  console.log("db/seed.ts generated successfully.");
}

main().catch(console.error);
