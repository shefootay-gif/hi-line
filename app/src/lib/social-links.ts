import {
  Facebook,
  Ghost,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export type SocialSettings = Record<string, string | null | undefined>;

export type SocialPlatform = {
  key: string;
  labelEn: string;
  labelAr: string;
  icon: LucideIcon;
  placeholder: string;
  color: string;
  kind: "url" | "whatsapp" | "email";
};

export const socialLinkPlatforms: SocialPlatform[] = [
  { key: "whatsapp_number", labelEn: "WhatsApp", labelAr: "واتساب", icon: MessageCircle, placeholder: "+20 100 000 0000", color: "#25D366", kind: "whatsapp" },
  { key: "facebook_url", labelEn: "Facebook", labelAr: "فيسبوك", icon: Facebook, placeholder: "https://facebook.com/...", color: "#1877F2", kind: "url" },
  { key: "instagram_url", labelEn: "Instagram", labelAr: "انستجرام", icon: Instagram, placeholder: "https://instagram.com/...", color: "#E4405F", kind: "url" },
  { key: "tiktok_url", labelEn: "TikTok", labelAr: "تيك توك", icon: Music2, placeholder: "https://tiktok.com/@...", color: "#010101", kind: "url" },
  { key: "twitter_url", labelEn: "X (Twitter)", labelAr: "إكس (تويتر)", icon: Twitter, placeholder: "https://x.com/...", color: "#111111", kind: "url" },
  { key: "snapchat_url", labelEn: "Snapchat", labelAr: "سناب شات", icon: Ghost, placeholder: "https://snapchat.com/add/...", color: "#D4B800", kind: "url" },
  { key: "youtube_url", labelEn: "YouTube", labelAr: "يوتيوب", icon: Youtube, placeholder: "https://youtube.com/...", color: "#FF0000", kind: "url" },
  { key: "telegram_url", labelEn: "Telegram", labelAr: "تيليجرام", icon: Send, placeholder: "https://t.me/...", color: "#0088CC", kind: "url" },
  { key: "linkedin_url", labelEn: "LinkedIn", labelAr: "لينكد إن", icon: Linkedin, placeholder: "https://linkedin.com/...", color: "#0A66C2", kind: "url" },
  { key: "pinterest_url", labelEn: "Pinterest", labelAr: "بنترست", icon: MessageCircle, placeholder: "https://pinterest.com/...", color: "#E60023", kind: "url" },
  { key: "email_address", labelEn: "Email", labelAr: "البريد الإلكتروني", icon: Mail, placeholder: "hello@example.com", color: "#EA4335", kind: "email" },
];

export type ActiveSocialLink = SocialPlatform & { href: string };

function platformHref(platform: SocialPlatform, rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value || value === "#") return null;

  if (platform.kind === "whatsapp") {
    const phone = value.replace(/[^\d]/g, "");
    return phone.length >= 7 ? `https://wa.me/${phone}` : null;
  }

  if (platform.kind === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getActiveSocialLinks(settings?: SocialSettings): ActiveSocialLink[] {
  return socialLinkPlatforms.flatMap(platform => {
    const href = platformHref(platform, settings?.[platform.key] ?? "");
    return href ? [{ ...platform, href }] : [];
  });
}
