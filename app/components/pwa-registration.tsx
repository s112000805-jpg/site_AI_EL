"use client";

import { useEffect } from "react";

/** 僅註冊靜態資源快取；個人頁面與 API 永遠走網路。 */
export function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA 是漸進增強；註冊失敗時網站仍可正常瀏覽。
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
