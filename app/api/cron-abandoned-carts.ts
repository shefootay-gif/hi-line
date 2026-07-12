import { eq, and, isNull, sql } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { abandonedCarts } from "../db/schema";
import { sendWhatsAppMessage } from "./whatsapp-service";

export const processAbandonedCarts = async () => {
  try {
    const db = getDb();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const carts = await db
      .select()
      .from(abandonedCarts)
      .where(
        and(
          eq(abandonedCarts.status, "pending"),
          isNull(abandonedCarts.reminderSentAt),
          sql`${abandonedCarts.updatedAt} <= ${oneDayAgo}`,
          sql`${abandonedCarts.updatedAt} >= ${twoDaysAgo}`
        )
      )
      .limit(50);

    for (const cart of carts) {
      const message = `Hi! We noticed you left some items in your cart. Complete your purchase now and get 10% off with code CART10!`;
      const sent = await sendWhatsAppMessage(cart.phone, message);
      
      if (sent) {
        await db
          .update(abandonedCarts)
          .set({ reminderSentAt: new Date(), status: "recovered" })
          .where(eq(abandonedCarts.id, cart.id));
      }
    }
    console.log(`Processed ${carts.length} abandoned carts.`);
  } catch (err) {
    console.error("Failed to process abandoned carts:", err);
  }
};
