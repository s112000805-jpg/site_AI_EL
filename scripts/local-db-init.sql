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

CREATE TABLE IF NOT EXISTS `quiz_attempts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `quiz_type` text NOT NULL,
  `score` integer NOT NULL,
  `max_score` integer NOT NULL,
  `wrong_question_ids` text DEFAULT '[]' NOT NULL,
  `answers_json` text DEFAULT '{}' NOT NULL,
  `submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `learners`(`user_id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX IF NOT EXISTS `quiz_attempts_user_lesson_submitted_idx`
ON `quiz_attempts` (`user_id`, `lesson_id`, `submitted_at`);

CREATE INDEX IF NOT EXISTS `quiz_attempts_user_submitted_idx`
ON `quiz_attempts` (`user_id`, `submitted_at`);

CREATE TABLE IF NOT EXISTS `visitor_events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `visitor_id` text NOT NULL,
  `session_id` text NOT NULL,
  `path` text NOT NULL,
  `referrer_host` text,
  `device_type` text NOT NULL,
  `is_authenticated` integer DEFAULT 0 NOT NULL,
  `visited_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS `visitor_events_visited_at_idx`
ON `visitor_events` (`visited_at`);

CREATE INDEX IF NOT EXISTS `visitor_events_visitor_id_idx`
ON `visitor_events` (`visitor_id`);

CREATE INDEX IF NOT EXISTS `visitor_events_path_idx`
ON `visitor_events` (`path`);
