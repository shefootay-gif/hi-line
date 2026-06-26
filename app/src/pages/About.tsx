import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { Award, Shield, Sparkles } from "lucide-react";

export default function About() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      {/* Hero */}
      <div
        className="pt-32 pb-20"
        style={{
          background: "linear-gradient(135deg, #4B1C71 0%, #B57EDC 50%, #dbb6ee 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t.aboutTitle}
          </h1>
          <p className="text-white/80 text-lg">{t.aboutSubtitle}</p>
        </div>
      </div>

      {/* Brand Story */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex flex-col lg:flex-row items-center gap-12 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
                {lang === "ar" ? "قصتنا" : "OUR STORY"}
              </p>
              <h2 className="text-3xl font-bold text-[#4B1C71] mb-6">
                {t.ourStory}
              </h2>
              <div className="space-y-4 text-[#6F6178] leading-relaxed">
                <p>{t.ourStoryText1}</p>
                <p>{t.ourStoryText2}</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="rounded-3xl overflow-hidden">
                <img
                  src="/campaign/collection-pool.jpg"
                  alt="Hi Line Collection"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 bg-[#F7ECFF]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
            {lang === "ar" ? "رسالتنا" : "MISSION"}
          </p>
          <h2 className="text-3xl font-bold text-[#4B1C71] mb-6">{t.mission}</h2>
          <p className="text-lg text-[#6F6178] leading-relaxed max-w-2xl mx-auto">
            {t.missionText}
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
              {lang === "ar" ? "قيمنا" : "VALUES"}
            </p>
            <h2 className="text-3xl font-bold text-[#4B1C71]">{t.values}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: t.quality,
                text: t.qualityText,
              },
              {
                icon: Sparkles,
                title: t.freshness,
                text: t.freshnessText,
              },
              {
                icon: Shield,
                title: t.trust,
                text: t.trustText,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="text-center p-8 bg-[#FCF8FF] rounded-2xl"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F7ECFF] flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-[#4B1C71]" />
                </div>
                <h3 className="text-xl font-semibold text-[#4B1C71] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6F6178]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Hi Line */}
      <div className="py-20 bg-[#F7ECFF]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B57EDC] font-semibold mb-3">
            {lang === "ar" ? "لماذا نحن" : "WHY US"}
          </p>
          <h2 className="text-3xl font-bold text-[#4B1C71] mb-6">
            {t.whyHiLine}
          </h2>
          <p className="text-[#6F6178] leading-relaxed">{t.whyHiLineText}</p>
        </div>
      </div>
    </div>
  );
}
