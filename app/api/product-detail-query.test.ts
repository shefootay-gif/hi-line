import { beforeEach, describe, expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import type { SQL } from "drizzle-orm";
import { storeRouter } from "./store-router";

const mocks = vi.hoisted(() => ({ related: undefined as unknown, where: vi.fn() }));
vi.mock("./queries/connection", () => ({ getDb: () => ({
  select: () => ({ from: () => ({ where: mocks.where }) }),
}) }));

describe("product detail related-product query", () => {
  beforeEach(() => {
    mocks.where.mockReset();
    mocks.where.mockImplementationOnce(() => ({ limit: async () => [{ id: 1, relatedProducts: mocks.related }] }));
    mocks.where.mockResolvedValue([]);
  });
  it.each([[2, 3, 4], "[2,3,4]"].map(value => ({ value })))("supports stored relation data $value", async ({ value }) => {
    mocks.related = value;
    const caller = storeRouter.createCaller({ req: new Request("https://localhost/api/trpc"), resHeaders: new Headers() });
    const result = await caller.getProductBySlug({ slug: "hi-line-deodorant-roll-on-tropical-breeze" });
    expect(result?.id).toBe(1);
    const sql = new MySqlDialect().sqlToQuery(mocks.where.mock.calls[1][0] as SQL);
    expect(sql.sql).toContain("in (?, ?, ?)");
    expect(sql.params).toEqual([2, 3, 4]);
  });
  it.each([null, "invalid-json", "{}", "null", ["oops", -1, 0]].map(value => ({ value })))("ignores invalid relation data $value", async ({ value }) => {
    mocks.related = value;
    const caller = storeRouter.createCaller({ req: new Request("https://localhost/api/trpc"), resHeaders: new Headers() });
    const result = await caller.getProductBySlug({ slug: "test" });
    expect(result?.relatedProductsList).toEqual([]);
    expect(mocks.where).toHaveBeenCalledTimes(1);
  });
});
