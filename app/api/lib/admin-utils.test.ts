import { describe, expect, it } from "vitest";
import { nextAvailableSlug } from "./admin-utils";

describe("nextAvailableSlug", () => {
  it("uses the English product name and resolves collisions", () => {
    expect(nextAvailableSlug("Premium Business Package", [])).toBe(
      "premium-business-package",
    );
    expect(
      nextAvailableSlug("Premium Business Package", [
        "premium-business-package",
        "premium-business-package-2",
      ]),
    ).toBe("premium-business-package-3");
  });
});
