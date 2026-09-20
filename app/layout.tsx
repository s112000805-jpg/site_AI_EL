import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FLOW AI 學院｜成人 AI 四階學習計畫", template: "%s｜FLOW AI 學院" },
  description: "從 AI 啟蒙、AI 應用、AI 工作流到 AI 系統管理的成人基礎課程。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('flow-ai-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()` }} /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
