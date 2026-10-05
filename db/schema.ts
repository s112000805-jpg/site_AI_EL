import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learners = sqliteTable("learners", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const learningProgress = sqliteTable(
  "learning_progress",
  {
    userId: text("user_id").notNull().references(() => learners.userId),
    lessonId: text("lesson_id").notNull(),
    watchedSeconds: integer("watched_seconds").notNull().default(0),
    lastPositionSeconds: integer("last_position_seconds").notNull().default(0),
    status: text("status").notNull().default("not_started"),
    completedAt: text("completed_at"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.lessonId] }),
    index("learning_progress_user_status_idx").on(table.userId, table.status),
  ],
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().references(() => learners.userId),
    lessonId: text("lesson_id").notNull(),
    quizType: text("quiz_type").notNull(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull(),
    wrongQuestionIds: text("wrong_question_ids").notNull().default("[]"),
    answersJson: text("answers_json").notNull().default("{}"),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("quiz_attempts_user_lesson_submitted_idx").on(table.userId, table.lessonId, table.submittedAt),
    index("quiz_attempts_user_submitted_idx").on(table.userId, table.submittedAt),
  ],
);

export const visitorEvents = sqliteTable(
  "visitor_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    visitorId: text("visitor_id").notNull(),
    sessionId: text("session_id").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    deviceType: text("device_type").notNull(),
    isAuthenticated: integer("is_authenticated").notNull().default(0),
    visitedAt: text("visited_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("visitor_events_visited_at_idx").on(table.visitedAt),
    index("visitor_events_visitor_id_idx").on(table.visitorId),
    index("visitor_events_path_idx").on(table.path),
  ],
);

export const guestMessages = sqliteTable(
  "guest_messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    guestKey: text("guest_key").notNull(),
    nickname: text("nickname").notNull(),
    body: text("body").notNull(),
    lessonId: text("lesson_id"),
    status: text("status").notNull().default("pending"),
    adminReply: text("admin_reply"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    reviewedAt: text("reviewed_at"),
    reviewedBy: text("reviewed_by"),
  },
  (table) => [
    index("guest_messages_status_created_idx").on(table.status, table.createdAt),
    index("guest_messages_guest_created_idx").on(table.guestKey, table.createdAt),
  ],
);
