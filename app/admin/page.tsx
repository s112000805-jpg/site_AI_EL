import { redirect } from "next/navigation";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { filterAdminLearners, getAdminLearners, type LearnerStatusFilter, totalLessonCount } from "@/db/progress";
import { formatDuration } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";
import Link from "next/link";
import { FontSizeControl } from "@/app/components/font-size-control";

export const dynamic = "force-dynamic";

const validStatuses = new Set<LearnerStatusFilter>(["all", "completed", "in_progress", "not_started"]);

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireChatGPTUser("/admin");
  if (!isAdminUser(user)) redirect("/progress");
  const params = await searchParams;
  const query = (params.q ?? "").slice(0, 100);
  const requestedStatus = params.status as LearnerStatusFilter;
  const status = validStatuses.has(requestedStatus) ? requestedStatus : "all";
  const allLearners = await getAdminLearners();
  const learners = filterAdminLearners(allLearners, query, status);
  const completed = allLearners.reduce((sum, row) => sum + row.completed_count, 0);
  const watched = allLearners.reduce((sum, row) => sum + row.watched_seconds, 0);
  const avg = allLearners.length && totalLessonCount ? Math.round((completed / (allLearners.length * totalLessonCount)) * 100) : 0;
  const exportParams = new URLSearchParams();
  if (query) exportParams.set("q", query);
  if (status !== "all") exportParams.set("status", status);

  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav><Link href="/">返回課程</Link><Link href="/progress">我的成果</Link><FontSizeControl /><a href={chatGPTSignOutPath("/")} target="_top">登出</a></nav></header>
    <section className="dashboard-title"><div><p className="eyebrow">MANAGER DASHBOARD</p><h1>學習管理報告</h1><p>掌握學員完成進度、學習中的課程與總觀看時間。</p></div></section>
    <section className="metric-grid"><article><span>學員人數</span><b>{allLearners.length}<small> 人</small></b></article><article><span>完成課次</span><b>{completed}<small> 次</small></b></article><article><span>平均完成率</span><b>{avg}%</b></article><article><span>總學習時間</span><b>{formatDuration(watched)}</b></article></section>
    <section className="report-panel admin-panel">
      <div className="panel-heading"><div><h2>學員明細</h2><span>共 {totalLessonCount} 堂影片課</span></div><a className="export-button" href={`/api/admin/export?${exportParams.toString()}`}>下載目前結果 CSV</a></div>
      <form className="report-filters" method="get">
        <label><span>搜尋學員</span><input name="q" defaultValue={query} placeholder="輸入姓名或 Email" /></label>
        <label><span>整體狀態</span><select name="status" defaultValue={status}><option value="all">全部狀態</option><option value="completed">全部完成</option><option value="in_progress">學習中</option><option value="not_started">尚未開始</option></select></label>
        <button type="submit">套用篩選</button><Link href="/admin">清除</Link>
      </form>
      <p className="result-count">顯示 {learners.length} / {allLearners.length} 位學員</p>
      <div className="table-wrap"><table><thead><tr><th>學員</th><th>已完成</th><th>學習中</th><th>尚未學習</th><th>總時間</th><th>最近活動</th><th>報告</th></tr></thead><tbody>{learners.length ? learners.map((row) => <tr key={row.user_id}><td><b>{row.display_name}</b><small>{row.email}</small></td><td>{row.completed_count}</td><td>{row.in_progress_count}</td><td>{Math.max(0, totalLessonCount - row.completed_count - row.in_progress_count)}</td><td>{formatDuration(row.watched_seconds)}</td><td>{formatTaipeiDate(row.last_activity)}</td><td><Link className="table-link" href={`/admin/learners/${encodeURIComponent(row.user_id)}`}>查看</Link></td></tr>) : <tr><td colSpan={7} className="empty-row">目前沒有符合條件的學員。</td></tr>}</tbody></table></div>
    </section>
  </main>;
}

function formatTaipeiDate(value: string) {
  const iso = value.endsWith("Z") || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}
