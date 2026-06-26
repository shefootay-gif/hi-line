import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";
import { trpc } from "@/providers/trpc";
import { useState } from "react";
import {
  MessageCircle,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Contact() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const { data: settings } = trpc.store.getSettings.useQuery();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const whatsappNumber = (settings?.whatsapp_number || "+201223863092").replace(/[^\d]/g, "");
  const displayPhone = settings?.phone_number || settings?.whatsapp_number || "+20 122 386 3092";
  const facebookUrl = settings?.facebook_url || "https://www.facebook.com/profile.php?id=61587944979845";
  const instagramUrl = settings?.instagram_url || "#";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitMessage = trpc.store.submitContactMessage.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message || !formData.email) {
      toast.error(
        lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields"
      );
      return;
    }
    
    try {
      await submitMessage.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setSent(true);
      toast.success(t.messageSent);
    } catch (err: any) {
      toast.error(err.message || (lang === "ar" ? "حدث خطأ أثناء الإرسال" : "Error sending message"));
    }
  };

  return (
    <div className={isRTL ? "font-[Cairo]" : "font-[Inter]"}>
      <Toaster position="top-center" />

      {/* Header */}
      <div
        className="pt-32 pb-20"
        style={{
          background: "linear-gradient(135deg, #4B1C71 0%, #B57EDC 50%, #dbb6ee 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t.contactTitle}
          </h1>
          <p className="text-white/80">{t.contactSubtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`flex flex-col lg:flex-row gap-12 ${isRTL ? "lg:flex-row-reverse" : ""}`}>
          {/* Contact Form */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#4B1C71] mb-2">
              {t.getInTouch}
            </h2>
            <p className="text-[#6F6178] mb-8">{t.contactText}</p>

            {sent ? (
              <div className="text-center py-12 bg-[#F7ECFF] rounded-2xl">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-[#4B1C71] mb-2">
                  {t.messageSent}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setFormData({ name: "", email: "", phone: "", message: "" });
                  }}
                  className="text-sm text-[#4B1C71] hover:text-[#B57EDC]"
                >
                  {lang === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                    {t.yourName} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                      {t.yourEmail}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                      {t.yourPhone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                    {t.yourMessage} *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={t.messagePlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#B57EDC] text-[#4B1C71] font-semibold rounded-xl hover:bg-[#A66DCC] transition-colors"
                >
                  {t.sendMessage}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-[#F7ECFF] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                {t.getInTouch}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#4B1C71]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8D7A97]">
                      {lang === "ar" ? "هاتف" : "Phone"}
                    </p>
                    <p className="text-sm font-medium text-[#4B1C71]">
                      {displayPhone}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8D7A97]">WhatsApp</p>
                    <p className="text-sm font-medium text-[#4B1C71]">
                      {displayPhone}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#4B1C71]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8D7A97]">
                      {lang === "ar" ? "الموقع" : "Location"}
                    </p>
                    <p className="text-sm font-medium text-[#4B1C71]">Egypt</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t.chatOnWhatsApp}
            </a>

            {/* Social */}
            <div className="bg-white border border-[#E7D8F1] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#4B1C71] mb-4">
                {t.followUs}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={instagramUrl}
                  className="w-10 h-10 rounded-xl bg-[#E4405F]/10 text-[#E4405F] flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
