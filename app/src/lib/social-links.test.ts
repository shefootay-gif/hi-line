import { describe, expect, it } from "vitest";
import { getActiveSocialLinks } from "./social-links";

describe("social links", () => {
  it("returns every configured valid platform and skips empty or invalid links", () => {
    const links = getActiveSocialLinks({
      facebook_url: "https://facebook.com/hiline",
      instagram_url: "",
      tiktok_url: "not-a-url",
      telegram_url: "https://t.me/hiline",
      whatsapp_number: "+20 100 000 0000",
      email_address: "hello@example.com",
    });

    expect(links.map(link => link.key)).toEqual([
      "whatsapp_number",
      "facebook_url",
      "telegram_url",
      "email_address",
    ]);
  });
});
