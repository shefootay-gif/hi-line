import type { MiddlewareHandler } from "hono";
import { env } from "./env";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

function getClientIp(
  remoteAddress: string | undefined,
  forwardedFor: string | undefined,
): string {
  if (remoteAddress) return remoteAddress;
  if (!env.trustProxy || !forwardedFor) return "unknown";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

export const rateLimiter = (options = { limit: 200, windowMs: 60000 }): MiddlewareHandler => {
  return async (c, next) => {
    const ip = getClientIp(
      c.env?.remoteAddress,
      c.req.header("x-forwarded-for"),
    );
    const now = Date.now();
    const url = c.req.url;
    
    // Stricter limits for authentication and order mutations
    const isSensitive = 
      url.includes("createOrder") || 
      url.includes("Login") || 
      url.includes("register") || 
      url.includes("resetPassword");
      
    const limit = isSensitive ? 10 : options.limit;
    const storeKey = `${ip}:${isSensitive ? "sensitive" : "normal"}`;
    
    if (!store[storeKey]) {
      store[storeKey] = { count: 1, resetTime: now + options.windowMs };
    } else {
      if (now > store[storeKey].resetTime) {
        store[storeKey] = { count: 1, resetTime: now + options.windowMs };
      } else {
        store[storeKey].count++;
        if (store[storeKey].count > limit) {
          const retryAfter = Math.max(
            1,
            Math.ceil((store[storeKey].resetTime - now) / 1000),
          );
          c.header("Retry-After", String(retryAfter));
          c.header("X-RateLimit-Limit", String(limit));
          c.header("X-RateLimit-Remaining", "0");
          return c.json(
            { error: "Too many requests. Please wait a moment and try again." },
            429,
          );
        }
      }
    }

    c.header("X-RateLimit-Limit", String(limit));
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, limit - store[storeKey].count)),
    );
    
    await next();
  };
};
