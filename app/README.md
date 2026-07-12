# Hi Line Pro Care E-commerce 🛍️

A complete, modern, and high-performance e-commerce web application built for **Hi Line Pro Care**, specializing in cosmetic and personal care products. 

The platform offers a seamless shopping experience for customers and a robust, feature-rich admin dashboard for store management.

## 🌟 Key Features

### 🛍️ For Customers (Storefront)
- **Dynamic Catalog:** Browse products dynamically fetched from the database with real-time stock availability.
- **Cart & Checkout:** Advanced shopping cart system with automatic calculation of totals, discounts, and shipping fees.
- **Payment Gateways:** Support for multiple payment methods including:
  - Cash on Delivery (COD)
  - Paymob Integration
  - Vodafone Cash / InstaPay (with automated UI instructions)
- **Order Tracking & Notifications:** Customers can track their orders and instantly contact support via WhatsApp using dynamic links.
- **RTL & LTR Support:** Full localization and RTL layout specifically tailored for Arabic users.

### ⚙️ For Managers (Admin Dashboard)
- **Comprehensive Analytics:** Track total revenue, daily orders, sales by category, and low stock warnings.
- **Order Management:** View, update status, and manage orders effortlessly.
- **Integrated Printing System:** Print beautifully formatted A4 Invoices and 10x15cm Shipping Labels directly from the dashboard.
- **Inventory Tracking:** Real-time logging of stock changes (sales, restocks, adjustments) via `inventory_movements`.
- **Marketing Tools:** Full management over Discount Coupons, Media/Ads Banners, and SEO settings.
- **Store Settings:** Customize shipping rates by governorate, control active payment methods, and edit store policies dynamically.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite.
- **Backend/API:** Node.js, Express, tRPC (Type-safe APIs).
- **Database:** MySQL, Drizzle ORM (Schema-driven).
- **Icons & UI Elements:** Lucide React, Custom modern CSS.
- **Deployment:** ESBuild bundle for ultra-fast performance.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with a MySQL instance running.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example` if available) and add your connection strings:
```env
DATABASE_URL=mysql://user:password@localhost:3306/hiline_db
WHATSAPP_API_URL=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
PAYMOB_API_KEY=
```

### 3. Database Initialization
Push the Drizzle schema to your MySQL database to create the necessary tables:
```bash
npx drizzle-kit push
```
Then, optionally run the seed script to populate the database with default products and settings:
```bash
npx tsx db/seed.ts
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 5. Building for Production
Check for TypeScript errors, build the client, and bundle the server:
```bash
npm run check
npm run build
```
Once built, you can serve the application using Node.js.

---

## 🏗️ Project Structure
- `api/` - Backend tRPC router, middleware, and external service integrations (WhatsApp, Paymob).
- `db/` - Drizzle ORM schema, migrations, and seeding scripts.
- `src/pages/` - React pages (Home, Shop, Cart, Checkout, OrderConfirmation).
- `src/pages/admin/` - Admin Dashboard components (Orders, Products, Analytics, Settings, etc.).
- `src/components/` - Reusable UI components.
- `src/lib/` - Utilities and Translation libraries for bilingual support.

---
*Built with ❤️ for Hi Line Pro Care.*
