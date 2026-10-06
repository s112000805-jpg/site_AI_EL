import "server-only";
import { getD1 } from "./index";

export type VisitorSummary = {
  todayVisitors: number;
  todayPageViews: number;
  rangeVisitors: number;
  rangePageViews: number;
};

export type VisitorDateRange = {
  from: string;
  to: string;
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

export type DailyVisitorTrend = {
  date: string;
  page_views: number;
  visitors: number;
};

export type VisitorExportRow = RecentVisit & {
  session_id: string;
};

const RETENTION_DAYS = 90;

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
  const database = getD1();
  await database.prepare(`
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

  // 寫入後同步執行保險清理；即使排程暫時中斷，也不會無限保留舊資料。
  await cleanupExpiredVisitorEvents(database);
}

export async function getVisitorDashboard(range: VisitorDateRange): Promise<{
  summary: VisitorSummary;
  recentVisits: RecentVisit[];
  popularPages: PopularPage[];
  dailyTrend: DailyVisitorTrend[];
}> {
  await ensureVisitorTable();
  const database = getD1();
  await cleanupExpiredVisitorEvents(database);
  const [summaryResult, recentResult, popularResult, trendResult] = await Promise.all([
    database.prepare(`
      SELECT
        SUM(CASE WHEN visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours') THEN 1 ELSE 0 END) AS range_page_views,
        COUNT(DISTINCT CASE WHEN visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours') THEN visitor_id END) AS range_visitors,
        SUM(CASE WHEN date(visited_at, '+8 hours') = date('now', '+8 hours') THEN 1 ELSE 0 END) AS today_page_views,
        COUNT(DISTINCT CASE WHEN date(visited_at, '+8 hours') = date('now', '+8 hours') THEN visitor_id END) AS today_visitors
      FROM visitor_events
    `).bind(range.from, range.to, range.from, range.to).first<{ range_page_views: number; range_visitors: number; today_page_views: number; today_visitors: number }>(),
    database.prepare(`
      SELECT id, substr(visitor_id, 1, 8) AS visitor_id, path, referrer_host,
        device_type, is_authenticated, visited_at
      FROM visitor_events
      WHERE visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours')
      ORDER BY visited_at DESC, id DESC LIMIT 50
    `).bind(range.from, range.to).all<RecentVisit>(),
    database.prepare(`
      SELECT path, COUNT(*) AS page_views, COUNT(DISTINCT visitor_id) AS visitors
      FROM visitor_events
      WHERE visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours')
      GROUP BY path ORDER BY page_views DESC, path ASC LIMIT 10
    `).bind(range.from, range.to).all<PopularPage>(),
    database.prepare(`
      SELECT date(visited_at, '+8 hours') AS date,
        COUNT(*) AS page_views,
        COUNT(DISTINCT visitor_id) AS visitors
      FROM visitor_events
      WHERE visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours')
      GROUP BY date(visited_at, '+8 hours') ORDER BY date ASC
    `).bind(range.from, range.to).all<DailyVisitorTrend>(),
  ]);

  return {
    summary: {
      todayVisitors: Number(summaryResult?.today_visitors ?? 0),
      todayPageViews: Number(summaryResult?.today_page_views ?? 0),
      rangeVisitors: Number(summaryResult?.range_visitors ?? 0),
      rangePageViews: Number(summaryResult?.range_page_views ?? 0),
    },
    recentVisits: (recentResult.results ?? []).map((row) => ({ ...row, id: Number(row.id), is_authenticated: Number(row.is_authenticated) })),
    popularPages: (popularResult.results ?? []).map((row) => ({ ...row, page_views: Number(row.page_views), visitors: Number(row.visitors) })),
    dailyTrend: fillMissingTrendDays(range, trendResult.results ?? []),
  };
}

export async function getVisitorExportRows(range: VisitorDateRange): Promise<VisitorExportRow[]> {
  await ensureVisitorTable();
  const result = await getD1().prepare(`
    SELECT id, substr(visitor_id, 1, 8) AS visitor_id, substr(session_id, 1, 8) AS session_id,
      path, referrer_host, device_type, is_authenticated, visited_at
    FROM visitor_events
    WHERE visited_at >= datetime(?, '-8 hours') AND visited_at < datetime(?, '+1 day', '-8 hours')
    ORDER BY visited_at DESC, id DESC LIMIT 50000
  `).bind(range.from, range.to).all<VisitorExportRow>();
  return (result.results ?? []).map((row) => ({ ...row, id: Number(row.id), is_authenticated: Number(row.is_authenticated) }));
}

export async function cleanupExpiredVisitorEvents(database = getD1()) {
  await ensureVisitorTable();
  return database.prepare(`DELETE FROM visitor_events WHERE visited_at < datetime('now', '-${RETENTION_DAYS} days')`).run();
}

export function resolveVisitorDateRange(from?: string, to?: string): VisitorDateRange {
  const today = taipeiDateString(new Date());
  const earliest = addDays(today, -(RETENTION_DAYS - 1));
  const defaultFrom = addDays(today, -29);
  const safeTo = isCalendarDate(to) ? clampDate(to, earliest, today) : today;
  const safeFrom = isCalendarDate(from) ? clampDate(from, earliest, safeTo) : clampDate(defaultFrom, earliest, safeTo);
  return { from: safeFrom, to: safeTo };
}

function fillMissingTrendDays(range: VisitorDateRange, rows: DailyVisitorTrend[]) {
  const byDate = new Map(rows.map((row) => [row.date, row]));
  const result: DailyVisitorTrend[] = [];
  for (let date = range.from; date <= range.to; date = addDays(date, 1)) {
    const row = byDate.get(date);
    result.push({ date, page_views: Number(row?.page_views ?? 0), visitors: Number(row?.visitors ?? 0) });
  }
  return result;
}

function taipeiDateString(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isCalendarDate(value?: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function clampDate(value: string, minimum: string, maximum: string) {
  return value < minimum ? minimum : value > maximum ? maximum : value;
}
