export type StorefrontLocale = "ar" | "en";

export const localeFromPath = (pathname: string): StorefrontLocale | null => {
  const locale = pathname.split("/")[1];
  return locale === "ar" || locale === "en" ? locale : null;
};

export const pathForLocale = (
  pathname: string,
  locale: StorefrontLocale
) => {
  const currentLocale = localeFromPath(pathname);
  const pathWithoutLocale = currentLocale
    ? pathname.slice(currentLocale.length + 1) || "/"
    : pathname;
  return `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
};

export const pathWithoutLocale = (pathname: string) => {
  const locale = localeFromPath(pathname);
  return locale ? pathname.slice(locale.length + 1) || "/" : pathname;
};
