CREATE TABLE `guest_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_key` text NOT NULL,
	`nickname` text NOT NULL,
	`body` text NOT NULL,
	`lesson_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_reply` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text
);
--> statement-breakpoint
CREATE INDEX `guest_messages_status_created_idx` ON `guest_messages` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `guest_messages_guest_created_idx` ON `guest_messages` (`guest_key`,`created_at`);