ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_user_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_location_id_locations_id_fk`;--> statement-breakpoint
ALTER TABLE `favorites` MODIFY COLUMN `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `favorites` MODIFY COLUMN `location_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_location_id_unique` UNIQUE(`user_id`,`location_id`);--> statement-breakpoint
ALTER TABLE `favorites` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `favorites` ADD `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY;--> statement-breakpoint

ALTER TABLE `locations` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `locations` drop column `coordinates`;--> statement-breakpoint
ALTER TABLE `locations` ADD `coordinates` POINT GENERATED ALWAYS AS (ST_PointFromText(CONCAT('POINT(', latitude, ' ', longitude, ')'), 4326)) STORED NOT NULL;--> statement-breakpoint

ALTER TABLE `users` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `external_id` char(36);--> statement-breakpoint

ALTER TABLE `favorites` ADD CONSTRAINT `favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_location_id_locations_id_fk` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE no action ON UPDATE no action;
