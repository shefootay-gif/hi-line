import { expect, it } from "vitest";
import { encryptBackup, decryptBackup, safeBackupPath, type StoreBackup } from "./backup-codec";
const snapshot: StoreBackup = {version:1,createdAt:"2026-08-30",sourceDatabase:"source",tables:[{name:"order_items",ddl:"CREATE TABLE `order_items` (`id` int)",rows:[{id:1,name:"طلب عربي"}]}],files:[{path:"products/test.webp",content:"YWJj"}]};
it("round-trips encrypted tables and image files without cleartext customer data",()=>{const encrypted=encryptBackup(snapshot,"long-test-password");expect(encrypted).not.toContain("طلب عربي");expect(decryptBackup(encrypted,"long-test-password")).toEqual(snapshot);});
it("rejects wrong passwords and tampered archives",()=>{const encrypted=encryptBackup(snapshot,"long-test-password");expect(()=>decryptBackup(encrypted,"wrong-password")).toThrow();const data=JSON.parse(encrypted);data.tag="AAAAAAAAAAAAAAAAAAAAAA==";expect(()=>decryptBackup(JSON.stringify(data),"long-test-password")).toThrow();});
it.each(["../secret","/absolute","C:/secret","products/../../secret","products\\secret"])("rejects unsafe restore path %s",value=>expect(safeBackupPath(value)).toBe(false));
