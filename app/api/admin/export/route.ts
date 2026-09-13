import { getChatGPTUser } from "@/app/chatgpt-auth";
import { filterAdminLearners, getAdminLearnerReport, getAdminLearners, type LearnerStatusFilter, totalLessonCount } from "@/db/progress";
import { formatDuration, lessons } from "@/lib/courses";
import { isAdminUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getChatGPTUser();
  if (!admin) return Response.json({ error: "請先登入" }, { status: 401 });
  if (!isAdminUser(admin)) return Response.json({ error: "沒有管理者權限" }, { status: 403 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (userId) {
    const report = await getAdminLearnerReport(userId);
    if (!report) return Response.json({ error: "找不到學員" }, { status: 404 });
    const progressMap = new Map(report.progress.map((row) => [row.lesson_id, row]));
    const rows = lessons.map((lesson) => {
      const progress = progressMap.get(lesson.id);
      return [report.learner.display_name, report.learner.email, lesson.code, lesson.stageTitle, lesson.title, lesson.durationSeconds, progress?.watched_seconds ?? 0, progress?.last_position_seconds ?? 0, statusLabel(progress?.status ?? "not_started"), progress?.completed_at ?? "", progress?.updated_at ?? ""];
    });
    return csvResponse(`learner-${safeFilePart(report.learner.email)}.csv`, [["學員姓名", "Email", "課程編號", "階段", "課程名稱", "課程長度（秒）", "觀看時間（秒）", "最後播放位置（秒）", "狀態", "完成時間", "最近更新"], ...rows]);
  }

  const query = (url.searchParams.get("q") ?? "").slice(0, 100);
  const rawStatus = url.searchParams.get("status") ?? "all";
  const status: LearnerStatusFilter = ["completed", "in_progress", "not_started"].includes(rawStatus) ? rawStatus as LearnerStatusFilter : "all";
  const learners = filterAdminLearners(await getAdminLearners(), query, status);
  const rows = learners.map((row) => [row.display_name, row.email, row.completed_count, row.in_progress_count, Math.max(0, totalLessonCount - row.completed_count - row.in_progress_count), formatDuration(row.watched_seconds), row.last_activity]);
  return csvResponse("learning-report.csv", [["學員姓名", "Email", "已完成課數", "學習中課數", "尚未學習課數", "總學習時間", "最近活動"], ...rows]);
}

function statusLabel(status: string) {
  return status === "completed" ? "已完成" : status === "in_progress" ? "學習中" : "尚未學習";
}

function csvResponse(filename: string, rows: Array<Array<string | number>>) {
  const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "no-store" } });
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 64) || "report";
}
