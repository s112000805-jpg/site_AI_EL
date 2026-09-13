import "server-only";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { findLesson, lessons } from "@/lib/courses";
import { getD1 } from "./index";

export type ProgressRow = {
  lesson_id: string;
  watched_seconds: number;
  last_position_seconds: number;
  status: "not_started" | "in_progress" | "completed";
  completed_at: string | null;
  updated_at: string;
};

export async function ensureLearner(user: ChatGPTUser) {
  await getD1().prepare(`
    INSERT INTO learners (user_id, email, display_name)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      email = excluded.email,
      display_name = excluded.display_name,
      updated_at = CURRENT_TIMESTAMP
  `).bind(user.userId, user.email, user.displayName).run();
}

export async function getUserProgress(user: ChatGPTUser): Promise<ProgressRow[]> {
  await ensureLearner(user);
  const result = await getD1().prepare(`
    SELECT lesson_id, watched_seconds, last_position_seconds, status, completed_at, updated_at
    FROM learning_progress WHERE user_id = ? ORDER BY updated_at DESC
  `).bind(user.userId).all<ProgressRow>();
  return result.results ?? [];
}

export async function recordProgress(
  user: ChatGPTUser,
  lessonId: string,
  positionSeconds: number,
  watchedDeltaSeconds: number,
) {
  const lesson = findLesson(lessonId);
  if (!lesson) throw new Error("找不到指定的課程影片");
  await ensureLearner(user);

  const position = Math.min(lesson.durationSeconds, Math.max(0, Math.round(positionSeconds || 0)));
  const delta = Math.min(30, Math.max(0, Math.round(watchedDeltaSeconds || 0)));
  const current = await getD1().prepare(`
    SELECT watched_seconds, completed_at FROM learning_progress
    WHERE user_id = ? AND lesson_id = ?
  `).bind(user.userId, lessonId).first<{ watched_seconds: number; completed_at: string | null }>();
  const watched = Math.min(lesson.durationSeconds, (current?.watched_seconds ?? 0) + delta);
  const completed = watched >= Math.ceil(lesson.durationSeconds * 0.8);
  const status = completed ? "completed" : watched > 0 ? "in_progress" : "not_started";

  await getD1().prepare(`
    INSERT INTO learning_progress
      (user_id, lesson_id, watched_seconds, last_position_seconds, status, completed_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      watched_seconds = excluded.watched_seconds,
      last_position_seconds = excluded.last_position_seconds,
      status = excluded.status,
      completed_at = CASE
        WHEN learning_progress.completed_at IS NOT NULL THEN learning_progress.completed_at
        WHEN excluded.status = 'completed' THEN CURRENT_TIMESTAMP
        ELSE NULL
      END,
      updated_at = CURRENT_TIMESTAMP
  `).bind(user.userId, lessonId, watched, position, status, status).run();
  return { lessonId, watchedSeconds: watched, positionSeconds: position, status };
}

export type AdminLearnerRow = {
  user_id: string;
  email: string;
  display_name: string;
  completed_count: number;
  in_progress_count: number;
  watched_seconds: number;
  last_activity: string;
};

export type LearnerProfile = {
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

export async function getAdminLearners(): Promise<AdminLearnerRow[]> {
  const result = await getD1().prepare(`
    SELECT l.user_id, l.email, l.display_name,
      COALESCE(SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_count,
      COALESCE(SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END), 0) AS in_progress_count,
      COALESCE(SUM(p.watched_seconds), 0) AS watched_seconds,
      COALESCE(MAX(p.updated_at), l.updated_at) AS last_activity
    FROM learners l LEFT JOIN learning_progress p ON p.user_id = l.user_id
    GROUP BY l.user_id, l.email, l.display_name, l.updated_at
    ORDER BY last_activity DESC
  `).all<AdminLearnerRow>();
  return (result.results ?? []).map((row) => ({
    ...row,
    completed_count: Number(row.completed_count),
    in_progress_count: Number(row.in_progress_count),
    watched_seconds: Number(row.watched_seconds),
  }));
}

export async function getAdminLearnerReport(userId: string): Promise<{
  learner: LearnerProfile;
  progress: ProgressRow[];
} | null> {
  const learner = await getD1().prepare(`
    SELECT user_id, email, display_name, created_at, updated_at
    FROM learners WHERE user_id = ?
  `).bind(userId).first<LearnerProfile>();
  if (!learner) return null;

  const progress = await getD1().prepare(`
    SELECT lesson_id, watched_seconds, last_position_seconds, status, completed_at, updated_at
    FROM learning_progress WHERE user_id = ? ORDER BY updated_at DESC
  `).bind(userId).all<ProgressRow>();
  return { learner, progress: progress.results ?? [] };
}

export type LearnerStatusFilter = "all" | "completed" | "in_progress" | "not_started";

export function filterAdminLearners(
  rows: AdminLearnerRow[],
  query: string,
  status: LearnerStatusFilter,
) {
  const needle = query.trim().toLocaleLowerCase("zh-TW");
  return rows.filter((row) => {
    const matchesQuery = !needle || `${row.display_name} ${row.email}`.toLocaleLowerCase("zh-TW").includes(needle);
    const overallStatus = row.completed_count >= totalLessonCount
      ? "completed"
      : row.watched_seconds > 0
        ? "in_progress"
        : "not_started";
    return matchesQuery && (status === "all" || status === overallStatus);
  });
}

export const totalLessonCount = lessons.length;
