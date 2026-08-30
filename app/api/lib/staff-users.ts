import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { adminStaffUsers, users, adminActivityLogs } from "@db/schema";
import { staffRoles, roleModules, adminModules } from "@contracts/admin-access";
import { getDb } from "../queries/connection";

const password = z.string().min(12).max(72).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/).refine(p => Buffer.byteLength(p) <= 72);
export const staffInput = z.object({
  name: z.string().trim().min(1).max(255), email: z.string().trim().toLowerCase().email().max(320),
  role: z.enum(staffRoles), permissions: z.array(z.enum(adminModules)).default([]),
  isActive: z.boolean().default(true), password: password.optional(),
});

export async function saveStaff(input: z.infer<typeof staffInput> & { id?: number }, actorId: number) {
  if (!input.id && !input.password) throw new TRPCError({ code: "BAD_REQUEST", message: "A strong password is required for a new staff account." });
  const hash = input.password ? await bcrypt.hash(input.password, 12) : undefined;
  return getDb().transaction(async tx => {
    const unionId = input.id ? `local:staff:${input.id}` : "";
    const [emailOwner] = await tx.select({ id: users.id }).from(users).where(and(eq(users.email, input.email), ne(users.unionId, unionId))).limit(1);
    if (emailOwner) throw new TRPCError({ code: "CONFLICT", message: "Email is already in use." });
    const fields = { name: input.name, email: input.email, role: input.role, isActive: input.isActive, permissions: input.permissions.filter(p => roleModules[input.role].includes(p)) };
    let id = input.id;
    if (id) {
      const [existing] = await tx.select({ id: adminStaffUsers.id }).from(adminStaffUsers).where(eq(adminStaffUsers.id, id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Staff account not found." });
      await tx.update(adminStaffUsers).set(fields).where(eq(adminStaffUsers.id, id));
    } else {
      const result = await tx.insert(adminStaffUsers).values(fields);
      id = Number(result[0].insertId);
    }
    const staffUnionId = `local:staff:${id}`;
    const [existingUser] = await tx.select({ id: users.id }).from(users).where(eq(users.unionId, staffUnionId)).limit(1);
    if (!existingUser && !hash) throw new TRPCError({ code: "BAD_REQUEST", message: "Set a password to activate this staff record." });
    const userFields = { name: input.name, email: input.email, role: "admin" as const, ...(hash ? { passwordHash: hash } : {}) };
    if (existingUser) await tx.update(users).set(userFields).where(eq(users.id, existingUser.id));
    else await tx.insert(users).values({ ...userFields, unionId: staffUnionId });
    await tx.insert(adminActivityLogs).values({ adminUserId: actorId || null, action: input.id ? "update_admin_staff" : "create_admin_staff", entityType: "admin_staff", entityId: id, details: { role: input.role, isActive: input.isActive } });
    return { id };
  });
}
