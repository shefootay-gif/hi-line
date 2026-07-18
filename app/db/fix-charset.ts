import mysql from "mysql2/promise";
import { env } from "../api/lib/env";

async function main() {
  console.log("Connecting to database to fix charset...");
  
  // Extract connection details from DATABASE_URL
  const connection = await mysql.createConnection(env.databaseUrl);
  
  console.log("Altering database charset...");
  await connection.query(
    "ALTER DATABASE `hiline_pro_care` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  );
  
  const tables = [
    "categories",
    "products",
    "faqs",
    "store_settings",
    "payment_settings",
    "shipping_settings",
    "users",
    "orders",
    "order_items",
    "reviews",
    "wishlists",
    "contact_messages",
    "inventory_movements",
    "return_requests",
    "admin_notifications",
    "abandoned_carts",
  ];
  
  for (const table of tables) {
    try {
      console.log(`Converting table ${table} to utf8mb4...`);
      await connection.query(
        `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Could not convert table ${table}: ${message}`);
    }
  }
  
  await connection.end();
  console.log("Charset fix complete!");
}

main().catch(console.error);
