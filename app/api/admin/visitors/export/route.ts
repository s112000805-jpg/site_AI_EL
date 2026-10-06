import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getVisitorExportRows, resolveVisitorDateRange } from "@/db/visitors";
import { isAdminUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getChatGPTUser();
  if (!admin) return Response.json({ error: "請先登入" }, { status: 401 });
  if (!isAdminUser(admin)) return Response.json({ error: "沒有管理者權限" }, { status: 403 });

  const url = new URL(request.url);
  const range = resolveVisitorDateRange(url.searchParams.get("from") ?? undefined, url.searchParams.get("to") ?? undefined);
  const rows = await getVisitorExportRows(range);
  const csvRows: Array<Array<string | number>> = [
    ["造訪時間（UTC）", "匿名訪客", "匿名工作階段", "登入狀態", "頁面", "裝置", "來源網域"],
    ...rows.map((row) => [row.visited_at, row.visitor_id, row.session_id, row.is_authenticated ? "已登入" : "訪客", row.path, deviceLabel(row.device_type), row.referrer_host ?? "直接進入"]),
  ];
  return csvResponse(`visitor-report-${range.from}-${range.to}.csv`, csvRows);
}

function deviceLabel(device: "desktop" | "mobile" | "tablet") {
  return device === "mobile" ? "手機" : device === "tablet" ? "平板" : "電腦";
}

function csvResponse(filename: string, rows: Array<Array<string | number>>) {
  const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "no-store" } });
}

function csvCell(value: string | number) {
  const cell = String(value);
  // 防止訪客來源或路徑被試算表辨識為公式。
  const safeCell = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
  return `"${safeCell.replaceAll('"', '""')}"`;
}
