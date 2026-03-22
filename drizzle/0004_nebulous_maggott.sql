CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `featuredCarousel` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`carouselTitle` varchar(255) NOT NULL DEFAULT 'Destaques',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featuredCarousel_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerAddress` text,
	`items` json NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`shippingCost` decimal(10,2) NOT NULL DEFAULT '0',
	`paymentFee` decimal(10,2) NOT NULL DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`termsAccepted` boolean NOT NULL DEFAULT false,
	`status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentFeeConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardType` varchar(50) NOT NULL DEFAULT 'credit',
	`label` varchar(100) NOT NULL DEFAULT 'Cartão de Crédito',
	`feePercentage` decimal(5,2) NOT NULL,
	`minFee` decimal(10,2) NOT NULL,
	`maxFee` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentFeeConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`question` text NOT NULL,
	`status` enum('pending','answered') NOT NULL DEFAULT 'pending',
	`adminResponse` text,
	`adminResponseAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`status` enum('pending','approved','hidden') NOT NULL DEFAULT 'pending',
	`adminResponse` text,
	`adminResponseAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shippingConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`baseCost` decimal(10,2) NOT NULL,
	`costPerKg` decimal(10,2) NOT NULL,
	`freeShippingThreshold` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shippingConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `weight` decimal(8,3) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `image` text;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `categoryId` int;--> statement-breakpoint
ALTER TABLE `products` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `products` ADD `gallery` json;