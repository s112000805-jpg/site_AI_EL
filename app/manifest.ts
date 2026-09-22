import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FLOW AI 學院",
    short_name: "FLOW AI",
    description: "從 AI 啟蒙到 AI 系統管理的四階段學習網站。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09233f",
    orientation: "any",
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
