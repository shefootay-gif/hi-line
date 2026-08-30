import { z } from "zod";

export const nonNegativeMoney = z
  .string()
  .trim()
  .default("0")
  .refine(
    value => Number.isFinite(Number(value)) && Number(value) >= 0,
    "Value must be a non-negative number"
  );

export const optionalNonNegativeMoney = z
  .string()
  .trim()
  .optional()
  .refine(
    value =>
      value === undefined ||
      value === "" ||
      (Number.isFinite(Number(value)) && Number(value) >= 0),
    "Value must be a non-negative number"
  );

export function toNumber(value: string | number | null | undefined) {
  return Number(value ?? 0) || 0;
}

export function rawRows<T>(result: unknown): T[] {
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as T[];
  }
  return result as T[];
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "supplier-product"
  );
}

export function nextAvailableSlug(value: string, existingSlugs: Iterable<string>) {
  const base = slugify(value);
  const existing = new Set(existingSlugs);
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function validateCampaignMetrics(input: {
  budget?: string;
  spend?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ordersCount?: number;
  revenue?: string;
}) {
  const budget = toNumber(input.budget);
  const spend = toNumber(input.spend);
  const impressions = input.impressions ?? 0;
  const clicks = input.clicks ?? 0;
  const conversions = input.conversions ?? 0;
  const ordersCount = input.ordersCount ?? 0;

  if ([impressions, clicks, conversions, ordersCount].some(value => value < 0)) {
    throw new Error("Campaign metrics cannot be negative");
  }
  if (clicks > impressions) throw new Error("Clicks cannot be greater than impressions");
  if (conversions > clicks) throw new Error("Conversions cannot be greater than clicks");
  if (ordersCount > conversions) throw new Error("Orders cannot be greater than conversions");
  if (budget > 0 && spend > budget) throw new Error("Spend cannot be greater than budget");
}

export const editableSettingKeys = new Set([
  "store_name_en", "store_name_ar", "tagline_en", "tagline_ar",
  "logo_url", "favicon_url", "hero_bg_url", "whatsapp_number",
  "phone_number", "email_address", "address_en", "address_ar",
  "facebook_url", "instagram_url", "tiktok_url", "youtube_url",
  "twitter_url", "snapchat_url", "telegram_url", "linkedin_url",
  "pinterest_url", "primary_color", "secondary_color", "accent_color",
  "background_color", "announcement_text_en", "announcement_text_ar",
  "free_shipping_threshold", "default_shipping_fee", "meta_title_en",
  "meta_description_en", "meta_title_ar", "meta_description_ar",
  "currency", "default_language",
]);

function csvEscape(value: unknown) {
  const raw = value === null || value === undefined ? "" : String(value);
  // CSV quoting does not stop spreadsheets interpreting text as formulas.
  const text = typeof value === "string" && /^[\s\uFEFF]*[=+@-]/u.test(raw) ? `'${raw}` : raw;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvEscape).join(","),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(",")),
  ].join("\n");
}

export function safeNumber(value: string | number | null | undefined) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}
