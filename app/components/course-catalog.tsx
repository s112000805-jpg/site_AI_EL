"use client";

import { useMemo, useState } from "react";
import { ExternalLink, PlayCircle, Search, X } from "lucide-react";
import { courseStages } from "@/lib/courses";

const contentTypeLabels = {
  long: "一般影片",
  short: "Shorts／短影音",
} as const;

const catalogRows = courseStages.flatMap((stage, stageIndex) =>
  stage.lessons.map((lesson) => ({ stage, stageIndex, lesson })),
);
const filterTags = Array.from(new Set(catalogRows.flatMap(({ lesson }) => lesson.tags ?? [])));

export function CourseCatalog() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeContentType, setActiveContentType] = useState<"long" | "short" | null>(null);
  const normalized = query.trim().toLocaleLowerCase("zh-Hant");
  const rows = useMemo(() => catalogRows.filter(({ stage, lesson }) => {
    const matchesTag = !activeTag || lesson.tags?.includes(activeTag);
    const matchesContentType = !activeContentType || lesson.contentType === activeContentType;
    if (!matchesTag || !matchesContentType) return false;
    if (!normalized) return true;
    return [stage.className, stage.title, lesson.code, lesson.title, lesson.description, lesson.kind, contentTypeLabels[lesson.contentType], ...(lesson.tags ?? [])]
      .some((value) => value.toLocaleLowerCase("zh-Hant").includes(normalized));
  }), [activeContentType, activeTag, normalized]);
  const stageRowCounts = new Map<string, number>();
  for (const { stage } of rows) {
    stageRowCounts.set(stage.id, (stageRowCounts.get(stage.id) ?? 0) + 1);
  }

  return (
    <section id="course-map" className="catalog-section" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div><p className="eyebrow">COURSE CATALOG</p><h2 id="catalog-title">完整課程地圖</h2><p>依階段查看課程編號、影片重點與觀看連結。</p></div>
        <label className="course-search"><Search aria-hidden="true" /><span className="sr-only">搜尋課程</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋課程名稱、編號或主題" />{query && <button type="button" onClick={() => setQuery("")} aria-label="清除搜尋"><X aria-hidden="true" /></button>}</label>
      </div>
      <div className="course-filters" role="group" aria-label="課程主題篩選">
        <span>主題篩選</span>
        <button type="button" className={!activeTag ? "is-active" : ""} aria-pressed={!activeTag} onClick={() => setActiveTag(null)}>全部</button>
        {filterTags.map((tag) => <button type="button" className={activeTag === tag ? "is-active" : ""} aria-pressed={activeTag === tag} onClick={() => setActiveTag(tag)} key={tag}>{tag}</button>)}
      </div>
      <div className="course-filters" role="group" aria-label="影片形式篩選">
        <span>影片形式</span>
        <button type="button" className={!activeContentType ? "is-active" : ""} aria-pressed={!activeContentType} onClick={() => setActiveContentType(null)}>全部形式</button>
        {(Object.entries(contentTypeLabels) as Array<["long" | "short", string]>).map(([contentType, label]) => <button type="button" className={activeContentType === contentType ? "is-active" : ""} aria-pressed={activeContentType === contentType} onClick={() => setActiveContentType(contentType)} key={contentType}>{label}</button>)}
      </div>
      <p className="catalog-count" aria-live="polite">顯示 {rows.length} / {courseStages.reduce((sum, stage) => sum + stage.lessons.length, 0)} 部課程影片</p>
      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead><tr><th>階段</th><th>課程編號</th><th>課程名稱</th><th>影片說明</th><th>影片連結</th></tr></thead>
          <tbody>{rows.length ? rows.map(({ stage, stageIndex, lesson }, index) => <tr key={lesson.code} aria-label={`${stage.className}｜${stage.title}・${lesson.title}`}>
            {(index === 0 || rows[index - 1].stage.id !== stage.id) && <td data-label="階段" rowSpan={stageRowCounts.get(stage.id)} className="catalog-stage-cell"><span className={`stage-badge tone-${stageIndex + 1}`}>{stage.className}<b>{stage.title}</b></span></td>}
            <td data-label="課程編號"><code>{lesson.code}</code></td>
            <td data-label="課程名稱" className="catalog-lesson-cell"><b>{lesson.title}</b><small>{lesson.kind} · {contentTypeLabels[lesson.contentType]} · {lesson.durationLabel}</small>{lesson.quizStatus === "pending" && <span className="catalog-quiz-pending">測驗準備中</span>}{lesson.tags?.length ? <div className="lesson-topic-tags">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}</td>
            <td data-label="影片說明" className="catalog-description-cell">{lesson.description}</td>
            <td data-label="影片連結" className="catalog-links-cell"><div className="catalog-links"><a href={`#lesson-${lesson.id}`}><PlayCircle aria-hidden="true" />本站觀看</a><a href={`https://youtu.be/${lesson.id}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" />YouTube</a></div></td>
          </tr>) : <tr><td colSpan={5} className="empty-row">找不到符合目前條件的課程，請調整搜尋文字或篩選標籤。</td></tr>}</tbody>
        </table>
      </div>
    </section>
  );
}
