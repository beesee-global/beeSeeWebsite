-- Featured Products Data Import Script
-- Database: ecommerce-db
-- This script creates tables and inserts sample featured product data based on the HeroProduct.tsx fallback data

USE `ecommerce-db`;

-- ===============================
-- CREATE TABLES IF NOT EXISTS
-- ===============================

-- Features table (main featured product sections)
CREATE TABLE IF NOT EXISTS `features` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `name` text,
  `pid` varchar(50) DEFAULT NULL,
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
  `order` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_feature_tech_stats_features` (`feature_id`),
  CONSTRAINT `FK_feature_tech_stats_features` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===============================
-- CLEANUP EXISTING DATA
-- ===============================
-- This removes existing data so the new values (like 4.8★) will be inserted
DELETE FROM feature_tech_stats WHERE feature_id IN (SELECT id FROM features WHERE title = 'FEATURED PRODUCTS');
DELETE FROM feature_badges WHERE feature_product_id IN (SELECT id FROM feature_products WHERE feature_id IN (SELECT id FROM features WHERE title = 'FEATURED PRODUCTS'));
DELETE FROM feature_product_images WHERE feature_product_id IN (SELECT id FROM feature_products WHERE feature_id IN (SELECT id FROM features WHERE title = 'FEATURED PRODUCTS'));
DELETE FROM feature_products WHERE feature_id IN (SELECT id FROM features WHERE title = 'FEATURED PRODUCTS');
DELETE FROM features WHERE title = 'FEATURED PRODUCTS';

-- ===============================
-- INSERT FEATURE SECTION
-- ===============================
INSERT INTO `features` (`title`, `name`, `pid`, `created_at`, `updated_at`) 
VALUES (
    'FEATURED PRODUCTS',
    'The ultra-slim chassis houses a long-life battery system calibrated for extended uptime without performance throttling. With optimized hardware acceleration and modern connectivity support, the device is built to meet the requirements of power users, professionals, and performance-driven environments.',
    UUID(),
    NOW(),
    NOW()
);

-- Get the feature_id
SET @feature_id = LAST_INSERT_ID();

-- ===============================
-- INSERT FEATURED PRODUCTS
-- ===============================
-- Note: These product_ids should match actual products in your products table
-- You may need to update these IDs based on your actual product data

-- Product 1 (assuming product_id = 1 exists)
INSERT INTO `feature_products` (`feature_id`, `product_id`, `created_at`) 
VALUES (@feature_id, 1, NOW());
SET @feature_product_1_id = LAST_INSERT_ID();

-- Product 2 (assuming product_id = 2 exists)
INSERT INTO `feature_products` (`feature_id`, `product_id`, `created_at`) 
VALUES (@feature_id, 2, NOW());
SET @feature_product_2_id = LAST_INSERT_ID();

-- ===============================
-- INSERT BADGES FOR PRODUCT 1
-- ===============================
INSERT INTO `feature_badges` (`feature_product_id`, `text`, `created_at`)
VALUES
    (@feature_product_1_id, '144Hz', NOW()),
    (@feature_product_1_id, 'Premium', NOW()),
    (@feature_product_1_id, '4.8★', NOW());

-- ===============================
-- INSERT BADGES FOR PRODUCT 2
-- ===============================
INSERT INTO `feature_badges` (`feature_product_id`, `text`, `created_at`) 
VALUES 
    (@feature_product_2_id, 'Advanced', NOW()),
    (@feature_product_2_id, 'Turbo Mode', NOW()),
    (@feature_product_2_id, '99% EF', NOW());

-- ===============================
-- INSERT TECH STATS
-- ===============================
INSERT INTO `feature_tech_stats` (`feature_id`, `label`, `value`, `order`, `created_at`) 
VALUES 
    (@feature_id, 'PROCESSING', 'HIGH-PERFORMANCE', 1, NOW()),
    (@feature_id, 'BATTERY LIFE', 'LONG-LASTING', 2, NOW()),
    (@feature_id, 'DESIGN', 'LUXURIOUS', 3, NOW());

-- ===============================
-- INSERT PRODUCT IMAGES (Optional)
-- ===============================
-- If you want to add custom images for the featured products, uncomment and update these:
-- INSERT INTO `feature_product_images` (`feature_product_id`, `attachment_url`, `sort_order`, `created_at`, `updated_at`) 
-- VALUES 
--     (@feature_product_1_id, '/featuredProduct/LaptopPro.png', 1, NOW(), NOW()),
--     (@feature_product_2_id, '/featuredProduct/LaptopDuos.png', 1, NOW(), NOW());

-- ===============================
-- VERIFICATION
-- ===============================
SELECT 
    f.title,
    f.name as description,
    COUNT(DISTINCT fp.id) as product_count,
    COUNT(DISTINCT fb.id) as badge_count,
    COUNT(DISTINCT fts.id) as tech_stat_count
FROM features f
LEFT JOIN feature_products fp ON f.id = fp.feature_id
LEFT JOIN feature_badges fb ON fp.id = fb.feature_product_id
LEFT JOIN feature_tech_stats fts ON f.id = fts.feature_id
WHERE f.title = 'FEATURED PRODUCTS'
GROUP BY f.id, f.title, f.name;

SELECT 'Featured products data imported successfully!' AS status;
