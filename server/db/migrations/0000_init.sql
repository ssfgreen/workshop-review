CREATE TABLE `codes` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` integer NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`gist` text NOT NULL,
	`definition` text NOT NULL,
	`participants_json` text NOT NULL,
	`rooms_json` text NOT NULL,
	`sections_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `epics` (
	`id` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evidence` (
	`code_id` text NOT NULL,
	`position` integer NOT NULL,
	`data_json` text NOT NULL,
	PRIMARY KEY(`code_id`, `position`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`section_key` text NOT NULL,
	`position` integer NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`person_id` text NOT NULL,
	`target` text NOT NULL,
	`value` text,
	`note` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`person_id`, `target`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`key` text PRIMARY KEY NOT NULL,
	`position` integer NOT NULL,
	`label` text NOT NULL,
	`question` text NOT NULL,
	`prompt` text NOT NULL,
	`columns_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`code_id` text NOT NULL,
	`position` integer NOT NULL,
	`data_json` text NOT NULL,
	PRIMARY KEY(`code_id`, `position`)
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`section_key` text NOT NULL,
	`group_title` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`evidence` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `suggestions_section` ON `suggestions` (`section_key`);--> statement-breakpoint
CREATE TABLE `votes` (
	`person_id` text NOT NULL,
	`target` text NOT NULL,
	`value` text,
	`note` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`person_id`, `target`)
);
