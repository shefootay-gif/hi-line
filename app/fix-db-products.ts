import { getDb } from "./api/queries/connection";
import { products } from "./db/schema";
import { eq } from "drizzle-orm";
import { rollOnProducts } from "./src/lib/hiLineCatalog";

async function main() {
  const db = getDb();
  for (const staticProduct of rollOnProducts) {
    const slug = staticProduct.slug;
    await db.update(products).set({
      price: staticProduct.originalPrice,
      salePrice: staticProduct.salePrice,
      images: staticProduct.images,
    }).where(eq(products.slug, slug));
    console.log(`Updated ${slug} with price: ${staticProduct.originalPrice}, salePrice: ${staticProduct.salePrice}, images: ${staticProduct.images}`);
  }
  console.log("Done updating products!");
  process.exit(0);
}

main().catch(console.error);
