import {
  CreditCard,
  Globe,
  LockKeyhole,
  MapPin,
  Palette,
  Phone,
  Store,
  Truck,
} from "lucide-react";
import { socialLinkPlatforms } from "@/lib/social-links";

export const settingsTabs = [
  { key: "store", labelEn: "Store Identity", labelAr: "هوية المتجر", icon: Store },
  { key: "contact", labelEn: "Contact & Social", labelAr: "التواصل", icon: Phone },
  { key: "appearance", labelEn: "Appearance", labelAr: "المظهر", icon: Palette },
  { key: "shipping", labelEn: "Shipping", labelAr: "الشحن", icon: Truck },
  { key: "payment", labelEn: "Payment", labelAr: "الدفع", icon: CreditCard },
  { key: "security", labelEn: "Security", labelAr: "الأمان", icon: LockKeyhole },
  { key: "seo", labelEn: "SEO", labelAr: "تحسين البحث", icon: Globe },
];

const whatsapp = socialLinkPlatforms.find(platform => platform.key === "whatsapp_number")!;
const email = socialLinkPlatforms.find(platform => platform.key === "email_address")!;

export const socialPlatforms = [
  whatsapp,
  { key: "phone_number", labelEn: "Phone", labelAr: "هاتف", icon: Phone, placeholder: "+20 100 000 0000", color: "#4B1C71" },
  email,
  { key: "address_en", labelEn: "Address (EN)", labelAr: "العنوان EN", icon: MapPin, placeholder: "Cairo, Egypt", color: "#6F6178" },
  { key: "address_ar", labelEn: "Address (AR)", labelAr: "العنوان AR", icon: MapPin, placeholder: "القاهرة، مصر", color: "#6F6178" },
  ...socialLinkPlatforms.filter(platform => !["whatsapp_number", "email_address"].includes(platform.key)),
];

export const colorPresets = [
  { name: "Purple (Default)", primary: "#4B1C71", secondary: "#B57EDC", accent: "#F7ECFF", bg: "#FFFFFF" },
  { name: "Rose Gold", primary: "#9B2335", secondary: "#E8A0B4", accent: "#FFF0F3", bg: "#FFFAFA" },
  { name: "Ocean Blue", primary: "#0C4A6E", secondary: "#38BDF8", accent: "#E0F2FE", bg: "#F8FBFF" },
  { name: "Forest Green", primary: "#14532D", secondary: "#4ADE80", accent: "#DCFCE7", bg: "#F8FFF9" },
  { name: "Midnight Gold", primary: "#1C1917", secondary: "#D97706", accent: "#FEF3C7", bg: "#FFFBF0" },
  { name: "Coral", primary: "#9A3412", secondary: "#FB923C", accent: "#FFEDD5", bg: "#FFF8F0" },
];
