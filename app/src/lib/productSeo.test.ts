import { describe, expect, it } from "vitest";
import { productStructuredData, type ProductSeoInput } from "./productSeo";

const product = (stock: number): ProductSeoInput => ({
  id: 7,
  name: "Hi Line Roll On",
  description: "48-hour freshness",
  imagePath: "/products/roll-on.webp",
  price: "285.00",
  stock,
  url: "https://hiline.example/shop/roll-on",
  origin: "https://hiline.example",
  brand: "Hi Line",
});

describe("productStructuredData", () => {
  it.each([
    [5, "https://schema.org/InStock"],
    [0, "https://schema.org/OutOfStock"],
  ])("maps stock %s to the correct schema availability", (stock, availability) => {
    const schema = productStructuredData(product(stock));

    expect(schema["@type"]).toBe("Product");
    expect(schema.image).toEqual(["https://hiline.example/products/roll-on.webp"]);
    expect(schema.offers).toMatchObject({
      priceCurrency: "EGP",
      price: "285.00",
      availability,
    });
  });
});
