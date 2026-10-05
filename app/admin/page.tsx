import { redirect } from "next/navigation";
import { requireChatGPTUser, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { filterAdminLearners, getAdminLearners, type LearnerStatusFilter, totalLessonCount } from "@/db/progress";
import { formatDuration } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";
import { getVisitorDashboard } from "@/db/visitors";
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
  const [allLearners, visitorDashboard] = await Promise.all([getAdminLearners(), getVisitorDashboard()]);
  const learners = filterAdminLearners(allLearners, query, status);
  const completed = allLearners.reduce((sum, row) => sum + row.completed_count, 0);
  const watched = allLearners.reduce((sum, row) => sum + row.watched_seconds, 0);
  const avg = allLearners.length && totalLessonCount ? Math.round((completed / (allLearners.length * totalLessonCount)) * 100) : 0;
  const exportParams = new URLSearchParams();
  if (query) exportParams.set("q", query);
  if (status !== "all") exportParams.set("status", status);

  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand" href="/"><span>F</span><b>FLOW AI 學院</b></Link><nav><Link href="/">返回課程</Link><Link href="/admin/messages">留言審核</Link><Link href="/progress">我的成果</Link><FontSizeControl /><a href={chatGPTSignOutPath("/")} target="_top">登出</a></nav></header>
    <section className="dashboard-title"><div><p className="eyebrow">MANAGER DASHBOARD</p><h1>學習管理報告</h1><p>掌握學員完成進度、學習中的課程與總觀看時間。</p></div></section>
    <section className="metric-grid"><article><span>學員人數</span><b>{allLearners.length}<small> 人</small></b></article><article><span>完成課次</span><b>{completed}<small> 次</small></b></article><article><span>平均完成率</span><b>{avg}%</b></article><article><span>總學習時間</span><b>{formatDuration(watched)}</b></article></section>
    <section className="visitor-dashboard-section">
      <div className="panel-heading"><div><h2>網站訪客紀錄</h2><span>匿名統計，不保存完整 IP、姓名或 Email</span></div></div>
      <div className="metric-grid visitor-metrics"><article><span>今日訪客</span><b>{visitorDashboard.summary.todayVisitors}<small> 人</small></b></article><article><span>今日瀏覽</span><b>{visitorDashboard.summary.todayPageViews}<small> 次</small></b></article><article><span>累計訪客</span><b>{visitorDashboard.summary.totalVisitors}<small> 人</small></b></article><article><span>累計瀏覽</span><b>{visitorDashboard.summary.totalPageViews}<small> 次</small></b></article></div>
      <div className="visitor-report-grid">
        <section className="report-panel visitor-panel"><div className="panel-heading"><div><h2>熱門頁面</h2><span>最近 30 天</span></div></div><div className="table-wrap"><table><thead><tr><th>頁面</th><th>訪客</th><th>瀏覽</th></tr></thead><tbody>{visitorDashboard.popularPages.length ? visitorDashboard.popularPages.map((row) => <tr key={row.path}><td data-label="頁面"><b>{formatPageName(row.path)}</b><small>{row.path}</small></td><td data-label="訪客">{row.visitors}</td><td data-label="瀏覽">{row.page_views}</td></tr>) : <tr><td colSpan={3} className="empty-row">尚未累積訪客資料。</td></tr>}</tbody></table></div></section>
        <section className="report-panel visitor-panel"><div className="panel-heading"><div><h2>最近造訪</h2><span>最新 50 筆</span></div></div><div className="table-wrap"><table><thead><tr><th>時間</th><th>匿名訪客</th><th>頁面</th><th>裝置</th><th>來源</th></tr></thead><tbody>{visitorDashboard.recentVisits.length ? visitorDashboard.recentVisits.map((row) => <tr key={row.id}><td data-label="時間">{formatTaipeiDate(row.visited_at)}</td><td data-label="匿名訪客"><b>{row.visitor_id}</b><small>{row.is_authenticated ? "已登入" : "訪客"}</small></td><td data-label="頁面">{formatPageName(row.path)}</td><td data-label="裝置">{deviceLabel(row.device_type)}</td><td data-label="來源">{row.referrer_host ?? "直接進入"}</td></tr>) : <tr><td colSpan={5} className="empty-row">尚未累積訪客資料。</td></tr>}</tbody></table></div></section>
      </div>
    </section>
    <section className="report-panel admin-panel">
      <div className="panel-heading"><div><h2>學員明細</h2><span>共 {totalLessonCount} 堂影片課</span></div><div className="export-actions"><a className="export-button secondary" href="/api/admin/export?type=wrong">下載錯題 CSV</a><a className="export-button" href={`/api/admin/export?${exportParams.toString()}`}>下載目前結果 CSV</a></div></div>
      <form className="report-filters" method="get">
        <label><span>搜尋學員</span><input name="q" defaultValue={query} placeholder="輸入姓名或 Email" /></label>
        <label><span>整體狀態</span><select name="status" defaultValue={status}><option value="all">全部狀態</option><option value="completed">全部完成</option><option value="in_progress">學習中</option><option value="not_started">尚未開始</option></select></label>
        <button type="submit">套用篩選</button><Link href="/admin">清除</Link>
      </form>
      <p className="result-count">顯示 {learners.length} / {allLearners.length} 位學員</p>
      <div className="table-wrap"><table><thead><tr><th>學員</th><th>已完成</th><th>學習中</th><th>尚未學習</th><th>總時間</th><th>最近活動</th><th>報告</th></tr></thead><tbody>{learners.length ? learners.map((row) => <tr key={row.user_id}><td data-label="學員"><b>{row.display_name}</b><small>{row.email}</small></td><td data-label="已完成">{row.completed_count}</td><td data-label="學習中">{row.in_progress_count}</td><td data-label="尚未學習">{Math.max(0, totalLessonCount - row.completed_count - row.in_progress_count)}</td><td data-label="總時間">{formatDuration(row.watched_seconds)}</td><td data-label="最近活動">{formatTaipeiDate(row.last_activity)}</td><td data-label="報告"><Link className="table-link" href={`/admin/learners/${encodeURIComponent(row.user_id)}`}>查看</Link></td></tr>) : <tr><td colSpan={7} className="empty-row">目前沒有符合條件的學員。</td></tr>}</tbody></table></div>
    </section>
  </main>;
}

function formatTaipeiDate(value: string) {
  const iso = value.endsWith("Z") || /[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

function formatPageName(path: string) {
  const pathname = path.split("?")[0];
  if (pathname === "/") return "課程首頁";
  if (pathname === "/quizzes") return "測驗題庫";
  if (pathname === "/progress") return "學習成果";
  return pathname;
}

function deviceLabel(device: "desktop" | "mobile" | "tablet") {
  return device === "mobile" ? "手機" : device === "tablet" ? "平板" : "電腦";
}
