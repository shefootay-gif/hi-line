import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "./boot";
import crypto from "crypto";
import { env } from "./lib/env";

interface MockProduct {
  id: number;
  stock: number;
}

interface MockOrder {
  id: number;
  orderNumber: string;
  total: string;
  paymentStatus: string;
  couponCode?: string;
}

interface MockPaymentTx {
  id?: number;
  orderId?: number;
  orderNumber?: string;
  provider?: string;
  method?: string;
  amount?: string;
  currency?: string;
  status: string;
  providerOrderId: string;
  providerTransactionId?: string;
  providerReference?: string;
  rawPayload: unknown;
  paidAt?: Date | null;
}

const getTableName = (schemaTable: unknown): string => {
  if (!schemaTable) return "";
  if (typeof schemaTable === "string") return schemaTable;
  const nameSymbol = Object.getOwnPropertySymbols(schemaTable).find(
    s => s.toString() === "Symbol(drizzle:Name)"
  );
  return nameSymbol
    ? String((schemaTable as Record<symbol, unknown>)[nameSymbol])
    : (schemaTable as { key?: string }).key ||
        (schemaTable as { _name?: string })._name ||
        "";
};

class MockDbInstance {
  orders: MockOrder[] = [];
  orderItems: { productId: number; quantity: number }[] = [];
  products: MockProduct[] = [{ id: 1, stock: 10 }];
  coupons: unknown[] = [];
  inventoryMovements: unknown[] = [];
  paymentTransactions: MockPaymentTx[] = [];

  select() {
    return {
      from: (schemaTable: unknown) => {
        const tableName = getTableName(schemaTable);
        const getResult = () => {
          if (tableName === "orders") return this.orders;
          if (tableName === "payment_transactions")
            return this.paymentTransactions;
          if (tableName === "products") return this.products;
          if (tableName === "coupons") return this.coupons;
          if (tableName === "order_items") return this.orderItems;
          return [];
        };

        const queryObj = {
          where: () => queryObj,
          limit: () => queryObj,
          then: (onfulfilled?: (res: unknown) => unknown) => {
            const promise = Promise.resolve(getResult());
            return onfulfilled ? promise.then(onfulfilled) : promise;
          },
        };
        return queryObj;
      },
    };
  }

  insert(schemaTable: unknown) {
    const tableName = getTableName(schemaTable);
    return {
      values: (val: unknown) => {
        if (tableName === "payment_transactions") {
          const arr = Array.isArray(val) ? val : [val];
          this.paymentTransactions.push(...(arr as MockPaymentTx[]));
        }
        if (tableName === "inventory_movements") {
          const arr = Array.isArray(val) ? val : [val];
          this.inventoryMovements.push(...arr);
        }
        return [{ affectedRows: 1 }];
      },
    };
  }

  update(schemaTable: unknown) {
    const tableName = getTableName(schemaTable);
    return {
      set: (val: Record<string, unknown>) => {
        return {
          where: () => {
            if (tableName === "orders" && this.orders[0]) {
              Object.assign(this.orders[0], val);
            }
            if (
              tableName === "payment_transactions" &&
              this.paymentTransactions[0]
            ) {
              Object.assign(this.paymentTransactions[0], val);
            }
            if (tableName === "products" && this.products[0]) {
              this.products[0].stock = 12;
            }
            return [{ affectedRows: 1 }];
          },
        };
      },
    };
  }

  transaction(cb: (tx: MockDbInstance) => Promise<unknown>) {
    return cb(this);
  }
}

let mockDbInstance: MockDbInstance;

vi.mock("./queries/connection", () => ({
  getDb: () => mockDbInstance,
}));

