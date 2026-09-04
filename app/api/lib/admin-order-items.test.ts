import { describe, expect, it } from "vitest";
import { groupOrderItems } from "./admin-order-items";

describe("groupOrderItems", () => {
  it("attaches each item to its order for the admin orders list", () => {
    const grouped = groupOrderItems([
      { id: 1, orderId: 10, productName: "A" },
      { id: 2, orderId: 20, productName: "B" },
      { id: 3, orderId: 10, productName: "C" },
    ]);
    expect(grouped.get(10)?.map(item => item.productName)).toEqual(["A", "C"]);
    expect(grouped.get(20)?.map(item => item.productName)).toEqual(["B"]);
  });
});
