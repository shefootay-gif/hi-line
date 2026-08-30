import { describe, expect, it } from "vitest";
import { createRouter, adminQuery } from "./middleware";
import { canCallAdmin, roleModules, staffRoles } from "@contracts/admin-access";
import type { TrpcContext } from "./context";

describe("staff access enforced at the API", () => {
  const router = createRouter({ admin: createRouter({
    listOrders: adminQuery.query(() => "orders"),
    updateOrderStatus: adminQuery.mutation(() => "updated"),
    createBackupJob: adminQuery.mutation(() => "backup"),
  }) });
  const user = { id: 12, unionId: "local:staff:12", role: "admin", adminAccess: { role: "orders", permissions: ["orders"] } } as TrpcContext["user"];
  it("allows an authorized staff query and mutation", async () => {
    const caller = router.createCaller({ req: new Request("http://localhost"), resHeaders: new Headers(), user });
    expect(await caller.admin.listOrders()).toBe("orders");
    expect(await caller.admin.updateOrderStatus()).toBe("updated");
    await expect(caller.admin.createBackupJob()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("denies anonymous and unprovisioned staff", async () => {
    for (const candidate of [undefined, { ...user!, adminAccess: undefined }]) {
      const caller = router.createCaller({ req: new Request("http://localhost"), resHeaders: new Headers(), user: candidate });
      await expect(caller.admin.listOrders()).rejects.toThrow();
    }
  });
  it.each(staffRoles)("does not permit %s staff to manage security or backups", role => {
    const access = { role, permissions: [...roleModules[role]] };
    for (const path of ["admin.updateSetting", "admin.createAdminStaffUser", "admin.createBackupJob", "auth.changeLocalAdminPassword", "admin.unknownEndpoint"]) expect(canCallAdmin(access, path, "mutation")).toBe(false);
  });
  it("denies read-only writes and permissions outside the role", () => {
    expect(canCallAdmin({role:"viewer",permissions:["products"]},"admin.updateProduct","mutation")).toBe(false);
    expect(canCallAdmin({role:"inventory",permissions:["orders"]},"admin.listOrders","query")).toBe(false);
  });
});
