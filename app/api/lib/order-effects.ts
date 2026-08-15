import { getDb } from "../queries/connection";
import {
  coupons,
  customers,
  inventoryMovements,
  orderItems,
  orders,
  products,
} from "@db/schema";
import { eq, sql } from "drizzle-orm";

type DbTransaction = Parameters<
  Parameters<ReturnType<typeof getDb>["transaction"]>[0]
>[0];

type ReversibleOrder = Pick<
  typeof orders.$inferSelect,
  "id" | "orderNumber" | "couponCode" | "customerPhone" | "total"
>;

export async function restoreOrderInventory(
  tx: DbTransaction,
  order: ReversibleOrder,
  movementType: "cancel" | "return" = "cancel"
) {
  const items = await tx
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  for (const item of items) {
    await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}` })
      .where(eq(products.id, item.productId));

    const [updatedProduct] = await tx
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    const newStock = updatedProduct?.stock ?? null;

    await tx.insert(inventoryMovements).values({
      productId: item.productId,
      orderId: order.id,
      type: movementType,
      quantity: item.quantity,
      previousStock: newStock === null ? null : newStock - item.quantity,
      newStock,
      reason:
        movementType === "return"
          ? "Order refund stock return"
          : "Order cancellation stock return",
      reference: order.orderNumber,
    });
  }
}

export async function reverseOrderAccounting(
  tx: DbTransaction,
  order: ReversibleOrder
) {
  if (order.couponCode) {
    await tx
      .update(coupons)
      .set({
        currentUsage: sql`GREATEST(COALESCE(${coupons.currentUsage}, 0) - 1, 0)`,
      })
      .where(eq(coupons.code, order.couponCode));
  }

  const [customer] = await tx
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.phone, order.customerPhone))
    .limit(1);
  if (customer) {
    await tx
      .update(customers)
      .set({
        totalOrders: sql`GREATEST(COALESCE(${customers.totalOrders}, 0) - 1, 0)`,
        totalSpent: sql`GREATEST(COALESCE(${customers.totalSpent}, 0) - ${order.total}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customer.id));
  }
}

export async function reverseOrderEffects(
  tx: DbTransaction,
  order: ReversibleOrder,
  movementType: "cancel" | "return" = "cancel"
) {
  await restoreOrderInventory(tx, order, movementType);
  await reverseOrderAccounting(tx, order);
}
