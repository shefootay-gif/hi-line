import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

function required(name: string): string {
  const value = process.env[name];
  if (!value && isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optionalNonEmpty(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requiredJwtSecret(): string {
  const value =
    optionalNonEmpty("JWT_SECRET") ?? optionalNonEmpty("APP_SECRET");
  if (!value && isProduction) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return value ?? "local-dev-secret-change-in-production";
}

function databaseUrl(): string {
  const value = required("DATABASE_URL").trim();
  if (!value || value.startsWith("#") || !value.includes("://")) {
    throw new Error(
      "DATABASE_URL must be set to a valid MySQL connection URL, for example mysql://user:password@host:3306/database"
    );
  }
  return value;
}

export const env = {
  // Primary JWT secret (new, preferred)
  jwtSecret: requiredJwtSecret(),

  // Paymob is intentionally disabled. The test environment keeps the callback
  // reachable only so its legacy signature/reconciliation tests remain useful.
  paymobEnabled: process.env.NODE_ENV === "test",
  paymobHmacSecret:
    optionalNonEmpty("PAYMOB_HMAC_SECRET") ?? "local-dev-hmac-secret",

  // Legacy compat — used in kimi/session.ts via appSecret fallback
  appId: process.env.APP_ID ?? "",
  appSecret:
    optionalNonEmpty("APP_SECRET") ??
    (isProduction
      ? required("APP_SECRET")
      : "local-dev-secret"),

  isProduction,
  trustProxy: process.env.TRUST_PROXY === "true",
  databaseUrl: databaseUrl(),

  // Kimi OAuth (optional — only needed if using OAuth login)
  kimiAuthUrl: process.env.KIMI_AUTH_URL ?? "",
  kimiOpenUrl: process.env.KIMI_OPEN_URL ?? "",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",

  // Local admin credentials
  localAdminUsername:
    process.env.LOCAL_ADMIN_USERNAME ??
    (process.env.NODE_ENV === "production" ? "" : "admin"),
  localAdminPassword:
    process.env.LOCAL_ADMIN_PASSWORD ??
    (isProduction ? "" : "admin-dev-password"),

  // Transactional email used by the password-reset flow.
  resendApiKey:
    optionalNonEmpty("RESEND_API_KEY") ??
    (isProduction ? required("RESEND_API_KEY") : ""),
  passwordResetFromEmail:
    optionalNonEmpty("PASSWORD_RESET_FROM_EMAIL") ??
    (isProduction ? required("PASSWORD_RESET_FROM_EMAIL") : ""),
  passwordResetBaseUrl:
    optionalNonEmpty("PASSWORD_RESET_BASE_URL") ??
    (isProduction
      ? required("PASSWORD_RESET_BASE_URL")
      : "http://localhost:3000"),
};
