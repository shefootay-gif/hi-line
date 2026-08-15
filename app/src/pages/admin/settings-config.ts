import {
  CreditCard, Facebook, Globe, Instagram, LockKeyhole, Mail, MapPin, Palette,
  Phone, Send, Store, Truck, Twitter, Youtube,
} from "lucide-react";

export const settingsTabs = [
  { key: "store", labelEn: "Store Identity", labelAr: "هوية المتجر", icon: Store },
  { key: "contact", labelEn: "Contact & Social", labelAr: "التواصل", icon: Phone },
  { key: "appearance", labelEn: "Appearance", labelAr: "المظهر", icon: Palette },
  { key: "shipping", labelEn: "Shipping", labelAr: "الشحن", icon: Truck },
  { key: "payment", labelEn: "Payment", labelAr: "الدفع", icon: CreditCard },
  { key: "security", labelEn: "Security", labelAr: "الأمان", icon: LockKeyhole },
  { key: "seo", labelEn: "SEO", labelAr: "تحسين البحث", icon: Globe },
];

export const socialPlatforms = [
  { key: "whatsapp_number", labelEn: "WhatsApp", labelAr: "واتساب", icon: Phone, placeholder: "+20 100 000 0000", color: "#25D366" },
  { key: "phone_number", labelEn: "Phone", labelAr: "هاتف", icon: Phone, placeholder: "+20 100 000 0000", color: "#4B1C71" },
  { key: "email_address", labelEn: "Email", labelAr: "البريد", icon: Mail, placeholder: "hello@hiline.com", color: "#EA4335" },
  { key: "address_en", labelEn: "Address (EN)", labelAr: "العنوان EN", icon: MapPin, placeholder: "Cairo, Egypt", color: "#6F6178" },
  { key: "address_ar", labelEn: "Address (AR)", labelAr: "العنوان AR", icon: MapPin, placeholder: "القاهرة، مصر", color: "#6F6178" },
  { key: "facebook_url", labelEn: "Facebook", labelAr: "فيسبوك", icon: Facebook, placeholder: "https://facebook.com/...", color: "#1877F2" },
  { key: "instagram_url", labelEn: "Instagram", labelAr: "انستجرام", icon: Instagram, placeholder: "https://instagram.com/...", color: "#E4405F" },
  { key: "tiktok_url", labelEn: "TikTok", labelAr: "تيك توك", icon: Globe, placeholder: "https://tiktok.com/@...", color: "#010101" },
  { key: "youtube_url", labelEn: "YouTube", labelAr: "يوتيوب", icon: Youtube, placeholder: "https://youtube.com/...", color: "#FF0000" },
  { key: "twitter_url", labelEn: "X (Twitter)", labelAr: "إكس تويتر", icon: Twitter, placeholder: "https://x.com/...", color: "#1DA1F2" },
  { key: "snapchat_url", labelEn: "Snapchat", labelAr: "سناب شات", icon: Globe, placeholder: "https://snapchat.com/...", color: "#FFFC00" },
  { key: "telegram_url", labelEn: "Telegram", labelAr: "تيليجرام", icon: Send, placeholder: "https://t.me/...", color: "#0088CC" },
  { key: "linkedin_url", labelEn: "LinkedIn", labelAr: "لينكد إن", icon: Globe, placeholder: "https://linkedin.com/...", color: "#0A66C2" },
  { key: "pinterest_url", labelEn: "Pinterest", labelAr: "بينترست", icon: Globe, placeholder: "https://pinterest.com/...", color: "#E60023" },
];

export const colorPresets = [
  { name: "Purple (Default)", primary: "#4B1C71", secondary: "#B57EDC", accent: "#F7ECFF", bg: "#FFFFFF" },
  { name: "Rose Gold", primary: "#9B2335", secondary: "#E8A0B4", accent: "#FFF0F3", bg: "#FFFAFA" },
  { name: "Ocean Blue", primary: "#0C4A6E", secondary: "#38BDF8", accent: "#E0F2FE", bg: "#F8FBFF" },
  { name: "Forest Green", primary: "#14532D", secondary: "#4ADE80", accent: "#DCFCE7", bg: "#F8FFF9" },
  { name: "Midnight Gold", primary: "#1C1917", secondary: "#D97706", accent: "#FEF3C7", bg: "#FFFBF0" },
  { name: "Coral", primary: "#9A3412", secondary: "#FB923C", accent: "#FFEDD5", bg: "#FFF8F0" },
];
