import "server-only";
import { getD1 } from "./index";

export type VisitorSummary = {
  todayVisitors: number;
  todayPageViews: number;
  totalVisitors: number;
  totalPageViews: number;
};

export type RecentVisit = {
  id: number;
  visitor_id: string;
  path: string;
  referrer_host: string | null;
  device_type: "desktop" | "mobile" | "tablet";
  is_authenticated: number;
  visited_at: string;
};

export type PopularPage = {
  path: string;
  page_views: number;
  visitors: number;
};

let visitorTablePromise: Promise<void> | null = null;

/**
 * Sites 的 D1 環境不一定會自動執行 migration，因此在首次使用時安全建立資料表。
 * CREATE IF NOT EXISTS 可重複執行，不會清除或覆蓋既有訪客資料。
 */
async function ensureVisitorTable() {
  if (!visitorTablePromise) {
    visitorTablePromise = (async () => {
      const database = getD1();
      await database.prepare(`CREATE TABLE IF NOT EXISTS visitor_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        path TEXT NOT NULL,
        referrer_host TEXT,
        device_type TEXT NOT NULL,
        is_authenticated INTEGER NOT NULL DEFAULT 0,
        visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`).run();
      await database.prepare("CREATE INDEX IF NOT EXISTS visitor_events_visited_at_idx ON visitor_events (visited_at)").run();
      await database.prepare("CREATE INDEX IF NOT EXISTS visitor_events_visitor_id_idx ON visitor_events (visitor_id)").run();
      await database.prepare("CREATE INDEX IF NOT EXISTS visitor_events_path_idx ON visitor_events (path)").run();
    })().catch((error) => {
      visitorTablePromise = null;
      throw error;
    });
  }
  await visitorTablePromise;
}

export async function recordVisit(input: {
  visitorId: string;
  sessionId: string;
  path: string;
  referrerHost: string | null;
  deviceType: RecentVisit["device_type"];
  isAuthenticated: boolean;
}) {
  await ensureVisitorTable();
  await getD1().prepare(`
    INSERT INTO visitor_events
      (visitor_id, session_id, path, referrer_host, device_type, is_authenticated)
    SELECT ?, ?, ?, ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM visitor_events
      WHERE visitor_id = ? AND session_id = ? AND path = ?
        AND visited_at >= datetime('now', '-30 seconds')
    )
  `).bind(
    input.visitorId,
    input.sessionId,
    input.path,
    input.referrerHost,
    input.deviceType,
    input.isAuthenticated ? 1 : 0,
    input.visitorId,
    input.sessionId,
    input.path,
  ).run();
}

/** 對外只提供彙總數字，不回傳任何訪客識別碼或造訪紀錄。 */
export async function getPublicVisitorCount(): Promise<number> {
  await ensureVisitorTable();
  const row = await getD1().prepare("SELECT COUNT(DISTINCT visitor_id) AS visitor_count FROM visitor_events")
    .first<{ visitor_count: number }>();
  return Number(row?.visitor_count ?? 0);
}

export async function getVisitorDashboard(): Promise<{
  summary: VisitorSummary;
  recentVisits: RecentVisit[];
  popularPages: PopularPage[];
}> {
  await ensureVisitorTable();
  const database = getD1();
  const [summaryResult, recentResult, popularResult] = await Promise.all([
    database.prepare(`
      SELECT
        COUNT(*) AS total_page_views,
        COUNT(DISTINCT visitor_id) AS total_visitors,
        SUM(CASE WHEN date(visited_at, '+8 hours') = date('now', '+8 hours') THEN 1 ELSE 0 END) AS today_page_views,
        COUNT(DISTINCT CASE WHEN date(visited_at, '+8 hours') = date('now', '+8 hours') THEN visitor_id END) AS today_visitors
      FROM visitor_events
    `).first<{ total_page_views: number; total_visitors: number; today_page_views: number; today_visitors: number }>(),
    database.prepare(`
      SELECT id, substr(visitor_id, 1, 8) AS visitor_id, path, referrer_host,
        device_type, is_authenticated, visited_at
      FROM visitor_events ORDER BY visited_at DESC, id DESC LIMIT 50
    `).all<RecentVisit>(),
    database.prepare(`
      SELECT path, COUNT(*) AS page_views, COUNT(DISTINCT visitor_id) AS visitors
      FROM visitor_events
      WHERE visited_at >= datetime('now', '-30 days')
      GROUP BY path ORDER BY page_views DESC, path ASC LIMIT 10
    `).all<PopularPage>(),
  ]);

  return {
    summary: {
      todayVisitors: Number(summaryResult?.today_visitors ?? 0),
      todayPageViews: Number(summaryResult?.today_page_views ?? 0),
      totalVisitors: Number(summaryResult?.total_visitors ?? 0),
      totalPageViews: Number(summaryResult?.total_page_views ?? 0),
    },
    recentVisits: (recentResult.results ?? []).map((row) => ({ ...row, id: Number(row.id), is_authenticated: Number(row.is_authenticated) })),
    popularPages: (popularResult.results ?? []).map((row) => ({ ...row, page_views: Number(row.page_views), visitors: Number(row.visitors) })),
  };
}
