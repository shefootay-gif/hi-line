import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { env } from "./env";
import { encryptBackup, type StoreBackup } from "./backup-codec";

const backupDir = () => path.resolve(process.cwd(), "private-backups");
let creatingBackup = false;
export async function createStoreBackup(passphrase: string) {
  if (creatingBackup) throw new Error("Another backup is already running.");
  creatingBackup = true;
  try { return await buildStoreBackup(passphrase); } finally { creatingBackup = false; }
}
async function buildStoreBackup(passphrase: string) {
  const conn = await mysql.createConnection({ uri: env.databaseUrl, dateStrings: true, supportBigNumbers: true, bigNumberStrings: true });
  const snapshot: StoreBackup = { version: 1, createdAt: new Date().toISOString(), sourceDatabase: new URL(env.databaseUrl).pathname.slice(1), tables: [], files: [] };
  try {
    await conn.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await conn.query("START TRANSACTION WITH CONSISTENT SNAPSHOT");
    const [tables] = await conn.query<RowDataPacket[]>("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    for (const entry of tables) {
      const name = String(Object.values(entry)[0]);
      if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Unsupported table name.");
      const [ddl] = await conn.query<RowDataPacket[]>(`SHOW CREATE TABLE \`${name}\``);
      const [rows] = await conn.query<RowDataPacket[]>(`SELECT * FROM \`${name}\``);
      snapshot.tables.push({ name, ddl: String(ddl[0]["Create Table"]), rows });
    }
    await conn.commit();
  } catch (error) { await conn.rollback(); throw error; } finally { await conn.end(); }
  const root = path.resolve(process.cwd(), "dist/public");
  let assetBytes = 0;
  async function collect(directory: string) {
    for (const item of await fs.readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, item.name);
      if (item.isSymbolicLink()) throw new Error("Symbolic links in public assets are not supported.");
      if (item.isDirectory()) await collect(full);
      else if (item.isFile()) {
        const data = await fs.readFile(full); assetBytes += data.length;
        if (assetBytes > 100 * 1024 * 1024) throw new Error("Assets exceed 100 MB. Use the hosting backup tool.");
        snapshot.files.push({ path: path.relative(root, full).split(path.sep).join("/"), content: data.toString("base64") });
      }
    }
  }
  await collect(root);
  const content = encryptBackup(snapshot, passphrase);
  await fs.mkdir(backupDir(), { recursive: true, mode: 0o700 });
  const fileName = `hiline-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.hlbackup`;
  await fs.writeFile(path.join(backupDir(), fileName), content, { flag: "wx", mode: 0o600 });
  return { fileName, content, tables: snapshot.tables.length, files: snapshot.files.length };
}
export async function listStoreBackups() {
  const entries = await fs.readdir(backupDir()).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
  return Promise.all(entries.filter(name => /^hiline-\d+-[a-f0-9]+\.hlbackup$/.test(name)).sort().reverse().map(async fileName => { const stat = await fs.stat(path.join(backupDir(), fileName)); return { fileName, bytes: stat.size, createdAt: stat.mtime }; }));
}
export async function readStoreBackup(fileName: string) {
  if (!/^hiline-\d+-[a-f0-9]+\.hlbackup$/.test(fileName)) throw new Error("Invalid backup filename.");
  return { fileName, content: await fs.readFile(path.join(backupDir(), fileName), "utf8") };
}
