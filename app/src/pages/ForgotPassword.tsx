import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function ForgotPassword() {
  const { lang, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const forgotPassword = trpc.auth.forgotPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(lang === "ar" ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }
    try {
      await forgotPassword.mutateAsync({ email });
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
    }
  };

  return (
    <div className={`min-h-screen bg-[#FCF8FF] flex items-center justify-center pt-20 px-4 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(75,28,113,0.04)] border border-[#E7D8F1]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <h1 className="text-3xl font-bold text-[#4B1C71] tracking-tight">Hi Line</h1>
          </Link>
          <h2 className="text-2xl font-bold text-[#4B1C71] mb-2">
            {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </h2>
          <p className="text-[#6F6178]">
            {lang === "ar" 
              ? "لا تقلق، سنرسل لك رابطاً لإعادة تعيين كلمة المرور." 
              : "No worries, we'll send you reset instructions."}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-[#F7ECFF] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#B57EDC]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#4B1C71] mb-2">
                {lang === "ar" ? "تحقق من بريدك الإلكتروني" : "Check your email"}
              </h3>
              <p className="text-[#6F6178] text-sm">
                {lang === "ar" 
                  ? "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى " 
                  : "We sent a password reset link to "}
                <span className="font-semibold text-[#4B1C71]">{email}</span>
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B1C71] hover:text-[#B57EDC] transition-colors"
            >
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to login"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
                {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                  <Mail className="w-5 h-5 text-[#8D7A97]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 text-[#4B1C71] font-medium transition-shadow`}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full py-3.5 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors shadow-lg shadow-[#4B1C71]/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {forgotPassword.isPending ? "..." : (lang === "ar" ? "إرسال الرابط" : "Reset Password")}
            </button>
            
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F6178] hover:text-[#4B1C71] transition-colors"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                {lang === "ar" ? "العودة لتسجيل الدخول" : "Back to login"}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
