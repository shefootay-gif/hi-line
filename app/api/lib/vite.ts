import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { and, eq } from "drizzle-orm";
import { products, seoPages } from "../../db/schema";
import { findSeoOverride, publicSeoPath, seoRoute } from "@contracts/seo-settings";
import { getDb } from "../queries/connection";
import { env } from "./env";
import { injectSeoDocument, type SeoProduct } from "./seo-document";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  app.use("*", serveStatic({ root: "./dist/public" }));

  app.notFound(async (c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const template = fs.readFileSync(indexPath, "utf-8");
    const url = new URL(c.req.url);
    const productMatch = url.pathname.match(/^\/(?:ar|en)\/shop\/([^/]+)$/);
    let product: SeoProduct | null = null;

    if (productMatch) {
      const slug = decodeURIComponent(productMatch[1]);
      const [result] = await getDb()
        .select({
          slug: products.slug,
          nameEn: products.nameEn,
          nameAr: products.nameAr,
          descriptionEn: products.descriptionEn,
          descriptionAr: products.descriptionAr,
          shortDescriptionEn: products.shortDescriptionEn,
          shortDescriptionAr: products.shortDescriptionAr,
          price: products.price,
          salePrice: products.salePrice,
          stock: products.stock,
          sku: products.sku,
          images: products.images,
        })
        .from(products)
        .where(and(eq(products.slug, slug), eq(products.isActive, true)))
        .limit(1);
      product = result ?? null;
    }

    const overrides = publicSeoPath(seoRoute(url.pathname)) ? await getDb().select().from(seoPages) : [];
    const content = injectSeoDocument(
      template,
      env.isProduction ? "https://bellorypharma.com" : url.origin,
      url.pathname,
      product,
      findSeoOverride(overrides, url.pathname),
    );
    return c.html(content);
  });
}
