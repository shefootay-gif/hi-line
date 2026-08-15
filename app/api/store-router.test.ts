import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./router";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

interface MockProduct {
  id: number;
  nameEn: string;
  price: string;
  stock: number;
  isActive: boolean;
}

interface MockCoupon {
  id: number;
  code: string;
  discountValue: string;
  discountType: string;
  isActive: boolean;
  currentUsage: number;
  maxUsage: number;
  expiresAt?: Date | null;
  minOrderValue?: string | null;
}

interface MockOrder {
  id: number;
  orderNumber: string;
  idempotencyKey?: string;
  requestFingerprint?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  subtotal?: string;
  total?: string;
  discountAmount?: string;
  paymentStatus?: string;
  orderStatus?: string;
  notes?: string;
  appliedCouponId?: number | null;
  shippingAddress?: string;
  items?: { productId: number; quantity: number }[];
}

interface MockPaymentSetting {
  method: string;
  isEnabled: boolean;
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

function calculateFingerprint(input: {
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  customerEmail?: string;
  shippingAddress: string;
  governorate?: string;
  city?: string;
  postalCode?: string;
  paymentMethod: string;
  notes?: string;
  source?: string;
  items: { productId: number; quantity: number }[];
  couponCode?: string;
}) {
  const sortedItems = [...input.items].sort(
    (a, b) => a.productId - b.productId
  );
  const normalized = {
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerWhatsapp: input.customerWhatsapp?.trim() || null,
    customerEmail: input.customerEmail?.trim().toLowerCase() || null,
    shippingAddress: input.shippingAddress.trim(),
    governorate: input.governorate?.trim() || null,
    city: input.city?.trim() || null,
    postalCode: input.postalCode?.trim() || null,
    paymentMethod: input.paymentMethod,
    notes: input.notes?.trim() || null,
    source: input.source || "website",
    items: sortedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    couponCode: input.couponCode?.trim().toUpperCase() || null,
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}

class MockDbInstance {
  orders: MockOrder[] = [];
  orderItems: unknown[] = [];
  products: MockProduct[] = [
    { id: 1, nameEn: "Product 1", price: "50.00", stock: 10, isActive: true },
  ];
  coupons: MockCoupon[] = [
    {
      id: 10,
      code: "SAVE10",
      discountValue: "10.00",
      discountType: "flat",
      isActive: true,
      currentUsage: 0,
      maxUsage: 100,
    },
  ];
  inventoryMovements: unknown[] = [];
  paymentTransactions: unknown[] = [];
  paymentSettings: MockPaymentSetting[] = [
    { method: "cash_on_delivery", isEnabled: true },
    { method: "vodafone_cash", isEnabled: true },
    { method: "instapay", isEnabled: true },
    { method: "bank_transfer", isEnabled: false },
  ];
  customers: unknown[] = [];
  shippingSettings: unknown[] = [];
  storeSettings: unknown[] = [];
  updateTables: string[] = [];

  select() {
    return {
      from: (schemaTable: unknown) => {
        const tableName = getTableName(schemaTable);
        const getResult = () => {
          if (tableName === "orders") return this.orders;
          if (tableName === "products") return this.products;
          if (tableName === "coupons") return this.coupons;
          if (tableName === "customers") return this.customers;
          if (tableName === "shipping_settings") return this.shippingSettings;
          if (tableName === "store_settings") return this.storeSettings;
          if (tableName === "payment_transactions")
            return this.paymentTransactions;
          if (tableName === "payment_settings") return this.paymentSettings;
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
        if (tableName === "orders") {
          const arr = Array.isArray(val) ? val : [val];
          const newOrders = arr.map((o, idx) => ({
            ...(o as MockOrder),
            id: this.orders.length + idx + 1,
          }));
          this.orders.push(...newOrders);
          return [{ insertId: newOrders[0].id }];
        }
        if (tableName === "inventory_movements") {
          const arr = Array.isArray(val) ? val : [val];
          this.inventoryMovements.push(...arr);
        }
        if (tableName === "payment_transactions") {
          const arr = Array.isArray(val) ? val : [val];
          this.paymentTransactions.push(...arr);
        }
        if (tableName === "order_items") {
          const arr = Array.isArray(val) ? val : [val];
          this.orderItems.push(...arr);
        }
        if (tableName === "customers") {
          const arr = Array.isArray(val) ? val : [val];
          this.customers.push(...arr);
        }
        return [{ affectedRows: 1 }];
      },
    };
  }

  update(schemaTable: unknown) {
    const tableName = getTableName(schemaTable);
    this.updateTables.push(tableName);
    return {
      set: (val: Record<string, unknown>) => {
        return {
          where: () => {
            if (tableName === "products") {
              if (val.stock) {
                this.products[0].stock = 12;
              }
            }
            if (tableName === "orders") {
              if (this.orders[0]) {
                Object.assign(this.orders[0], val);
              }
            }
            if (tableName === "coupons") {
              if (this.coupons[0]) {
                Object.assign(this.coupons[0], val);
              }
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

describe("tRPC store.createOrder behaviors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDbInstance = new MockDbInstance();
  });

  it("should process and return same order on exact idempotency key retry", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const key = "a3b8fa3a-2394-4d80-87a3-864bbd985a1a";

    const result1 = await caller.store.createOrder({
      idempotencyKey: key,
      customerName: "John Doe",
      customerPhone: "01234567890",
      shippingAddress: "Cairo",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 1, quantity: 2 }],
    });

    expect(result1.orderId).toBeDefined();

    mockDbInstance.orders = [
      {
        id: result1.orderId,
        orderNumber: result1.orderNumber,
        idempotencyKey: key,
        requestFingerprint: mockDbInstance.orders[0].requestFingerprint,
        customerName: "John Doe",
        customerPhone: "01234567890",
        paymentMethod: "cash_on_delivery",
        total: "100.00",
        discountAmount: "0.00",
      },
    ];

    const result2 = await caller.store.createOrder({
      idempotencyKey: key,
      customerName: "John Doe",
      customerPhone: "01234567890",
      shippingAddress: "Cairo",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 1, quantity: 2 }],
    });

    expect(result2.orderId).toBe(result1.orderId);
    expect(result2.orderNumber).toBe(result1.orderNumber);
  });

  it("should reject idempotency key reuse with conflicting details", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const key = "b12a8069-4e78-43d9-95e2-763db026ee68";

    mockDbInstance.orders = [
      {
        id: 999,
        orderNumber: "HL999",
        idempotencyKey: key,
        requestFingerprint: "some-fingerprint",
        customerName: "John Doe",
        customerPhone: "01234567890",
        paymentMethod: "cash_on_delivery",
        total: "100.00",
        discountAmount: "0.00",
      },
    ];

    await expect(
      caller.store.createOrder({
        idempotencyKey: key,
        customerName: "Different Name",
        customerPhone: "01234567890",
        shippingAddress: "Cairo",
        paymentMethod: "cash_on_delivery",
        items: [{ productId: 1, quantity: 2 }],
      })
    ).rejects.toThrow(TRPCError);
  });

  it("should handle concurrent duplicate key inserts race conditions by refetching and comparing", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const key = "c78a0690-3498-4bd8-9a8d-190f7a627a19";

    mockDbInstance.insert = () => ({
      values: () => {
        throw {
          code: "ER_DUP_ENTRY",
          message: "Duplicate entry for idempotency_key",
        };
      },
    });

    const input = {
      idempotencyKey: key,
      customerName: "John Doe",
      customerPhone: "01234567890",
      shippingAddress: "Cairo",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 1, quantity: 2 }],
    };

    const expectedFingerprint = calculateFingerprint(input);

    mockDbInstance.orders = [
      {
        id: 555,
        orderNumber: "HL555",
        idempotencyKey: key,
        requestFingerprint: expectedFingerprint,
        customerName: "John Doe",
        customerPhone: "01234567890",
        shippingAddress: "Cairo",
        paymentMethod: "cash_on_delivery",
        items: [{ productId: 1, quantity: 2 }],
      },
    ];

    const result = await caller.store.createOrder({
      idempotencyKey: key,
      customerName: "John Doe",
      customerPhone: "01234567890",
      shippingAddress: "Cairo",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 1, quantity: 2 }],
    });

    expect(result.orderId).toBe(555);
  });

  it("rejects payment methods outside the supported manual methods", async () => {
    mockDbInstance.paymentSettings = [
      { method: "cash_on_delivery", isEnabled: true },
      { method: "bank_transfer", isEnabled: false },
    ];
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    await expect(
      caller.store.createOrder({
        idempotencyKey: "e8b96a40-924c-4ef3-8bfb-0f851dfb84a9",
        customerName: "John Doe",
        customerPhone: "01234567890",
        shippingAddress: "Cairo",
        paymentMethod: "paymob" as never,
        items: [{ productId: 1, quantity: 1 }],
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    expect(mockDbInstance.orders).toHaveLength(0);
  });

  it("applies the same three-item volume discount stored on the order", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const result = await caller.store.createOrder({
      idempotencyKey: "f393943d-c18c-4a5a-ac9f-d6280fbd5192",
      customerName: "John Doe",
      customerPhone: "01234567890",
      shippingAddress: "Cairo",
      paymentMethod: "cash_on_delivery",
      items: [{ productId: 1, quantity: 3 }],
    });

    expect(result.discountAmount).toBe("22.50");
    expect(result.total).toBe("127.50");
    expect(mockDbInstance.orders[0].subtotal).toBe("150.00");
    expect(mockDbInstance.orders[0].discountAmount).toBe("22.50");
  });
});

