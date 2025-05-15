CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_to_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location_id` int NOT NULL,
	`category_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `location_to_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `location_to_categories_location_id_category_id_unique` UNIQUE(`location_id`,`category_id`)
);
--> statement-breakpoint
ALTER TABLE `location_to_categories` ADD CONSTRAINT `location_to_categories_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `location_to_categories` ADD CONSTRAINT `location_to_categories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;