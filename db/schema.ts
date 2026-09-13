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
