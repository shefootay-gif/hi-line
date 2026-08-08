import { Hono } from "hono";
import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimiter } from "./rate-limiter";

const createApp = (limit: number, windowMs: number) => {
  const app = new Hono();
  app.use("*", rateLimiter({ limit, windowMs }));
  app.get("/test", c => c.json({ ok: true }));
  return app;
};

describe("rateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("exceeding the request limit returns 429 with retry headers", async () => {
    const app = createApp(2, 5_000);
    const requestEnv = { remoteAddress: "rate-limit-client" };

    const firstResponse = await app.request("/test", undefined, requestEnv);
    const secondResponse = await app.request("/test", undefined, requestEnv);
    const blockedResponse = await app.request("/test", undefined, requestEnv);

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(firstResponse.headers.get("X-RateLimit-Remaining")).toBe("1");
    expect(secondResponse.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(blockedResponse.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(Number(blockedResponse.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("allows the same client again after the rate-limit window resets", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T00:00:00.000Z"));

    const app = createApp(1, 1_000);
    const requestEnv = { remoteAddress: "window-reset-client" };

    expect((await app.request("/test", undefined, requestEnv)).status).toBe(200);
    expect((await app.request("/test", undefined, requestEnv)).status).toBe(429);

    vi.advanceTimersByTime(1_001);
    const responseAfterReset = await app.request("/test", undefined, requestEnv);

    expect(responseAfterReset.status).toBe(200);
    expect(responseAfterReset.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("applies the stricter authentication limit to forgot-password requests", async () => {
    const app = new Hono();
    app.use("*", rateLimiter({ limit: 300, windowMs: 60_000 }));
    app.post("/api/trpc/auth.forgotPassword", c => c.json({ ok: true }));
    const requestEnv = { remoteAddress: "forgot-password-client" };

    for (let request = 0; request < 10; request += 1) {
      expect(
        (
          await app.request(
            "/api/trpc/auth.forgotPassword",
            { method: "POST" },
            requestEnv,
          )
        ).status,
      ).toBe(200);
    }

    const blockedResponse = await app.request(
      "/api/trpc/auth.forgotPassword",
      { method: "POST" },
      requestEnv,
    );
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("X-RateLimit-Limit")).toBe("10");
  });
});
