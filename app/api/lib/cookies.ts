import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    // Keep session cookies protected from cross-site form/script requests.
    // If the API is intentionally hosted on a different domain from the frontend,
    // add CSRF protection before changing this back to SameSite=None.
    sameSite: "Lax",
    secure: !localhost,
  };
}
