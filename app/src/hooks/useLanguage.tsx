import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  localeFromPath,
  pathForLocale,
  storefrontEntryLocale,
  type StorefrontLocale,
} from "@/lib/localeRouting";

type Language = StorefrontLocale;

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
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>(() => {
    return localeFromPath(location.pathname) ?? storefrontEntryLocale(
      location.pathname,
      typeof window === "undefined" ? null : localStorage.getItem("hilang"),
    );
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    const pathLocale = localeFromPath(location.pathname);
    if (pathLocale && pathLocale !== lang) setLang(pathLocale);
  }, [lang, location.pathname]);

  useEffect(() => {
    localStorage.setItem("hilang", lang);
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const toggleLanguage = useCallback(() => {
    const nextLanguage = lang === "en" ? "ar" : "en";
    setLang(nextLanguage);
    navigate(
      {
        pathname: pathForLocale(location.pathname, nextLanguage),
        search: location.search,
        hash: location.hash,
      },
      { replace: true }
    );
  }, [lang, location.hash, location.pathname, location.search, navigate]);

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    navigate(
      {
        pathname: pathForLocale(location.pathname, newLang),
        search: location.search,
        hash: location.hash,
      },
      { replace: true }
    );
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <LanguageContext.Provider value={{ lang, isRTL, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
