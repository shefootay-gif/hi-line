import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

export type StoreBackup = {
  version: 1; createdAt: string; sourceDatabase: string;
  tables: { name: string; ddl: string; rows: Record<string, unknown>[] }[];
  files: { path: string; content: string }[];
};
const limit = 200 * 1024 * 1024;
export function encryptBackup(snapshot: StoreBackup, passphrase: string): string {
  if (passphrase.length < 12 || passphrase.length > 256) throw new Error("Backup password must be 12–256 characters.");
  const salt = randomBytes(16); const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", scryptSync(passphrase, salt, 32), iv);
  const raw = Buffer.from(JSON.stringify(snapshot));
  if (raw.length > limit) throw new Error("Backup exceeds 200 MB. Use the hosting backup tool.");
  const encrypted = Buffer.concat([cipher.update(gzipSync(raw)), cipher.final()]);
  return JSON.stringify({ version: 1, salt: salt.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: encrypted.toString("base64") });
}
export function decryptBackup(content: string, passphrase: string): StoreBackup {
  if (content.length > limit * 2) throw new Error("Backup file too large.");
  const envelope = JSON.parse(content);
  if (envelope.version !== 1) throw new Error("Unsupported backup version.");
  const salt = Buffer.from(envelope.salt, "base64"), iv = Buffer.from(envelope.iv, "base64"), tag = Buffer.from(envelope.tag, "base64");
  if (salt.length !== 16 || iv.length !== 12 || tag.length !== 16) throw new Error("Invalid backup header.");
  const decipher = createDecipheriv("aes-256-gcm", scryptSync(passphrase, salt, 32), iv); decipher.setAuthTag(tag);
  const compressed = Buffer.concat([decipher.update(Buffer.from(envelope.data, "base64")), decipher.final()]);
  const snapshot = JSON.parse(gunzipSync(compressed, { maxOutputLength: limit }).toString("utf8")) as StoreBackup;
  if (snapshot.version !== 1 || !Array.isArray(snapshot.tables) || !Array.isArray(snapshot.files)) throw new Error("Invalid backup contents.");
  for (const table of snapshot.tables) {
    if (!/^[a-zA-Z0-9_]+$/.test(table.name) || !table.ddl.startsWith(`CREATE TABLE \`${table.name}\``) || !Array.isArray(table.rows)) throw new Error("Invalid table in backup.");
    for (const row of table.rows) if (Object.keys(row).some(key => !/^[a-zA-Z0-9_]+$/.test(key))) throw new Error("Invalid column in backup.");
  }
  for (const file of snapshot.files) if (!safeBackupPath(file.path)) throw new Error("Invalid asset path.");
  return snapshot;
}
export function safeBackupPath(value: string) {
  return typeof value === "string" && value.length > 0 && !value.startsWith("/") && !value.includes("\\") && !value.includes(":") && !value.includes("\0") && value.split("/").every(part => part !== ".." && part !== "." && part.length > 0);
}
