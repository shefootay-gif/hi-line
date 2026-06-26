import * as jose from "jose";
import { env } from "./env";

export type SessionPayload = {
  unionId: string;
  clientId: string;
};

const JWT_ALG = "HS256";

function getSecret() {
  return new TextEncoder().encode(env.jwtSecret);
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALG],
    });
    const { unionId, clientId } = payload as {
      unionId?: string;
      clientId?: string;
    };
    if (!unionId) {
      console.warn("[session] JWT payload missing unionId field.");
      return null;
    }
    return { unionId, clientId: clientId ?? "local" };
  } catch (error) {
    console.warn(
      "[session] JWT verification failed:",
      error instanceof Error ? error.message : "Verification failed",
    );
    return null;
  }
}
