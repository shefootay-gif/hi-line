import fs from "node:fs";
import path from "node:path";
import { seed, seedCareSaleProducts, seedSingleRollOnSaleProducts } from "../db/seed";

const seedMarker = path.resolve(import.meta.dirname, "../.seed-complete");

async function bootstrap() {
  if (!fs.existsSync(seedMarker)) {
    await seed();
    fs.writeFileSync(seedMarker, new Date().toISOString(), "utf8");
  } else {
    await seedSingleRollOnSaleProducts();
    await seedCareSaleProducts();
  }

  await import("./boot");
}

void bootstrap().catch(error => {
  console.error("Application bootstrap failed", error);
  process.exitCode = 1;
});
