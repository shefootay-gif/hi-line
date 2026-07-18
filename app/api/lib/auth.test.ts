process.env.LOCAL_ADMIN_USERNAME = "admin";
process.env.JWT_SECRET = "test-jwt-secret-key-that-is-long-enough-for-hmac";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticateRequest } from "./auth";
import { verifySessionToken } from "./session";

vi.mock("./session", () => ({
  verifySessionToken: vi.fn(),
}));

vi.mock("../queries/users", () => ({
  findUserByUnionId: vi.fn(),
  findUserById: vi.fn(),
}));

describe("authenticateRequest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should fail to authenticate when authorization header is Bearer admin123", async () => {
    const headers = new Headers();
    headers.set("authorization", "Bearer admin123");

    await expect(authenticateRequest(headers)).rejects.toThrow(
      "Invalid authentication token."
    );
  });

  it("should fail to authenticate with any arbitrary Bearer token", async () => {
    const headers = new Headers();
    headers.set("authorization", "Bearer arbitrary_token");

    await expect(authenticateRequest(headers)).rejects.toThrow(
      "Invalid authentication token."
    );
  });

  it("should succeed with a valid signed local-admin session token cookie", async () => {
    const headers = new Headers();
    headers.set("cookie", "hi_line_sid=valid_admin_token");

    vi.mocked(verifySessionToken).mockResolvedValueOnce({
      unionId: "local-admin:admin",
      clientId: "local-admin",
    });

    const user = await authenticateRequest(headers);
    expect(user.role).toBe("admin");
    expect(user.unionId).toBe("local-admin:admin");
  });
});
