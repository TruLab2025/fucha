-- CreateTable
CREATE TABLE `listing_contacts` (
    `listing_id` VARCHAR(36) NOT NULL,
    `phone` VARCHAR(32) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `contact_preference` ENUM('phone', 'email', 'both') NOT NULL DEFAULT 'both',
    `verified_at` DATETIME(0) NULL,
    `consent_version` VARCHAR(32) NULL,
    `consent_accepted_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL,

    INDEX `idx_listing_contacts_email`(`email`),
    PRIMARY KEY (`listing_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `id` VARCHAR(36) NOT NULL,
    `type` ENUM('worker', 'employer') NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `expires_at` DATETIME(0) NULL,
    `status` ENUM('active', 'expired', 'deleted') NOT NULL DEFAULT 'active',
    `province` VARCHAR(120) NULL,
    `city` VARCHAR(120) NULL,
    `category` VARCHAR(120) NULL,
    `availability_mode` ENUM('single', 'range') NULL,
    `available_date` DATE NULL,
    `available_to` DATE NULL,
    `available_hours` VARCHAR(32) NULL,
    `rate_type` ENUM('hourly', 'daily') NULL,
    `rate` VARCHAR(64) NULL,
    `company_name` VARCHAR(255) NULL,
    `job_title` VARCHAR(255) NULL,
    `skills_required` TEXT NULL,
    `experience_level` VARCHAR(120) NULL,
    `salary_min` VARCHAR(64) NULL,
    `salary_max` VARCHAR(64) NULL,

    INDEX `idx_listings_category`(`category`),
    INDEX `idx_listings_expiration`(`expires_at`, `status`),
    INDEX `idx_listings_location`(`province`, `city`),
    INDEX `idx_listings_type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `listing_contacts` ADD CONSTRAINT `fk_listing_contacts_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
