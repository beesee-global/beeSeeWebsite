-- BeeSee public/ecommerce release database
-- Branch scope: ron
-- This file is safe to run repeatedly against a development or live schema.
-- It contains schema and non-sensitive catalog seeds only; no accounts or private records.

CREATE DATABASE IF NOT EXISTS `ecommerce-db`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `ecommerce-db`;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` char(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` char(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `details` longtext,
  `long_specs` longtext,
  `long_specs_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `details_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `basic_information_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `gallery_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `quick_product_highlight_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `specifications_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `product_specs_highlight` text,
  `product_specs_highlight_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `tagline` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT 0,
  `category_id` int DEFAULT NULL,
  `video_type` enum('s3','youtube') DEFAULT NULL,
  `video_url` text,
  `video_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `brochure_url` text,
  `brochure_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `product_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_ecommerce_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` char(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('regular','admin','superadmin') NOT NULL DEFAULT 'regular',
  `positions_id` int DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `phone` varchar(50) DEFAULT NULL,
  `address` text,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ecommerce_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pid` char(50) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_protected` tinyint(1) NOT NULL DEFAULT 0,
  `permission` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ecommerce_positions_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `positions_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_id` int DEFAULT NULL,
  `parent_id` varchar(50) DEFAULT NULL,
  `children_id` varchar(50) DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `module_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_ecom_position` (`position_id`),
  CONSTRAINT `fk_ecom_position_permission` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `positions_permission_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `position_permission_id` int DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_ecom_permission_action` (`position_permission_id`),
  CONSTRAINT `fk_ecom_permission_action` FOREIGN KEY (`position_permission_id`) REFERENCES `positions_permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int NOT NULL AUTO_INCREMENT, `product_id` int NOT NULL, `sort_order` int DEFAULT 0,
  `attachment_url` longtext, `file_name` varchar(255) DEFAULT NULL, `file_size` int DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_hover_specs` (
  `id` int NOT NULL AUTO_INCREMENT, `product_id` int NOT NULL, `spec_key` varchar(255) NOT NULL,
  `spec_value` text, `icon` varchar(255) DEFAULT NULL, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_hover_specs_product` (`product_id`),
  CONSTRAINT `fk_hover_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_spec_sections` (
  `id` int NOT NULL AUTO_INCREMENT, `product_id` int NOT NULL, `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `idx_spec_sections_product` (`product_id`),
  CONSTRAINT `fk_spec_sections_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `product_spec_items` (
  `id` int NOT NULL AUTO_INCREMENT, `product_section_id` int NOT NULL, `spec_key` varchar(255) NOT NULL,
  `spec_value` text, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`),
  KEY `idx_spec_items_section` (`product_section_id`),
  CONSTRAINT `fk_spec_items_section` FOREIGN KEY (`product_section_id`) REFERENCES `product_spec_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `features` (
  `id` int NOT NULL AUTO_INCREMENT, `pid` char(50) DEFAULT NULL, `title` varchar(255) NOT NULL, `name` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feature_products` (
  `id` int NOT NULL AUTO_INCREMENT, `feature_id` int NOT NULL, `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`),
  KEY `idx_feature_products_feature` (`feature_id`), KEY `idx_feature_products_product` (`product_id`),
  CONSTRAINT `fk_feature_products_feature` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feature_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feature_badges` (
  `id` int NOT NULL AUTO_INCREMENT, `feature_product_id` int NOT NULL, `text` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`), KEY `idx_feature_badges_product` (`feature_product_id`),
  CONSTRAINT `fk_feature_badges_product` FOREIGN KEY (`feature_product_id`) REFERENCES `feature_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feature_product_images` (
  `id` int NOT NULL AUTO_INCREMENT, `feature_product_id` int NOT NULL, `attachment_url` longtext,
  `file_name` varchar(255) DEFAULT NULL, `file_size` int DEFAULT NULL, `file_type` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT 0, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`),
  KEY `idx_feature_images_product` (`feature_product_id`),
  CONSTRAINT `fk_feature_images_product` FOREIGN KEY (`feature_product_id`) REFERENCES `feature_products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feature_tech_stats` (
  `id` int NOT NULL AUTO_INCREMENT, `feature_id` int NOT NULL, `label` varchar(255) NOT NULL, `value` text,
  `sort_order` int DEFAULT 0, `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_feature_stats_feature` (`feature_id`),
  CONSTRAINT `fk_feature_stats_feature` FOREIGN KEY (`feature_id`) REFERENCES `features` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Guarded additions for databases created before the current ron schema.
SET @db = DATABASE();
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='details'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN details LONGTEXT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='long_specs'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN long_specs LONGTEXT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='long_specs_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN long_specs_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='details_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN details_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='basic_information_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN basic_information_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='gallery_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN gallery_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='quick_product_highlight_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN quick_product_highlight_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='specifications_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN specifications_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='product_specs_highlight'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN product_specs_highlight TEXT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='product_specs_highlight_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN product_specs_highlight_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='video_type'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN video_type ENUM(''s3'',''youtube'') NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='video_url'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN video_url TEXT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='video_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN video_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='brochure_url'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN brochure_url TEXT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='brochure_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN brochure_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='product_enabled'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN product_enabled TINYINT(1) NOT NULL DEFAULT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema=@db AND table_name='products' AND column_name='category_id'), 'SELECT 1', 'ALTER TABLE products ADD COLUMN category_id INT NULL'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Non-sensitive release catalog data. Existing rows are preserved.
INSERT INTO categories (id, name, icon) VALUES
  (1, 'Laptops', 'laptop'), (2, 'Smart Watches', 'watch'), (3, 'Smart TVs', 'tv'), (4, 'Tablets', 'tablet')
ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon);

INSERT INTO products (pid, name, tagline, description, quantity, category_id)
SELECT v.pid, v.name, v.tagline, v.description, v.quantity, v.category_id
FROM (SELECT 'LAP-001' pid, 'Fusion' name, 'Power meets elegance in every pixel' tagline, 'Workstation performance for creative professionals.' description, 100 quantity, 1 category_id
      UNION ALL SELECT 'LAP-002', 'Duos', 'Dual-core brilliance for modern workflows', 'Dual-screen productivity for modern workflows.', 100, 1
      UNION ALL SELECT 'TV-001', 'Educational Smart TV - 86 Inch', 'Immersive learning through intelligent display technology', '4K educational display for collaborative classrooms.', 50, 3
      UNION ALL SELECT 'TV-002', 'Educational Smart TV - 75 Inch', 'Collaboration reimagined for modern spaces', 'Interactive display for presentations and learning.', 50, 3
      UNION ALL SELECT 'TAB-001', 'Beepad', 'Foldable innovation that transforms productivity', 'A flexible tablet for work and learning.', 100, 4) v
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.pid=v.pid);

INSERT INTO product_hover_specs (product_id, spec_key, spec_value, icon)
SELECT p.id, s.spec_key, s.spec_value, s.icon
FROM products p JOIN (SELECT 'LAP-001' pid, 'cpu' spec_key, 'Intel Core i5 11th Gen' spec_value, 'Cpu' icon UNION ALL SELECT 'LAP-001','ram','16GB RAM','Memory' UNION ALL SELECT 'LAP-001','storage','512GB NVMe SSD','HardDrive' UNION ALL SELECT 'TV-002','display','75 inches','Display' UNION ALL SELECT 'TV-002','os support','Windows Android','MonitorCog') s ON s.pid=p.pid
WHERE NOT EXISTS (SELECT 1 FROM product_hover_specs h WHERE h.product_id=p.id AND h.spec_key=s.spec_key);

INSERT INTO features (pid, title, name)
SELECT 'FEATURED-RON', 'FEATURED PRODUCTS', 'Featured products for the public home page'
WHERE NOT EXISTS (SELECT 1 FROM features WHERE pid='FEATURED-RON' OR title='FEATURED PRODUCTS');

SET @feature_id = (SELECT id FROM features WHERE title='FEATURED PRODUCTS' ORDER BY id LIMIT 1);
INSERT INTO feature_products (feature_id, product_id)
SELECT @feature_id, p.id FROM products p
WHERE p.pid IN ('LAP-001','TV-002')
  AND NOT EXISTS (SELECT 1 FROM feature_products fp WHERE fp.feature_id=@feature_id AND fp.product_id=p.id);

INSERT INTO feature_tech_stats (feature_id, label, value, sort_order)
SELECT @feature_id, v.label, v.value, v.sort_order FROM
 (SELECT 'PROCESSING' label, 'HIGH-PERFORMANCE' value, 1 sort_order UNION ALL SELECT 'BATTERY LIFE','LONG-LASTING',2 UNION ALL SELECT 'DESIGN','LUXURIOUS',3) v
WHERE NOT EXISTS (SELECT 1 FROM feature_tech_stats WHERE feature_id=@feature_id AND label=v.label);
