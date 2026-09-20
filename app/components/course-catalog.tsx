"use client";

import { useMemo, useState } from "react";
import { ExternalLink, PlayCircle, Search, X } from "lucide-react";
import { courseStages } from "@/lib/courses";

export function CourseCatalog() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("zh-Hant");
  const rows = useMemo(() => courseStages.flatMap((stage, stageIndex) => stage.lessons.map((lesson) => ({ stage, stageIndex, lesson }))).filter(({ stage, lesson }) => {
    if (!normalized) return true;
    return [stage.className, stage.title, lesson.code, lesson.title, lesson.description, lesson.kind].some((value) => value.toLocaleLowerCase("zh-Hant").includes(normalized));
  }), [normalized]);

  return (
    <section id="course-map" className="catalog-section" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div><p className="eyebrow">COURSE CATALOG</p><h2 id="catalog-title">完整課程地圖</h2><p>依階段查看課程編號、影片重點與觀看連結。</p></div>
        <label className="course-search"><Search aria-hidden="true" /><span className="sr-only">搜尋課程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋課程名稱、編號或主題" />{query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜尋"><X aria-hidden="true" /></button>}</label>
      </div>
      <p className="catalog-count" aria-live="polite">顯示 {rows.length} / {courseStages.reduce((sum, stage) => sum + stage.lessons.length, 0)} 部課程影片</p>
      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead><tr><th>階段</th><th>課程編號</th><th>課程名稱</th><th>影片說明</th><th>影片連結</th></tr></thead>
          <tbody>{rows.length ? rows.map(({ stage, stageIndex, lesson }) => <tr key={lesson.code}>
            <td data-label="階段"><span className={`stage-badge tone-${stageIndex + 1}`}>{stage.className}<b>{stage.title}</b></span></td>
            <td data-label="課程編號"><code>{lesson.code}</code></td>
            <td data-label="課程名稱"><b>{lesson.title}</b><small>{lesson.kind} · {lesson.durationLabel}</small></td>
            <td data-label="影片說明">{lesson.description}</td>
            <td data-label="影片連結"><div className="catalog-links"><a href={`#lesson-${lesson.id}`}><PlayCircle aria-hidden="true" />本站觀看</a><a href={`https://youtu.be/${lesson.id}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />YouTube</a></div></td>
          </tr>) : <tr><td colSpan={5} className="empty-row">找不到符合「{query}」的課程，請改用其他關鍵字。</td></tr>}</tbody>
        </table>
      </div>
    </section>
  );
}
