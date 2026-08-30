import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { rateLimiter } from "./lib/rate-limiter";
import { getDb } from "./queries/connection";
import {
  orders,
  paymentTransactions,
  products,
  faqs,
  orderItems,
  coupons,
  inventoryMovements,
  seoPages,
} from "../db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import crypto from "crypto";
import { sendMetaCAPIEvent } from "./meta-capi";
import { buildSitemap } from "./lib/sitemap";
import { buildAiCatalog } from "./lib/ai-catalog";
import { getAffectedRows } from "./lib/db-result";

process.on("uncaughtException", err => {
  console.error("CRITICAL UNCAUGHT EXCEPTION:", err);
});
process.on("unhandledRejection", reason => {
  console.error("CRITICAL UNHANDLED REJECTION:", reason);
});

const app = new Hono<{ Bindings: HttpBindings }>();
const publicOrigin = env.isProduction
  ? "https://bellorypharma.com"
  : undefined;

app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)",
  );
  if (env.isProduction) {
    c.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get("/sitemap.xml", async c => {
  const activeProducts = await getDb()
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isActive, true));
  const sitemap = buildSitemap(
    publicOrigin ?? new URL(c.req.url).origin,
    activeProducts,
    await getDb().select().from(seoPages),
  );

  return c.body(sitemap, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});
