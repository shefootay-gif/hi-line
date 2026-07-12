import type { MiddlewareHandler } from "hono";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimiter = (options = { limit: 200, windowMs: 60000 }): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.env?.remoteAddress || c.req.header("x-forwarded-for") || "unknown";
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
          return c.json({ error: "Too many requests. Please wait a moment and try again." }, 429);
        }
      }
    }
    
    await next();
  };
};
