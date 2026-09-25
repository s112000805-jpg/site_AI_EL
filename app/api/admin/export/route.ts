import { getChatGPTUser } from "@/app/chatgpt-auth";
import { filterAdminLearners, getAdminLearnerReport, getAdminLearners, getAdminQuizAttempts, parseWrongQuestionIds, type LearnerStatusFilter, totalLessonCount } from "@/db/progress";
import { findLesson, formatDuration, lessons } from "@/lib/courses";
import { getQuizQuestions, type QuizType } from "@/lib/quizzes";
import { isAdminUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getChatGPTUser();
  if (!admin) return Response.json({ error: "請先登入" }, { status: 401 });
  if (!isAdminUser(admin)) return Response.json({ error: "沒有管理者權限" }, { status: 403 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const reportType = url.searchParams.get("type");

  if (reportType === "wrong") {
    if (userId && !await getAdminLearnerReport(userId)) return Response.json({ error: "找不到學員" }, { status: 404 });
    const attempts = (await getAdminQuizAttempts()).filter((row) => !userId || row.user_id === userId);
    const latest = new Map<string, (typeof attempts)[number]>();
    for (const row of attempts) {
      const key = `${row.user_id}:${row.lesson_id}:${row.quiz_type}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const rows = [...latest.values()].flatMap((attempt) => {
      const lesson = findLesson(attempt.lesson_id);
      if (!lesson) return [];
      const questions = getQuizQuestions(attempt.lesson_id, attempt.quiz_type as QuizType);
      const answers = parseAnswers(attempt.answers_json);
      return parseWrongQuestionIds(attempt).flatMap((questionId) => {
        const question = questions.find((item) => item.id === questionId);
        if (!question) return [];
        const selected = answers[questionId];
        const selectedIndex = typeof selected === "number" ? selected : NaN;
        return [[attempt.display_name, attempt.email, lesson.code, lesson.title, attempt.quiz_type === "pre" ? "課前診斷" : "課後複習", question.id, question.prompt, Number.isInteger(selectedIndex) ? question.options[selectedIndex] ?? "未作答" : "未作答", question.options[question.correctIndex], question.objective, attempt.submitted_at]];
      });
    });
    const filename = userId ? `wrong-questions-${safeFilePart(attempts[0]?.email ?? "learner")}.csv` : "wrong-questions-report.csv";
    return csvResponse(filename, [["學員姓名", "Email", "課程編號", "課程名稱", "題組", "題目編號", "題目", "學員答案", "正確答案", "學習目標", "最近作答時間"], ...rows]);
  }

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
  const cell = String(value);
  // 避免試算表將學員輸入的姓名或 Email 當成公式執行。
  const safeCell = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
  return `"${safeCell.replaceAll('"', '""')}"`;
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 64) || "report";
}

function parseAnswers(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
