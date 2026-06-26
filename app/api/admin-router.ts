import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  products,
  categories,
  faqs,
  storeSettings,
  paymentSettings,
  shippingSettings,
  orders,
  orderItems,
  customers,
  coupons,
  dropshippingSuppliers,
  dropshippingSupplierProducts,
  dropshippingImportLogs,
  mediaBuyerCampaigns,
  inventoryMovements,
  adminActivityLogs,
  paymentTransactions,
  shippingProviders,
  shipments,
  invoices,
  adminNotifications,
  returnRequests,
  uploadAssets,
  seoPages,
  adminStaffUsers,
  exportJobs,
  backupJobs,
} from "@db/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";


const nonNegativeMoney = z
  .string()
  .trim()
  .default("0")
  .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, "Value must be a non-negative number");

const optionalNonNegativeMoney = z
  .string()
  .trim()
  .optional()
  .refine((value) => value === undefined || value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Value must be a non-negative number");

function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0) || 0;
}

function rawRows<T>(result: unknown): T[] {
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as T[];
  }
  return result as T[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "supplier-product";
}

function validateCampaignMetrics(input: {
  budget?: string;
  spend?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ordersCount?: number;
  revenue?: string;
}) {
  const budget = toNumber(input.budget);
  const spend = toNumber(input.spend);
  const impressions = input.impressions ?? 0;
  const clicks = input.clicks ?? 0;
  const conversions = input.conversions ?? 0;
  const ordersCount = input.ordersCount ?? 0;

  if ([impressions, clicks, conversions, ordersCount].some((value) => value < 0)) {
    throw new Error("Campaign metrics cannot be negative");
  }
  if (clicks > impressions) {
    throw new Error("Clicks cannot be greater than impressions");
  }
  if (conversions > clicks) {
    throw new Error("Conversions cannot be greater than clicks");
  }
  if (ordersCount > conversions) {
    throw new Error("Orders cannot be greater than conversions");
  }
  if (budget > 0 && spend > budget) {
    throw new Error("Spend cannot be greater than budget");
  }
}

type AdminDb = ReturnType<typeof getDb>;

async function logAdminActivity(
  db: AdminDb,
  adminUserId: number | null | undefined,
  action: string,
  entityType: string,
  entityId?: number | null,
  details?: Record<string, unknown>
) {
  await db.insert(adminActivityLogs).values({
    adminUserId: adminUserId || null,
    action,
    entityType,
    entityId: entityId ?? null,
    details: details ?? {},
  });
}

const editableSettingKeys = new Set([
  // Store identity
  "store_name_en",
  "store_name_ar",
  "tagline_en",
  "tagline_ar",
  "logo_url",
  "favicon_url",
  "hero_bg_url",
  // Contact
  "whatsapp_number",
  "phone_number",
  "email_address",
  "address_en",
  "address_ar",
  // Social Media
  "facebook_url",
  "instagram_url",
  "tiktok_url",
  "youtube_url",
  "twitter_url",
  "snapchat_url",
  "telegram_url",
  "linkedin_url",
  "pinterest_url",
  // Appearance
  "primary_color",
  "secondary_color",
  "accent_color",
  "background_color",
  // Announcements
  "announcement_text_en",
  "announcement_text_ar",
  // Shipping
  "free_shipping_threshold",
  "default_shipping_fee",
  // SEO
  "meta_title_en",
  "meta_description_en",
  "meta_title_ar",
  "meta_description_ar",
  // Store config
  "currency",
  "default_language",
]);


function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","))].join("\n");
}

