import { MobileNavigation } from "@/app/components/mobile-navigation";
import { PwaRegistration } from "@/app/components/pwa-registration";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FLOW AI 學院｜成人 AI 四階學習計畫", template: "%s｜FLOW AI 學院" },
  description: "從 AI 啟蒙、AI 應用、AI 工作流到 AI 系統管理的成人基礎課程。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FLOW AI",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#09233f" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1b29" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var r=document.documentElement;var t=localStorage.getItem('flow-ai-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';r.dataset.theme=t;var f=localStorage.getItem('flow-ai-font-size');r.dataset.fontSize=f==='small'||f==='large'?f:'medium'}catch(e){}})()` }} /></head>
      <body className="antialiased">
        {children}
        <MobileNavigation />
        <PwaRegistration />
      </body>
    </html>
  );
}
