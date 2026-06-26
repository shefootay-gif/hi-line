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
} from "@db/schema";
import { eq, desc, and, sql, like } from "drizzle-orm";

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
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        images: input.images ?? null,
        benefits: input.benefits ?? null,
        benefitsAr: input.benefitsAr ?? null,
      });
      return { id: Number(result[0].insertId) };
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
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db
        .update(products)
        .set({
          ...data,
          images: data.images ?? null,
          benefits: data.benefits ?? null,
          benefitsAr: data.benefitsAr ?? null,
        })
        .where(eq(products.id, id));
      return { success: true };
    }),

  deleteProduct: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
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
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ orderStatus: input.status })
        .where(eq(orders.id, input.id));
      return { success: true };
    }),

  updatePaymentStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "failed", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ paymentStatus: input.status })
        .where(eq(orders.id, input.id));
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
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .insert(storeSettings)
        .values({ key: input.key, value: input.value })
        .onDuplicateKeyUpdate({
          set: { value: input.value, updatedAt: new Date() },
        });
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
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(dropshippingSuppliers).values({
        ...input,
        category: input.category || "Beauty & Personal Care",
        rating: input.rating || "0",
        shippingDays: input.shippingDays || "3-5",
      });
      return { id: Number(result[0].insertId) };
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
    .mutation(async ({ input }) => {
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
      return { success: true };
    }),

  deleteDropshippingSupplier: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(dropshippingSupplierProducts)
        .where(eq(dropshippingSupplierProducts.supplierId, input.id));
      await db.delete(dropshippingSuppliers).where(eq(dropshippingSuppliers.id, input.id));
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
    .mutation(async ({ input }) => {
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

      for (const item of sampleProducts) {
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
      }

      await db.insert(dropshippingImportLogs).values({
        supplierId: input.supplierId,
        importedCount: sampleProducts.length,
        source: "manual",
        status: "success",
        message: "Sample supplier catalog imported. Replace with real supplier API/CSV later.",
      });

      return { success: true, importedCount: sampleProducts.length };
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
        budget: z.string().default("0"),
        spend: z.string().default("0"),
        impressions: z.number().default(0),
        clicks: z.number().default(0),
        conversions: z.number().default(0),
        linkUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(mediaBuyerCampaigns).values(input);
      return { id: Number(result[0].insertId) };
    }),

  updateMediaCampaign: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        platform: z.enum(["facebook", "instagram", "tiktok", "google"]).default("facebook"),
        status: z.enum(["active", "paused", "draft"]).default("draft"),
        budget: z.string().default("0"),
        spend: z.string().default("0"),
        impressions: z.number().default(0),
        clicks: z.number().default(0),
        conversions: z.number().default(0),
        linkUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(mediaBuyerCampaigns).set(data).where(eq(mediaBuyerCampaigns.id, id));
      return { success: true };
    }),

  updateMediaCampaignStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "paused", "draft"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(mediaBuyerCampaigns)
        .set({ status: input.status })
        .where(eq(mediaBuyerCampaigns.id, input.id));
      return { success: true };
    }),

  deleteMediaCampaign: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(mediaBuyerCampaigns).where(eq(mediaBuyerCampaigns.id, input.id));
      return { success: true };
    }),

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
