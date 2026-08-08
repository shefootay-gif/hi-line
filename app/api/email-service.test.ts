import crypto from "crypto";
import { describe, expect, it } from "vitest";
import {
  buildPasswordResetUrl,
  hashPasswordResetToken,
} from "./email-service";

describe("password reset email helpers", () => {
  it("stores a deterministic SHA-256 digest instead of the raw token", () => {
    const token = "sensitive-reset-token";
    const digest = hashPasswordResetToken(token);

    expect(digest).toBe(
      crypto.createHash("sha256").update(token).digest("hex"),
    );
    expect(digest).not.toContain(token);
    expect(digest).toHaveLength(64);
  });

  it("encodes the reset token in the public reset URL", () => {
    const url = new URL(buildPasswordResetUrl("token/with special+chars"));

    expect(url.pathname).toBe("/en/reset-password");
    expect(url.searchParams.get("token")).toBe("token/with special+chars");
  });
});
