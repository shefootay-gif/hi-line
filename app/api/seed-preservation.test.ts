import { beforeEach, describe, expect, it, vi } from "vitest";
import { categories, products, storeSettings, shippingSettings, paymentSettings, faqs } from "../db/schema";
import { seed, seedCareSaleProducts } from "../db/seed";

const mocks = vi.hoisted(() => ({
  existing: new Map<unknown, object[]>(),
  insert: vi.fn(), update: vi.fn(), delete: vi.fn(), duplicate: vi.fn(),
}));
vi.mock("./queries/connection", () => ({ getDb: () => ({
  select: () => ({ from: (table: unknown) => ({
    limit: async () => mocks.existing.get(table) ?? [],
    where: () => Object.assign(Promise.resolve(mocks.existing.get(table) ?? []), {
      limit: async () => mocks.existing.get(table) ?? [],
    }),
  }) }),
  insert: mocks.insert, update: mocks.update, delete: mocks.delete,
}) }));

describe("seed preserves admin-managed data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.existing.clear();
    mocks.insert.mockReturnValue({ values: () => ({ onDuplicateKeyUpdate: mocks.duplicate }) });
  });

  it.each([products, categories, storeSettings, shippingSettings, paymentSettings, faqs])(
    "skips initialization if a store table already contains data", async (table) => {
      mocks.existing.set(table, [{ id: 42 }]);
      await seed();
      expect(mocks.insert).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.delete).not.toHaveBeenCalled();
    },
  );

  it("does not overwrite existing care products or category settings", async () => {
    mocks.existing.set(categories, [{ id: 1, slug: "body-mist" }, { id: 2, slug: "facial-care" }]);
    mocks.existing.set(products, [{ id: 42, price: "350.00", isActive: false }]);
    await seedCareSaleProducts();
    expect(mocks.update).not.toHaveBeenCalled();
    for (const [options] of mocks.duplicate.mock.calls) {
      expect(Object.keys(options.set)).toEqual(["id"]);
    }
  });

  it("initializes an empty store once and leaves subsequent edits/deletions untouched", async () => {
    mocks.insert.mockImplementation((table: unknown) => ({ values: (value: object | object[]) => {
      const rows = (Array.isArray(value) ? value : [value]).map((row, index) => ({ id: index + 1, ...row }));
      mocks.existing.set(table, [...(mocks.existing.get(table) ?? []), ...rows]);
      return { onDuplicateKeyUpdate: mocks.duplicate };
    } }));
    mocks.update.mockReturnValue({ set: () => ({ where: async () => undefined }) });
    await seed();
    expect(mocks.existing.get(products)).toHaveLength(14);
    expect(mocks.existing.get(shippingSettings)).toHaveLength(27);
    const edited = [{ id: 42, nameEn: "Saved name", price: "350.00", stock: 7, isActive: false }];
    mocks.existing.set(products, edited);
    vi.clearAllMocks();
    await seed();
    expect(mocks.existing.get(products)).toEqual(edited);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
  });
});
