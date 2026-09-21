"use client";

import { useSyncExternalStore } from "react";

type FontSize = "small" | "medium" | "large";

const fontSizes: Array<{ value: FontSize; label: string; description: string }> = [
  { value: "small", label: "小", description: "使用小字體" },
  { value: "medium", label: "中", description: "使用中字體" },
  { value: "large", label: "大", description: "使用大字體" },
];

const fontSizeChangeEvent = "flow-ai-font-size-change";

function getFontSize(): FontSize {
  const current = document.documentElement.dataset.fontSize;
  return current === "small" || current === "large" ? current : "medium";
}

function subscribeToFontSize(onChange: () => void) {
  window.addEventListener(fontSizeChangeEvent, onChange);
  return () => window.removeEventListener(fontSizeChangeEvent, onChange);
}

function applyFontSize(next: FontSize) {
  document.documentElement.dataset.fontSize = next;
  window.localStorage.setItem("flow-ai-font-size", next);
  window.dispatchEvent(new Event(fontSizeChangeEvent));
}

/** 字體偏好只儲存在使用者裝置，不會寫入學習紀錄。 */
export function FontSizeControl() {
  const fontSize = useSyncExternalStore(subscribeToFontSize, getFontSize, () => "medium");

  return (
    <fieldset className="font-size-control" aria-label="字體大小">
      <legend className="sr-only">選擇網站字體大小</legend>
      {fontSizes.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={fontSize === option.value}
          aria-label={option.description}
          title={option.description}
          onClick={() => applyFontSize(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