app.get("/llms-full.txt", async c => {
  const db = getDb();
  const [activeProducts, activeFaqs] = await Promise.all([
    db
      .select({
        slug: products.slug,
        nameEn: products.nameEn,
        nameAr: products.nameAr,
        descriptionEn: products.descriptionEn,
        descriptionAr: products.descriptionAr,
        shortDescriptionEn: products.shortDescriptionEn,
        shortDescriptionAr: products.shortDescriptionAr,
        price: products.price,
        salePrice: products.salePrice,
        stock: products.stock,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.nameEn)),
    db
      .select({
        questionEn: faqs.questionEn,
        questionAr: faqs.questionAr,
        answerEn: faqs.answerEn,
        answerAr: faqs.answerAr,
      })
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(asc(faqs.sortOrder)),
  ]);
  const catalog = buildAiCatalog(
    publicOrigin ?? new URL(c.req.url).origin,
    activeProducts,
    activeFaqs,
  );

  return c.body(catalog, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "X-Robots-Tag": "index, follow",
  });
});
app.use("/api/*", rateLimiter({ limit: 300, windowMs: 60000 }));
app.get("/api/health/ready", async c => {
  try {
    await getDb().execute(sql`SELECT 1`);
    return c.json({ status: "ready" });
  } catch {
    return c.json({ status: "unavailable" }, 503);
  }
});
app.use("/api/trpc/*", async c => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.post("/api/payments/paymob/callback", async c => {
  if (!env.paymobEnabled) {
    return c.json({ error: "Not Found" }, 404);
  }

  try {
    const hmac = c.req.query("hmac");
    if (!hmac) {
      return c.json({ error: "Missing hmac signature" }, 401);
    }

    if (!/^[a-fA-F0-9]{128}$/.test(hmac)) {
      return c.json({ error: "Invalid hmac signature format" }, 401);
    }

    const payload = await c.req.json();
    const obj = payload.obj;
    if (!obj) {
      return c.json({ error: "Invalid payload body" }, 400);
    }

    const source_data_pan = obj.source_data?.pan || "";
    const source_data_sub_type = obj.source_data?.sub_type || "";
    const source_data_type = obj.source_data?.type || "";

    const concatenatedString =
      String(obj.amount_cents) +
      String(obj.created_at) +
      String(obj.currency) +
      String(obj.error_occured) +
      String(obj.has_parent_transaction) +
      String(obj.id) +
      String(obj.integration_id) +
      String(obj.is_3d_secure) +
      String(obj.is_auth) +
      String(obj.is_capture) +
      String(obj.is_refunded) +
      String(obj.is_standalone_payment) +
      String(obj.is_voided) +
      String(obj.order?.id) +
      String(obj.owner) +
      String(obj.pending) +
      String(source_data_pan) +
      String(source_data_sub_type) +
      String(source_data_type) +
      String(obj.success);

    const calculatedHmac = crypto
      .createHmac("sha512", env.paymobHmacSecret)
      .update(concatenatedString)
      .digest("hex");

    const bufferA = Buffer.from(hmac, "hex");
    const bufferB = Buffer.from(calculatedHmac, "hex");

    if (
      bufferA.length !== bufferB.length ||
      !crypto.timingSafeEqual(bufferA, bufferB)
    ) {
      return c.json({ error: "Invalid hmac signature" }, 401);
    }

    if (payload.type !== "TRANSACTION") {
      return c.json({
        success: true,
        message: "Non-transaction event skipped",
      });
    }

    const orderNumber = obj.order?.merchant_order_id;
    if (!orderNumber) {
      return c.json({ error: "Missing merchant_order_id" }, 400);
    }

    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const centsAmount = Math.round(parseFloat(order.total) * 100);
    if (centsAmount !== Number(obj.amount_cents) || obj.currency !== "EGP") {
      return c.json({ error: "Amount or currency mismatch" }, 400);
    }

    const paymobOrderId = String(obj.order?.id || "");
    const paymobTransactionId = String(obj.id || "");
    if (!paymobOrderId || !paymobTransactionId) {
      return c.json({ error: "Missing provider identifiers" }, 400);
    }

    const isFalse = (value: unknown) =>
      value === false || String(value) === "false";
    const isPaid =
      (obj.success === true || String(obj.success) === "true") &&
      isFalse(obj.pending) &&
      isFalse(obj.error_occured) &&
      isFalse(obj.is_voided) &&
      isFalse(obj.is_refunded);
    const isFailed =
      (obj.success === false || String(obj.success) === "false") &&
      (obj.pending === false || String(obj.pending) === "false");

    // Do not overwrite a paid transaction/order with failed or stale events
    if (order.paymentStatus === "paid") {
      return c.json({
        success: true,
        message: "Order is already marked as paid",
      });
    }

    // Lookup transaction by provider transaction ID (event idempotency boundary)
    let [existingTx] = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.providerTransactionId, paymobTransactionId))
      .limit(1);

    if (!existingTx) {
      [existingTx] = await db
        .select()
        .from(paymentTransactions)
        .where(
          and(
            eq(paymentTransactions.orderId, order.id),
            eq(paymentTransactions.provider, "paymob"),
            eq(paymentTransactions.status, "pending")
          )
        )
        .limit(1);
    }

    if (existingTx) {
      if (existingTx.status === "paid") {
        return c.json({
          success: true,
          message: "Transaction is already paid",
        });
      }
      if (existingTx.status === "failed" && isFailed) {
        return c.json({
          success: true,
          message: "Transaction is already failed",
        });
      }
      if (
        existingTx.providerOrderId &&
        existingTx.providerOrderId !== paymobOrderId
      ) {
        return c.json({ error: "Provider order ID mismatch" }, 400);
      }
    }

    const newPaymentStatus = isPaid ? "paid" : isFailed ? "failed" : "pending";

    const auditFields = {
      txnId: obj.id,
      orderId: obj.order?.id,
      merchantOrderId: obj.order?.merchant_order_id,
      amountCents: obj.amount_cents,
      currency: obj.currency,
      success: obj.success,
      pending: obj.pending,
      isRefunded: obj.is_refunded,
      isVoided: obj.is_voided,
      paymentMethodSubType: obj.source_data?.sub_type || "",
    };

    let orderTransitionApplied = false;
    await db.transaction(async tx => {
      if (existingTx) {
        await tx
          .update(paymentTransactions)
          .set({
            status: newPaymentStatus,
            providerOrderId: paymobOrderId,
            providerTransactionId: paymobTransactionId,
            providerReference: paymobTransactionId,
            rawPayload: auditFields,
            paidAt: newPaymentStatus === "paid" ? new Date() : null,
          })
          .where(eq(paymentTransactions.id, existingTx.id));
      } else {
        await tx.insert(paymentTransactions).values({
          orderId: order.id,
          orderNumber: order.orderNumber,
          provider: "paymob",
          method: "paymob",
          amount: order.total,
          currency: "EGP",
          status: newPaymentStatus,
          providerOrderId: paymobOrderId,
          providerTransactionId: paymobTransactionId,
          providerReference: paymobTransactionId,
          rawPayload: auditFields,
          paidAt: newPaymentStatus === "paid" ? new Date() : null,
        });
      }

      // Perform conditional transition status on orders (out-of-order defense)
      const updateResult = await tx
        .update(orders)
        .set({
          paymentStatus: newPaymentStatus,
          orderStatus:
            newPaymentStatus === "paid"
              ? "processing"
              : newPaymentStatus === "failed"
                ? "cancelled"
                : "pending",
        })
        .where(
          and(eq(orders.id, order.id), eq(orders.paymentStatus, "pending"))
        );

      const affected = getAffectedRows(updateResult);
      orderTransitionApplied = affected === 1;

      if (newPaymentStatus === "failed" && affected === 1) {
        const itemsToRestore = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        for (const item of itemsToRestore) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${item.quantity}` })
            .where(eq(products.id, item.productId));

          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (product) {
            const newStock = product.stock;
            const previousStock = newStock - item.quantity;

            await tx.insert(inventoryMovements).values({
              productId: item.productId,
              orderId: order.id,
              type: "cancel",
              quantity: item.quantity,
              previousStock,
              newStock,
              reason: "Payment failure - Stock restored",
              reference: order.orderNumber,
            });
          }
        }

        if (order.couponCode) {
          const [coupon] = await tx
            .select()
            .from(coupons)
            .where(eq(coupons.code, order.couponCode))
            .limit(1);

          if (coupon) {
            await tx
              .update(coupons)
              .set({
                currentUsage: sql`GREATEST(${coupons.currentUsage} - 1, 0)`,
              })
              .where(eq(coupons.id, coupon.id));
          }
        }
      }
    });

    if (newPaymentStatus === "paid" && orderTransitionApplied) {
      void sendMetaCAPIEvent(
        "Purchase",
        {
          value: Number(order.total),
          currency: "EGP",
          content_type: "product",
        },
        {
          phone: order.customerPhone ?? undefined,
          email: order.customerEmail ?? undefined,
          firstName: order.customerName?.split(" ")[0],
        }
      ).catch(() => {});
    }

    return c.json({
      success: true,
      message: "Order payment status processed successfully",
    });
  } catch (error) {
    console.error("Paymob callback handler error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.all("/api/*", c => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
