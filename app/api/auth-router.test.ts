import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { appRouter } from "./router";
import { env } from "./lib/env";

class LocalAdminDb {
  passwordHash: string | null = null;
  activityActions: string[] = [];

  select() {
    return {
      from: () => {
        const query = {
          where: () => query,
          limit: async () => this.passwordHash ? [{ passwordHash: this.passwordHash }] : [],
        };
        return query;
      },
    };
  }

  update() {
    return {
      set: (value: { passwordHash?: string }) => ({
        where: async () => {
          if (!this.passwordHash) return [{ affectedRows: 0 }];
          this.passwordHash = value.passwordHash ?? null;
          return [{ affectedRows: 1 }];
        },
      }),
    };
  }

  insert(table: unknown) {
    const nameSymbol = Object.getOwnPropertySymbols(table as object).find(
      symbol => symbol.toString() === "Symbol(drizzle:Name)",
    );
    const tableName = nameSymbol
      ? String((table as Record<symbol, unknown>)[nameSymbol])
      : "";
    return {
      values: async (value: { passwordHash?: string; action?: string }) => {
        if (tableName === "users") this.passwordHash = value.passwordHash ?? null;
        if (tableName === "admin_activity_logs" && value.action) this.activityActions.push(value.action);
        return [{ affectedRows: 1 }];
      },
    };
  }
}

let db: LocalAdminDb;

vi.mock("./queries/connection", () => ({ getDb: () => db }));
vi.mock("./lib/session", () => ({ signSessionToken: vi.fn().mockResolvedValue("test-session-token") }));

const adminContext = {
  req: new Request("https://localhost/api/trpc"),
  resHeaders: new Headers(),
  user: {
    id: 0,
    unionId: "local-admin:admin",
    name: "Hi Line Admin",
    email: "admin@hiline.local",
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

describe("local admin password management", () => {
  beforeEach(() => {
    db = new LocalAdminDb();
  });

  it("hashes a new password and uses it for the next login", async () => {
    const caller = appRouter.createCaller(adminContext);
    const newPassword = "NewSecure!Pass123";

    await caller.auth.changeLocalAdminPassword({
      currentPassword: env.localAdminPassword,
      newPassword,
    });

    expect(db.passwordHash).not.toBe(newPassword);
    expect(await bcrypt.compare(newPassword, db.passwordHash!)).toBe(true);
    expect(db.activityActions).toContain("change_admin_password");

    await expect(caller.auth.localAdminLogin({
      username: "admin",
      password: newPassword,
    })).resolves.toEqual({ success: true });
  });

  it("rejects an incorrect current password", async () => {
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.auth.changeLocalAdminPassword({
      currentPassword: "wrong-password",
      newPassword: "NewSecure!Pass123",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
