import crypto from "crypto";
import { env } from "./lib/env";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, character => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildPasswordResetUrl(token: string): string {
  const resetUrl = new URL("/en/reset-password", env.passwordResetBaseUrl);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}

type PasswordResetEmail = {
  to: string;
  name?: string | null;
  token: string;
};

export async function sendPasswordResetEmail({
  to,
  name,
  token,
}: PasswordResetEmail): Promise<void> {
  const resetUrl = buildPasswordResetUrl(token);

  if (!env.resendApiKey) {
    if (!env.isProduction) {
      console.log(`[PASSWORD RESET] Link: ${resetUrl}`);
      return;
    }
    throw new Error("Password reset email provider is not configured.");
  }

  const safeName = escapeHtml(name?.trim() || "Customer");
  const safeResetUrl = escapeHtml(resetUrl);
  const response = await fetch(RESEND_EMAILS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `password-reset/${hashPasswordResetToken(token)}`,
      "User-Agent": "hi-line-pro-care/1.0",
    },
    body: JSON.stringify({
      from: env.passwordResetFromEmail,
      to: [to],
      subject: "Reset your Hi Line Pro Care password | إعادة تعيين كلمة المرور",
      html: `
        <div dir="auto" style="font-family:Arial,sans-serif;line-height:1.7;color:#1A0533">
          <p>Hello ${safeName},</p>
          <p>Use the button below to reset your password. This link expires in one hour.</p>
          <p><a href="${safeResetUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#7C3AED;color:#fff;text-decoration:none">Reset password</a></p>
          <hr style="border:0;border-top:1px solid #E7D8F1;margin:24px 0" />
          <p dir="rtl">مرحباً ${safeName}،</p>
          <p dir="rtl">استخدم الزر أعلاه لإعادة تعيين كلمة المرور. تنتهي صلاحية الرابط خلال ساعة واحدة.</p>
          <p>If you did not request this change, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your Hi Line Pro Care password: ${resetUrl}\n\nإعادة تعيين كلمة المرور: ${resetUrl}\n\nThis link expires in one hour.`,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Password reset email failed (${response.status}): ${responseText.slice(0, 500)}`,
    );
  }
}
