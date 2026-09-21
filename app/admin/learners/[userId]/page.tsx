import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { getAdminLearnerReport } from "@/db/progress";
import { courseStages, formatDuration, lessons } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";
import Link from "next/link";
import { FontSizeControl } from "@/app/components/font-size-control";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LearnerReportPage({ params }: { params: Promise<{ userId: string }> }) {
  const admin = await requireChatGPTUser("/admin");
  if (!isAdminUser(admin)) redirect("/progress");
  const { userId } = await params;
  const report = await getAdminLearnerReport(userId);
  if (!report) notFound();
  const progressMap = new Map(report.progress.map((row) => [row.lesson_id, row]));
  const completed = report.progress.filter((row) => row.status === "completed").length;
  const watched = report.progress.reduce((sum, row) => sum + Number(row.watched_seconds), 0);
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav><Link href="/admin">返回後台</Link><Link href="/progress">我的成果</Link><FontSizeControl /><a href={chatGPTSignOutPath("/")} target="_top">登出</a></nav></header>
    <section className="dashboard-title"><div><p className="eyebrow">LEARNER REPORT</p><h1>{report.learner.display_name}</h1><p>{report.learner.email} · 個別學習報告</p></div><a className="export-button" href={`/api/admin/export?userId=${encodeURIComponent(report.learner.user_id)}`}>下載個人報告 CSV</a></section>
    <section className="metric-grid"><article><span>整體完成率</span><b>{percent}%</b><div className="progress-bar"><i style={{ width: `${percent}%` }} /></div></article><article><span>已完成</span><b>{completed}<small> / {lessons.length} 課</small></b></article><article><span>學習中</span><b>{report.progress.filter((row) => row.status === "in_progress").length}<small> 課</small></b></article><article><span>總學習時間</span><b>{formatDuration(watched)}</b></article></section>
    <section className="report-panel"><div className="panel-heading"><h2>逐課明細</h2><span>觀看達 80% 即完成</span></div>
      {courseStages.map((stage) => <div className="report-stage" key={stage.id}><div className="report-stage-title"><span>{stage.number}</span><div><small>{stage.className}</small><h3>{stage.title}</h3></div></div>
        {stage.lessons.length ? <div className="report-lessons">{stage.lessons.map((lesson) => { const row = progressMap.get(lesson.id); const status = row?.status ?? "not_started"; const label = status === "completed" ? "已完成" : status === "in_progress" ? "學習中" : "尚未學習"; const lessonPercent = Math.min(100, Math.round(((row?.watched_seconds ?? 0) / lesson.durationSeconds) * 100)); return <article key={lesson.id}><div><span className={`status ${status}`}>{label}</span><h4>{lesson.code} · {lesson.title}</h4><p>課程長度 {lesson.durationLabel} · 已觀看 {formatDuration(row?.watched_seconds ?? 0)} · 播放位置 {formatClock(row?.last_position_seconds ?? 0)} · {lessonPercent}%</p></div></article>; })}</div> : <p className="empty-row">課程內容準備中</p>}
      </div>)}
    </section>
  </main>;
}

function formatClock(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
