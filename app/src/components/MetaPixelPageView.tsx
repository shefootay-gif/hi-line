import { useEffect } from "react";
import { useLocation } from "react-router";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __metaPixelLastPageView?: string;
  }
}

export function MetaPixelPageView() {
  const location = useLocation();
  const pageKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    if (!window.fbq || window.__metaPixelLastPageView === pageKey) return;
    window.fbq("track", "PageView");
    window.__metaPixelLastPageView = pageKey;
  }, [pageKey]);

  return null;
}
