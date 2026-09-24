CREATE TABLE `quiz_attempts` (
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
--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_lesson_submitted_idx` ON `quiz_attempts` (`user_id`,`lesson_id`,`submitted_at`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_submitted_idx` ON `quiz_attempts` (`user_id`,`submitted_at`);