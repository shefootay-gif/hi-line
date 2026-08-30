export const staffRoles = ["admin", "orders", "inventory", "marketing", "support", "viewer"] as const;
export type StaffRole = typeof staffRoles[number];
export type AdminAccess = { role: StaffRole; permissions: string[] };
export const adminModules = ["products", "orders", "customers", "inventory", "marketing", "analytics", "media", "seo", "notifications"] as const;
export const roleModules: Record<StaffRole, readonly string[]> = {
  admin: adminModules,
  orders: ["orders", "customers"],
  inventory: ["products", "inventory"],
  marketing: ["marketing", "analytics", "media", "seo"],
  support: ["orders", "customers", "notifications"],
  viewer: ["products", "inventory", "analytics"],
};
const procedures: Record<string, readonly string[]> = {
  products: ["listProducts", "createProduct", "updateProduct", "listCategories", "createCategory", "updateCategory", "deleteCategory"],
  orders: ["listOrders", "getOrderDetails", "updateOrderStatus", "listShipments", "listShippingProviders", "createShippingProvider", "updateShippingProvider", "createShipment", "updateShipmentStatus", "listInvoices", "createInvoiceForOrder", "updateInvoiceStatus", "listReturnRequests", "createReturnRequestAdmin", "updateReturnRequestStatus", "listPaymentTransactions", "createManualPaymentTransaction", "updatePaymentTransactionStatus"],
  customers: ["listCustomers", "createCustomer"],
  inventory: ["listInventoryMovements", "getInventoryAnalytics"],
  marketing: ["listCoupons", "createCoupon", "updateCoupon", "deleteCoupon", "listMediaCampaigns", "createMediaCampaign", "updateMediaCampaign", "updateMediaCampaignStatus", "deleteMediaCampaign", "getMediaBuyerAnalytics", "listDropshippingSuppliers", "createDropshippingSupplier", "updateDropshippingSupplier", "deleteDropshippingSupplier", "listSupplierCatalog", "importSupplierCatalog", "approveSupplierCatalogProduct"],
  analytics: ["getAnalyticsSummary", "getRevenueTrend", "getTopProductsAnalytics", "getCustomerAnalytics", "getInventoryAnalytics", "getMediaBuyerAnalytics", "getFunnelAnalytics", "getSalesByDate", "getSalesByScent"],
  media: ["listUploadAssets", "createUploadAsset", "deleteUploadAsset"],
  seo: ["listSeoPages", "upsertSeoPage", "generateSeoFiles", "createFaq", "updateFaq", "deleteFaq"],
  notifications: ["listAdminNotifications", "markAdminNotificationRead"],
};
export function hasAdminModule(access: AdminAccess, module: string) {
  return roleModules[access.role]?.includes(module) && access.permissions.includes(module);
}
export function canCallAdmin(access: AdminAccess, path: string, type: string) {
  if (!path.startsWith("admin.")) return false;
  if ((access.role === "viewer" || access.role === "support") && type !== "query") return false;
  const name = path.slice(6);
  return Object.entries(procedures).some(([module, names]) => hasAdminModule(access, module) && names.includes(name));
}
export function canVisitAdmin(access: AdminAccess, path: string) {
  if (path === "/admin") return true;
  const modules: Record<string, string> = {
    products: "products", categories: "products", orders: "orders", customers: "customers",
    coupons: "marketing", "media-buyer": "marketing", dropshipping: "marketing",
    "inventory-movements": "inventory", analytics: "analytics", fulfillment: "orders",
    notifications: "notifications", "media-library": "media", seo: "seo",
  };
  const module = modules[path.split("/")[2]];
  return Boolean(module && hasAdminModule(access, module));
}
