"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const themeChangeEvent = "flow-ai-theme-change";

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener(themeChangeEvent, onChange);
  return () => window.removeEventListener(themeChangeEvent, onChange);
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  window.localStorage.setItem("flow-ai-theme", next);
  window.dispatchEvent(new Event(themeChangeEvent));
}

/** 閱讀模式只儲存在使用者裝置，不會寫入學習紀錄。 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, () => "light");

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    applyTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme === "light" ? "切換為夜間閱讀模式" : "切換為白天閱讀模式"} title={theme === "light" ? "夜間模式" : "白天模式"}>
      {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
      <span>{theme === "light" ? "夜間" : "白天"}</span>
    </button>
  );
}