function safeNumber(value: string | number | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export const adminRouter = createRouter({
  // Products management
  listProducts: adminQuery
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.search) {
        conditions.push(like(products.nameEn, `%${input.search}%`));
      }
      if (input?.isActive !== undefined) {
        conditions.push(eq(products.isActive, input.isActive));
      }

      const query =
        conditions.length > 0
          ? db
              .select()
              .from(products)
              .where(and(...conditions))
              .orderBy(desc(products.createdAt))
          : db.select().from(products).orderBy(desc(products.createdAt));

      return query;
    }),

  createProduct: adminQuery
    .input(
      z.object({
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        slug: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        shortDescriptionEn: z.string().optional(),
        shortDescriptionAr: z.string().optional(),
        price: z.string().min(1),
        salePrice: z.string().optional(),
        stock: z.number().default(0),
        sku: z.string().optional(),
        scent: z.string().min(1),
        scentColor: z.string().optional(),
        categoryId: z.number().optional(),
        images: z.array(z.string()).optional(),
        benefits: z.array(z.string()).optional(),
        benefitsAr: z.array(z.string()).optional(),
        ingredients: z.string().optional(),
        ingredientsAr: z.string().optional(),
        usageInstructions: z.string().optional(),
        usageInstructionsAr: z.string().optional(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        isBestSeller: z.boolean().default(false),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        images: input.images ?? null,
        benefits: input.benefits ?? null,
        benefitsAr: input.benefitsAr ?? null,
      });
      const id = Number(result[0].insertId);
      if (input.stock > 0) {
        await db.insert(inventoryMovements).values({
          productId: id,
          type: "restock",
          quantity: input.stock,
          previousStock: 0,
          newStock: input.stock,
          reason: "Initial product stock",
          reference: input.sku ?? null,
        });
      }
      await logAdminActivity(db, ctx.user.id, "create", "product", id, { name: input.nameEn, sku: input.sku ?? null });
      return { id };
    }),

  updateProduct: adminQuery
    .input(
      z.object({
        id: z.number(),
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        slug: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        shortDescriptionEn: z.string().optional(),
        shortDescriptionAr: z.string().optional(),
        price: z.string().min(1),
        salePrice: z.string().optional(),
        stock: z.number().default(0),
        sku: z.string().optional(),
        scent: z.string().min(1),
        scentColor: z.string().optional(),
        categoryId: z.number().optional(),
        images: z.array(z.string()).optional(),
        benefits: z.array(z.string()).optional(),
        benefitsAr: z.array(z.string()).optional(),
        ingredients: z.string().optional(),
        ingredientsAr: z.string().optional(),
        usageInstructions: z.string().optional(),
        usageInstructionsAr: z.string().optional(),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        isBestSeller: z.boolean().default(false),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      const [existing] = await db.select().from(products).where(eq(products.id, id)).limit(1);
      await db
        .update(products)
        .set({
          ...data,
          images: data.images ?? null,
          benefits: data.benefits ?? null,
          benefitsAr: data.benefitsAr ?? null,
        })
        .where(eq(products.id, id));
      if (existing && existing.stock !== data.stock) {
        await db.insert(inventoryMovements).values({
          productId: id,
          type: "adjustment",
          quantity: data.stock - existing.stock,
          previousStock: existing.stock,
          newStock: data.stock,
          reason: "Manual stock adjustment",
          reference: data.sku ?? existing.sku ?? null,
        });
      }
      await logAdminActivity(db, ctx.user.id, "update", "product", id, { name: data.nameEn, sku: data.sku ?? null });
      return { success: true };
    }),

  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      await logAdminActivity(db, ctx.user.id, "delete", "product", input.id);
      return { success: true };
    }),

  // Orders management
  listOrders: adminQuery
    .input(
      z.object({
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.status) {
        conditions.push(eq(orders.orderStatus, input.status));
      }
      if (input?.search) {
        conditions.push(like(orders.orderNumber, `%${input.search}%`));
      }

      const query =
        conditions.length > 0
          ? db
              .select()
              .from(orders)
              .where(and(...conditions))
              .orderBy(desc(orders.createdAt))
          : db.select().from(orders).orderBy(desc(orders.createdAt));

      return query;
    }),

  getOrderDetails: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (orderResult.length === 0) return null;

      const order = orderResult[0];
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  updateOrderStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ orderStatus: input.status })
        .where(eq(orders.id, input.id));
      await logAdminActivity(db, ctx.user.id, "update_status", "order", input.id, { status: input.status });
      return { success: true };
    }),

  updatePaymentStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ paymentStatus: input.status })
        .where(eq(orders.id, input.id));
      await logAdminActivity(db, ctx.user.id, "update_payment", "order", input.id, { status: input.status });
      return { success: true };
    }),

  deleteOrder: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete order items first
      await db.delete(orderItems).where(eq(orderItems.orderId, input.id));
      // Delete order
      await db.delete(orders).where(eq(orders.id, input.id));
      return { success: true };
    }),

  // Customers management
  listCustomers: adminQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.search) {
        return db
          .select()
          .from(customers)
          .where(like(customers.name, `%${input.search}%`))
          .orderBy(desc(customers.createdAt));
      }
      return db.select().from(customers).orderBy(desc(customers.createdAt));
    }),

  createCustomer: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        governorate: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(customers).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Settings management
  updateSetting: adminQuery
    .input(
      z.object({
        key: z.string().refine((key) => editableSettingKeys.has(key), "Invalid setting key"),
        value: z.string().max(3_000_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .insert(storeSettings)
        .values({ key: input.key, value: input.value })
        .onDuplicateKeyUpdate({
          set: { value: input.value, updatedAt: new Date() },
        });
      await logAdminActivity(db, ctx.user.id, "update", "setting", null, { key: input.key });
      return { success: true };
    }),

  // Coupons management
  listCoupons: adminQuery
    .query(async () => {
      const db = getDb();
      return db.select().from(coupons).orderBy(desc(coupons.createdAt));
    }),

  createCoupon: adminQuery
    .input(
      z.object({
        code: z.string().min(1),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.string().min(1),
        minOrderValue: z.string().optional(),
        maxUsage: z.number().optional(),
        isActive: z.boolean().default(true),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.code))
        .limit(1);
      if (existing.length > 0) {
        throw new Error("Coupon code already exists");
      }
      const result = await db.insert(coupons).values({
        code: input.code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderValue: input.minOrderValue || "0",
        maxUsage: input.maxUsage ?? null,
        isActive: input.isActive,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });
      return { id: Number(result[0].insertId) };
    }),

  updateCoupon: adminQuery
    .input(
      z.object({
        id: z.number(),
        code: z.string().min(1),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.string().min(1),
        minOrderValue: z.string().optional(),
        maxUsage: z.number().optional(),
        isActive: z.boolean().default(true),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(coupons)
        .set({
          ...data,
          minOrderValue: data.minOrderValue || "0",
          maxUsage: data.maxUsage ?? null,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        })
        .where(eq(coupons.id, id));
      return { success: true };
    }),

  deleteCoupon: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(coupons).where(eq(coupons.id, input.id));
      return { success: true };
    }),

  // Payment settings management
  updatePaymentMethod: adminQuery
    .input(
      z.object({
        id: z.number(),
        isEnabled: z.boolean(),
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
        instructions: z.string().optional(),
        instructionsAr: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(paymentSettings).set(data).where(eq(paymentSettings.id, id));
      return { success: true };
    }),

  // Shipping settings management
  updateShippingSetting: adminQuery
    .input(
      z.object({
        id: z.number(),
        baseFee: z.string(),
        freeShippingThreshold: z.string().optional(),
        estimatedDays: z.string().optional(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(shippingSettings).set(data).where(eq(shippingSettings.id, id));
      return { success: true };
    }),

  // Category management
  listCategories: adminQuery.query(async () => {
    const db = getDb();
    return await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder);
  }),

  createCategory: adminQuery
    .input(
      z.object({
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        slug: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(categories).values(input);
      return { id: Number(result[0].insertId) };
    }),

  updateCategory: adminQuery
    .input(
      z.object({
        id: z.number(),
        nameEn: z.string().min(1),
        nameAr: z.string().min(1),
        slug: z.string().min(1),
        descriptionEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      return { success: true };
    }),

  deleteCategory: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),

  // FAQ management
  createFaq: adminQuery
    .input(
      z.object({
        questionEn: z.string().min(1),
        questionAr: z.string().min(1),
        answerEn: z.string().min(1),
        answerAr: z.string().min(1),
        category: z.string().default("general"),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(faqs).values(input);
      return { id: Number(result[0].insertId) };
    }),

  updateFaq: adminQuery
    .input(
      z.object({
        id: z.number(),
        questionEn: z.string().min(1),
        questionAr: z.string().min(1),
        answerEn: z.string().min(1),
        answerAr: z.string().min(1),
        category: z.string().default("general"),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(faqs).set(data).where(eq(faqs.id, id));
      return { success: true };
    }),

  deleteFaq: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(faqs).where(eq(faqs.id, input.id));
      return { success: true };
    }),


  // Dropshipping management
  listDropshippingSuppliers: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: dropshippingSuppliers.id,
        name: dropshippingSuppliers.name,
        country: dropshippingSuppliers.country,
        category: dropshippingSuppliers.category,
        contactName: dropshippingSuppliers.contactName,
        phone: dropshippingSuppliers.phone,
        email: dropshippingSuppliers.email,
        website: dropshippingSuppliers.website,
        catalogUrl: dropshippingSuppliers.catalogUrl,
        rating: dropshippingSuppliers.rating,
        shippingDays: dropshippingSuppliers.shippingDays,
        status: dropshippingSuppliers.status,
        notes: dropshippingSuppliers.notes,
        createdAt: dropshippingSuppliers.createdAt,
        productsCount: sql<number>`(SELECT COUNT(*) FROM dropshipping_supplier_products WHERE supplier_id = ${dropshippingSuppliers.id})`,
      })
      .from(dropshippingSuppliers)
      .orderBy(desc(dropshippingSuppliers.createdAt));
  }),

  createDropshippingSupplier: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        country: z.string().min(1),
        category: z.string().optional(),
        contactName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        catalogUrl: z.string().optional(),
        rating: z.string().optional(),
        shippingDays: z.string().optional(),
        status: z.enum(["active", "pending", "inactive"]).default("active"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(dropshippingSuppliers).values({
        ...input,
        category: input.category || "Beauty & Personal Care",
        rating: input.rating || "0",
        shippingDays: input.shippingDays || "3-5",
      });
      const id = Number(result[0].insertId);
      await logAdminActivity(db, ctx.user.id, "create", "dropshipping_supplier", id, { name: input.name });
      return { id };
    }),

  updateDropshippingSupplier: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        country: z.string().min(1),
        category: z.string().optional(),
        contactName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        catalogUrl: z.string().optional(),
        rating: z.string().optional(),
        shippingDays: z.string().optional(),
        status: z.enum(["active", "pending", "inactive"]).default("active"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(dropshippingSuppliers)
        .set({
          ...data,
          category: data.category || "Beauty & Personal Care",
          rating: data.rating || "0",
          shippingDays: data.shippingDays || "3-5",
        })
        .where(eq(dropshippingSuppliers.id, id));
      await logAdminActivity(db, ctx.user.id, "update", "dropshipping_supplier", id, { name: data.name });
      return { success: true };
    }),

  deleteDropshippingSupplier: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(dropshippingSuppliers)
        .set({ status: "inactive" })
        .where(eq(dropshippingSuppliers.id, input.id));
      await logAdminActivity(db, ctx.user.id, "deactivate", "dropshipping_supplier", input.id);
      return { success: true };
    }),

  listSupplierCatalog: adminQuery
    .input(z.object({ supplierId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.supplierId) {
        return db
          .select()
          .from(dropshippingSupplierProducts)
          .where(eq(dropshippingSupplierProducts.supplierId, input.supplierId))
          .orderBy(desc(dropshippingSupplierProducts.createdAt));
      }
      return db
        .select()
        .from(dropshippingSupplierProducts)
        .orderBy(desc(dropshippingSupplierProducts.createdAt));
    }),

  importSupplierCatalog: adminQuery
    .input(z.object({ supplierId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const supplier = await db
        .select()
        .from(dropshippingSuppliers)
        .where(eq(dropshippingSuppliers.id, input.supplierId))
        .limit(1);

      if (supplier.length === 0) {
        throw new Error("Supplier not found");
      }

      const baseName = supplier[0].name.replace(/[^a-zA-Z0-9]+/g, " ").trim() || "Supplier";
      const sampleProducts = [
        { name: `${baseName} Body Mist`, sku: `DS-${input.supplierId}-MIST`, costPrice: "120.00", suggestedPrice: "199.00", stock: 50 },
        { name: `${baseName} Roll On`, sku: `DS-${input.supplierId}-ROLL`, costPrice: "65.00", suggestedPrice: "120.00", stock: 80 },
        { name: `${baseName} Lotion`, sku: `DS-${input.supplierId}-LOTION`, costPrice: "95.00", suggestedPrice: "169.00", stock: 40 },
      ];

      let importedCount = 0;
      let skippedCount = 0;

      for (const item of sampleProducts) {
        const existing = await db
          .select({ id: dropshippingSupplierProducts.id })
          .from(dropshippingSupplierProducts)
          .where(and(eq(dropshippingSupplierProducts.supplierId, input.supplierId), eq(dropshippingSupplierProducts.sku, item.sku)))
          .limit(1);

        if (existing.length > 0) {
          skippedCount += 1;
          continue;
        }

        await db.insert(dropshippingSupplierProducts).values({
          supplierId: input.supplierId,
          name: item.name,
          sku: item.sku,
          category: supplier[0].category ?? "Beauty & Personal Care",
          costPrice: item.costPrice,
          suggestedPrice: item.suggestedPrice,
          stock: item.stock,
          sourceUrl: supplier[0].catalogUrl ?? supplier[0].website ?? null,
          status: "available",
        });
        importedCount += 1;
      }

      await db.insert(dropshippingImportLogs).values({
        supplierId: input.supplierId,
        importedCount,
        source: "manual",
        status: "success",
        message: `Imported ${importedCount} items. Skipped ${skippedCount} duplicate SKU items. CSV/API import can replace this sample importer later.`,
      });

      await logAdminActivity(db, ctx.user.id, "import_catalog", "dropshipping_supplier", input.supplierId, { importedCount, skippedCount });

      return { success: true, importedCount, skippedCount };
    }),

  approveSupplierCatalogProduct: adminQuery
    .input(z.object({
      id: z.number(),
      price: optionalNonNegativeMoney,
      salePrice: optionalNonNegativeMoney,
      stock: z.number().int().min(0).optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [catalogProduct] = await db
        .select()
        .from(dropshippingSupplierProducts)
        .where(eq(dropshippingSupplierProducts.id, input.id))
        .limit(1);

      if (!catalogProduct) {
        throw new Error("Supplier catalog product not found");
      }

      if (catalogProduct.approvedProductId) {
        return { success: true, productId: catalogProduct.approvedProductId, alreadyApproved: true };
      }

      const stock = input.stock ?? catalogProduct.stock ?? 0;
      const price = input.price && input.price !== "" ? input.price : catalogProduct.suggestedPrice ?? catalogProduct.costPrice;
      const salePrice = input.salePrice && input.salePrice !== "" ? input.salePrice : undefined;
      const baseSlug = slugify(catalogProduct.name);
      const result = await db.insert(products).values({
        nameEn: catalogProduct.name,
        nameAr: catalogProduct.name,
        slug: `${baseSlug}-${catalogProduct.id}`,
        descriptionEn: `Imported from supplier catalog product #${catalogProduct.id}.`,
        descriptionAr: `تم اعتماده من كتالوج المورد رقم ${catalogProduct.id}.`,
        shortDescriptionEn: catalogProduct.category ?? undefined,
        shortDescriptionAr: catalogProduct.category ?? undefined,
        price,
        salePrice,
        stock,
        sku: catalogProduct.sku ? `DS-${catalogProduct.supplierId}-${catalogProduct.sku}` : `DS-${catalogProduct.supplierId}-${catalogProduct.id}`,
        scent: catalogProduct.category ?? "Dropshipping",
        categoryId: null,
        images: catalogProduct.imageUrl ? [catalogProduct.imageUrl] : null,
        isActive: input.isActive,
        isFeatured: false,
        isBestSeller: false,
      });

      const productId = Number(result[0].insertId);
      await db
        .update(dropshippingSupplierProducts)
        .set({ approvedProductId: productId, approvedAt: new Date() })
        .where(eq(dropshippingSupplierProducts.id, input.id));

      if (stock > 0) {
        await db.insert(inventoryMovements).values({
          productId,
          supplierProductId: catalogProduct.id,
          type: "import",
          quantity: stock,
          previousStock: 0,
          newStock: stock,
          reason: "Approved supplier catalog product",
          reference: catalogProduct.sku ?? null,
        });
      }

      await logAdminActivity(db, ctx.user.id, "approve_catalog_product", "dropshipping_supplier_product", input.id, { productId, stock });

      return { success: true, productId, alreadyApproved: false };
    }),


  // Media buyer campaign management
  listMediaCampaigns: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(mediaBuyerCampaigns).orderBy(desc(mediaBuyerCampaigns.createdAt));
  }),

  createMediaCampaign: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        platform: z.enum(["facebook", "instagram", "tiktok", "google"]).default("facebook"),
        status: z.enum(["active", "paused", "draft"]).default("draft"),
        budget: nonNegativeMoney,
        spend: nonNegativeMoney,
        impressions: z.number().int().min(0).default(0),
        clicks: z.number().int().min(0).default(0),
        conversions: z.number().int().min(0).default(0),
        ordersCount: z.number().int().min(0).default(0),
        revenue: nonNegativeMoney,
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        linkUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      validateCampaignMetrics(input);
      const db = getDb();
      const result = await db.insert(mediaBuyerCampaigns).values(input);
      const id = Number(result[0].insertId);
      await logAdminActivity(db, ctx.user.id, "create", "media_campaign", id, { name: input.name, platform: input.platform });
      return { id };
    }),

  updateMediaCampaign: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        platform: z.enum(["facebook", "instagram", "tiktok", "google"]).default("facebook"),
        status: z.enum(["active", "paused", "draft"]).default("draft"),
        budget: nonNegativeMoney,
        spend: nonNegativeMoney,
        impressions: z.number().int().min(0).default(0),
        clicks: z.number().int().min(0).default(0),
        conversions: z.number().int().min(0).default(0),
        ordersCount: z.number().int().min(0).default(0),
        revenue: nonNegativeMoney,
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        linkUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      validateCampaignMetrics(input);
      const db = getDb();
      const { id, ...data } = input;
      await db.update(mediaBuyerCampaigns).set(data).where(eq(mediaBuyerCampaigns.id, id));
      await logAdminActivity(db, ctx.user.id, "update", "media_campaign", id, { name: data.name, platform: data.platform });
      return { success: true };
    }),

  updateMediaCampaignStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "paused", "draft"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .update(mediaBuyerCampaigns)
        .set({ status: input.status })
        .where(eq(mediaBuyerCampaigns.id, input.id));
      await logAdminActivity(db, ctx.user.id, "update_status", "media_campaign", input.id, { status: input.status });
      return { success: true };
    }),

  deleteMediaCampaign: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(mediaBuyerCampaigns).where(eq(mediaBuyerCampaigns.id, input.id));
      await logAdminActivity(db, ctx.user.id, "delete", "media_campaign", input.id);
      return { success: true };
    }),

  listInventoryMovements: adminQuery
    .input(z.object({ productId: z.number().optional(), limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.productId) {
        return db
          .select()
          .from(inventoryMovements)
          .where(eq(inventoryMovements.productId, input.productId))
          .orderBy(desc(inventoryMovements.createdAt))
          .limit(input.limit ?? 50);
      }
      return db.select().from(inventoryMovements).orderBy(desc(inventoryMovements.createdAt)).limit(input?.limit ?? 50);
    }),

  listAdminActivityLogs: adminQuery
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(adminActivityLogs).orderBy(desc(adminActivityLogs.createdAt)).limit(input?.limit ?? 50);
    }),


  // Advanced data analytics
  getAnalyticsSummary: adminQuery
    .input(z.object({ days: z.number().int().min(1).max(365).default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      const current = rawRows<{
        revenue: string | number;
        orders: string | number;
        deliveredOrders: string | number;
        cancelledOrders: string | number;
        customers: string | number;
        averageOrderValue: string | number;
        discounts: string | number;
        shippingFees: string | number;
      }>(await db.execute(sql`SELECT
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
        COUNT(*) AS orders,
        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) AS deliveredOrders,
        SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledOrders,
        COUNT(DISTINCT customer_phone) AS customers,
        COALESCE(AVG(CASE WHEN order_status != 'cancelled' THEN total END), 0) AS averageOrderValue,
        COALESCE(SUM(discount_amount), 0) AS discounts,
        COALESCE(SUM(shipping_fee), 0) AS shippingFees
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`))[0];

      const previous = rawRows<{
        revenue: string | number;
        orders: string | number;
      }>(await db.execute(sql`SELECT
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
        COUNT(*) AS orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days * 2} DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL ${days} DAY)`))[0];

      const revenue = toNumber(current?.revenue);
      const previousRevenue = toNumber(previous?.revenue);
      const ordersCount = toNumber(current?.orders);
      const previousOrders = toNumber(previous?.orders);

      return {
        ...current,
        revenueGrowth: previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : revenue > 0 ? 100 : 0,
        ordersGrowth: previousOrders > 0 ? ((ordersCount - previousOrders) / previousOrders) * 100 : ordersCount > 0 ? 100 : 0,
        cancellationRate: ordersCount > 0 ? (toNumber(current?.cancelledOrders) / ordersCount) * 100 : 0,
      };
    }),

  getRevenueTrend: adminQuery
    .input(z.object({ days: z.number().int().min(7).max(365).default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      return rawRows<{
        date: string;
        orders: string | number;
        revenue: string | number;
        averageOrderValue: string | number;
      }>(await db.execute(sql`SELECT
        DATE(created_at) AS date,
        COUNT(*) AS orders,
        COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total ELSE 0 END), 0) AS revenue,
        COALESCE(AVG(CASE WHEN order_status != 'cancelled' THEN total END), 0) AS averageOrderValue
      FROM orders
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`));
    }),

  getTopProductsAnalytics: adminQuery
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return rawRows<{
        productId: string | number;
        productName: string;
        scent: string | null;
        quantitySold: string | number;
        revenue: string | number;
      }>(await db.execute(sql`SELECT
        oi.product_id AS productId,
        oi.product_name AS productName,
        oi.scent AS scent,
        COALESCE(SUM(oi.quantity), 0) AS quantitySold,
        COALESCE(SUM(oi.total_price), 0) AS revenue
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE o.order_status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name, oi.scent
      ORDER BY revenue DESC
      LIMIT ${input?.limit ?? 10}`));
    }),

  getCustomerAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const totals = rawRows<{
      customers: string | number;
      repeatCustomers: string | number;
      totalSpent: string | number;
    }>(await db.execute(sql`SELECT
      COUNT(*) AS customers,
      SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) AS repeatCustomers,
      COALESCE(SUM(total_spent), 0) AS totalSpent
    FROM customers`))[0];

    const topLocations = rawRows<{
      governorate: string | null;
      city: string | null;
      orders: string | number;
      revenue: string | number;
    }>(await db.execute(sql`SELECT
      governorate,
      city,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    GROUP BY governorate, city
    ORDER BY revenue DESC
    LIMIT 10`));

    return {
      ...totals,
      repeatRate: toNumber(totals?.customers) > 0 ? (toNumber(totals?.repeatCustomers) / toNumber(totals?.customers)) * 100 : 0,
      topLocations,
    };
  }),

  getInventoryAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const summary = rawRows<{
      products: string | number;
      activeProducts: string | number;
      lowStockProducts: string | number;
      outOfStockProducts: string | number;
      totalStock: string | number;
    }>(await db.execute(sql`SELECT
      COUNT(*) AS products,
      SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) AS activeProducts,
      SUM(CASE WHEN stock > 0 AND stock <= 10 THEN 1 ELSE 0 END) AS lowStockProducts,
      SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS outOfStockProducts,
      COALESCE(SUM(stock), 0) AS totalStock
    FROM products`))[0];

    const lowStock = rawRows<{
      id: string | number;
      nameEn: string;
      nameAr: string;
      sku: string | null;
      stock: string | number;
    }>(await db.execute(sql`SELECT id, name_en AS nameEn, name_ar AS nameAr, sku, stock
      FROM products
      WHERE stock <= 10
      ORDER BY stock ASC
      LIMIT 10`));

    const movements = rawRows<{
      type: string;
      quantity: string | number;
      count: string | number;
    }>(await db.execute(sql`SELECT type, COALESCE(SUM(quantity), 0) AS quantity, COUNT(*) AS count
      FROM inventory_movements
      GROUP BY type
      ORDER BY count DESC`));

    return { ...summary, lowStock, movements };
  }),

  getMediaBuyerAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const summary = rawRows<{
      campaigns: string | number;
      activeCampaigns: string | number;
      spend: string | number;
      revenue: string | number;
      impressions: string | number;
      clicks: string | number;
      conversions: string | number;
      ordersCount: string | number;
    }>(await db.execute(sql`SELECT
      COUNT(*) AS campaigns,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCampaigns,
      COALESCE(SUM(spend), 0) AS spend,
      COALESCE(SUM(revenue), 0) AS revenue,
      COALESCE(SUM(impressions), 0) AS impressions,
      COALESCE(SUM(clicks), 0) AS clicks,
      COALESCE(SUM(conversions), 0) AS conversions,
      COALESCE(SUM(orders_count), 0) AS ordersCount
    FROM media_buyer_campaigns`))[0];

    const campaigns = rawRows<{
      id: string | number;
      name: string;
      platform: string;
      status: string;
      spend: string | number;
      revenue: string | number;
      impressions: string | number;
      clicks: string | number;
      conversions: string | number;
      ordersCount: string | number;
    }>(await db.execute(sql`SELECT
      id, name, platform, status, spend, revenue, impressions, clicks, conversions, orders_count AS ordersCount
    FROM media_buyer_campaigns
    ORDER BY revenue DESC
    LIMIT 10`));

    const spend = toNumber(summary?.spend);
    const revenue = toNumber(summary?.revenue);
    const impressions = toNumber(summary?.impressions);
    const clicks = toNumber(summary?.clicks);
    const conversions = toNumber(summary?.conversions);

    return {
      ...summary,
      campaignsCount: summary?.campaigns ?? 0,
      roas: spend > 0 ? revenue / spend : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      campaigns,
    };
  }),

  getFunnelAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const media = rawRows<{
      impressions: string | number;
      clicks: string | number;
      conversions: string | number;
      ordersCount: string | number;
    }>(await db.execute(sql`SELECT
      COALESCE(SUM(impressions), 0) AS impressions,
      COALESCE(SUM(clicks), 0) AS clicks,
      COALESCE(SUM(conversions), 0) AS conversions,
      COALESCE(SUM(orders_count), 0) AS ordersCount
    FROM media_buyer_campaigns`))[0];

    const realOrders = rawRows<{ orders: string | number }>(await db.execute(sql`SELECT COUNT(*) AS orders FROM orders WHERE order_status != 'cancelled'`))[0];

    return {
      impressions: toNumber(media?.impressions),
      clicks: toNumber(media?.clicks),
      conversions: toNumber(media?.conversions),
      campaignOrders: toNumber(media?.ordersCount),
      storeOrders: toNumber(realOrders?.orders),
    };
  }),


  // Payments / transactions
  listPaymentTransactions: adminQuery
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(paymentTransactions).orderBy(desc(paymentTransactions.createdAt)).limit(input?.limit ?? 100);
    }),

  createManualPaymentTransaction: adminQuery
    .input(z.object({ orderId: z.number().optional(), orderNumber: z.string().optional(), provider: z.enum(["manual", "tap", "hyperpay", "paytabs", "stripe", "moyasar", "myfatoorah"]).default("manual"), method: z.string().optional(), amount: z.string().default("0"), currency: z.string().default("EGP"), status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]).default("pending"), providerReference: z.string().optional(), checkoutUrl: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(paymentTransactions).values({ ...input, orderId: input.orderId ?? null, paidAt: input.status === "paid" ? new Date() : null });
      if (input.orderId && input.status === "paid") await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, input.orderId));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_payment", entityType: "payment_transaction", entityId: Number(result[0].insertId), details: input });
      return { id: Number(result[0].insertId) };
    }),

  updatePaymentTransactionStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "paid", "failed", "refunded", "cancelled"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const found = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, input.id)).limit(1);
      await db.update(paymentTransactions).set({ status: input.status, paidAt: input.status === "paid" ? new Date() : null }).where(eq(paymentTransactions.id, input.id));
      if (found[0]?.orderId && input.status === "paid") await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, found[0].orderId));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_payment_status", entityType: "payment_transaction", entityId: input.id, details: input });
      return { success: true };
    }),

  // Shipping providers and shipments
  listShippingProviders: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(shippingProviders).orderBy(desc(shippingProviders.createdAt));
  }),

  createShippingProvider: adminQuery
    .input(z.object({ name: z.string().min(1), phone: z.string().optional(), website: z.string().optional(), trackingUrlTemplate: z.string().optional(), baseFee: z.string().default("0"), isActive: z.boolean().default(true), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(shippingProviders).values(input);
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_shipping_provider", entityType: "shipping_provider", entityId: Number(result[0].insertId), details: input });
      return { id: Number(result[0].insertId) };
    }),

  updateShippingProvider: adminQuery
    .input(z.object({ id: z.number(), name: z.string().min(1), phone: z.string().optional(), website: z.string().optional(), trackingUrlTemplate: z.string().optional(), baseFee: z.string().default("0"), isActive: z.boolean().default(true), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb(); const { id, ...data } = input;
      await db.update(shippingProviders).set(data).where(eq(shippingProviders.id, id));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_shipping_provider", entityType: "shipping_provider", entityId: id, details: data });
      return { success: true };
    }),

  listShipments: adminQuery
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(shipments).orderBy(desc(shipments.createdAt)).limit(input?.limit ?? 100);
    }),

  createShipment: adminQuery
    .input(z.object({ orderId: z.number(), providerId: z.number().optional(), trackingNumber: z.string().optional(), status: z.enum(["pending", "ready", "shipped", "out_for_delivery", "delivered", "failed", "returned"]).default("pending"), shippingCost: z.string().default("0"), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(shipments).values({ ...input, providerId: input.providerId ?? null, shippedAt: ["shipped", "out_for_delivery", "delivered"].includes(input.status) ? new Date() : null, deliveredAt: input.status === "delivered" ? new Date() : null });
      if (["shipped", "out_for_delivery", "delivered"].includes(input.status)) await db.update(orders).set({ orderStatus: input.status === "delivered" ? "delivered" : "shipped" }).where(eq(orders.id, input.orderId));
      await db.insert(adminNotifications).values({ title: "Shipment updated", message: `Shipment created for order #${input.orderId}`, type: "shipping", entityType: "shipment", entityId: Number(result[0].insertId) });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_shipment", entityType: "shipment", entityId: Number(result[0].insertId), details: input });
      return { id: Number(result[0].insertId) };
    }),

  updateShipmentStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "ready", "shipped", "out_for_delivery", "delivered", "failed", "returned"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const found = await db.select().from(shipments).where(eq(shipments.id, input.id)).limit(1);
      await db.update(shipments).set({ status: input.status, shippedAt: ["shipped", "out_for_delivery", "delivered"].includes(input.status) ? new Date() : null, deliveredAt: input.status === "delivered" ? new Date() : null }).where(eq(shipments.id, input.id));
      if (found[0]?.orderId && ["shipped", "delivered"].includes(input.status)) await db.update(orders).set({ orderStatus: input.status === "delivered" ? "delivered" : "shipped" }).where(eq(orders.id, found[0].orderId));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_shipment_status", entityType: "shipment", entityId: input.id, details: input });
      return { success: true };
    }),

  // Invoices
  listInvoices: adminQuery.query(async () => {
    const db = getDb(); return db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }),

  createInvoiceForOrder: adminQuery
    .input(z.object({ orderId: z.number(), taxAmount: z.string().default("0") }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
      if (!order[0]) throw new Error("Order not found");
      const existing = await db.select().from(invoices).where(eq(invoices.orderId, input.orderId)).limit(1);
      if (existing[0]) return { id: existing[0].id, invoiceNumber: existing[0].invoiceNumber };
      const invoiceNumber = `INV-${order[0].orderNumber}-${Date.now().toString().slice(-5)}`;
      const result = await db.insert(invoices).values({ orderId: input.orderId, invoiceNumber, subtotal: order[0].subtotal, shippingFee: order[0].shippingFee ?? "0", discountAmount: order[0].discountAmount ?? "0", taxAmount: input.taxAmount, total: String(safeNumber(order[0].total) + safeNumber(input.taxAmount)), status: order[0].paymentStatus === "paid" ? "paid" : "issued" });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_invoice", entityType: "invoice", entityId: Number(result[0].insertId), details: { orderId: input.orderId, invoiceNumber } });
      return { id: Number(result[0].insertId), invoiceNumber };
    }),

  updateInvoiceStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["draft", "issued", "paid", "cancelled"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb(); await db.update(invoices).set({ status: input.status }).where(eq(invoices.id, input.id));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_invoice_status", entityType: "invoice", entityId: input.id, details: input });
      return { success: true };
    }),

  // Notifications
  listAdminNotifications: adminQuery
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ input }) => {
      const db = getDb(); return db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(input?.limit ?? 100);
    }),

  createAdminNotification: adminQuery
    .input(z.object({ title: z.string().min(1), message: z.string().min(1), type: z.enum(["order", "payment", "shipping", "inventory", "system", "return"]).default("system") }))
    .mutation(async ({ input }) => { const db = getDb(); const result = await db.insert(adminNotifications).values(input); return { id: Number(result[0].insertId) }; }),

  markAdminNotificationRead: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { const db = getDb(); await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, input.id)); return { success: true }; }),

  // Return requests
  listReturnRequests: adminQuery.query(async () => { const db = getDb(); return db.select().from(returnRequests).orderBy(desc(returnRequests.createdAt)); }),

  createReturnRequestAdmin: adminQuery
    .input(z.object({ orderNumber: z.string().min(1), customerPhone: z.string().min(1), customerName: z.string().optional(), reason: z.string().min(1), refundAmount: z.string().default("0"), status: z.enum(["pending", "approved", "rejected", "received", "refunded", "closed"]).default("pending"), adminNotes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(and(eq(orders.orderNumber, input.orderNumber), eq(orders.customerPhone, input.customerPhone))).limit(1);
      const result = await db.insert(returnRequests).values({ ...input, orderId: order[0]?.id ?? null });
      await db.insert(adminNotifications).values({ title: "Return request", message: `Return request for ${input.orderNumber}`, type: "return", entityType: "return_request", entityId: Number(result[0].insertId) });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_return_request", entityType: "return_request", entityId: Number(result[0].insertId), details: input });
      return { id: Number(result[0].insertId) };
    }),

  updateReturnRequestStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected", "received", "refunded", "closed"]), refundAmount: z.string().optional(), restockItems: z.boolean().default(false), adminNotes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb(); const { id, ...data } = input;
      await db.update(returnRequests).set(data).where(eq(returnRequests.id, id));
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_return_status", entityType: "return_request", entityId: id, details: data });
      return { success: true };
    }),

  // Media library / uploads registry
  listUploadAssets: adminQuery.query(async () => { const db = getDb(); return db.select().from(uploadAssets).orderBy(desc(uploadAssets.createdAt)); }),

  createUploadAsset: adminQuery
    .input(z.object({ title: z.string().optional(), url: z.string().min(1), altText: z.string().optional(), mimeType: z.string().optional(), sizeBytes: z.number().optional(), width: z.number().optional(), height: z.number().optional(), folder: z.string().default("general") }))
    .mutation(async ({ input, ctx }) => { const db = getDb(); const result = await db.insert(uploadAssets).values(input); await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_media_asset", entityType: "upload_asset", entityId: Number(result[0].insertId), details: { title: input.title, url: input.url } }); return { id: Number(result[0].insertId) }; }),

  deleteUploadAsset: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => { const db = getDb(); await db.delete(uploadAssets).where(eq(uploadAssets.id, input.id)); await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "delete_media_asset", entityType: "upload_asset", entityId: input.id }); return { success: true }; }),

  // SEO tools
  listSeoPages: adminQuery.query(async () => { const db = getDb(); return db.select().from(seoPages).orderBy(desc(seoPages.createdAt)); }),

  upsertSeoPage: adminQuery
    .input(z.object({ path: z.string().min(1), titleEn: z.string().optional(), titleAr: z.string().optional(), descriptionEn: z.string().optional(), descriptionAr: z.string().optional(), keywords: z.string().optional(), ogImage: z.string().optional(), canonicalUrl: z.string().optional(), isIndexed: z.boolean().default(true) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(seoPages).values(input).onDuplicateKeyUpdate({ set: { ...input, updatedAt: new Date() } });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "upsert_seo_page", entityType: "seo_page", details: { path: input.path } });
      return { success: true };
    }),

  generateSeoFiles: adminQuery.query(async () => {
    const db = getDb();
    const pages = await db.select().from(seoPages);
    const productRows = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true));
    const staticPaths = ["/", "/shop", "/about", "/contact", "/faq", "/track-order"];
    const urls = [...staticPaths, ...productRows.map((p) => `/shop/${p.slug}`), ...pages.map((p) => p.path)];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(new Set(urls)).map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>`;
    const robots = "User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n";
    return { sitemap, robots, urlsCount: urls.length };
  }),

  // Admin staff permissions registry
  listAdminStaffUsers: adminQuery.query(async () => { const db = getDb(); return db.select().from(adminStaffUsers).orderBy(desc(adminStaffUsers.createdAt)); }),

  createAdminStaffUser: adminQuery
    .input(z.object({ name: z.string().min(1), email: z.string().optional(), role: z.enum(["owner", "admin", "orders", "inventory", "marketing", "support", "viewer"]).default("viewer"), permissions: z.array(z.string()).default([]), isActive: z.boolean().default(true), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => { const db = getDb(); const result = await db.insert(adminStaffUsers).values(input); await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_admin_staff", entityType: "admin_staff", entityId: Number(result[0].insertId), details: input }); return { id: Number(result[0].insertId) }; }),

  updateAdminStaffUser: adminQuery
    .input(z.object({ id: z.number(), name: z.string().min(1), email: z.string().optional(), role: z.enum(["owner", "admin", "orders", "inventory", "marketing", "support", "viewer"]).default("viewer"), permissions: z.array(z.string()).default([]), isActive: z.boolean().default(true), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => { const db = getDb(); const { id, ...data } = input; await db.update(adminStaffUsers).set(data).where(eq(adminStaffUsers.id, id)); await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "update_admin_staff", entityType: "admin_staff", entityId: id, details: data }); return { success: true }; }),

  // Export center
  createExportJob: adminQuery
    .input(z.object({ type: z.enum(["orders", "customers", "products", "inventory", "campaigns", "activity", "returns"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const tableRows: Record<string, unknown>[] = input.type === "orders" ? await db.select().from(orders) as Record<string, unknown>[]
        : input.type === "customers" ? await db.select().from(customers) as Record<string, unknown>[]
        : input.type === "products" ? await db.select().from(products) as Record<string, unknown>[]
        : input.type === "inventory" ? await db.select().from(inventoryMovements) as Record<string, unknown>[]
        : input.type === "campaigns" ? await db.select().from(mediaBuyerCampaigns) as Record<string, unknown>[]
        : input.type === "activity" ? await db.select().from(adminActivityLogs) as Record<string, unknown>[]
        : await db.select().from(returnRequests) as Record<string, unknown>[];
      const content = toCsv(tableRows);
      const fileName = `${input.type}-${new Date().toISOString().slice(0, 10)}.csv`;
      const result = await db.insert(exportJobs).values({ type: input.type, fileName, rowCount: tableRows.length, content, status: "ready" });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_export", entityType: "export_job", entityId: Number(result[0].insertId), details: { type: input.type, rowCount: tableRows.length } });
      return { id: Number(result[0].insertId), fileName, rowCount: tableRows.length, content };
    }),

  listExportJobs: adminQuery.query(async () => { const db = getDb(); return db.select().from(exportJobs).orderBy(desc(exportJobs.createdAt)); }),

  // Backup center
  createBackupJob: adminQuery
    .input(z.object({ label: z.string().min(1), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const content = {
        createdAt: new Date().toISOString(),
        products: await db.select().from(products),
        categories: await db.select().from(categories),
        orders: await db.select().from(orders),
        customers: await db.select().from(customers),
        storeSettings: await db.select().from(storeSettings),
        shippingSettings: await db.select().from(shippingSettings),
        paymentSettings: await db.select().from(paymentSettings),
      };
      const result = await db.insert(backupJobs).values({ label: input.label, notes: input.notes, content, status: "ready" });
      await db.insert(adminActivityLogs).values({ adminUserId: ctx.user.id, action: "create_backup", entityType: "backup_job", entityId: Number(result[0].insertId), details: { label: input.label } });
      return { id: Number(result[0].insertId), content };
    }),

  listBackupJobs: adminQuery.query(async () => { const db = getDb(); return db.select().from(backupJobs).orderBy(desc(backupJobs.createdAt)); }),

  // Sales analytics
  getSalesByDate: adminQuery
    .input(z.object({ days: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days ?? 30;
      const result = await db.execute(
        sql`SELECT 
          DATE(created_at) as date, 
          COUNT(*) as orders, 
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          AND order_status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY date DESC`
      );
      return result;
    }),

  getSalesByScent: adminQuery.query(async () => {
    const db = getDb();
    const result = await db.execute(
      sql`SELECT 
        p.scent,
        SUM(oi.quantity) as total_sold,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'cancelled'
      GROUP BY p.scent
      ORDER BY total_sold DESC`
    );
    return result;
  }),

  getRecentOrders: adminQuery
    .input(z.object({ limit: z.number().default(10) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(input?.limit ?? 10);
    }),
});
