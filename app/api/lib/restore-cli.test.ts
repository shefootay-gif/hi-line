// @vitest-environment node
import { expect, it } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { encryptBackup, type StoreBackup } from "./backup-codec";

it("verifies a downloaded archive offline and refuses to overwrite source databases or directories",()=>{
  const directory=mkdtempSync(path.join(tmpdir(),"hiline-restore-test-"));
  try {
    const file=path.join(directory,"fixture.hlbackup");
    const snapshot:StoreBackup={version:1,createdAt:new Date().toISOString(),sourceDatabase:"source_database",tables:[{name:"order_items",ddl:"CREATE TABLE `order_items` (`id` int)",rows:[{id:1}]}],files:[{path:"products/demo.txt",content:"YQ=="}]};
    writeFileSync(file,encryptBackup(snapshot,"BackupTest!Pass123"));
    const env={...process.env,BACKUP_FILE:file,BACKUP_PASSPHRASE:"BackupTest!Pass123",RESTORE_DATABASE_URL:"mysql://unused:unused@127.0.0.1:1/source_database",RESTORE_ASSET_DIR:path.join(directory,"assets"),RESTORE_CONFIRM:"RESTORE_TO_EMPTY_DATABASE"};
    const run=(args:string[],vars=env)=>spawnSync(process.execPath,["dist/restore-backup.js",...args],{env:vars,encoding:"utf8",timeout:10000});
    const verified=run(["--verify"]); expect(verified.status).toBe(0); expect(verified.stdout).toContain("Verified: 1 tables, 1 files");
    expect(run([]).stderr).toContain("source database");
    expect(existsSync(env.RESTORE_ASSET_DIR)).toBe(false);
    expect(run([],{...env,RESTORE_DATABASE_URL:"mysql://unused:unused@127.0.0.1:1/new_database",RESTORE_ASSET_DIR:directory}).stderr).toContain("must not exist");
    expect(run(["--verify"],{...env,BACKUP_PASSPHRASE:"wrong-password"}).status).not.toBe(0);
  } finally { rmSync(directory,{recursive:true,force:true}); }
});