describe("tRPC store order privacy and cancellation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDbInstance = new MockDbInstance();
    mockDbInstance.orders = [{
      id: 1,
      orderNumber: "HL1001",
      customerName: "John Doe",
      customerPhone: "01234567890",
      paymentMethod: "cash_on_delivery",
      total: "100.00",
      orderStatus: "pending",
    }];
    mockDbInstance.customers = [{ id: 1, phone: "01234567890" }];
  });

  it("requires the customer phone before returning order details", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    await expect(caller.store.getOrderByNumber({
      orderNumber: "HL1001",
    } as never)).rejects.toThrow();
  });

  it("reverses the customer's order counters when an order is cancelled", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    await caller.store.cancelOrder({
      orderNumber: "HL1001",
      customerPhone: "01234567890",
    });

    expect(mockDbInstance.updateTables).toContain("customers");
  });
});

describe("tRPC store.validateCoupon behaviors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockDbInstance = new MockDbInstance();
  });

  it("caps a flat coupon discount at the order subtotal", async () => {
    mockDbInstance.coupons[0].discountValue = "100.00";
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const result = await caller.store.validateCoupon({
      code: "SAVE10",
      subtotal: 50,
    });

    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(50);
  });

  it("normalizes lowercase coupon codes", async () => {
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    const result = await caller.store.validateCoupon({
      code: "save10",
      subtotal: 50,
    });

    expect(result.valid).toBe(true);
  });

  it.each([
    ["inactive", { isActive: false }, "no longer active"],
    ["expired", { expiresAt: new Date("2020-01-01") }, "expired"],
    ["exhausted", { currentUsage: 100 }, "usage limit"],
    ["below minimum", { minOrderValue: "75.00" }, "Minimum order value"],
  ])("rejects an %s coupon", async (_scenario, couponState, message) => {
    Object.assign(mockDbInstance.coupons[0], couponState);
    const caller = appRouter.createCaller({
      req: new Request("https://localhost/api/trpc"),
      resHeaders: new Headers(),
    });

    await expect(
      caller.store.validateCoupon({ code: "SAVE10", subtotal: 50 })
    ).rejects.toThrow(message);
  });
});
