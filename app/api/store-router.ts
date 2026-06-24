import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
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
} from "@db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export const storeRouter = createRouter({
  // Products
  getProducts: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        scent: z.string().optional(),
        featured: z.boolean().optional(),
        bestSeller: z.boolean().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(products.isActive, true)];

      if (input?.featured) {
        conditions.push(eq(products.isFeatured, true));
      }
      if (input?.bestSeller) {
        conditions.push(eq(products.isBestSeller, true));
      }
      if (input?.scent) {
        conditions.push(eq(products.scent, input.scent));
      }

      const query = db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(desc(products.createdAt));

      const result = await query;
      return result;
    }),

  getProductBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);

      if (result.length === 0) return null;

      const product = result[0];

      // Get related products
      let relatedProductsList: typeof result = [];
      if (product.relatedProducts) {
        const relatedIds = product.relatedProducts;
        if (relatedIds.length > 0) {
          relatedProductsList = await db
            .select()
            .from(products)
            .where(inArray(products.id, relatedIds));
        }
      }

      return { ...product, relatedProductsList };
    }),

  getProductById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  // Categories
  getCategories: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);
  }),

  // FAQs
  getFaqs: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(faqs.isActive, true)];
      if (input?.category) {
        conditions.push(eq(faqs.category, input.category));
      }
      return db
        .select()
        .from(faqs)
        .where(and(...conditions))
        .orderBy(faqs.sortOrder);
    }),

  // Store Settings
  getSettings: publicQuery.query(async () => {
    const db = getDb();
    const settings = await db.select().from(storeSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value ?? "";
    }
    return settingsMap;
  }),

  // Payment Settings
  getPaymentMethods: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(paymentSettings)
      .where(eq(paymentSettings.isEnabled, true))
      .orderBy(paymentSettings.sortOrder);
  }),

  // Shipping Settings
  getShippingGovernorates: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(shippingSettings)
      .where(eq(shippingSettings.isActive, true))
      .orderBy(shippingSettings.governorate);
  }),

  getShippingFee: publicQuery
    .input(z.object({ governorate: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(shippingSettings)
        .where(eq(shippingSettings.governorate, input.governorate))
        .limit(1);
      return result[0] ?? null;
    }),

  // Orders
  createOrder: publicQuery
    .input(
      z.object({
        customerName: z.string().min(1),
        customerPhone: z.string().min(1),
        customerWhatsapp: z.string().optional(),
        customerEmail: z.string().email().optional(),
        shippingAddress: z.string().min(1),
        governorate: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        paymentMethod: z.enum([
          "cash_on_delivery",
          "vodafone_cash",
          "instapay",
          "bank_transfer",
        ]),
        notes: z.string().optional(),
        source: z.enum(["website", "whatsapp"]).default("website"),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get product details for each item
      const productIds = input.items.map((item) => item.productId);
      const productDetails = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      // Calculate totals
      let subtotal = 0;
      const orderItemsData = input.items.map((item) => {
        const product = productDetails.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const unitPrice = parseFloat(product.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        return {
          productId: item.productId,
          productName: product.nameEn,
          productNameAr: product.nameAr,
          scent: product.scent,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: totalPrice.toFixed(2),
        };
      });

      // Get shipping fee
      let shippingFee = 0;
      if (input.governorate) {
        const shipping = await db
          .select()
          .from(shippingSettings)
          .where(eq(shippingSettings.governorate, input.governorate))
          .limit(1);
        if (shipping[0]) {
          shippingFee = parseFloat(shipping[0].baseFee ?? "0");
        }
      }

      // Check free shipping threshold
      const freeShippingSetting = await db
        .select()
        .from(storeSettings)
        .where(eq(storeSettings.key, "free_shipping_threshold"))
        .limit(1);
      if (freeShippingSetting[0]) {
        const threshold = parseFloat(freeShippingSetting[0].value ?? "999999");
        if (subtotal >= threshold) {
          shippingFee = 0;
        }
      }

      const total = subtotal + shippingFee;

      // Generate order number
      const orderNumber = `HL${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const orderResult = await db.insert(orders).values({
        orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerWhatsapp: input.customerWhatsapp,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        governorate: input.governorate,
        city: input.city,
        postalCode: input.postalCode,
        subtotal: subtotal.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        source: input.source,
      });

      const orderId = Number(orderResult[0].insertId);

      // Create order items
      for (const item of orderItemsData) {
        await db.insert(orderItems).values({
          orderId,
          ...item,
        });
      }

      // Update product stock
      for (const item of input.items) {
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      return { orderId, orderNumber, total: total.toFixed(2) };
    }),

  getOrderByNumber: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (orderResult.length === 0) return null;

      const order = orderResult[0];
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  // Stats for admin
  getStats: publicQuery.query(async () => {
    const db = getDb();

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const totalRevenue = await db
      .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
      .from(orders)
      .where(sql`order_status != 'cancelled'`);

    const pendingOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.orderStatus, "pending"));

    const todayOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`DATE(created_at) = CURDATE()`);

    const totalProducts = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const lowStockProducts = await db
      .select()
      .from(products)
      .where(sql`stock <= 10`);

    return {
      totalOrders: totalOrders[0]?.count ?? 0,
      totalRevenue: totalRevenue[0]?.total ?? "0",
      pendingOrders: pendingOrders[0]?.count ?? 0,
      todayOrders: todayOrders[0]?.count ?? 0,
      totalProducts: totalProducts[0]?.count ?? 0,
      lowStockProducts,
    };
  }),
});
