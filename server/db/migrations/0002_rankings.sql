CREATE TABLE `rankings` (
	`person_id` text NOT NULL,
	`target` text NOT NULL,
	`priority` text,
	`work` text,
	`size` text,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`person_id`, `target`)
);
