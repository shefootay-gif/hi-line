export type ProductSeoInput = {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  price: string;
  stock: number;
  url: string;
  origin: string;
  brand: string;
};

export const productStructuredData = (product: ProductSeoInput) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  description: product.description,
  image: [new URL(product.imagePath, product.origin).href],
  sku: String(product.id),
  brand: {
    "@type": "Brand",
    name: product.brand,
  },
  offers: {
    "@type": "Offer",
    url: product.url,
    priceCurrency: "EGP",
    price: product.price,
    availability:
      product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
  },
});
