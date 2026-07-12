import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  boolean,
  json,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

// Users table (from auth)
export const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  gender: varchar("gender", { length: 20 }),
  birthday: varchar("birthday", { length: 50 }),
  nationality: varchar("nationality", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = mysqlTable("categories", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  image: text("image"),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Category = typeof categories.$inferSelect;

// Products table
export const products = mysqlTable("products", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  shortDescriptionEn: text("short_description_en"),
  shortDescriptionAr: text("short_description_ar"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  stock: int("stock").default(0).notNull(),
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  scent: varchar("scent", { length: 100 }).notNull(),
  scentColor: varchar("scent_color", { length: 20 }),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  images: json("images").$type<string[]>(),
  benefits: json("benefits").$type<string[]>(),
  benefitsAr: json("benefits_ar").$type<string[]>(),
  ingredients: text("ingredients"),
  ingredientsAr: text("ingredients_ar"),
  usageInstructions: text("usage_instructions"),
  usageInstructionsAr: text("usage_instructions_ar"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  relatedProducts: json("related_products").$type<number[]>(),
  flashSalePrice: decimal("flash_sale_price", { precision: 10, scale: 2 }),
  flashSaleEndsAt: timestamp("flash_sale_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Product = typeof products.$inferSelect;

// Customers table
export const customers = mysqlTable("customers", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  governorate: varchar("governorate", { length: 100 }),
  city: varchar("city", { length: 100 }),
  notes: text("notes"),
  totalOrders: int("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
  source: varchar("source", { length: 50 }).default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Customer = typeof customers.$inferSelect;

// Orders table
export const orders = mysqlTable("orders", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  userId: bigint("user_id", { mode: "number", unsigned: true }),
  customerId: bigint("customer_id", { mode: "number", unsigned: true }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  customerWhatsapp: varchar("customer_whatsapp", { length: 50 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  shippingAddress: text("shipping_address").notNull(),
  governorate: varchar("governorate", { length: 100 }),
  city: varchar("city", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  couponCode: varchar("coupon_code", { length: 50 }),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", [
    "cash_on_delivery",
    "vodafone_cash",
    "instapay",
    "bank_transfer",
    "paymob",
  ]).default("cash_on_delivery"),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "failed", "refunded"])
    .default("pending"),
  orderStatus: mysqlEnum("order_status", [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]).default("pending"),
  notes: text("notes"),
  source: mysqlEnum("source", ["website", "whatsapp"]).default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => {
  return {
    phoneIdx: index("customer_phone_idx").on(table.customerPhone),
    statusIdx: index("order_status_idx").on(table.orderStatus),
  };
});

export type Order = typeof orders.$inferSelect;

// Order Items table
export const orderItems = mysqlTable("order_items", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productNameAr: varchar("product_name_ar", { length: 255 }),
  scent: varchar("scent", { length: 100 }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// Store Settings table
export const storeSettings = mysqlTable("store_settings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StoreSetting = typeof storeSettings.$inferSelect;

// Payment Settings table
export const paymentSettings = mysqlTable("payment_settings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  method: varchar("method", { length: 50 }).notNull().unique(),
  isEnabled: boolean("is_enabled").default(true),
  displayName: varchar("display_name", { length: 255 }),
  displayNameAr: varchar("display_name_ar", { length: 255 }),
  accountNumber: varchar("account_number", { length: 255 }),
  accountName: varchar("account_name", { length: 255 }),
  instructions: text("instructions"),
  instructionsAr: text("instructions_ar"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PaymentSetting = typeof paymentSettings.$inferSelect;

// Shipping Settings table
export const shippingSettings = mysqlTable("shipping_settings", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  governorate: varchar("governorate", { length: 100 }).notNull(),
  governorateAr: varchar("governorate_ar", { length: 100 }),
  baseFee: decimal("base_fee", { precision: 10, scale: 2 }).default("0"),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),
  estimatedDays: varchar("estimated_days", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type ShippingSetting = typeof shippingSettings.$inferSelect;

// Media/Ads table
export const mediaAds = mysqlTable("media_ads", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["banner", "video", "slider", "hero"]).default("banner"),
  mediaUrl: text("media_url").notNull(),
  linkUrl: text("link_url"),
  position: varchar("position", { length: 100 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type MediaAd = typeof mediaAds.$inferSelect;

// FAQ table
export const faqs = mysqlTable("faqs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  questionEn: text("question_en").notNull(),
  questionAr: text("question_ar").notNull(),
  answerEn: text("answer_en").notNull(),
  answerAr: text("answer_ar").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;

// Coupons table
export const coupons = mysqlTable("coupons", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discount_type", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }).default("0"),
  maxUsage: int("max_usage"),
  currentUsage: int("current_usage").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Coupon = typeof coupons.$inferSelect;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  images: json("images").$type<string[]>(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Review = typeof reviews.$inferSelect;

// Wishlists table
export const wishlists = mysqlTable("wishlists", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Wishlist = typeof wishlists.$inferSelect;

// Contact Messages table
export const contactMessages = mysqlTable("contact_messages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

// Password Reset Tokens table
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;


// Dropshipping Suppliers table
export const dropshippingSuppliers = mysqlTable("dropshipping_suppliers", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  category: varchar("category", { length: 150 }).default("Beauty & Personal Care"),
  contactName: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  catalogUrl: text("catalog_url"),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
  shippingDays: varchar("shipping_days", { length: 50 }).default("3-5"),
  status: mysqlEnum("status", ["active", "pending", "inactive"]).default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type DropshippingSupplier = typeof dropshippingSuppliers.$inferSelect;

// Dropshipping Supplier Products / Catalog table
export const dropshippingSupplierProducts = mysqlTable("dropshipping_supplier_products", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  category: varchar("category", { length: 150 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  suggestedPrice: decimal("suggested_price", { precision: 10, scale: 2 }),
  stock: int("stock").default(0),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
  status: mysqlEnum("status", ["available", "out_of_stock", "draft"]).default("available"),
  approvedProductId: bigint("approved_product_id", { mode: "number", unsigned: true }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type DropshippingSupplierProduct = typeof dropshippingSupplierProducts.$inferSelect;

// Dropshipping Import Logs table
export const dropshippingImportLogs = mysqlTable("dropshipping_import_logs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  importedCount: int("imported_count").default(0),
  source: varchar("source", { length: 100 }).default("manual"),
  status: mysqlEnum("status", ["success", "failed"]).default("success"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DropshippingImportLog = typeof dropshippingImportLogs.$inferSelect;

// Media Buyer Campaigns table
export const mediaBuyerCampaigns = mysqlTable("media_buyer_campaigns", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "tiktok", "google"]).default("facebook"),
  status: mysqlEnum("status", ["active", "paused", "draft"]).default("draft"),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0"),
  spend: decimal("spend", { precision: 12, scale: 2 }).default("0"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  ordersCount: int("orders_count").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 150 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  linkUrl: text("link_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type MediaBuyerCampaign = typeof mediaBuyerCampaigns.$inferSelect;

// Inventory movement audit table
export const inventoryMovements = mysqlTable("inventory_movements", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  productId: bigint("product_id", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }),
  supplierProductId: bigint("supplier_product_id", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", ["sale", "restock", "adjustment", "return", "import", "cancel"]).notNull(),
  quantity: int("quantity").notNull(),
  previousStock: int("previous_stock"),
  newStock: int("new_stock"),
  reason: varchar("reason", { length: 255 }),
  reference: varchar("reference", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// Admin activity log table
export const adminActivityLogs = mysqlTable("admin_activity_logs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  adminUserId: bigint("admin_user_id", { mode: "number", unsigned: true }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  details: json("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;



// Payment transactions table
export const paymentTransactions = mysqlTable("payment_transactions", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }),
  orderNumber: varchar("order_number", { length: 50 }),
  provider: mysqlEnum("provider", ["manual", "tap", "hyperpay", "paytabs", "stripe", "moyasar", "myfatoorah"]).default("manual"),
  method: varchar("method", { length: 100 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("EGP"),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded", "cancelled"]).default("pending"),
  providerReference: varchar("provider_reference", { length: 255 }),
  checkoutUrl: text("checkout_url"),
  rawPayload: json("raw_payload").$type<Record<string, unknown>>(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Shipping providers table
export const shippingProviders = mysqlTable("shipping_providers", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  trackingUrlTemplate: text("tracking_url_template"),
  baseFee: decimal("base_fee", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type ShippingProvider = typeof shippingProviders.$inferSelect;

// Shipments table
export const shipments = mysqlTable("shipments", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  providerId: bigint("provider_id", { mode: "number", unsigned: true }),
  trackingNumber: varchar("tracking_number", { length: 150 }),
  status: mysqlEnum("status", ["pending", "ready", "shipped", "out_for_delivery", "delivered", "failed", "returned"]).default("pending"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  estimatedDelivery: timestamp("estimated_delivery"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type Shipment = typeof shipments.$inferSelect;

// Invoices table
export const invoices = mysqlTable("invoices", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 80 }).notNull().unique(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "issued", "paid", "cancelled"]).default("issued"),
  issuedAt: timestamp("issued_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type Invoice = typeof invoices.$inferSelect;

// Notifications table
export const adminNotifications = mysqlTable("admin_notifications", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["order", "payment", "shipping", "inventory", "system", "return"]).default("system"),
  isRead: boolean("is_read").default(false),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: bigint("entity_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type AdminNotification = typeof adminNotifications.$inferSelect;

// Return / refund requests table
export const returnRequests = mysqlTable("return_requests", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  customerName: varchar("customer_name", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  reason: text("reason").notNull(),
  images: json("images").$type<string[]>(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "received", "refunded", "closed"]).default("pending"),
  refundAmount: decimal("refund_amount", { precision: 12, scale: 2 }).default("0"),
  restockItems: boolean("restock_items").default(false),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type ReturnRequest = typeof returnRequests.$inferSelect;

// Upload / media assets table
export const uploadAssets = mysqlTable("upload_assets", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }),
  sizeBytes: int("size_bytes"),
  width: int("width"),
  height: int("height"),
  folder: varchar("folder", { length: 120 }).default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type UploadAsset = typeof uploadAssets.$inferSelect;

// SEO pages / metadata table
export const seoPages = mysqlTable("seo_pages", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  path: varchar("path", { length: 255 }).notNull().unique(),
  titleEn: varchar("title_en", { length: 255 }),
  titleAr: varchar("title_ar", { length: 255 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  keywords: text("keywords"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  isIndexed: boolean("is_indexed").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type SeoPage = typeof seoPages.$inferSelect;

// Admin staff / permissions registry table
export const adminStaffUsers = mysqlTable("admin_staff_users", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["owner", "admin", "orders", "inventory", "marketing", "support", "viewer"]).default("viewer"),
  permissions: json("permissions").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export type AdminStaffUser = typeof adminStaffUsers.$inferSelect;

// Export jobs table
export const exportJobs = mysqlTable("export_jobs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  type: mysqlEnum("type", ["orders", "customers", "products", "inventory", "campaigns", "activity", "returns"]).notNull(),
  status: mysqlEnum("status", ["ready", "failed"]).default("ready"),
  fileName: varchar("file_name", { length: 255 }),
  rowCount: int("row_count").default(0),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type ExportJob = typeof exportJobs.$inferSelect;

// Backup jobs table
export const backupJobs = mysqlTable("backup_jobs", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["ready", "failed"]).default("ready"),
  content: json("content").$type<Record<string, unknown>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type BackupJob = typeof backupJobs.$inferSelect;


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

export const userAddresses = mysqlTable("user_addresses", {
  id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 100 }).default("Home").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  governorate: varchar("governorate", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  address: text("address").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type UserAddress = typeof userAddresses.$inferSelect;

