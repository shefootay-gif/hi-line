import { createContext, useContext, useState, useCallback, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  isRTL: false,
  toggleLanguage: () => {},
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("hilang") as Language) || "en";
    }
    return "en";
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    localStorage.setItem("hilang", lang);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, isRTL, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
