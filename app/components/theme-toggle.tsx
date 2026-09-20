"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

/** 閱讀模式只儲存在使用者裝置，不會寫入學習紀錄。 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("flow-ai-theme", next);
    setTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "light" ? "切換為夜間閱讀模式" : "切換為白天閱讀模式"} title={theme === "light" ? "夜間模式" : "白天模式"}>
      {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
      <span>{theme === "light" ? "夜間" : "白天"}</span>
    </button>
  );
}
