CREATE TABLE `visitor_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` text NOT NULL,
	`session_id` text NOT NULL,
	`path` text NOT NULL,
	`referrer_host` text,
	`device_type` text NOT NULL,
	`is_authenticated` integer DEFAULT 0 NOT NULL,
	`visited_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visitor_events_visited_at_idx` ON `visitor_events` (`visited_at`);--> statement-breakpoint
CREATE INDEX `visitor_events_visitor_id_idx` ON `visitor_events` (`visitor_id`);--> statement-breakpoint
CREATE INDEX `visitor_events_path_idx` ON `visitor_events` (`path`);