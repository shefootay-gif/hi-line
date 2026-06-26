import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function ResetPassword() {
  const { lang, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetPassword = trpc.auth.resetPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(lang === "ar" ? "رابط غير صالح" : "Invalid link");
      return;
    }
    if (password !== confirmPassword) {
      toast.error(lang === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error(lang === "ar" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    try {
      await resetPassword.mutateAsync({ token, password });
      toast.success(lang === "ar" ? "تم إعادة تعيين كلمة المرور بنجاح" : "Password reset successful");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || (lang === "ar" ? "حدث خطأ" : "An error occurred"));
    }
  };

  if (!token) {
    return (
      <div className={`min-h-screen bg-[#FCF8FF] flex items-center justify-center px-4 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4B1C71] mb-2">
            {lang === "ar" ? "رابط غير صالح" : "Invalid Link"}
          </h2>
          <Link to="/forgot-password" className="text-[#B57EDC] hover:underline">
            {lang === "ar" ? "اطلب رابطاً جديداً" : "Request a new link"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FCF8FF] flex items-center justify-center pt-20 px-4 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(75,28,113,0.04)] border border-[#E7D8F1]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <h1 className="text-3xl font-bold text-[#4B1C71] tracking-tight">Hi Line</h1>
          </Link>
          <h2 className="text-2xl font-bold text-[#4B1C71] mb-2">
            {lang === "ar" ? "تعيين كلمة مرور جديدة" : "Set New Password"}
          </h2>
          <p className="text-[#6F6178]">
            {lang === "ar" 
              ? "يرجى إدخال كلمة المرور الجديدة أدناه." 
              : "Please enter your new password below."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
              {lang === "ar" ? "كلمة المرور الجديدة" : "New Password"}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                <Lock className="w-5 h-5 text-[#8D7A97]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 text-[#4B1C71] font-medium transition-shadow`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4B1C71] mb-1.5">
              {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                <Lock className="w-5 h-5 text-[#8D7A97]" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"} py-3.5 rounded-xl border border-[#E7D8F1] focus:outline-none focus:ring-2 focus:ring-[#B57EDC]/30 text-[#4B1C71] font-medium transition-shadow`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={resetPassword.isPending}
            className="w-full py-3.5 bg-[#4B1C71] text-white font-semibold rounded-xl hover:bg-[#3a1558] transition-colors shadow-lg shadow-[#4B1C71]/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {resetPassword.isPending ? "..." : (lang === "ar" ? "حفظ التغييرات" : "Save Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
