-- LEGACY / DEPRECATED REFERENCE ONLY
-- Canonical schema history: prisma/schema.prisma and prisma/migrations/.
-- Do not apply this file to local, staging, or production databases.

CREATE TABLE IF NOT EXISTS listings (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  type ENUM('worker', 'employer') NULL,
  title VARCHAR(255) NULL,
  description TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NULL,
  status ENUM('active', 'expired', 'deleted') NOT NULL DEFAULT 'active',
  province VARCHAR(120) NULL,
  city VARCHAR(120) NULL,
  category VARCHAR(120) NULL,
  availability_mode ENUM('single', 'range') NULL,
  available_date DATE NULL,
  available_to DATE NULL,
  available_hours VARCHAR(32) NULL,
  rate_type ENUM('hourly', 'daily') NULL,
  rate VARCHAR(64) NULL,
  company_name VARCHAR(255) NULL,
  job_title VARCHAR(255) NULL,
  skills_required TEXT NULL,
  experience_level VARCHAR(120) NULL,
  salary_min VARCHAR(64) NULL,
  salary_max VARCHAR(64) NULL,
  INDEX idx_listings_type (type),
  INDEX idx_listings_location (province, city),
  INDEX idx_listings_category (category),
  INDEX idx_listings_expiration (expires_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listing_contacts (
  listing_id VARCHAR(36) NOT NULL PRIMARY KEY,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_preference ENUM('phone', 'email', 'both') NOT NULL DEFAULT 'both',
  verified_at DATETIME NULL,
  consent_version VARCHAR(32) NULL,
  consent_accepted_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_listing_contacts_listing
    FOREIGN KEY (listing_id) REFERENCES listings(id)
    ON DELETE CASCADE,
  INDEX idx_listing_contacts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
