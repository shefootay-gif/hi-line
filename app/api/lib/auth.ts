import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { env } from "./env";
import { verifySessionToken } from "./session";
import { findUserById, findUserByUnionId } from "../queries/users";

export async function authenticateRequest(headers: Headers) {
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
      passwordHash: null,
      createdAt: now,
      updatedAt: now,
      lastSignInAt: now,
    } as const;
  }

  if (!claim.unionId.startsWith("local:")) {
    throw Errors.forbidden("Unsupported authentication provider. Please re-login.");
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

  return user;
}
