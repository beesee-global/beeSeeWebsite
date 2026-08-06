-- Complete E-commerce Database Schema
-- Database: ecommerce-db
-- This script creates all required tables for the Beesee e-commerce system

USE `ecommerce-db`;

-- ===============================
-- USER TABLES
-- ===============================

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Users details table
CREATE TABLE IF NOT EXISTS `users_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `users_id` int DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `url_permission` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_id` (`users_id`),
  CONSTRAINT `fk_users_details` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Users images table
CREATE TABLE IF NOT EXISTS `users_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `users_id` int DEFAULT NULL,
  `image_url` text,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_id` (`users_id`),
  CONSTRAINT `fk_users_images` FOREIGN KEY (`users_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===============================
-- PRODUCT TABLES
-- ===============================

-- Categories table (UPDATED: added pid and icon fields)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` char(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `tagline` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT 0,
  `category_id` int DEFAULT NULL,
  `is_deleted` tinyint DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_products_categories` (`category_id`),
  CONSTRAINT `FK_products_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product images table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `sort_order` int DEFAULT 0,
  `attachment_url` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_product_images_products` (`product_id`),
  CONSTRAINT `FK_product_images_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product hover specs table
CREATE TABLE IF NOT EXISTS `product_hover_specs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `spec_key` varchar(255) NOT NULL,
  `spec_value` text,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_product_hover_specs_products` (`product_id`),
  CONSTRAINT `FK_product_hover_specs_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product spec sections table
CREATE TABLE IF NOT EXISTS `product_spec_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_product_spec_sections_products` (`product_id`),
  CONSTRAINT `FK_product_spec_sections_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product spec items table
CREATE TABLE IF NOT EXISTS `product_spec_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_section_id` int NOT NULL,
  `spec_key` varchar(255) NOT NULL,
  `spec_value` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_product_spec_items_sections` (`product_section_id`),
  CONSTRAINT `FK_product_spec_items_sections` FOREIGN KEY (`product_section_id`) REFERENCES `product_spec_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===============================
-- FEATURED PRODUCTS TABLES (NEW)
-- ===============================

-- Features table (main featured sections)
CREATE TABLE IF NOT EXISTS `features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `name` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Feature products table (links features to products)
CREATE TABLE IF NOT EXISTS `feature_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feature_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_feature_products_features` (`feature_id`),
  KEY `FK_feature_products_products` (`product_id`),
  CONSTRAINT `FK_feature_products_features` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_feature_products_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Feature badges table
CREATE TABLE IF NOT EXISTS `feature_badges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feature_product_id` int NOT NULL,
  `text` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_feature_badges_feature_products` (`feature_product_id`),
  CONSTRAINT `FK_feature_badges_feature_products` FOREIGN KEY (`feature_product_id`) REFERENCES `feature_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Feature product images table
CREATE TABLE IF NOT EXISTS `feature_product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feature_product_id` int NOT NULL,
  `attachment_url` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_feature_product_images_feature_products` (`feature_product_id`),
  CONSTRAINT `FK_feature_product_images_feature_products` FOREIGN KEY (`feature_product_id`) REFERENCES `feature_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Feature tech stats table
CREATE TABLE IF NOT EXISTS `feature_tech_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `feature_id` int NOT NULL,
  `label` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_feature_tech_stats_features` (`feature_id`),
  CONSTRAINT `FK_feature_tech_stats_features` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===============================
-- SAMPLE DATA
-- ===============================

-- Insert sample categories
INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
(1, 'Educational TV', 'tv'),
(2, 'Laptops', 'laptop'),
(3, 'Tablets', 'tablet'),
(4, 'Accessories', 'headphones')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `icon` = VALUES(`icon`);

-- ===============================
-- DUMMY USER CREATION
-- ===============================

-- Delete any existing dummy user to avoid conflicts
DELETE FROM users_details WHERE users_id IN (SELECT id FROM users WHERE email = 'dummy@beesee.ph');
DELETE FROM users WHERE email = 'dummy@beesee.ph';

-- Insert the dummy user with correct bcrypt hash for "Dummy123!"
INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `pid`, `created_at`, `updated_at`) 
VALUES (
    'Dummy',
    'User',
    'dummy@beesee.ph',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7xIXF2J9J6',
    UUID(),
    NOW(),
    NOW()
);

-- Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Insert user details with correct permission
INSERT INTO `users_details` (`users_id`, `employment_status`, `url_permission`, `created_at`, `updated_at`) 
VALUES (
    @user_id,
    'Active',
    'ecommerce',
    NOW(),
    NOW()
);

-- Verify the user was created correctly
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    ud.employment_status,
    ud.url_permission
FROM users u
LEFT JOIN users_details ud ON u.id = ud.users_id
WHERE u.email = 'dummy@beesee.ph';

-- Also fix your existing test user
UPDATE users_details 
SET url_permission = 'ecommerce' 
WHERE users_id = (SELECT id FROM users WHERE email = 'test@beesee.ph');
