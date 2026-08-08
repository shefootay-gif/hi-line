# Hi Line Pro Care E-commerce 🛍️

A complete, modern, and high-performance e-commerce web application built for **Hi Line Pro Care**, specializing in cosmetic and personal care products. 

The platform offers a seamless shopping experience for customers and a robust, feature-rich admin dashboard for store management.

---

## 🌟 Key Features

- **Localized storefront URLs:** Arabic pages use `/ar/...`, English pages use `/en/...`, and legacy unprefixed storefront links redirect to the saved locale.

### 🛍️ For Customers (Storefront)
- **Dynamic Catalog:** Browse products dynamically fetched from the database with real-time stock availability and custom Arabic translation support.
- **Cart & Checkout:** Advanced shopping cart system with automatic calculation of totals, discounts, and shipping fees.
- **Payment Options:** Support for multiple payment methods including:
  - Cash on Delivery (COD) / الدفع عند الاستلام
  - Vodafone Cash / فودافون كاش (displays transfer details and instructs the customer to send their transfer receipt via a WhatsApp link)
  - InstaPay / إنستاباي (displays the store handle and instructs the customer to transfer and share the receipt via a WhatsApp link)
  - Bank Transfer / تحويل بنكي
  - Paymob credit/debit card online checkout implementation (coded, requires credentials/webhook setup)
- **Order Tracking & Notifications:** Customers can track their orders and contact support via WhatsApp using dynamic short links.
- **RTL & LTR Support:** Full localization and RTL layout specifically tailored for Arabic users.

### ⚙️ For Managers (Admin Dashboard)
- **Comprehensive Analytics:** Track total revenue, daily orders, sales by category, and low stock warnings.
- **Order Management:** View, update status, and manage orders.
- **Integrated Printing System:** Print formatted A4 Invoices and 10x15cm Shipping Labels directly from the dashboard.
- **Inventory Tracking:** Real-time logging of stock changes (sales, restocks, adjustments) via `inventory_movements` to maintain complete audit history.
- **Marketing Tools:** Full management over Discount Coupons, Media/Ads Banners, and basic SEO settings.
- **Store Settings:** Customize shipping rates by governorate, control active payment methods, and edit store policies dynamically.

---

## 🛠️ Tech Stack

- **Frontend:** React `^19.2.0`, TypeScript, Tailwind CSS `^3.4.19` (with shadcn theme), Vite `^7.2.4`.
- **Backend/API:** Node.js, Hono framework, `@hono/node-server`, tRPC v11 (utilizing `superjson` transformer).
- **Database:** MySQL, Drizzle ORM (Schema-driven).
- **Icons & UI Elements:** Lucide React, Custom modern CSS.
- **Bundler & Compiler:** Vite for frontend, esbuild for backend (`api/boot.ts` bundled into `dist/boot.js`).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v20+ recommended) installed along with a running MySQL instance.

### 1. Installation
Clone the repository and install the dependencies from the `app` directory:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the `app` directory (based on `.env.example`). The environment configuration options are detailed below:

```env
# ── Core Backend Settings ──────────────────────────────────────
# Secret key for JWT signing and verification (required in production)
JWT_SECRET=your-production-jwt-secret-key-here
# Legacy fallback secret key (required in production)
APP_SECRET=your-production-app-secret-key-here

# ── Database Connection ────────────────────────────────────────
# MySQL connection string (recommended: append ?charset=utf8mb4 for Arabic support)
DATABASE_URL=mysql://user:password@127.0.0.1:3306/hiline_pro_care?charset=utf8mb4

# ── Admin Settings ─────────────────────────────────────────────
# Local admin credentials for dashboard login (auto-defaults in dev mode)
LOCAL_ADMIN_USERNAME=admin
LOCAL_ADMIN_PASSWORD=secure-admin-password-here
# Optional: Union ID for admin promotion on first login
OWNER_UNION_ID=

# ── Paymob Integration ─────────────────────────────────────────
# Paymob credentials (required for credit card checkout)
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
# HMAC Secret for authenticating incoming transaction webhooks (required in production)
PAYMOB_HMAC_SECRET=your-paymob-hmac-webhook-secret

# Transactional password-reset email (Resend)
RESEND_API_KEY=your-resend-api-key
PASSWORD_RESET_FROM_EMAIL=Hi Line Pro Care <no-reply@yourdomain.com>
PASSWORD_RESET_BASE_URL=https://yourdomain.com

# ── WhatsApp Notifications (Optional) ──────────────────────────
# Meta WhatsApp Cloud API credentials
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_TOKEN=your-meta-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# ── Server Networking ──────────────────────────────────────────
# Set to true only when requests pass through a trusted reverse proxy (Nginx, Cloudflare)
TRUST_PROXY=false
```

### 3. Database Initialization
To initialize your database structure and push/migrate schemas:

- **Generate migrations:** Create SQL migration files based on schema changes.
  ```bash
  npm run db:generate
  ```
- **Apply migrations:** Apply existing migrations to your MySQL database.
  ```bash
  npm run db:migrate
  ```
- **Push schema directly:** Update database schema directly without migrations (suitable for local prototyping).
  ```bash
  npm run db:push
  ```

### 4. Running Locally
Start the development server (which spins up Vite with Hono dev-server middleware):
```bash
npm run dev
```
The application will be accessible at **`http://localhost:3000`** (configured in `vite.config.ts`).

### 5. Verification & Testing
To ensure code quality and verify backend services:
- **TypeScript Check:** Validate type correctness.
  ```bash
  npm run check
  ```
- **Lint Check:** Run ESLint rules.
  ```bash
  npm run lint
  ```
- **Format files:** Apply Prettier formatting. This command writes changes to the working tree.
  ```bash
  npm run format
  ```
- **Run Unit/Integration Tests:** Executes the 18 local test cases using Vitest.
  ```bash
  npm run test
  ```

### 6. Building and Starting for Production
To bundle the project and start the application in production mode:

1. Build the production client bundle and server wrapper:
   ```bash
   npm run build
   ```
2. Start the Hono server:
   ```bash
   npm run start
   ```
This sets `NODE_ENV=production` and runs the compiled bundle `dist/boot.js` listening on port `3000` (or the port defined in the `PORT` environment variable).

### Railway deployment

The repository includes `railway.json` with the production build, database migration, start command, restart policy, and `/api/health/ready` health check. In Railway, set the service root directory to `app`, attach a MySQL service over private networking, and configure the production environment variables above before the first deployment.

---

## 🏗️ Project Structure
- `api/` - Backend Hono and tRPC router, rate-limiting middleware, webhooks, and integrations (Paymob, WhatsApp).
- `db/` - Drizzle ORM schema, SQL migrations, and database maintenance scripts.
- `src/pages/` - React storefront pages (Home, Shop, Cart, Checkout, OrderConfirmation).
- `src/pages/admin/` - Admin Dashboard pages and views (Orders, Products, Analytics, Settings).
- `src/components/` - Reusable UI widgets and layout containers.
- `src/lib/` - Utility functions, translation catalog, and custom React hooks.

---
*Built with ❤️ for Hi Line Pro Care.*
