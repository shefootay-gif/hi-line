import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./router";

const getTableName = (schemaTable: unknown): string => {
  const nameSymbol = Object.getOwnPropertySymbols(schemaTable as object).find(
    symbol => symbol.toString() === "Symbol(drizzle:Name)"
  );
  return nameSymbol
    ? String((schemaTable as Record<symbol, unknown>)[nameSymbol])
    : "";
};

class AdminOrderDb {
  order = {
    id: 1,
    orderNumber: "HL1001",
    customerName: "John Doe",
    customerPhone: "01234567890",
    couponCode: "SAVE10",
    total: "100.00",
    paymentMethod: "cash_on_delivery",
    paymentStatus: "pending",
    orderStatus: "pending" as string,
  };
  updates: string[] = [];
  inventoryMovements: unknown[] = [];
  returnRequest = {
    id: 5,
    orderId: 1,
    restockItems: false,
    status: "approved",
  };

  select() {
    return {
      from: (schemaTable: unknown) => {
        const tableName = getTableName(schemaTable);
        const result = () => {
          if (tableName === "orders") return [this.order];
          if (tableName === "order_items") {
            return [{ orderId: 1, productId: 1, quantity: 2 }];
          }
          if (tableName === "products") return [{ stock: 10 }];
          if (tableName === "customers") return [{ id: 1 }];
          if (tableName === "return_requests") return [this.returnRequest];
          return [];
        };
        const query = {
          where: () => query,
          limit: () => query,
          then: (fulfilled?: (value: unknown[]) => unknown) => {
            const promise = Promise.resolve(result());
            return fulfilled ? promise.then(fulfilled) : promise;
          },
        };
        return query;
      },
    };
  }

  update(schemaTable: unknown) {
    const tableName = getTableName(schemaTable);
    this.updates.push(tableName);
    return {
      set: (value: Record<string, unknown>) => ({
        where: () => {
          if (tableName === "orders" && typeof value.orderStatus === "string") {
            this.order.orderStatus = value.orderStatus;
          }
          if (tableName === "return_requests") {
            Object.assign(this.returnRequest, value);
          }
          return [{ affectedRows: 1 }];
        },
      }),
    };
  }

  insert(schemaTable: unknown) {
    const tableName = getTableName(schemaTable);
    return {
      values: (value: unknown) => {
        if (tableName === "inventory_movements") {
          this.inventoryMovements.push(value);
        }
        return [{ affectedRows: 1 }];
      },
    };
  }

  transaction(callback: (tx: AdminOrderDb) => Promise<unknown>) {
    return callback(this);
  }
}

let db: AdminOrderDb;

vi.mock("./queries/connection", () => ({ getDb: () => db }));
vi.mock("./whatsapp-service", () => ({ sendWhatsAppMessage: vi.fn() }));

const adminContext = {
  req: new Request("https://localhost/api/trpc"),
  resHeaders: new Headers(),
  user: {
    id: 1,
    unionId: "admin-1",
    name: "Admin",
    email: "admin@example.com",
    avatar: null,
    role: "admin" as const,
    phone: null,
    gender: null,
    birthday: null,
    nationality: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignInAt: new Date(),
  },
};

describe("admin order status effects", () => {
  beforeEach(() => {
    db = new AdminOrderDb();
  });

  it("restores inventory and customer totals exactly once when cancelled", async () => {
    const caller = appRouter.createCaller(adminContext);

    await caller.admin.updateOrderStatus({ id: 1, status: "cancelled" });
    const firstMovementCount = db.inventoryMovements.length;
    await caller.admin.updateOrderStatus({ id: 1, status: "cancelled" });

    expect(db.updates).toContain("products");
    expect(db.updates).toContain("coupons");
    expect(db.updates).toContain("customers");
    expect(firstMovementCount).toBe(1);
    expect(db.inventoryMovements).toHaveLength(1);
  });

  it("does not allow permanent order deletion", async () => {
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.admin.deleteOrder({ id: 1 })).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  it("refunds through the same one-time inventory reversal", async () => {
    const caller = appRouter.createCaller(adminContext);

    await caller.admin.updatePaymentStatus({ id: 1, status: "refunded" });
    const firstMovementCount = db.inventoryMovements.length;
    await caller.admin.updatePaymentStatus({ id: 1, status: "refunded" });

    expect(db.order.orderStatus).toBe("refunded");
    expect(firstMovementCount).toBe(1);
    expect(db.inventoryMovements).toHaveLength(1);
  });

  it("restocks a received return exactly once", async () => {
    const caller = appRouter.createCaller(adminContext);
    const input = {
      id: 5,
      status: "received" as const,
      restockItems: true,
    };

    await caller.admin.updateReturnRequestStatus(input);
    const firstMovementCount = db.inventoryMovements.length;
    await caller.admin.updateReturnRequestStatus(input);

    expect(firstMovementCount).toBe(1);
    expect(db.inventoryMovements).toHaveLength(1);
  });
});
