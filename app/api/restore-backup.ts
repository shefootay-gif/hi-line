// Offline recovery only: refuses non-empty databases and existing asset targets.
import fs from "node:fs/promises";
import path from "node:path";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { decryptBackup } from "./lib/backup-codec";

async function main() {
  const { BACKUP_FILE, BACKUP_PASSPHRASE, RESTORE_DATABASE_URL, RESTORE_ASSET_DIR } = process.env;
  if (!BACKUP_FILE || !BACKUP_PASSPHRASE) throw new Error("Set BACKUP_FILE and BACKUP_PASSPHRASE. Use --verify for a read-only integrity check.");
  const snapshot = decryptBackup(await fs.readFile(BACKUP_FILE, "utf8"), BACKUP_PASSPHRASE);
  if (process.argv.includes("--verify")) { console.log(`Verified: ${snapshot.tables.length} tables, ${snapshot.files.length} files.`); return; }
  if (!RESTORE_DATABASE_URL || !RESTORE_ASSET_DIR || process.env.RESTORE_CONFIRM !== "RESTORE_TO_EMPTY_DATABASE") throw new Error("Restoration requires RESTORE_DATABASE_URL, a new RESTORE_ASSET_DIR and RESTORE_CONFIRM=RESTORE_TO_EMPTY_DATABASE.");
  if (new URL(RESTORE_DATABASE_URL).pathname.slice(1) === snapshot.sourceDatabase) throw new Error("Refusing to restore to the source database name. Use a new database.");
  const assetRoot = path.resolve(RESTORE_ASSET_DIR);
  if (await fs.lstat(assetRoot).then(()=>true, (e: NodeJS.ErrnoException)=>{if(e.code === "ENOENT") return false; throw e;})) throw new Error("Asset destination must not exist.");
  const conn = await mysql.createConnection({uri: RESTORE_DATABASE_URL, dateStrings: true});
  try {
    const [tables] = await conn.query<RowDataPacket[]>("SHOW TABLES");
    if (tables.length) throw new Error("Destination database is not empty. Nothing was changed.");
    await conn.query("SET FOREIGN_KEY_CHECKS=0");
    for (const table of snapshot.tables) await conn.query(table.ddl);
    await conn.beginTransaction();
    try {
      for (const table of snapshot.tables) for (const row of table.rows) {
        const keys = Object.keys(row); if (!keys.length) continue;
        const values = keys.map(key => typeof row[key] === "object" && row[key] !== null ? JSON.stringify(row[key]) : row[key]);
        await conn.execute(`INSERT INTO \`${table.name}\` (${keys.map(key=>`\`${key}\``).join(",")}) VALUES (${keys.map(()=>"?").join(",")})`, values);
      }
      await conn.commit();
    } catch (e) { await conn.rollback(); throw e; }
    await conn.query("SET FOREIGN_KEY_CHECKS=1");
    await fs.mkdir(assetRoot, {recursive:true,mode:0o700});
    for (const file of snapshot.files) { const target = path.join(assetRoot, file.path); await fs.mkdir(path.dirname(target), {recursive:true}); await fs.writeFile(target, Buffer.from(file.content,"base64"), {flag:"wx",mode:0o600}); }
    console.log("Restored into the new database and asset directory. Verify before switching production. Server secrets and external media require separate recovery.");
  } finally { await conn.end(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Restore failed"); process.exitCode = 1; });
