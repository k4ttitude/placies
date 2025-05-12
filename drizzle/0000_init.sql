CREATE TABLE `favorites` (
	`user_id` char(36) NOT NULL,
	`location_id` bigint unsigned NOT NULL,
	`label` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `favorites_user_id_location_id_pk` PRIMARY KEY(`user_id`,`location_id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`longitude` decimal(11,8) NOT NULL,
	`latitude` decimal(10,8) NOT NULL,
	`coordinates` POINT GENERATED ALWAYS AS (ST_PointFromText(CONCAT('POINT(', latitude, ' ', longitude, ')'), 4326)) STORED NOT NULL,
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `longitude_idx` ON `locations` (`longitude`);--> statement-breakpoint
CREATE INDEX `latitude_idx` ON `locations` (`latitude`);--> statement-breakpoint
CREATE INDEX `coordinates_spatial_idx` ON `locations` (`coordinates`);
