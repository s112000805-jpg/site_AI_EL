"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const VISITOR_KEY = "flow-ai-visitor-id";
const SESSION_KEY = "flow-ai-session-id";
const LAST_VIEW_KEY = "flow-ai-last-view";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    try {
      // 僅記錄路徑，不保存查詢參數，避免搜尋字詞或其他輸入被寫入分析資料。
      const path = pathname;
      const now = Date.now();
      const previous = sessionStorage.getItem(LAST_VIEW_KEY)?.split("|") ?? [];
      if (previous[0] === path && now - Number(previous[1] ?? 0) < 5000) return;
      sessionStorage.setItem(LAST_VIEW_KEY, `${path}|${now}`);

      const visitorId = getOrCreateId(localStorage, VISITOR_KEY);
      const sessionId = getOrCreateId(sessionStorage, SESSION_KEY);
      void fetch("/api/visits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId, sessionId, path, referrer: document.referrer }),
        keepalive: true,
      }).then((response) => {
        if (response.ok) window.dispatchEvent(new Event("flow-ai:visit-recorded"));
      }).catch(() => {
        // 網路暫時不可用時，不影響課程瀏覽。
      });
    } catch {
      // 隱私模式或儲存空間不可用時，網站內容仍應正常使用。
    }
  }, [pathname]);

  return null;
}

function getOrCreateId(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
}
