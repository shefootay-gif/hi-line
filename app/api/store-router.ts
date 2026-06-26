import { z } from "zod";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware";
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
  coupons,
  reviews,
  wishlists,
  contactMessages,
} from "@db/schema";
import { eq, desc, and, or, like, sql, inArray } from "drizzle-orm";

const categoryAliases: Record<string, string> = {
  all: "all",
  "all-products": "all",
  "roll-on": "deodorant-roll-on",
  "deodorant-roll-on": "deodorant-roll-on",
  fresh: "fresh-scents",
  "fresh-scents": "fresh-scents",
  fruity: "fruity-scents",
  "fruity-scents": "fruity-scents",
  "fragrance-free": "fragrance-free",
  "summer-collection": "all",
  "best-sellers": "best-sellers",
  offers: "all",
};

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
      if (input?.search?.trim()) {
        const term = `%${input.search.trim()}%`;
        const searchCondition = or(
          like(products.nameEn, term),
          like(products.nameAr, term),
          like(products.scent, term),
        );
        if (searchCondition) conditions.push(searchCondition);
      }
      if (input?.category) {
        const categorySlug = categoryAliases[input.category.toLowerCase()] || input.category;
        if (categorySlug === "best-sellers") {
          conditions.push(eq(products.isBestSeller, true));
        } else if (categorySlug === "fresh-scents") {
          conditions.push(inArray(products.scent, ["Tropical Breeze", "Voyage"]));
        } else if (categorySlug === "fruity-scents") {
          conditions.push(inArray(products.scent, ["Candy Pop", "Sweet Mango"]));
        } else if (categorySlug === "fragrance-free") {
          conditions.push(eq(products.scent, "Fragrance Free"));
        } else if (categorySlug !== "all") {
          const [category] = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.slug, categorySlug))
            .limit(1);
          if (category) {
            conditions.push(eq(products.categoryId, category.id));
          }
        }
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
        couponCode: z.string().optional(),
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

      // Validate stock availability
      for (const item of input.items) {
        const product = productDetails.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.nameEn}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItemsData = input.items.map((item) => {
        const product = productDetails.find((p) => p.id === item.productId)!;
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
      // Process coupon if provided
      let discountAmount = 0;
      let appliedCouponId = null;

      if (input.couponCode) {
        const [coupon] = await db
          .select()
          .from(coupons)
          .where(eq(coupons.code, input.couponCode))
          .limit(1);

        if (coupon) {
          const isValid =
            coupon.isActive &&
            (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
            (coupon.maxUsage === null || coupon.currentUsage! < coupon.maxUsage) &&
            subtotal >= parseFloat(coupon.minOrderValue ?? "0");

          if (isValid) {
            const val = parseFloat(coupon.discountValue);
            if (coupon.discountType === "percentage") {
              discountAmount = (subtotal * val) / 100;
            } else {
              discountAmount = val;
            }
            appliedCouponId = coupon.id;
          }
        }
      }

      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) discountAmount = subtotal;

      const total = subtotal - discountAmount + shippingFee;
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
        discountAmount: discountAmount.toFixed(2),
        couponCode: input.couponCode || null,
        total: total.toFixed(2),
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        source: input.source,
      });

      const orderId = Number(orderResult[0].insertId);

      // Create order items (batch insert)
      await db.insert(orderItems).values(
        orderItemsData.map((item) => ({ orderId, ...item }))
      );

      // Update product stock
      for (const item of input.items) {
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      // Update coupon usage
      if (appliedCouponId) {
        await db
          .update(coupons)
          .set({ currentUsage: sql`${coupons.currentUsage} + 1` })
          .where(eq(coupons.id, appliedCouponId));
      }

      return { orderId, orderNumber, total: total.toFixed(2), discountAmount: discountAmount.toFixed(2) };
    }),

  validateCoupon: publicQuery
    .input(z.object({ code: z.string(), subtotal: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.code))
        .limit(1);

      if (!coupon) {
        throw new Error("Invalid coupon code");
      }
      if (!coupon.isActive) {
        throw new Error("This coupon is no longer active");
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error("This coupon has expired");
      }
      if (coupon.maxUsage !== null && coupon.currentUsage! >= coupon.maxUsage) {
        throw new Error("This coupon has reached its usage limit");
      }
      if (input.subtotal < parseFloat(coupon.minOrderValue ?? "0")) {
        throw new Error(`Minimum order value to use this coupon is ${coupon.minOrderValue}`);
      }

      const val = parseFloat(coupon.discountValue);
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (input.subtotal * val) / 100;
      } else {
        discountAmount = val;
      }

      if (discountAmount > input.subtotal) discountAmount = input.subtotal;

      return {
        valid: true,
        discountType: coupon.discountType,
        discountValue: val,
        discountAmount: discountAmount,
      };
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

  cancelOrder: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (orderResult.length === 0) {
        throw new Error("Order not found");
      }

      const order = orderResult[0];

      if (
        order.orderStatus === "shipped" ||
        order.orderStatus === "delivered" ||
        order.orderStatus === "refunded" ||
        order.orderStatus === "cancelled"
      ) {
        throw new Error("Cannot cancel order at this stage");
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      // Restore stock
      for (const item of items) {
        await db
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }

      // Update status to cancelled
      await db
        .update(orders)
        .set({ orderStatus: "cancelled" })
        .where(eq(orders.id, order.id));

      return { success: true };
    }),

  // Reviews endpoints
  addReview: authedQuery
    .input(z.object({
      productId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      // Extract numeric ID from unionId like "local:12"
      const userIdStr = ctx.user.unionId.split(":")[1];
      if (!userIdStr) throw new Error("Invalid user session for review");
      const userId = parseInt(userIdStr, 10);
      
      await db.insert(reviews).values({
        productId: input.productId,
        userId: userId,
        rating: input.rating,
        comment: input.comment,
        status: "pending", // require admin approval by default
      });
      return { success: true };
    }),

  getReviews: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const res = await db.select().from(reviews).where(and(eq(reviews.productId, input.productId), eq(reviews.status, "approved")));
      return res;
    }),

  // Wishlist endpoints
  toggleWishlist: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userIdStr = ctx.user.unionId.split(":")[1];
      if (!userIdStr) throw new Error("Invalid user session");
      const userId = parseInt(userIdStr, 10);

      const existing = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.productId, input.productId), eq(wishlists.userId, userId)))
        .limit(1);

      if (existing.length > 0) {
        await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
        return { added: false };
      } else {
        await db.insert(wishlists).values({
          userId,
          productId: input.productId,
        });
        return { added: true };
      }
    }),

  getWishlist: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userIdStr = ctx.user.unionId.split(":")[1];
    if (!userIdStr) return [];
    const userId = parseInt(userIdStr, 10);

    const res = await db
      .select({
        wishlistId: wishlists.id,
        product: products,
      })
      .from(wishlists)
      .innerJoin(products, eq(wishlists.productId, products.id))
      .where(eq(wishlists.userId, userId));

    return res;
  }),

  // Contact Message endpoint
  submitContactMessage: publicQuery
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contactMessages).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
      });
      return { success: true };
    }),

  // My Orders endpoint
  getMyOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userIdStr = ctx.user.unionId.split(":")[1];
    if (!userIdStr) return [];
    const userId = parseInt(userIdStr, 10);

    const myOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return myOrders;
  }),

  // Stats for admin
  getStats: adminQuery.query(async () => {
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
