-- 本檔只用於本機開發環境，正式網站仍由 Drizzle migration 管理結構。
CREATE TABLE IF NOT EXISTS `learners` (
  `user_id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `display_name` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS `learning_progress` (
  `user_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `watched_seconds` integer DEFAULT 0 NOT NULL,
  `last_position_seconds` integer DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'not_started' NOT NULL,
  `completed_at` text,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY(`user_id`, `lesson_id`),
  FOREIGN KEY (`user_id`) REFERENCES `learners`(`user_id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX IF NOT EXISTS `learning_progress_user_status_idx`
ON `learning_progress` (`user_id`, `status`);
