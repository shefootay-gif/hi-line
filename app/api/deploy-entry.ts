import fs from "node:fs";
import path from "node:path";
import { seed } from "../db/seed";

const seedMarker = path.resolve(import.meta.dirname, "../.seed-complete");

if (!fs.existsSync(seedMarker)) {
  await seed();
  fs.writeFileSync(seedMarker, new Date().toISOString(), "utf8");
}

await import("./boot");
