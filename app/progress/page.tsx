import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { getUserProgress } from "@/db/progress";
import { courseStages, formatDuration, lessons } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireChatGPTUser("/progress");
  const rows = await getUserProgress(user);
  const progressMap = new Map(rows.map((row) => [row.lesson_id, row]));
  const completed = rows.filter((row) => row.status === "completed").length;
  const inProgress = rows.filter((row) => row.status === "in_progress").length;
  const watched = rows.reduce((sum, row) => sum + Number(row.watched_seconds), 0);
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((lesson) => progressMap.get(lesson.id)?.status !== "completed");
  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav><Link href="/">返回課程</Link>{isAdminUser(user) && <Link href="/admin">管理後台</Link>}<a href={chatGPTSignOutPath("/")} target="_top">登出</a></nav></header>
    <section className="dashboard-title"><div><p className="eyebrow">LEARNING REPORT</p><h1>{user.displayName} 的學習成果</h1><p>你的課程完成狀態與實際影片觀看時間會自動更新。</p></div>{nextLesson && <a className="primary-action" href={`/#lesson-${nextLesson.id}`}>繼續學習</a>}</section>
    <section className="metric-grid"><article><span>整體完成率</span><b>{percent}%</b><div className="progress-bar"><i style={{ width: `${percent}%` }} /></div></article><article><span>已完成</span><b>{completed}<small> / {lessons.length} 課</small></b></article><article><span>學習中</span><b>{inProgress}<small> 課</small></b></article><article><span>總學習時間</span><b>{formatDuration(watched)}</b></article></section>
    <section className="report-panel"><div className="panel-heading"><h2>課程進度</h2><span>觀看達 80% 即完成</span></div>
      {courseStages.map((stage) => <div className="report-stage" key={stage.id}><div className="report-stage-title"><span>{stage.number}</span><div><small>{stage.className}</small><h3>{stage.title}</h3></div></div>
        {stage.lessons.length ? <div className="report-lessons">{stage.lessons.map((lesson) => { const row = progressMap.get(lesson.id); const status = row?.status ?? "not_started"; const statusLabel = status === "completed" ? "已完成" : status === "in_progress" ? "學習中" : "尚未學習"; const lessonPercent = Math.min(100, Math.round(((row?.watched_seconds ?? 0) / lesson.durationSeconds) * 100)); return <article key={lesson.id}><div><span className={`status ${status}`}>{statusLabel}</span><h4>{lesson.code} · {lesson.title}</h4><p>課程長度 {lesson.durationLabel} · 已觀看 {formatDuration(row?.watched_seconds ?? 0)} · {lessonPercent}%</p></div><a href={`/#lesson-${lesson.id}`}>{status === "not_started" ? "開始" : status === "completed" ? "複習" : "繼續"}</a></article>; })}</div> : <p className="empty-row">課程內容準備中</p>}
      </div>)}
    </section>
  </main>;
}
