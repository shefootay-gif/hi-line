import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { Link } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  const { lang } = useLanguage();
  const t = useTranslations(lang);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-8xl font-bold text-[#B57EDC]">404</div>
      <h1 className="text-2xl font-bold text-[#4B1C71]">{t.pageNotFound}</h1>
      <p className="text-[#6F6178] text-center max-w-md">{t.pageNotFoundText}</p>
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors"
      >
        <Home className="w-5 h-5" />
        {t.goHome}
      </Link>
    </div>
  );
}
