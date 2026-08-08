CREATE TABLE `abandoned_carts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`cart_data` json NOT NULL,
	`status` enum('pending','recovered','ignored') DEFAULT 'pending',
	`reminder_sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandoned_carts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_activity_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`admin_user_id` bigint unsigned,
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` bigint unsigned,
	`details` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_notifications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('order','payment','shipping','inventory','system','return') DEFAULT 'system',
	`is_read` boolean DEFAULT false,
	`entity_type` varchar(100),
	`entity_id` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_staff_users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`role` enum('owner','admin','orders','inventory','marketing','support','viewer') DEFAULT 'viewer',
	`permissions` json,
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_staff_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backup_jobs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`label` varchar(255) NOT NULL,
	`status` enum('ready','failed') DEFAULT 'ready',
	`content` json,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backup_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description_en` text,
	`description_ar` text,
	`image` text,
	`parent_id` bigint unsigned,
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`message` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discount_type` enum('percentage','fixed') NOT NULL,
	`discount_value` decimal(10,2) NOT NULL,
	`min_order_value` decimal(10,2) DEFAULT '0',
	`max_usage` int,
	`current_usage` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`email` varchar(320),
	`address` text,
	`governorate` varchar(100),
	`city` varchar(100),
	`notes` text,
	`total_orders` int DEFAULT 0,
	`total_spent` decimal(12,2) DEFAULT '0',
	`source` varchar(50) DEFAULT 'website',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dropshipping_import_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`imported_count` int DEFAULT 0,
	`source` varchar(100) DEFAULT 'manual',
	`status` enum('success','failed') DEFAULT 'success',
	`message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dropshipping_import_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dropshipping_supplier_products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`supplier_id` bigint unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100),
	`category` varchar(150),
	`cost_price` decimal(10,2) NOT NULL,
	`suggested_price` decimal(10,2),
	`stock` int DEFAULT 0,
	`image_url` text,
	`source_url` text,
	`status` enum('available','out_of_stock','draft') DEFAULT 'available',
	`approved_product_id` bigint unsigned,
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dropshipping_supplier_products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dropshipping_suppliers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`category` varchar(150) DEFAULT 'Beauty & Personal Care',
	`contact_name` varchar(255),
	`phone` varchar(50),
	`email` varchar(320),
	`website` text,
	`catalog_url` text,
	`rating` decimal(3,1) DEFAULT '0',
	`shipping_days` varchar(50) DEFAULT '3-5',
	`status` enum('active','pending','inactive') DEFAULT 'active',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dropshipping_suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `export_jobs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`type` enum('orders','customers','products','inventory','campaigns','activity','returns') NOT NULL,
	`status` enum('ready','failed') DEFAULT 'ready',
	`file_name` varchar(255),
	`row_count` int DEFAULT 0,
	`content` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `export_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`question_en` text NOT NULL,
	`question_ar` text NOT NULL,
	`answer_en` text NOT NULL,
	`answer_ar` text NOT NULL,
	`category` varchar(100) DEFAULT 'general',
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`order_id` bigint unsigned,
	`supplier_product_id` bigint unsigned,
	`type` enum('sale','restock','adjustment','return','import','cancel') NOT NULL,
	`quantity` int NOT NULL,
	`previous_stock` int,
	`new_stock` int,
	`reason` varchar(255),
	`reference` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventory_movements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`invoice_number` varchar(80) NOT NULL,
	`subtotal` decimal(12,2) DEFAULT '0',
	`tax_amount` decimal(12,2) DEFAULT '0',
	`shipping_fee` decimal(10,2) DEFAULT '0',
	`discount_amount` decimal(10,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	`status` enum('draft','issued','paid','cancelled') DEFAULT 'issued',
	`issued_at` timestamp DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoice_number_unique` UNIQUE(`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `media_ads` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` enum('banner','video','slider','hero') DEFAULT 'banner',
	`media_url` text NOT NULL,
	`link_url` text,
	`position` varchar(100),
	`sort_order` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`start_date` timestamp,
	`end_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_buyer_campaigns` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` enum('facebook','instagram','tiktok','google') DEFAULT 'facebook',
	`status` enum('active','paused','draft') DEFAULT 'draft',
	`budget` decimal(12,2) DEFAULT '0',
	`spend` decimal(12,2) DEFAULT '0',
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`orders_count` int DEFAULT 0,
	`revenue` decimal(12,2) DEFAULT '0',
	`utm_source` varchar(100),
	`utm_medium` varchar(100),
	`utm_campaign` varchar(150),
	`start_date` timestamp,
	`end_date` timestamp,
	`link_url` text,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_buyer_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`product_name_ar` varchar(255),
	`scent` varchar(100),
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2) NOT NULL,
	`total_price` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_number` varchar(50) NOT NULL,
	`idempotency_key` varchar(255),
	`request_fingerprint` varchar(64),
	`user_id` bigint unsigned,
	`customer_id` bigint unsigned,
	`customer_name` varchar(255) NOT NULL,
	`customer_phone` varchar(50) NOT NULL,
	`customer_whatsapp` varchar(50),
	`customer_email` varchar(320),
	`shipping_address` text NOT NULL,
	`governorate` varchar(100),
	`city` varchar(100),
	`postal_code` varchar(20),
	`subtotal` decimal(12,2) NOT NULL,
	`shipping_fee` decimal(10,2) DEFAULT '0',
	`discount_amount` decimal(10,2) DEFAULT '0',
	`coupon_code` varchar(50),
	`total` decimal(12,2) NOT NULL,
	`payment_method` enum('cash_on_delivery','vodafone_cash','instapay','bank_transfer','paymob') DEFAULT 'cash_on_delivery',
	`payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
	`order_status` enum('pending','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
	`notes` text,
	`source` enum('website','whatsapp') DEFAULT 'website',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`),
	CONSTRAINT `orders_idempotency_key_unique` UNIQUE(`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `payment_settings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`method` varchar(50) NOT NULL,
	`is_enabled` boolean DEFAULT true,
	`display_name` varchar(255),
	`display_name_ar` varchar(255),
	`account_number` varchar(255),
	`account_name` varchar(255),
	`instructions` text,
	`instructions_ar` text,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_settings_method_unique` UNIQUE(`method`)
);
--> statement-breakpoint
CREATE TABLE `payment_transactions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned,
	`order_number` varchar(50),
	`provider` enum('manual','paymob','tap','hyperpay','paytabs','stripe','moyasar','myfatoorah') DEFAULT 'manual',
	`method` varchar(100),
	`amount` decimal(12,2) DEFAULT '0',
	`currency` varchar(10) DEFAULT 'EGP',
	`status` enum('pending','paid','failed','refunded','cancelled') DEFAULT 'pending',
	`provider_reference` varchar(255),
	`provider_order_id` varchar(255),
	`provider_transaction_id` varchar(255),
	`checkout_url` text,
	`raw_payload` json,
	`paid_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_transactions_provider_transaction_id_unique` UNIQUE(`provider_transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description_en` text,
	`description_ar` text,
	`short_description_en` text,
	`short_description_ar` text,
	`price` decimal(10,2) NOT NULL,
	`sale_price` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`sku` varchar(100),
	`barcode` varchar(100),
	`scent` varchar(100) NOT NULL,
	`scent_color` varchar(20),
	`category_id` bigint unsigned,
	`images` json,
	`benefits` json,
	`benefits_ar` json,
	`ingredients` text,
	`ingredients_ar` text,
	`usage_instructions` text,
	`usage_instructions_ar` text,
	`is_active` boolean DEFAULT true,
	`is_featured` boolean DEFAULT false,
	`is_best_seller` boolean DEFAULT false,
	`seo_title` varchar(255),
	`seo_description` text,
	`related_products` json,
	`flash_sale_price` decimal(10,2),
	`flash_sale_ends_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `return_requests` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned,
	`order_number` varchar(50) NOT NULL,
	`customer_name` varchar(255),
	`customer_phone` varchar(50) NOT NULL,
	`reason` text NOT NULL,
	`images` json,
	`status` enum('pending','approved','rejected','received','refunded','closed') DEFAULT 'pending',
	`refund_amount` decimal(12,2) DEFAULT '0',
	`restock_items` boolean DEFAULT false,
	`admin_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `return_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`images` json,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seo_pages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`path` varchar(255) NOT NULL,
	`title_en` varchar(255),
	`title_ar` varchar(255),
	`description_en` text,
	`description_ar` text,
	`keywords` text,
	`og_image` text,
	`canonical_url` text,
	`is_indexed` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seo_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_pages_path_unique` UNIQUE(`path`)
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`provider_id` bigint unsigned,
	`tracking_number` varchar(150),
	`status` enum('pending','ready','shipped','out_for_delivery','delivered','failed','returned') DEFAULT 'pending',
	`shipping_cost` decimal(10,2) DEFAULT '0',
	`estimated_delivery` timestamp,
	`shipped_at` timestamp,
	`delivered_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipping_providers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`website` text,
	`tracking_url_template` text,
	`base_fee` decimal(10,2) DEFAULT '0',
	`is_active` boolean DEFAULT true,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipping_providers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shipping_settings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`governorate` varchar(100) NOT NULL,
	`governorate_ar` varchar(100),
	`base_fee` decimal(10,2) DEFAULT '0',
	`free_shipping_threshold` decimal(10,2),
	`estimated_days` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shipping_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `store_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `upload_assets` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`url` text NOT NULL,
	`alt_text` varchar(255),
	`mime_type` varchar(100),
	`size_bytes` int,
	`width` int,
	`height` int,
	`folder` varchar(120) DEFAULT 'general',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upload_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_addresses` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`title` varchar(100) NOT NULL DEFAULT 'Home',
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`governorate` varchar(100) NOT NULL,
	`city` varchar(100),
	`address` text NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`password_hash` varchar(255),
	`phone` varchar(50),
	`gender` varchar(20),
	`birthday` varchar(50),
	`nationality` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customer_phone_idx` ON `orders` (`customer_phone`);--> statement-breakpoint
CREATE INDEX `order_status_idx` ON `orders` (`order_status`);