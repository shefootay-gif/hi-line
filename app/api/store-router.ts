import { z } from "zod";
import {
  createRouter,
  publicQuery,
  adminQuery,
  authedQuery,
} from "./middleware";
import { getDb } from "./queries/connection";
import { getCached, setCached } from "./cache";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { sendWhatsAppMessage } from "./whatsapp-service";
import { sendMetaCAPIEvent } from "./meta-capi";
import { getAffectedRows } from "./lib/db-result";
import { relatedProductIds } from "./lib/product-relations";
import { reverseOrderEffects } from "./lib/order-effects";
import {
  calculateOrderPricing,
  calculateVolumeDiscount,
} from "@contracts/order-pricing";
import {
  LEGACY_MARKETING_CATEGORY_SLUGS,
  PRIMARY_PRODUCT_CATEGORY,
} from "@contracts/product-category";
import {
  products,
  categories,
  faqs,
  storeSettings,
  seoPages,
  paymentSettings,
  shippingSettings,
  orders,
  orderItems,
  coupons,
  reviews,
  wishlists,
  contactMessages,
  inventoryMovements,
  returnRequests,
  adminNotifications,
  abandonedCarts,
  userAddresses,
  customers,
} from "@db/schema";
import { eq, desc, and, or, like, sql, inArray, notInArray } from "drizzle-orm";

