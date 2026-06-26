import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft, Shield } from "lucide-react";

export default function Login({ mode = "user" }: { mode?: "user" | "admin" }) {
  const { lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const isAdmin = mode === "admin";
  const ar = lang === "ar";

  // Shared
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

  // Admin login state
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPw, setAdminPw] = useState("");

  // User login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");

  const adminLogin = trpc.auth.localAdminLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin");
    },
    onError: () => toast.error(ar ? "بيانات الدخول غير صحيحة" : "Invalid credentials"),
  });

  const userLogin = trpc.auth.localUserLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/");
      toast.success(ar ? "مرحباً بك!" : "Welcome back!");
    },
    onError: (err) => toast.error(err.message === "Invalid credentials" ? (ar ? "بريد أو كلمة مرور غير صحيحة" : "Invalid email or password") : err.message),
  });

  const register = trpc.auth.localUserRegister.useMutation({
    onSuccess: () => {
      toast.success(ar ? "تم إنشاء الحساب! سجّل دخولك الآن." : "Account created! Please login.");
      setTab("login");
      setEmail(regEmail);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F3E8FF] to-[#FCF8FF] px-4 ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#4B1C71]/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#4B1C71] to-[#7f4ca5] px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {isAdmin ? <Shield className="w-7 h-7 text-white" /> : <LogIn className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-xl font-bold text-white">
              {isAdmin ? (ar ? "لوحة التحكم" : "Admin Panel") : (ar ? "مرحباً بك" : "Welcome Back")}
            </h1>
            <p className="text-white/70 text-sm mt-1">Hi Line Pro Care</p>
          </div>

          <div className="p-8">
            {/* Admin Login */}
            {isAdmin && (
              <form
                className="space-y-4"
                onSubmit={(e) => { e.preventDefault(); adminLogin.mutate({ username: adminUser, password: adminPw }); }}
              >
                <div>
                  <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "اسم المستخدم" : "Username"}</label>
                  <input
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "كلمة المرور" : "Password"}</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={adminPw}
                      onChange={(e) => setAdminPw(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors pr-12"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={adminLogin.isPending}
                  className="w-full py-3 bg-[#4B1C71] text-white font-semibold rounded-2xl hover:bg-[#3a1558] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adminLogin.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {ar ? "دخول" : "Sign In"}
                </button>
              </form>
            )}

            {/* User Login / Register */}
            {!isAdmin && (
              <>
                {/* Tabs */}
                <div className="flex bg-[#F3E8FF] rounded-2xl p-1 mb-6">
                  {(["login", "register"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        tab === t ? "bg-white text-[#4B1C71] shadow-sm" : "text-[#6F6178]"
                      }`}
                    >
                      {t === "login" ? (ar ? "تسجيل دخول" : "Login") : (ar ? "إنشاء حساب" : "Register")}
                    </button>
                  ))}
                </div>

                {/* Login Form */}
                {tab === "login" && (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => { e.preventDefault(); userLogin.mutate({ email, password }); }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "البريد الإلكتروني" : "Email"}</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "كلمة المرور" : "Password"}</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors pr-12"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={userLogin.isPending}
                      className="w-full py-3 bg-[#4B1C71] text-white font-semibold rounded-2xl hover:bg-[#3a1558] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {userLogin.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                      {ar ? "دخول" : "Sign In"}
                    </button>
                  </form>
                )}

                {/* Register Form */}
                {tab === "register" && (
                  <form
                    className="space-y-4"
                    onSubmit={(e) => { e.preventDefault(); register.mutate({ name: regName, email: regEmail, password: regPw }); }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "الاسم الكامل" : "Full Name"}</label>
                      <input
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={ar ? "محمد أحمد" : "John Doe"}
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "البريد الإلكتروني" : "Email"}</label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A0533] mb-1.5">{ar ? "كلمة المرور (8 أحرف+)" : "Password (8+ chars)"}</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          value={regPw}
                          onChange={(e) => setRegPw(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E7D8F1] text-sm focus:outline-none focus:border-[#B57EDC] focus:ring-2 focus:ring-[#B57EDC]/20 transition-colors pr-12"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={register.isPending}
                      className="w-full py-3 bg-[#4B1C71] text-white font-semibold rounded-2xl hover:bg-[#3a1558] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {register.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {ar ? "إنشاء حساب" : "Create Account"}
                    </button>
                  </form>
                )}
              </>
            )}

            <Link to="/" className="flex items-center justify-center gap-2 mt-6 text-sm text-[#9CA3AF] hover:text-[#4B1C71] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {ar ? "العودة للمتجر" : "Back to store"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