describe("Paymob Webhook Callback Route (Hono)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDbInstance = new MockDbInstance();
  });

  it("should fail when hmac query parameter is missing", async () => {
    const res = await app.request("/api/payments/paymob/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obj: {} }),
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Missing hmac signature");
  });

  it("should fail when hmac format is invalid (not 128 characters)", async () => {
    const res = await app.request(
      "/api/payments/paymob/callback?hmac=short_hmac",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obj: {} }),
      }
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Invalid hmac signature format");
  });

  it("should fail when SHA-512 HMAC signature is invalid", async () => {
    const invalid128CharHmac = "a".repeat(128);
    const res = await app.request(
      `/api/payments/paymob/callback?hmac=${invalid128CharHmac}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          obj: {
            amount_cents: 1000,
            currency: "EGP",
          },
        }),
      }
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Invalid hmac signature");
  });

  it("should succeed with fixed valid SHA-512 HMAC signature", async () => {
    const obj = {
      amount_cents: 10000,
      created_at: "2026-07-17",
      currency: "EGP",
      error_occured: "false",
      has_parent_transaction: "false",
      id: "txn123",
      integration_id: "int123",
      is_3d_secure: "true",
      is_auth: "false",
      is_capture: "false",
      is_refunded: "false",
      is_standalone_payment: "true",
      is_voided: "false",
      order: {
        id: "pm_order_123",
        merchant_order_id: "HLORDER123",
      },
      owner: "owner123",
      pending: "false",
      success: "true",
    };

    const concatenatedString =
      "10000" +
      "2026-07-17" +
      "EGP" +
      "false" +
      "false" +
      "txn123" +
      "int123" +
      "true" +
      "false" +
      "false" +
      "false" +
      "true" +
      "false" +
      "pm_order_123" +
      "owner123" +
      "false" +
      "" +
      "" +
      "" +
      "true";

    const expectedHmac = crypto
      .createHmac("sha512", env.paymobHmacSecret)
      .update(concatenatedString)
      .digest("hex");

    mockDbInstance.orders = [
      {
        id: 1,
        orderNumber: "HLORDER123",
        total: "100.00",
        paymentStatus: "pending",
      },
    ];

    const res = await app.request(
      `/api/payments/paymob/callback?hmac=${expectedHmac}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSACTION",
          obj,
        }),
      }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success?: boolean };
    expect(body.success).toBe(true);
  });

  it("should reject amount/currency mismatch", async () => {
    const obj = {
      amount_cents: 99999,
      created_at: "2026-07-17",
      currency: "EGP",
      error_occured: "false",
      has_parent_transaction: "false",
      id: "txn123",
      integration_id: "int123",
      is_3d_secure: "true",
      is_auth: "false",
      is_capture: "false",
      is_refunded: "false",
      is_standalone_payment: "true",
      is_voided: "false",
      order: {
        id: "pm_order_123",
        merchant_order_id: "HLORDER123",
      },
      owner: "owner123",
      pending: "false",
      success: "true",
    };

    const concatenatedString =
      "99999" +
      "2026-07-17" +
      "EGP" +
      "false" +
      "false" +
      "txn123" +
      "int123" +
      "true" +
      "false" +
      "false" +
      "false" +
      "true" +
      "false" +
      "pm_order_123" +
      "owner123" +
      "false" +
      "" +
      "" +
      "" +
      "true";

    const expectedHmac = crypto
      .createHmac("sha512", env.paymobHmacSecret)
      .update(concatenatedString)
      .digest("hex");

    mockDbInstance.orders = [
      {
        id: 1,
        orderNumber: "HLORDER123",
        total: "100.00",
        paymentStatus: "pending",
      },
    ];

    const res = await app.request(
      `/api/payments/paymob/callback?hmac=${expectedHmac}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSACTION",
          obj,
        }),
      }
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Amount or currency mismatch");
  });

  it("should ignore failed callback if order is already paid", async () => {
    const obj = {
      amount_cents: 10000,
      created_at: "2026-07-17",
      currency: "EGP",
      error_occured: "false",
      has_parent_transaction: "false",
      id: "txn123",
      integration_id: "int123",
      is_3d_secure: "true",
      is_auth: "false",
      is_capture: "false",
      is_refunded: "false",
      is_standalone_payment: "true",
      is_voided: "false",
      order: {
        id: "pm_order_123",
        merchant_order_id: "HLORDER123",
      },
      owner: "owner123",
      pending: "false",
      success: "false",
    };

    const concatenatedString =
      "10000" +
      "2026-07-17" +
      "EGP" +
      "false" +
      "false" +
      "txn123" +
      "int123" +
      "true" +
      "false" +
      "false" +
      "false" +
      "true" +
      "false" +
      "pm_order_123" +
      "owner123" +
      "false" +
      "" +
      "" +
      "" +
      "false";

    const expectedHmac = crypto
      .createHmac("sha512", env.paymobHmacSecret)
      .update(concatenatedString)
      .digest("hex");

    mockDbInstance.orders = [
      {
        id: 1,
        orderNumber: "HLORDER123",
        total: "100.00",
        paymentStatus: "paid",
      },
    ];

    const res = await app.request(
      `/api/payments/paymob/callback?hmac=${expectedHmac}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSACTION",
          obj,
        }),
      }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { message?: string };
    expect(body.message).toBe("Order is already marked as paid");
  });

  it("should process definitive failed callback and restore stock once", async () => {
    const obj = {
      amount_cents: 10000,
      created_at: "2026-07-17",
      currency: "EGP",
      error_occured: "false",
      has_parent_transaction: "false",
      id: "txn123",
      integration_id: "int123",
      is_3d_secure: "true",
      is_auth: "false",
      is_capture: "false",
      is_refunded: "false",
      is_standalone_payment: "true",
      is_voided: "false",
      order: {
        id: "pm_order_123",
        merchant_order_id: "HLORDER123",
      },
      owner: "owner123",
      pending: "false",
      success: "false",
    };

    const concatenatedString =
      "10000" +
      "2026-07-17" +
      "EGP" +
      "false" +
      "false" +
      "txn123" +
      "int123" +
      "true" +
      "false" +
      "false" +
      "false" +
      "true" +
      "false" +
      "pm_order_123" +
      "owner123" +
      "false" +
      "" +
      "" +
      "" +
      "false";

    const expectedHmac = crypto
      .createHmac("sha512", env.paymobHmacSecret)
      .update(concatenatedString)
      .digest("hex");

    mockDbInstance.orders = [
      {
        id: 1,
        orderNumber: "HLORDER123",
        total: "100.00",
        paymentStatus: "pending",
      },
    ];
    mockDbInstance.orderItems = [{ productId: 1, quantity: 2 }];
    mockDbInstance.products = [{ id: 1, stock: 10 }];

    const res = await app.request(
      `/api/payments/paymob/callback?hmac=${expectedHmac}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRANSACTION",
          obj,
        }),
      }
    );

    expect(res.status).toBe(200);
    expect(mockDbInstance.orders[0].paymentStatus).toBe("failed");
    expect(mockDbInstance.products[0].stock).toBe(12);
  });
});
