import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString || connectionString.startsWith("#") || !connectionString.includes("://")) {
  throw new Error("DATABASE_URL must be a valid MySQL connection URL");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
