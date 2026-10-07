"use client";

import { useEffect, useState } from "react";

type SiteStats = { visitorCount: number; learnerCount: number };

export function SiteStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/site-stats", { cache: "no-store" });
        if (!response.ok) throw new Error("Site statistics unavailable");
        const data: SiteStats = await response.json();
        if (!Number.isSafeInteger(data.visitorCount) || !Number.isSafeInteger(data.learnerCount)) {
          throw new Error("Invalid site statistics");
        }
        if (active) { setStats(data); setUnavailable(false); }
      } catch {
        if (active) setUnavailable(true);
      }
    };
    const onVisitRecorded = () => { void refresh(); };
    window.addEventListener("flow-ai:visit-recorded", onVisitRecorded);
    void refresh();
    return () => { active = false; window.removeEventListener("flow-ai:visit-recorded", onVisitRecorded); };
  }, []);

  const visitorValue = unavailable ? "暫不可用" : stats?.visitorCount.toLocaleString("zh-TW") ?? "—";
  const learnerValue = unavailable ? "暫不可用" : stats?.learnerCount.toLocaleString("zh-TW") ?? "—";

  return <section className="site-stats" aria-label="網站統計" aria-live="polite">
    <div><span>累計匿名訪客</span><strong>{visitorValue}</strong><small>以瀏覽器識別，不等於實際人數</small></div>
    <div><span>已有學習紀錄的學員</span><strong>{learnerValue}</strong><small>登入並建立學習紀錄後計入</small></div>
  </section>;
}