function calculateOrderFingerprint(input: {
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  customerEmail?: string;
  shippingAddress: string;
  governorate?: string;
  city?: string;
  postalCode?: string;
  paymentMethod: string;
  notes?: string;
  source: string;
  items: { productId: number; quantity: number }[];
  couponCode?: string;
}) {
  const sortedItems = [...input.items].sort(
    (a, b) => a.productId - b.productId
  );
  const normalized = {
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerWhatsapp: input.customerWhatsapp?.trim() || null,
    customerEmail: input.customerEmail?.trim().toLowerCase() || null,
    shippingAddress: input.shippingAddress.trim(),
    governorate: input.governorate?.trim() || null,
    city: input.city?.trim() || null,
    postalCode: input.postalCode?.trim() || null,
    paymentMethod: input.paymentMethod,
    notes: input.notes?.trim() || null,
    source: input.source,
    items: sortedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    couponCode: input.couponCode?.trim().toUpperCase() || null,
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}

const categoryAliases: Record<string, string> = {
  all: "all",
  "all-products": "all",
  "roll-on": PRIMARY_PRODUCT_CATEGORY.slug,
  [PRIMARY_PRODUCT_CATEGORY.slug]: PRIMARY_PRODUCT_CATEGORY.slug,
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
      z
        .object({
          category: z.string().optional(),
          scent: z.string().optional(),
          featured: z.boolean().optional(),
          bestSeller: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
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
          like(products.scent, term)
        );
        if (searchCondition) conditions.push(searchCondition);
      }
      if (input?.category) {
        const categorySlug =
          categoryAliases[input.category.toLowerCase()] || input.category;
        if (categorySlug === "best-sellers") {
          conditions.push(eq(products.isBestSeller, true));
        } else if (categorySlug === "fresh-scents") {
          conditions.push(
            inArray(products.scent, ["Tropical Breeze", "Voyage"])
          );
        } else if (categorySlug === "fruity-scents") {
          conditions.push(
            inArray(products.scent, ["Candy Pop", "Sweet Mango"])
          );
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
      const relatedIds = relatedProductIds(product.relatedProducts);
      if (relatedIds.length > 0) {
        relatedProductsList = await db
          .select()
          .from(products)
          .where(inArray(products.id, relatedIds));
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
      .where(
        and(
          eq(categories.isActive, true),
          notInArray(categories.slug, [...LEGACY_MARKETING_CATEGORY_SLUGS])
        )
      )
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
    const cached = getCached<Record<string, string>>("settings");
    if (cached) return cached;

    const db = getDb();
    const settings = await db.select().from(storeSettings);
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value ?? "";
    }

    setCached("settings", settingsMap, 300); // 5 minutes
    return settingsMap;
  }),

  getSeoPages: publicQuery.query(async () => {
    return getDb().select().from(seoPages);
  }),

  // Payment Settings
  getPaymentMethods: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(paymentSettings)
      .where(
        and(
          eq(paymentSettings.isEnabled, true),
          inArray(paymentSettings.method, [
            "cash_on_delivery",
            "vodafone_cash",
            "instapay",
          ])
        )
      )
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
        idempotencyKey: z.string().trim().uuid(),
        customerName: z.string().trim().min(1).max(255),
        customerPhone: z.string().trim().min(1).max(50),
        customerWhatsapp: z.string().trim().max(50).optional(),
        customerEmail: z.string().email().optional(),
        shippingAddress: z.string().trim().min(1).max(2000),
        governorate: z.string().trim().max(100).optional(),
        city: z.string().trim().max(100).optional(),
        postalCode: z.string().trim().max(20).optional(),
        paymentMethod: z.enum([
          "cash_on_delivery",
          "vodafone_cash",
          "instapay",
          "bank_transfer",
          "paymob",
        ]),
        notes: z.string().max(2000).optional(),
        source: z.enum(["website", "whatsapp"]).default("website"),
        items: z
          .array(
            z.object({
              productId: z.number().int().positive(),
              quantity: z.number().int().min(1).max(99),
            })
          )
          .min(1),
        couponCode: z.string().trim().max(50).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (input.paymentMethod !== "cash_on_delivery") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only cash on delivery is currently available.",
        });
      }

      const [enabledPaymentMethod] = await db
        .select()
        .from(paymentSettings)
        .where(
          and(
            eq(paymentSettings.method, input.paymentMethod),
            eq(paymentSettings.isEnabled, true)
          )
        )
        .limit(1);

      if (!enabledPaymentMethod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Selected payment method is not available.",
        });
      }

      const currentFingerprint = calculateOrderFingerprint(input);

      // End-to-end public order creation idempotency pre-check
      if (input.idempotencyKey) {
        const [existingOrder] = await db
          .select()
          .from(orders)
          .where(eq(orders.idempotencyKey, input.idempotencyKey))
          .limit(1);

        if (existingOrder) {
          if (existingOrder.requestFingerprint !== currentFingerprint) {
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Idempotency key conflict: another order exists with this key but different details.",
            });
          }

          if (
            existingOrder.paymentStatus === "failed" ||
            existingOrder.orderStatus === "cancelled"
          ) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message:
                "The previous payment attempt failed. Please submit the order again.",
            });
          }

          return {
            orderId: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            total: existingOrder.total,
            discountAmount: existingOrder.discountAmount,
            paymobUrl: null,
          };
        }
      }

      const { nanoid } = await import("nanoid");
      const orderNumber = `HL${Date.now().toString(36).toUpperCase()}${nanoid(4).toUpperCase()}`;

      let result;
      try {
        result = await db.transaction(async tx => {
          // Fetch products and calculate all financial values server-side.
          const productIds = input.items.map(item => item.productId);
          const productDetails = await tx
            .select()
            .from(products)
            .where(inArray(products.id, productIds));

          if (productDetails.length !== new Set(productIds).size) {
            throw new Error("One or more products were not found");
          }

          let subtotal = 0;
          const orderItemsData = input.items.map(item => {
            const product = productDetails.find(
              (p: typeof products.$inferSelect) => p.id === item.productId
            );
            if (!product)
              throw new Error(`Product ${item.productId} not found`);
            if (!product.isActive)
              throw new Error(`Product ${product.nameEn} is not available`);
            if (product.stock < item.quantity) {
              throw new Error(
                `Insufficient stock for "${product.nameEn}". Available: ${product.stock}, Requested: ${item.quantity}`
              );
            }

            const unitPrice = parseFloat(product.salePrice ?? product.price);
            const totalPrice = unitPrice * item.quantity;
            subtotal += totalPrice;

            return {
              productId: item.productId,
              productName: product.nameEn,
              productNameAr: product.nameAr,
              scent: product.scent,
              quantity: item.quantity,
              unitPrice: unitPrice.toFixed(2),
              totalPrice: totalPrice.toFixed(2),
            };
          });

          // Shipping is calculated server-side from the selected governorate.
          let shippingFee = 0;
          if (input.governorate) {
            const shipping = await tx
              .select()
              .from(shippingSettings)
              .where(
                and(
                  eq(shippingSettings.governorate, input.governorate),
                  eq(shippingSettings.isActive, true)
                )
              )
              .limit(1);
            if (shipping[0]) {
              shippingFee = parseFloat(shipping[0].baseFee ?? "0");
            }
          }

          const freeShippingSetting = await tx
            .select()
            .from(storeSettings)
            .where(eq(storeSettings.key, "free_shipping_threshold"))
            .limit(1);
          if (freeShippingSetting[0]) {
            const threshold = parseFloat(
              freeShippingSetting[0].value ?? "999999"
            );
            if (subtotal >= threshold) shippingFee = 0;
          }

          const totalItems = input.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          let couponDiscountAmount = 0;
          let appliedCouponId: number | null = null;
          const normalizedCouponCode = input.couponCode?.trim().toUpperCase();

          if (normalizedCouponCode) {
            const [coupon] = await tx
              .select()
              .from(coupons)
              .where(eq(coupons.code, normalizedCouponCode))
              .limit(1);

            if (coupon) {
              const isValid =
                coupon.isActive &&
                (!coupon.expiresAt ||
                  new Date(coupon.expiresAt) > new Date()) &&
                (coupon.maxUsage === null ||
                  (coupon.currentUsage ?? 0) < coupon.maxUsage) &&
                subtotal >= parseFloat(coupon.minOrderValue ?? "0");

              if (isValid) {
                const val = parseFloat(coupon.discountValue);
                couponDiscountAmount =
                  coupon.discountType === "percentage"
                    ? (subtotal * val) / 100
                    : val;
                appliedCouponId = coupon.id;
              }
            }
          }

          const pricing = calculateOrderPricing({
            subtotal,
            itemCount: totalItems,
            couponDiscount: couponDiscountAmount,
            shippingFee,
          });
          const { discountAmount, total } = pricing;

          const orderResult = await tx.insert(orders).values({
            orderNumber,
            idempotencyKey: input.idempotencyKey,
            requestFingerprint: currentFingerprint,
            userId: ctx.user?.id || null,
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
            couponCode: normalizedCouponCode || null,
            total: total.toFixed(2),
            paymentMethod: input.paymentMethod,
            notes: input.notes,
            source: input.source,
          });

          const orderId = Number(orderResult[0].insertId);

          // Sync with customers directory
          const existingCustomer = await tx
            .select()
            .from(customers)
            .where(eq(customers.phone, input.customerPhone))
            .limit(1);

          if (existingCustomer[0]) {
            await tx
              .update(customers)
              .set({
                name: input.customerName,
                email: input.customerEmail || existingCustomer[0].email,
                whatsapp:
                  input.customerWhatsapp || existingCustomer[0].whatsapp,
                address: input.shippingAddress,
                governorate:
                  input.governorate || existingCustomer[0].governorate,
                city: input.city || existingCustomer[0].city,
                totalOrders: sql`${customers.totalOrders} + 1`,
                totalSpent: sql`${customers.totalSpent} + ${total.toFixed(2)}`,
                updatedAt: new Date(),
              })
              .where(eq(customers.id, existingCustomer[0].id));
          } else {
            await tx.insert(customers).values({
              name: input.customerName,
              phone: input.customerPhone,
              whatsapp: input.customerWhatsapp || null,
              email: input.customerEmail || null,
              address: input.shippingAddress,
              governorate: input.governorate || null,
              city: input.city || null,
              totalOrders: 1,
              totalSpent: total.toFixed(2),
              source: input.source || "website",
            });
          }

          // Atomic stock deduction: prevents stock from going below zero in concurrent orders.
          for (const item of input.items) {
            const product = productDetails.find(
              (p: typeof products.$inferSelect) => p.id === item.productId
            );
            if (!product)
              throw new Error(`Product ${item.productId} not found`);

            const stockUpdate = await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${item.quantity}` })
              .where(
                and(
                  eq(products.id, item.productId),
                  sql`${products.stock} >= ${item.quantity}`
                )
              );

            if (getAffectedRows(stockUpdate) !== 1) {
              throw new Error(
                "Insufficient stock. Please refresh your cart and try again."
              );
            }

            const [updatedProd] = await tx
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .limit(1);

            const newStock = updatedProd ? updatedProd.stock : 0;
            const previousStock = newStock + item.quantity;

            await tx.insert(inventoryMovements).values({
              productId: item.productId,
              orderId,
              type: "sale",
              quantity: -item.quantity,
              previousStock,
              newStock,
              reason: "Order stock deduction",
              reference: orderNumber,
            });
          }

          await tx
            .insert(orderItems)
            .values(orderItemsData.map(item => ({ orderId, ...item })));

          if (appliedCouponId) {
            const couponUpdate = await tx
              .update(coupons)
              .set({ currentUsage: sql`${coupons.currentUsage} + 1` })
              .where(
                and(
                  eq(coupons.id, appliedCouponId),
                  or(
                    sql`${coupons.maxUsage} IS NULL`,
                    sql`${coupons.currentUsage} < ${coupons.maxUsage}`
                  )
                )
              );

            if (getAffectedRows(couponUpdate) !== 1) {
              throw new Error(
                "Coupon usage limit reached. Please remove the coupon and try again."
              );
            }
          }

          return {
            orderId,
            orderNumber,
            total: total.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            totalNumber: total,
            input,
            appliedCouponId,
          };
        });
      } catch (err) {
        const error = err as { code?: string; message?: string };
        // Handle concurrent insert race condition via db constraint violation
        if (
          error.code === "ER_DUP_ENTRY" ||
          error.message?.includes("idempotency_key") ||
          error.message?.includes("Duplicate entry")
        ) {
          const [existingOrder] = await db
            .select()
            .from(orders)
            .where(eq(orders.idempotencyKey, input.idempotencyKey))
            .limit(1);

          if (existingOrder) {
            if (existingOrder.requestFingerprint !== currentFingerprint) {
              throw new TRPCError({
                code: "CONFLICT",
                message:
                  "Idempotency key conflict: another order exists with this key but different details.",
              });
            }

            if (
              existingOrder.paymentStatus === "failed" ||
              existingOrder.orderStatus === "cancelled"
            ) {
              throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message:
                  "The previous payment attempt failed. Please submit the order again.",
              });
            }

            return {
              orderId: existingOrder.id,
              orderNumber: existingOrder.orderNumber,
              total: existingOrder.total,
              discountAmount: existingOrder.discountAmount,
              paymobUrl: null,
            };
          }
        }
        throw err;
      }

      sendWhatsAppMessage(
        result.input.customerPhone,
        `Hi ${result.input.customerName}, your order #${result.orderNumber} has been received successfully! Total: ${result.total} EGP.`
      );

      // Send to Meta CAPI
      sendMetaCAPIEvent(
          "Purchase",
          {
            value: result.totalNumber,
            currency: "EGP",
            content_ids: result.input.items.map(i => i.productId.toString()),
            content_type: "product",
          },
          {
            phone: result.input.customerPhone,
            email: result.input.customerEmail,
            firstName: result.input.customerName.split(" ")[0],
            lastName: result.input.customerName.split(" ").slice(1).join(" "),
          }
        ).catch(() => {});

      return {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        total: result.total,
        discountAmount: result.discountAmount,
        paymobUrl: null,
      };
    }),

  saveCart: publicQuery
    .input(
      z.object({
        phone: z.string(),
        cartData: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .insert(abandonedCarts)
        .values({
          phone: input.phone,
          cartData: input.cartData,
        })
        .onDuplicateKeyUpdate({
          set: { cartData: input.cartData, updatedAt: new Date() },
        });
      return { success: true };
    }),

  validateCoupon: publicQuery
    .input(
      z.object({
        code: z.string(),
        subtotal: z.number().nonnegative(),
        itemCount: z.number().int().nonnegative().optional().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const normalizedCouponCode = input.code.trim().toUpperCase();
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, normalizedCouponCode))
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
        throw new Error(
          `Minimum order value to use this coupon is ${coupon.minOrderValue}`
        );
      }

      const val = parseFloat(coupon.discountValue);
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (input.subtotal * val) / 100;
      } else {
        discountAmount = val;
      }

      const volumeDiscount = calculateVolumeDiscount(
        input.subtotal,
        input.itemCount
      );
      const maximumCouponDiscount = Math.max(
        0,
        input.subtotal - volumeDiscount
      );
      if (discountAmount > maximumCouponDiscount) {
        discountAmount = maximumCouponDiscount;
      }

      return {
        valid: true,
        discountType: coupon.discountType,
        discountValue: val,
        discountAmount: discountAmount,
      };
    }),

  getOrderByNumber: publicQuery
    .input(
      z.object({
        orderNumber: z.string().trim().min(1),
        customerPhone: z.string().trim().min(1),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (orderResult.length === 0) return null;

      const order = orderResult[0];
      if (order.customerPhone.trim() !== input.customerPhone.trim()) {
        return null;
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  cancelOrder: publicQuery
    .input(
      z.object({
        orderNumber: z.string().trim().min(1),
        customerPhone: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.transaction(async tx => {
        const orderResult = await tx
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, input.orderNumber))
          .limit(1);

        if (orderResult.length === 0) {
          throw new Error("Order not found");
        }

        const order = orderResult[0];

        if (order.customerPhone.trim() !== input.customerPhone.trim()) {
          throw new Error("Order phone number does not match");
        }

        const statusUpdate = await tx
          .update(orders)
          .set({ orderStatus: "cancelled" })
          .where(
            and(
              eq(orders.id, order.id),
              inArray(orders.orderStatus, ["pending", "processing"])
            )
          );

        if (getAffectedRows(statusUpdate) !== 1) {
          throw new Error("Cannot cancel order at this stage");
        }

        await reverseOrderEffects(tx, order, "cancel");
      });

      return { success: true };
    }),

  // Reviews endpoints
  addReview: authedQuery
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;
      if (!userId) throw new Error("Invalid user session for review");

      await db.insert(reviews).values({
        productId: input.productId,
        userId: userId,
        rating: input.rating,
        comment: input.comment,
        images: input.images,
        status: "pending", // require admin approval by default
      });
      return { success: true };
    }),

  getReviews: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const res = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.productId, input.productId),
            eq(reviews.status, "approved")
          )
        );
      return res;
    }),

  // Wishlist endpoints
  toggleWishlist: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user.id;
      if (!userId) throw new Error("Invalid user session");

      const existing = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.productId, input.productId),
            eq(wishlists.userId, userId)
          )
        )
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
    const userId = ctx.user.id;
    if (!userId) return [];

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

  // Return / exchange request endpoint
  createReturnRequest: publicQuery
    .input(
      z.object({
        orderNumber: z.string().trim().min(1).max(50),
        customerPhone: z.string().trim().min(1).max(50),
        reason: z.string().trim().min(5).max(2000),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const orderResult = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.orderNumber, input.orderNumber),
            eq(orders.customerPhone, input.customerPhone)
          )
        )
        .limit(1);

      if (orderResult.length === 0) {
        throw new Error(
          "Order not found. Please check the order number and phone."
        );
      }

      const order = orderResult[0];

      const existingOpenRequest = await db
        .select({ id: returnRequests.id })
        .from(returnRequests)
        .where(
          and(
            eq(returnRequests.orderId, order.id),
            sql`${returnRequests.status} IN ('pending', 'approved', 'received')`
          )
        )
        .limit(1);

      if (existingOpenRequest.length > 0) {
        throw new Error("A return request already exists for this order.");
      }

      const result = await db.insert(returnRequests).values({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        reason: input.reason,
        images: input.images ?? null,
        status: "pending",
      });

      const requestId = Number(result[0].insertId);

      await db.insert(adminNotifications).values({
        title: "New return request",
        message: `Return request for order ${order.orderNumber} from ${order.customerName}`,
        type: "return",
        entityType: "return_request",
        entityId: requestId,
      });

      return { success: true, id: requestId };
    }),

  // Contact Message endpoint
  submitContactMessage: publicQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        message: z.string().min(10),
      })
    )
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
    const userId = ctx.user.id;
    if (!userId) return [];

    const conditions = [eq(orders.userId, userId)];
    if (ctx.user.email) {
      conditions.push(eq(orders.customerEmail, ctx.user.email));
    }

    const myOrders = await db
      .select()
      .from(orders)
      .where(or(...conditions))
      .orderBy(desc(orders.createdAt));

    return myOrders;
  }),

  // Address Management
  listAddresses: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(userAddresses)
      .where(eq(userAddresses.userId, ctx.user.id))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));
  }),

  createAddress: authedQuery
    .input(
      z.object({
        title: z.string().trim().min(1).max(100),
        fullName: z.string().trim().min(1).max(255),
        phone: z.string().trim().min(1).max(50),
        governorate: z.string().trim().min(1).max(100),
        city: z.string().trim().max(100).optional(),
        address: z.string().trim().min(1),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (input.isDefault) {
        // unset other defaults
        await db
          .update(userAddresses)
          .set({ isDefault: false })
          .where(eq(userAddresses.userId, ctx.user.id));
      }
      await db.insert(userAddresses).values({
        userId: ctx.user.id,
        title: input.title,
        fullName: input.fullName,
        phone: input.phone,
        governorate: input.governorate,
        city: input.city || null,
        address: input.address,
        isDefault: input.isDefault,
      });
      return { success: true };
    }),

  updateAddress: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().trim().min(1).max(100),
        fullName: z.string().trim().min(1).max(255),
        phone: z.string().trim().min(1).max(50),
        governorate: z.string().trim().min(1).max(100),
        city: z.string().trim().max(100).optional(),
        address: z.string().trim().min(1),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (input.isDefault) {
        // unset other defaults
        await db
          .update(userAddresses)
          .set({ isDefault: false })
          .where(eq(userAddresses.userId, ctx.user.id));
      }
      await db
        .update(userAddresses)
        .set({
          title: input.title,
          fullName: input.fullName,
          phone: input.phone,
          governorate: input.governorate,
          city: input.city || null,
          address: input.address,
          isDefault: input.isDefault,
        })
        .where(
          and(
            eq(userAddresses.id, input.id),
            eq(userAddresses.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  deleteAddress: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .delete(userAddresses)
        .where(
          and(
            eq(userAddresses.id, input.id),
            eq(userAddresses.userId, ctx.user.id)
          )
        );
      return { success: true };
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
