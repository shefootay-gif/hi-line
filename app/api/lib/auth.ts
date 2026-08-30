import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { env } from "./env";
import { verifySessionToken } from "./session";
import type { SafeUser } from "@db/schema";
import { findUserById, findUserByUnionId } from "../queries/users";
import { getDb } from "../queries/connection";
import { adminStaffUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import { staffRoles, type StaffRole } from "@contracts/admin-access";

export async function authenticateRequest(headers: Headers): Promise<SafeUser> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }

  if (claim.unionId === `local-admin:${env.localAdminUsername}`) {
    const now = new Date();
    return {
      id: 0,
      unionId: claim.unionId,
      name: "Hi Line Admin",
      email: "admin@hiline.local",
      avatar: null,
      role: "admin",
      phone: null,
      gender: null,
      birthday: null,
      nationality: null,
      createdAt: now,
      updatedAt: now,
      lastSignInAt: now,
    } satisfies SafeUser;
  }

  if (!claim.unionId.startsWith("local:")) {
    throw Errors.forbidden(
      "Unsupported authentication provider. Please re-login."
    );
  }

  let user = await findUserByUnionId(claim.unionId);
  if (!user) {
    const legacyId = Number(claim.unionId.slice("local:".length));
    if (Number.isFinite(legacyId)) {
      user = await findUserById(legacyId);
    }
  }

  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }

  const safeUser: SafeUser & { passwordHash?: string | null } = { ...user };
  delete (safeUser as { passwordHash?: string }).passwordHash;
  if (claim.unionId.startsWith("local:staff:")) {
    const id = Number(claim.unionId.slice("local:staff:".length));
    const [staff] = await getDb().select().from(adminStaffUsers).where(eq(adminStaffUsers.id, id)).limit(1);
    if (!staff?.isActive || !staffRoles.includes(staff.role as StaffRole)) {
      throw Errors.forbidden("Staff account is disabled.");
    }
    safeUser.adminAccess = { role: staff.role as StaffRole, permissions: staff.permissions ?? [] };
  }
  return safeUser;
}
