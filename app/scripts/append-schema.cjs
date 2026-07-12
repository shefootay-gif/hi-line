const fs = require('fs');
let content = fs.readFileSync('db/schema.ts', 'utf8');

const tableCode = `
export const abandonedCarts = mysqlTable("abandoned_carts", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  cartData: json("cart_data").notNull(),
  status: mysqlEnum("status", ["pending", "recovered", "ignored"]).default("pending"),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
`;

fs.writeFileSync('db/schema.ts', content + "\n" + tableCode);
